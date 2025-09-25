// Утиліти для діагностики авторизації

export const debugAuthState = () => {
  console.log('🔍 === AUTH DEBUG INFO ===');
  
  // Перевірка localStorage
  const savedTokens = localStorage.getItem('auth_tokens');
  console.log('🔍 localStorage auth_tokens:', savedTokens ? 'EXISTS' : 'NOT FOUND');
  
  if (savedTokens) {
    try {
      const parsed = JSON.parse(savedTokens);
      console.log('🔍 Parsed tokens:', {
        hasIdToken: !!parsed.idToken,
        hasAccessToken: !!parsed.accessToken,
        hasRefreshToken: !!parsed.refreshToken,
        timestamp: parsed.timestamp,
        age: parsed.timestamp ? Date.now() - parsed.timestamp : 'unknown'
      });
      
      // Перевірка валідності токена
      if (parsed.idToken) {
        try {
          const payload = JSON.parse(atob(parsed.idToken.split('.')[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          const isExpired = payload.exp && payload.exp < currentTime;
          
          console.log('🔍 Token validation:', {
            exp: payload.exp,
            currentTime,
            isExpired,
            expiresIn: payload.exp ? payload.exp - currentTime : 'unknown'
          });
        } catch (error) {
          console.error('🔍 Error parsing token:', error);
        }
      }
    } catch (error) {
      console.error('🔍 Error parsing saved tokens:', error);
    }
  }
  
  // Перевірка sessionStorage
  console.log('🔍 sessionStorage keys:', Object.keys(sessionStorage));
  
  console.log('🔍 === END AUTH DEBUG ===');
};

export const clearAuthData = () => {
  console.log('🧹 Clearing all auth data...');
  localStorage.removeItem('auth_tokens');
  sessionStorage.clear();
  console.log('✅ Auth data cleared');
};

// Додаємо функції в глобальний об'єкт для зручності
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuthState;
  window.clearAuth = clearAuthData;
}
