# Діагностика проблем з авторизацією

## Проблема: 401 Unauthorized

Якщо ви бачите помилку `401 Unauthorized` в API запитах, це означає, що токен авторизації не передається або не валідний.

## Кроки діагностики

### 1. Перевірте консоль браузера

Відкрийте Developer Tools (F12) і подивіться на логи:

```
🔐 Auth state changed: { isAuthenticated: false, hasUser: false, hasAccessToken: false }
❌ Authorization header removed
🚀 API Request: { method: 'GET', url: '/tasks', headers: { Authorization: 'None' } }
❌ API Error: { status: 401, message: 'Unauthorized', url: '/tasks' }
```

### 2. Перевірте AuthDebug компонент

В правому нижньому куті повинен з'явитися компонент з інформацією про стан авторизації:

- **Loading**: ✅ (під час завантаження)
- **Authenticated**: ❌ (якщо не авторизований)
- **Has User**: ❌ (якщо немає користувача)
- **Has Access Token**: ❌ (якщо немає токена)

### 3. Перевірте стан авторизації

Якщо користувач не авторизований:
1. Перейдіть на `/login`
2. Натисніть "Увійти" або "Увійти через Google"
3. Пройдіть авторизацію в Cognito
4. Перевірте, чи повернувся користувач на головну сторінку

### 4. Перевірте токен

Після успішної авторизації в консолі повинно з'явитися:

```
🔐 Auth state changed: { isAuthenticated: true, hasUser: true, hasAccessToken: true }
✅ Authorization header set: Bearer eyJhbGciOiJSUzI1NiI...
🚀 API Request: { method: 'GET', url: '/tasks', headers: { Authorization: 'Bearer [TOKEN]' } }
✅ API Response: { status: 200, url: '/tasks' }
```

## Можливі проблеми та рішення

### Проблема 1: Користувач не авторизований

**Симптоми:**
- AuthDebug показує `Authenticated: ❌`
- В консолі: `🔒 User not authenticated, redirecting to login`

**Рішення:**
1. Перейдіть на сторінку входу
2. Увійдіть через Cognito
3. Переконайтеся, що redirect URI правильний

### Проблема 2: Немає токена

**Симптоми:**
- `Authenticated: ✅` але `Has Access Token: ❌`
- В консолі: `❌ Authorization header removed`

**Рішення:**
1. Перевірте налаштування Cognito User Pool
2. Переконайтеся, що scope включає необхідні дозволи
3. Перевірте, чи правильно налаштований OAuth 2.0 flow

### Проблема 3: Токен не передається

**Симптоми:**
- `Has Access Token: ✅` але в API запиті `Authorization: 'None'`

**Рішення:**
1. Перевірте, чи правильно працює `setAuthHeaders`
2. Переконайтеся, що `useAuth` хук викликається
3. Перезавантажте сторінку

### Проблема 4: Токен не валідний

**Симптоми:**
- Токен передається, але API повертає 401
- Можливо, токен застарів

**Рішення:**
1. Перевірте, чи правильно налаштований API Gateway
2. Переконайтеся, що Cognito User Pool правильно інтегрований з API
3. Спробуйте вийти та увійти знову

## Логи для діагностики

### Успішна авторизація:
```
🔐 Auth state changed: { isAuthenticated: true, hasUser: true, hasAccessToken: true }
✅ Authorization header set: Bearer eyJhbGciOiJSUzI1NiI...
📊 useStudyItems effect: { isAuthenticated: true, isLoading: false, hasAccessToken: true }
🚀 API Request: { method: 'GET', url: '/tasks', headers: { Authorization: 'Bearer [TOKEN]', x-api-key: '[SET]' } }
✅ API Response: { status: 200, url: '/tasks' }
```

### Неуспішна авторизація:
```
🔐 Auth state changed: { isAuthenticated: false, hasUser: false, hasAccessToken: false }
❌ Authorization header removed
📊 useStudyItems effect: { isAuthenticated: false, isLoading: false, hasAccessToken: false }
⚠️ User not authenticated, skipping API call
```

## Швидке виправлення

1. **Очистіть localStorage/sessionStorage**:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Перезавантажте сторінку** (Ctrl+F5)

3. **Перевірте налаштування Cognito**:
   - Callback URLs
   - OAuth Scopes
   - Authentication Flow

4. **Перевірте змінні середовища**:
   - `VITE_COGNITO_AUTHORITY`
   - `VITE_COGNITO_CLIENT_ID`
   - `VITE_COGNITO_REDIRECT_URI`
