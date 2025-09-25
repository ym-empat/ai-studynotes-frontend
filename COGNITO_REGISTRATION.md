# Налаштування реєстрації в Cognito

## Проблема з prompt параметром

Якщо ви бачите помилку:
```
Invalid prompt value provided
```

Це означає, що параметр `prompt: 'signup'` не підтримується вашим Cognito User Pool.

## Рішення

### 1. Використання Cognito Hosted UI

Cognito Hosted UI автоматично показує форму реєстрації при переході на `/signup` endpoint.

**URL для реєстрації:**
```
https://eu-central-1liscrw4g3.auth.eu-central-1.amazoncognito.com/signup?client_id=35ktssblhrugrug23uvbtsbm5r&response_type=code&scope=email openid phone&redirect_uri=http://localhost:5174
```

### 2. Налаштування Cognito User Pool

Переконайтеся, що ваш User Pool налаштований правильно:

#### App Client Settings
- **Client Type**: Public client
- **Authentication flows**: 
  - ✅ ALLOW_USER_SRP_AUTH
  - ✅ ALLOW_USER_PASSWORD_AUTH
  - ✅ ALLOW_REFRESH_TOKEN_AUTH

#### Hosted UI Settings
- **Allowed Callback URLs**: `http://localhost:5174`
- **Allowed Logout URLs**: `http://localhost:5174`
- **OAuth Scopes**: `email`, `openid`, `phone`

### 3. Форма реєстрації в Cognito

Cognito Hosted UI автоматично показує форму з полями:

- **Email address** (обов'язково)
- **Name** (якщо налаштовано)
- **Password** (з валідацією)
- **Confirm password**
- **Show password** (чекбокс)

### 4. Валідація пароля

Cognito автоматично валідує пароль згідно з налаштуваннями User Pool:

- Мінімальна довжина (зазвичай 8 символів)
- Складність (великі/малі літери, цифри, символи)

## Реалізація в додатку

### Спрощена форма реєстрації

Наша форма реєстрації тепер містить тільки:
- Email поле
- Кнопку "Продовжити реєстрацію"
- Інформаційне повідомлення

### Три способи реєстрації

1. **Через email**: Введіть email і натисніть "Продовжити реєстрацію"
2. **Через Google**: Натисніть кнопку Google
3. **Пряма реєстрація**: Натисніть "Пряма реєстрація в Cognito"

### Код реалізації

```javascript
// Простий redirect без prompt параметра
await auth.signinRedirect({
  login_hint: formData.email
});

// Або прямий URL
const authUrl = `${cognitoDomain}/signup?client_id=${clientId}&response_type=${responseType}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}`;
window.location.href = authUrl;
```

## Переваги цього підходу

✅ Немає помилок з prompt параметрами
✅ Використовує стандартні форми Cognito
✅ Автоматична валідація паролів
✅ Підтримка всіх провайдерів (Google, Facebook, тощо)
✅ Відповідає стандартам OAuth 2.0

## Недоліки

❌ Користувач залишає ваш сайт
❌ Менше контролю над UI/UX
❌ Складніше кастомізувати форму

## Альтернативи

Якщо потрібен повний контроль над формою:

1. **AWS Amplify Auth** - більше можливостей кастомізації
2. **AWS SDK напряму** - повний контроль
3. **Custom backend** - власна логіка реєстрації

## Troubleshooting

### Проблема: "Invalid prompt value"
**Рішення**: Видаліть параметр `prompt: 'signup'`

### Проблема: Реєстрація не працює
**Рішення**: 
1. Перевірте Callback URLs в Cognito
2. Переконайтеся, що Client ID правильний
3. Перевірте OAuth scopes

### Проблема: Пароль не проходить валідацію
**Рішення**: Перевірте Password Policy в User Pool
