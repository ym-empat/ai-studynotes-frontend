# Налаштування авторизації через AWS Cognito

## Огляд

Цей проект використовує AWS Cognito для авторизації користувачів з кастомними формами входу та реєстрації без редіректів.

## Встановлені залежності

- `oidc-client-ts` - OIDC клієнт для роботи з Cognito
- `react-oidc-context` - React контекст для OIDC авторизації

## Конфігурація

### 1. Налаштування Cognito через змінні середовища

Створіть файл `.env` на основі `env.example`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_KEY=your-api-key-here

# AWS Cognito Configuration
VITE_COGNITO_AUTHORITY=https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_liScrW4G3
VITE_COGNITO_CLIENT_ID=35ktssblhrugrug23uvbtsbm5r
VITE_COGNITO_REDIRECT_URI=http://localhost:5173
VITE_COGNITO_RESPONSE_TYPE=code
VITE_COGNITO_SCOPE=email openid phone
```

Конфігурація автоматично завантажується з змінних середовища в `main.jsx`:
```javascript
const cognitoAuthConfig = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
  response_type: import.meta.env.VITE_COGNITO_RESPONSE_TYPE,
  scope: import.meta.env.VITE_COGNITO_SCOPE,
};
```

### 2. Fallback значення

Якщо змінні середовища не налаштовані, використовуються fallback значення:
- `VITE_COGNITO_AUTHORITY`: `https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_liScrW4G3`
- `VITE_COGNITO_CLIENT_ID`: `35ktssblhrugrug23uvbtsbm5r`
- `VITE_COGNITO_REDIRECT_URI`: `http://localhost:5173`
- `VITE_COGNITO_RESPONSE_TYPE`: `code`
- `VITE_COGNITO_SCOPE`: `email openid phone`

Консоль покаже попередження, якщо відсутні обов'язкові змінні середовища.

### 3. Структура маршрутів

- `/login` - Сторінка входу
- `/register` - Сторінка реєстрації
- `/` - Головна сторінка (захищена)
- `/task/:id` - Деталі завдання (захищена)

## Використання

### Хук useAuth

```javascript
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const auth = useAuth();
  
  // Перевірка авторизації
  if (auth.isAuthenticated) {
    console.log('Користувач авторизований:', auth.getUserProfile());
  }
  
  // Отримання токенів
  const accessToken = auth.getAccessToken(); // Доступний, але не використовується
  const idToken = auth.getIdToken(); // Використовується для API запитів
  
  // Вихід
  const handleSignOut = () => {
    auth.signOut();
  };
};
```

### Автоматичні заголовки API

API клієнт автоматично додає Bearer токен до всіх запитів. **Використовується ID токен**:

```javascript
// В api.js
export const setAuthHeaders = (idToken) => {
  if (idToken) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};
```

### Різниця між Access та ID токенами

- **Access Token** - використовується для доступу до API ресурсів
- **ID Token** - містить інформацію про користувача, використовується для ідентифікації

В цьому проекті використовується **ID Token** для авторизації API запитів.

### Захищені маршрути

```javascript
<ProtectedRoute>
  <TaskListPage />
</ProtectedRoute>
```

## Компоненти

### LoginPage
- Кастомна форма входу з redirect flow
- Валідація даних
- Обробка помилок
- Опція входу через Google
- Автоматичне збереження даних форми в sessionStorage

### RegisterPage
- Повна кастомна форма реєстрації на сайті
- Пряма інтеграція з Cognito API через AWS Amplify
- Поля: ім'я, email, пароль, підтвердження пароля
- Автоматичне підтвердження email з кодом
- Валідація форми на клієнті та сервері

### ProtectedRoute
- Автоматичне перенаправлення неавторизованих користувачів
- Показ стану завантаження
- Обробка помилок авторизації

## API Integration

Всі API запити автоматично включають токен авторизації:

```javascript
// Приклад використання в компоненті
const MyComponent = () => {
  const auth = useAuth();
  
  const fetchData = async () => {
    // Токен автоматично додається до запиту
    const response = await apiClient.get('/protected-endpoint');
    return response.data;
  };
};
```

## CognitoService

Сервіс для прямої роботи з Cognito API:

```javascript
import { CognitoService } from '../services/cognitoService';

// Реєстрація
const result = await CognitoService.signUp({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe'
});

// Підтвердження email
const result = await CognitoService.confirmSignUp(email, code);

// Повторна відправка коду
const result = await CognitoService.resendConfirmationCode(email);
```

## Налаштування Cognito User Pool

### App Client Settings
- **Allowed Callback URLs**: `http://localhost:5174` (або ваш домен для продакшну)
- **Allowed Logout URLs**: `http://localhost:5174` (або ваш домен для продакшну)
- **Allowed OAuth Scopes**: `email`, `openid`, `phone`

### Authentication Flow
- **Authentication Flow**: `ALLOW_USER_SRP_AUTH`, `ALLOW_USER_PASSWORD_AUTH`

### Важливо для CSP проблем
- **OAuth 2.0 Flow**: Використовуйте тільки `Authorization code grant`
- **Implicit grant**: НЕ використовуйте (викликає CSP помилки)
- **Public client**: Встановіть як "Public client" для SPA

## Безпека

1. **Токени**: Access токени автоматично додаються до API запитів
2. **Сесії**: Користувачі автоматично виходять при закінченні сесії
3. **Валідація**: Всі форми мають клієнтську валідацію
4. **HTTPS**: В продакшні обов'язково використовуйте HTTPS

## Розробка

### Локальний запуск
```bash
# 1. Створіть файл .env на основі env.example
cp env.example .env

# 2. Відредагуйте .env файл з вашими налаштуваннями
# 3. Запустіть додаток
npm run dev
```

### Змінні середовища
Створіть файл `.env` на основі `env.example`:

```env
# API Configuration
VITE_API_BASE_URL=your_api_url
VITE_API_KEY=your_api_key

# AWS Cognito Configuration
VITE_COGNITO_AUTHORITY=https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_liScrW4G3
VITE_COGNITO_CLIENT_ID=35ktssblhrugrug23uvbtsbm5r
VITE_COGNITO_REDIRECT_URI=http://localhost:5173
VITE_COGNITO_RESPONSE_TYPE=code
VITE_COGNITO_SCOPE=email openid phone
```

**Важливо**: 
- Замініть значення на ваші реальні налаштування Cognito
- Для продакшну змініть `VITE_COGNITO_REDIRECT_URI` на ваш домен
- Файл `.env` не повинен бути в git (вже додано до `.gitignore`)
- Якщо змінні середовища не налаштовані, використовуються fallback значення

## Troubleshooting

### Поширені проблеми

1. **CSP помилка "frame-ancestors 'none'"**: 
   - **Причина**: Cognito блокує вбудовування в iframe через Content Security Policy
   - **Рішення**: Використовуйте redirect flow замість popup або iframe
   - **Код**: Використовуйте `auth.signinRedirect()` замість `auth.signinSilent()`

2. **CORS помилки**: Перевірте налаштування Cognito App Client
3. **Токени не додаються**: Перевірте чи правильно налаштований AuthProvider
4. **Редиректи не працюють**: Перевірте callback URLs в Cognito

### Логи
Всі помилки авторизації логуються в консоль браузера для дебагу.
