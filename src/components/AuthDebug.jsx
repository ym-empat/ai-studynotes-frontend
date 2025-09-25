import React from 'react';
import { useAuth } from '../hooks/useAuth.jsx';

const AuthDebug = () => {
  const auth = useAuth();

  if (process.env.NODE_ENV === 'production') {
    return null; // Не показуємо в продакшні
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">🔐 Auth Debug</h3>
      <div className="space-y-1">
        <div>Loading: {auth.isLoading ? '✅' : '❌'}</div>
        <div>Authenticated: {auth.isAuthenticated ? '✅' : '❌'}</div>
        <div>Has User: {auth.user ? '✅' : '❌'}</div>
        <div>Has Access Token: {auth.getAccessToken() ? '✅' : '❌'}</div>
        <div>Has ID Token: {auth.getIdToken() ? '✅' : '❌'}</div>
        <div className="text-yellow-300">Using: ID Token</div>
        {auth.user && (
          <div className="mt-2">
            <div>Email: {auth.getUserProfile()?.email || 'N/A'}</div>
            <div>ID Token Preview: {auth.getIdToken()?.substring(0, 20)}...</div>
          </div>
        )}
        {auth.error && (
          <div className="text-red-300 mt-2">
            Error: {auth.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDebug;
