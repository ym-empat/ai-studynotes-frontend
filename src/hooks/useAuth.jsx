import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CognitoService } from '../services/cognitoService';
import { setAuthHeaders } from '../services/api';
import apiClient from '../services/api';

// Створюємо контекст для автентифікації
const AuthContext = createContext();

// Provider компонент для автентифікації
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isApiReady, setIsApiReady] = useState(false);
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [error, setError] = useState(null);

  // Перевіряємо поточний стан автентифікації при завантаженні
  useEffect(() => {
    console.log('🔄 useAuth: Starting auth check on page load');
    checkAuthState();
  }, []);

  // Функція для перевірки валідності токена
  const isTokenValid = useCallback((tokenString) => {
    if (!tokenString) return false;
    
    try {
      const payload = JSON.parse(atob(tokenString.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Перевіряємо, чи не закінчився термін дії токена (з запасом в 5 хвилин)
      if (payload.exp && payload.exp < currentTime + 300) {
        console.log('⚠️ Token expired');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error validating token:', error);
      return false;
    }
  }, []);

  // Функція для збереження токенів в localStorage
  const saveTokensToStorage = useCallback((tokens) => {
    if (tokens && tokens.idToken) {
      try {
        const idTokenString = tokens.idToken.toString();
        
        // Перевіряємо валідність токена перед збереженням
        if (isTokenValid(idTokenString)) {
          localStorage.setItem('auth_tokens', JSON.stringify({
            idToken: idTokenString,
            accessToken: tokens.accessToken?.toString(),
            refreshToken: tokens.refreshToken?.toString(),
            timestamp: Date.now()
          }));
          console.log('✅ Tokens saved to localStorage');
        } else {
          console.log('⚠️ Token invalid, not saving to localStorage');
          clearTokensFromStorage();
        }
      } catch (error) {
        console.error('❌ Error saving tokens to localStorage:', error);
      }
    }
  }, [isTokenValid]);

  // Функція для завантаження токенів з localStorage
  const loadTokensFromStorage = useCallback(() => {
    try {
      const savedTokens = localStorage.getItem('auth_tokens');
      if (savedTokens) {
        const parsedTokens = JSON.parse(savedTokens);
        
        // Перевіряємо, чи не застаріли токени (24 години)
        const isExpired = Date.now() - parsedTokens.timestamp > 24 * 60 * 60 * 1000;
        if (!isExpired && isTokenValid(parsedTokens.idToken)) {
          console.log('✅ Tokens loaded from localStorage');
          return parsedTokens;
        } else {
          console.log('⚠️ Saved tokens expired or invalid, removing from storage');
          localStorage.removeItem('auth_tokens');
        }
      }
    } catch (error) {
      console.error('❌ Error loading tokens from localStorage:', error);
      localStorage.removeItem('auth_tokens');
    }
    return null;
  }, [isTokenValid]);

  // Функція для видалення токенів з localStorage
  const clearTokensFromStorage = useCallback(() => {
    localStorage.removeItem('auth_tokens');
    console.log('✅ Tokens cleared from localStorage');
  }, []);

  // Автоматично встановлюємо заголовки авторизації
  useEffect(() => {
    console.log('🔧 useAuth useEffect: Setting auth headers:', {
      isAuthenticated,
      hasTokens: !!tokens,
      hasIdToken: !!tokens?.idToken,
      isLoading
    });
    
    if (isAuthenticated && tokens?.idToken) {
      console.log('🔧 useAuth useEffect: Setting headers with token');
      setAuthHeaders(tokens.idToken.toString());
      
      // Встановлюємо стан готовності API через короткий час
      setTimeout(() => {
        const currentAuthHeader = apiClient.defaults.headers.common['Authorization'];
        console.log('🔧 useAuth useEffect: Verification - Authorization header:', currentAuthHeader ? 'SET' : 'NOT SET');
        setIsApiReady(!!currentAuthHeader);
      }, 150);
    } else {
      console.log('🔧 useAuth useEffect: Clearing headers');
      setAuthHeaders(null);
      setIsApiReady(false);
    }
  }, [isAuthenticated, tokens]);

  const checkAuthState = async () => {
    try {
      console.log('🔍 checkAuthState: Starting auth check...');
      setIsLoading(true);
      
      // Спочатку спробуємо отримати поточного користувача з Cognito
      console.log('🔍 checkAuthState: Checking Cognito session...');
      const currentUser = await CognitoService.getCurrentUser();
      const session = await CognitoService.getCurrentSession();
      
      console.log('🔍 checkAuthState: Cognito results:', {
        hasUser: !!currentUser,
        hasSession: !!session,
        hasTokens: !!session?.tokens,
        userUsername: currentUser?.username
      });
      
      if (currentUser && session?.tokens) {
        // Якщо користувач авторизований через Cognito, зберігаємо токени
        setUser(currentUser);
        setTokens(session.tokens);
        setIsAuthenticated(true);
        saveTokensToStorage(session.tokens);
        console.log('✅ User authenticated via Cognito:', currentUser.username);
        console.log('🔍 User attributes on load:', currentUser.attributes);
      } else {
        // Якщо немає активної сесії Cognito, перевіряємо збережені токени
        console.log('🔍 checkAuthState: No active Cognito session, checking localStorage...');
        const savedTokens = loadTokensFromStorage();
        console.log('🔍 checkAuthState: localStorage results:', {
          hasSavedTokens: !!savedTokens,
          hasIdToken: !!savedTokens?.idToken
        });
        
        if (savedTokens && savedTokens.idToken) {
          // Створюємо мок-об'єкт токенів для збережених даних
          const mockTokens = {
            idToken: { toString: () => savedTokens.idToken },
            accessToken: { toString: () => savedTokens.accessToken },
            refreshToken: { toString: () => savedTokens.refreshToken }
          };
          
          setTokens(mockTokens);
          setIsAuthenticated(true);
          console.log('✅ User authenticated via saved tokens');
          
          // Спробуємо отримати інформацію про користувача з ID токена
          try {
            const payload = JSON.parse(atob(savedTokens.idToken.split('.')[1]));
            const mockUser = {
              username: payload['cognito:username'] || payload.email,
              userId: payload.sub,
              attributes: {
                email: payload.email,
                name: payload.name || payload.given_name || payload.family_name
              }
            };
            setUser(mockUser);
            console.log('✅ User info restored from saved tokens');
          } catch (tokenError) {
            console.error('❌ Error parsing saved token:', tokenError);
            // Якщо не можемо розпарсити токен, очищуємо збережені дані
            clearTokensFromStorage();
            setIsAuthenticated(false);
            setUser(null);
            setTokens(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setTokens(null);
          console.log('❌ No authenticated user');
        }
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      setTokens(null);
      clearTokensFromStorage();
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
          saveTokensToStorage(session.tokens);
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
      clearTokensFromStorage();
    } catch (error) {
      console.error('Sign out error:', error);
      setError('Помилка виходу');
      // Навіть якщо Cognito signOut не спрацював, очищуємо локальні дані
      clearTokensFromStorage();
      setIsAuthenticated(false);
      setUser(null);
      setTokens(null);
    } finally {
      setIsLoading(false);
    }
  }, [clearTokensFromStorage]);

  const setTokensFromSession = useCallback((newTokens) => {
    setTokens(newTokens);
    if (newTokens) {
      setIsAuthenticated(true);
      saveTokensToStorage(newTokens);
    }
  }, [saveTokensToStorage]);

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
      console.log('🔍 User object:', user);
      console.log('🔍 User attributes:', user.attributes);
      console.log('🔍 User username:', user.username);
      console.log('🔍 User userId:', user.userId);
      
      // Спробуємо отримати дані з ID токена
      const idToken = tokens?.idToken;
      if (idToken) {
        try {
          const payload = JSON.parse(atob(idToken.toString().split('.')[1]));
          console.log('🔍 ID Token payload:', payload);
          
          // Використовуємо дані з токена як fallback
          const tokenEmail = payload.email || payload['cognito:username'];
          const tokenName = payload.name || payload.given_name || payload.family_name;
          
          console.log('🔍 Token email:', tokenEmail);
          console.log('🔍 Token name:', tokenName);
        } catch (error) {
          console.log('🔍 Error parsing ID token:', error);
        }
      }
      
      // Спробуємо різні способи отримання імені
      let name = user.attributes?.name || 
                 user.attributes?.given_name || 
                 user.attributes?.family_name;
      
      // Якщо ім'я не знайдено в атрибутах, спробуємо з ID токена
      if (!name && idToken) {
        try {
          const payload = JSON.parse(atob(idToken.toString().split('.')[1]));
          name = payload.name || payload.given_name || payload.family_name;
          console.log('🔍 Name from ID token:', name);
        } catch (error) {
          console.log('🔍 Error parsing ID token for name:', error);
        }
      }
      
      // Якщо ім'я все ще не знайдено, використовуємо частину email
      if (!name) {
        const email = user.attributes?.email || user.username;
        console.log('🔍 Email for name extraction:', email);
        if (email && email.includes('@')) {
          name = email.split('@')[0];
          // Робимо першу літеру великою
          name = name.charAt(0).toUpperCase() + name.slice(1);
        } else {
          name = 'Користувач';
        }
      }
      
      console.log('🔍 Extracted name:', name);
      
      // Спробуємо отримати email з різних джерел
      let email = user.attributes?.email || user.username;
      
      // Якщо email не знайдено, спробуємо з ID токена
      if (!email || email.includes('-') || email.length > 50) { // Перевіряємо, чи це не UUID
        if (idToken) {
          try {
            const payload = JSON.parse(atob(idToken.toString().split('.')[1]));
            email = payload.email || payload['cognito:username'];
            console.log('🔍 Email from ID token:', email);
          } catch (error) {
            console.log('🔍 Error parsing ID token for email:', error);
          }
        }
      }
      
      console.log('🔍 Final email:', email);
      
      return {
        email: email,
        name: name,
        sub: user.userId
      };
    }
    return null;
  }, [user, tokens]);

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
    isApiReady,
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
    checkAuthState,
    saveTokensToStorage,
    loadTokensFromStorage,
    clearTokensFromStorage
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
