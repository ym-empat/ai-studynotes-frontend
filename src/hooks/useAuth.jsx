import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CognitoService } from '../services/cognitoService';
import { setAuthHeaders } from '../services/api';

// Створюємо контекст для автентифікації
const AuthContext = createContext();

// Provider компонент для автентифікації
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [error, setError] = useState(null);

  // Перевіряємо поточний стан автентифікації при завантаженні
  useEffect(() => {
    checkAuthState();
  }, []);

  // Автоматично встановлюємо заголовки авторизації
  useEffect(() => {
    if (isAuthenticated && tokens?.idToken) {
      setAuthHeaders(tokens.idToken.toString());
    } else {
      setAuthHeaders(null);
    }
  }, [isAuthenticated, tokens]);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      const currentUser = await CognitoService.getCurrentUser();
      const session = await CognitoService.getCurrentSession();
      
      if (currentUser && session?.tokens) {
        setUser(currentUser);
        setTokens(session.tokens);
        setIsAuthenticated(true);
        console.log('✅ User authenticated:', currentUser.username);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setTokens(null);
        console.log('❌ No authenticated user');
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      setTokens(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await CognitoService.signIn(email, password);
      
      if (result.success) {
        const session = await CognitoService.getCurrentSession();
        const currentUser = await CognitoService.getCurrentUser();
        
        if (session?.tokens && currentUser) {
          setTokens(session.tokens);
          setUser(currentUser);
          setIsAuthenticated(true);
          return { success: true };
        }
      }
      
      setError(result.error);
      return { success: false, error: result.error };
    } catch (error) {
      const errorMessage = error.message || 'Помилка входу';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      await CognitoService.signOut();
      setIsAuthenticated(false);
      setUser(null);
      setTokens(null);
      setError(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setError('Помилка виходу');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setTokensFromSession = useCallback((newTokens) => {
    setTokens(newTokens);
    if (newTokens) {
      setIsAuthenticated(true);
    }
  }, []);

  // Get the access token for API requests
  const getAccessToken = useCallback(() => {
    return tokens?.accessToken?.toString() || null;
  }, [tokens]);

  // Get the ID token
  const getIdToken = useCallback(() => {
    return tokens?.idToken?.toString() || null;
  }, [tokens]);

  // Get user profile information
  const getUserProfile = useCallback(() => {
    if (user) {
      return {
        email: user.username,
        name: user.attributes?.name || user.username,
        sub: user.userId
      };
    }
    return null;
  }, [user]);

  // Create authorization headers for API requests
  const getAuthHeaders = useCallback(() => {
    const token = getIdToken();
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }
    return {
      'Content-Type': 'application/json'
    };
  }, [getIdToken]);

  const value = {
    isAuthenticated,
    isLoading,
    user,
    tokens,
    error,
    signIn,
    signOut,
    setTokens: setTokensFromSession,
    getAccessToken,
    getIdToken,
    getUserProfile,
    getAuthHeaders,
    checkAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Хук для використання автентифікації
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
