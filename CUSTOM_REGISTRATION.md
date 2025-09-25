# Кастомна реєстрація на сайті

## Огляд

Тепер реєстрація відбувається безпосередньо на вашому сайті без редіректів на Cognito Hosted UI. Використовується AWS Amplify для прямих викликів Cognito API.

## Встановлені залежності

- `aws-amplify` - AWS SDK для JavaScript
- `@aws-amplify/ui-react` - React компоненти для Amplify

## Архітектура

### 1. CognitoService
Центральний сервіс для роботи з Cognito API:

```javascript
// Реєстрація користувача
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

### 2. Форма реєстрації
Повна форма з усіма необхідними полями:

- **Ім'я** (обов'язково)
- **Email** (обов'язково)
- **Пароль** (мінімум 8 символів)
- **Підтвердження пароля** (має співпадати)
- **Погодження з умовами** (чекбокс)

### 3. Підтвердження email
Автоматичний перехід до форми підтвердження після реєстрації:

- Показує email, на який відправлено код
- Поле для введення коду підтвердження
- Кнопка "Відправити код повторно"
- Автоматичне перенаправлення на сторінку входу після підтвердження

## Процес реєстрації

### Крок 1: Заповнення форми
1. Користувач вводить ім'я, email, пароль
2. Форма валідується (email формат, співпадіння паролів, довжина)
3. Натискає "Створити акаунт"

### Крок 2: Реєстрація в Cognito
1. CognitoService.signUp() викликає Cognito API
2. Cognito створює користувача в User Pool
3. Відправляє код підтвердження на email
4. Показує форму підтвердження

### Крок 3: Підтвердження email
1. Користувач вводить код з email
2. CognitoService.confirmSignUp() підтверджує реєстрацію
3. Перенаправлення на сторінку входу

## Налаштування Cognito

### User Pool Configuration
- **User Pool ID**: `eu-central-1_liScrW4G3`
- **App Client ID**: `35ktssblhrugrug23uvbtsbm5r`
- **Region**: `eu-central-1`

### Authentication Flows
- ✅ ALLOW_USER_SRP_AUTH
- ✅ ALLOW_USER_PASSWORD_AUTH
- ✅ ALLOW_REFRESH_TOKEN_AUTH

### Password Policy
- Мінімум 8 символів
- Складність (великі/малі літери, цифри, символи)

## Переваги кастомної реєстрації

✅ **Повний контроль над UI/UX** - використовуйте власний дизайн
✅ **Без редіректів** - користувач залишається на вашому сайті
✅ **Кастомна валідація** - додайте власні правила валідації
✅ **Інтеграція з дизайном** - форма відповідає стилю сайту
✅ **Кращий UX** - плавний процес без переходів між сайтами

## Обробка помилок

### Поширені помилки Cognito

1. **UsernameExistsException**: Користувач вже існує
2. **InvalidPasswordException**: Пароль не відповідає політиці
3. **InvalidParameterException**: Неправильні параметри
4. **CodeMismatchException**: Неправильний код підтвердження
5. **ExpiredCodeException**: Код підтвердження застарів

### Валідація на клієнті

```javascript
const validateForm = () => {
  if (!formData.email.includes('@')) {
    setError('Введіть правильну email адресу');
    return false;
  }
  if (formData.password !== formData.confirmPassword) {
    setError('Паролі не співпадають');
    return false;
  }
  if (formData.password.length < 8) {
    setError('Пароль повинен містити принаймні 8 символів');
    return false;
  }
  return true;
};
```

## Логування та діагностика

CognitoService логує всі операції:

```javascript
console.log('🚀 Cognito signUp:', { email: userData.email, name: userData.name });
console.log('✅ Cognito signUp success:', result);
console.error('❌ Cognito signUp error:', error);
```

## Безпека

1. **Паролі** зберігаються в Cognito з шифруванням
2. **Email коди** мають обмежений час життя
3. **Rate limiting** - Cognito обмежує кількість спроб
4. **Валідація** на сервері та клієнті

## Розширення функціональності

### Додаткові поля
Можна додати більше атрибутів користувача:

```javascript
attributes: {
  email: userData.email,
  name: userData.name,
  phone_number: userData.phone,
  // інші атрибути
}
```

### Кастомні валідації
Додайте Lambda тригери для кастомної валідації:

```javascript
// Pre Sign-up trigger
exports.handler = async (event) => {
  // Кастомна валідація
  if (event.request.userAttributes.email.includes('test')) {
    throw new Error('Test emails not allowed');
  }
  return event;
};
```

## Troubleshooting

### Проблема: "User already exists"
**Рішення**: Перевірте, чи не реєструвався користувач раніше

### Проблема: "Invalid password format"
**Рішення**: Перевірте Password Policy в Cognito

### Проблема: "Code expired"
**Рішення**: Використайте кнопку "Відправити код повторно"

### Проблема: "Network error"
**Рішення**: Перевірте інтернет-з'єднання та налаштування Cognito
