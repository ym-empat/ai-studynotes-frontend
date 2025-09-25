import { useAuth as useOidcAuth } from 'react-oidc-context';
import { useCallback, useEffect } from 'react';
import { setAuthHeaders } from '../services/api';

export const useAuth = () => {
  const auth = useOidcAuth();

  // Automatically set auth headers when user logs in/out
  useEffect(() => {
    console.log('🔐 Auth state changed:', {
      isAuthenticated: auth.isAuthenticated,
      hasUser: !!auth.user,
      hasAccessToken: !!auth.user?.access_token
    });
    
    if (auth.isAuthenticated && auth.user && auth.user.access_token) {
      setAuthHeaders(auth.user.access_token);
    } else {
      setAuthHeaders(null);
    }
  }, [auth.isAuthenticated, auth.user]);

  // Get the access token for API requests
  const getAccessToken = useCallback(() => {
    if (auth.isAuthenticated && auth.user) {
      return auth.user.access_token;
    }
    return null;
  }, [auth.isAuthenticated, auth.user]);

  // Get the ID token
  const getIdToken = useCallback(() => {
    if (auth.isAuthenticated && auth.user) {
      return auth.user.id_token;
    }
    return null;
  }, [auth.isAuthenticated, auth.user]);

  // Get user profile information
  const getUserProfile = useCallback(() => {
    if (auth.isAuthenticated && auth.user) {
      return auth.user.profile;
    }
    return null;
  }, [auth.isAuthenticated, auth.user]);

  // Create authorization headers for API requests
  const getAuthHeaders = useCallback(() => {
    const token = getAccessToken();
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }
    return {
      'Content-Type': 'application/json'
    };
  }, [getAccessToken]);

  // Sign out and clear user data
  const signOut = useCallback(() => {
    auth.removeUser();
  }, [auth]);

  return {
    // Original auth properties
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    user: auth.user,
    
    // Custom helper methods
    getAccessToken,
    getIdToken,
    getUserProfile,
    getAuthHeaders,
    signOut,
    
    // Original auth methods
    signinRedirect: auth.signinRedirect,
    signinSilent: auth.signinSilent,
    signoutRedirect: auth.signoutRedirect,
    removeUser: auth.removeUser,
  };
};
