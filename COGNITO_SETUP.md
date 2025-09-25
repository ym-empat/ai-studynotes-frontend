# Швидке налаштування Cognito для SPA

## Проблема CSP
Якщо ви бачите помилку:
```
Refused to frame 'https://eu-central-1liscrw4g3.auth.eu-central-1.amazoncognito.com/' because an ancestor violates the following Content Security Policy directive: "frame-ancestors 'none'"
```

Це означає, що Cognito блокує вбудовування в iframe. **Рішення**: Використовуйте redirect flow.

## Налаштування Cognito User Pool

### 1. App Client Settings
```
Client Type: Public client
Authentication Flow: 
  ✅ ALLOW_USER_SRP_AUTH
  ✅ ALLOW_USER_PASSWORD_AUTH
  ❌ ALLOW_REFRESH_TOKEN_AUTH (не потрібно для SPA)

OAuth 2.0 Grant Types:
  ✅ Authorization code grant
  ❌ Implicit grant (викликає CSP помилки)
```

### 2. Hosted UI Settings
```
Allowed Callback URLs: 
  http://localhost:5174
  https://yourdomain.com

Allowed Logout URLs:
  http://localhost:5174
  https://yourdomain.com

Allowed OAuth Scopes:
  ✅ email
  ✅ openid
  ✅ phone
```

### 3. Environment Variables
Створіть `.env` файл:
```env
VITE_COGNITO_AUTHORITY=https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_YOUR_POOL_ID
VITE_COGNITO_CLIENT_ID=your_client_id_here
VITE_COGNITO_REDIRECT_URI=http://localhost:5174
VITE_COGNITO_RESPONSE_TYPE=code
VITE_COGNITO_SCOPE=email openid phone
```

## Як працює redirect flow

1. Користувач натискає "Увійти"
2. Додаток перенаправляє на Cognito Hosted UI
3. Користувач входить в Cognito
4. Cognito перенаправляє назад на ваш додаток з кодом
5. Додаток обмінює код на токени

## Переваги redirect flow

✅ Немає CSP помилок
✅ Безпечний OAuth 2.0 flow
✅ Підтримує всі провайдери (Google, Facebook, тощо)
✅ Працює з мобільними додатками

## Використання ID токенів

В цьому проекті використовується **ID токен** для авторизації API запитів:

- **ID токен** містить інформацію про користувача
- **Access токен** доступний, але не використовується
- Переконайтеся, що ваш API налаштований для прийому ID токенів

## Недоліки redirect flow

❌ Користувач залишає ваш сайт
❌ Складніше для кастомних форм
❌ Потребує налаштування callback URLs

## Альтернативи

Якщо потрібен кастомний UI без редіректів:
1. Використовуйте AWS Amplify Auth
2. Використовуйте AWS SDK напряму
3. Створіть власний backend для авторизації
