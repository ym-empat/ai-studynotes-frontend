# AWS Amplify v6 Migration

## Проблема

При використанні AWS Amplify v6 виникла помилка:
```
Uncaught SyntaxError: The requested module '/node_modules/.vite/deps/aws-amplify.js?v=746fd8cc' does not provide an export named 'Auth'
```

## Причина

AWS Amplify v6 кардинально змінив API. Старий спосіб імпорту `import { Auth } from 'aws-amplify'` більше не працює.

## Рішення

### 1. Оновлені імпорти

**Було (v5):**
```javascript
import { Auth } from 'aws-amplify';
```

**Стало (v6):**
```javascript
import { signUp, confirmSignUp, resendSignUpCode, signIn, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
```

### 2. Оновлена конфігурація

**Було (v5):**
```javascript
const amplifyConfig = {
  Auth: {
    region: 'eu-central-1',
    userPoolId: 'eu-central-1_liScrW4G3',
    userPoolWebClientId: '35ktssblhrugrug23uvbtsbm5r',
    authenticationFlowType: 'USER_SRP_AUTH',
  }
};

Auth.configure(amplifyConfig);
```

**Стало (v6):**
```javascript
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'eu-central-1_liScrW4G3',
      userPoolClientId: '35ktssblhrugrug23uvbtsbm5r',
      loginWith: {
        email: true,
        username: false,
        phone: false,
      }
    }
  }
};

Amplify.configure(amplifyConfig);
```

### 3. Оновлені методи

#### SignUp

**Було (v5):**
```javascript
const result = await Auth.signUp({
  username: userData.email,
  password: userData.password,
  attributes: {
    email: userData.email,
    name: userData.name,
  },
  autoSignIn: {
    enabled: true,
  }
});
```

**Стало (v6):**
```javascript
const { isSignUpComplete, userId, nextStep } = await signUp({
  username: userData.email,
  password: userData.password,
  options: {
    userAttributes: {
      email: userData.email,
      name: userData.name,
    },
    autoSignIn: true,
  }
});
```

#### ConfirmSignUp

**Було (v5):**
```javascript
const result = await Auth.confirmSignUp(email, code);
```

**Стало (v6):**
```javascript
const { isSignUpComplete } = await confirmSignUp({
  username: email,
  confirmationCode: code
});
```

#### ResendConfirmationCode

**Було (v5):**
```javascript
await Auth.resendSignUp(email);
```

**Стало (v6):**
```javascript
const { destination } = await resendSignUpCode({
  username: email
});
```

#### SignIn

**Було (v5):**
```javascript
const user = await Auth.signIn(email, password);
```

**Стало (v6):**
```javascript
const { isSignedIn, nextStep } = await signIn({
  username: email,
  password: password
});
```

#### SignOut

**Було (v5):**
```javascript
await Auth.signOut();
```

**Стало (v6):**
```javascript
await signOut();
```

#### GetCurrentUser

**Було (v5):**
```javascript
const user = await Auth.currentAuthenticatedUser();
```

**Стало (v6):**
```javascript
const user = await getCurrentUser();
```

#### GetCurrentSession

**Було (v5):**
```javascript
const session = await Auth.currentSession();
```

**Стало (v6):**
```javascript
const session = await fetchAuthSession();
```

## Ключові зміни в v6

### 1. Модульна архітектура
- Замість одного об'єкта `Auth` тепер окремі функції
- Імпорт тільки потрібних функцій
- Краща tree-shaking

### 2. Нова структура конфігурації
- `Auth.Cognito` замість безпосередніх параметрів
- `userPoolWebClientId` → `userPoolClientId`
- `loginWith` для налаштування методів входу

### 3. Змінені параметри функцій
- Об'єктні параметри замість позиційних
- `options` для додаткових налаштувань
- Структуровані відповіді з деструктуризацією

### 4. Покращена типізація
- Кращі TypeScript типи
- Більш явні інтерфейси
- Менше помилок під час розробки

## Переваги v6

✅ **Кращий tree-shaking** - менший розмір bundle
✅ **Модульність** - імпорт тільки потрібного
✅ **Типізація** - кращі TypeScript типи
✅ **Продуктивність** - оптимізовані API виклики
✅ **Майбутність** - підтримка нових функцій

## Сумісність

- **Node.js**: 16+
- **React**: 16.8+
- **TypeScript**: 4.9+ (опціонально)
- **Browsers**: ES2020+

## Troubleshooting

### Помилка: "Module not found"
**Рішення**: Перевірте правильність імпорту функцій

### Помилка: "Configuration error"
**Рішення**: Оновіть структуру конфігурації відповідно до v6

### Помилка: "Function signature changed"
**Рішення**: Оновіть виклики функцій з новими параметрами

## Документація

- [AWS Amplify v6 Migration Guide](https://docs.amplify.aws/react/build-a-backend/auth/migrate/)
- [Amplify v6 API Reference](https://aws-amplify.github.io/amplify-js/api/)
- [Breaking Changes](https://github.com/aws-amplify/amplify-js/blob/main/BREAKING_CHANGES.md)
