import { signUp, confirmSignUp, resendSignUpCode, signIn, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';

// Конфігурація Amplify для v6
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

// Ініціалізуємо Amplify (тільки один раз)
let isInitialized = false;
if (!isInitialized) {
  Amplify.configure(amplifyConfig);
  isInitialized = true;
}

export class CognitoService {
  /**
   * Реєстрація нового користувача
   * @param {Object} userData - Дані користувача
   * @param {string} userData.email - Email користувача
   * @param {string} userData.password - Пароль
   * @param {string} userData.name - Ім'я користувача
   * @returns {Promise<Object>} Результат реєстрації
   */
  static async signUp(userData) {
    try {
      console.log('🚀 Cognito signUp:', { email: userData.email, name: userData.name });
      
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

      console.log('✅ Cognito signUp success:', { isSignUpComplete, userId, nextStep });
      return {
        success: true,
        userSub: userId,
        needsConfirmation: !isSignUpComplete,
        message: 'Реєстрація успішна! Перевірте email для підтвердження.'
      };
    } catch (error) {
      console.error('❌ Cognito signUp error:', error);
      return {
        success: false,
        error: error.message || 'Помилка реєстрації'
      };
    }
  }

  /**
   * Підтвердження реєстрації через код з email
   * @param {string} email - Email користувача
   * @param {string} code - Код підтвердження
   * @returns {Promise<Object>} Результат підтвердження
   */
  static async confirmSignUp(email, code) {
    try {
      console.log('🚀 Cognito confirmSignUp:', { email, code });
      
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode: code
      });
      
      console.log('✅ Cognito confirmSignUp success:', { isSignUpComplete });
      return {
        success: true,
        message: 'Email підтверджено! Тепер ви можете увійти в систему.'
      };
    } catch (error) {
      console.error('❌ Cognito confirmSignUp error:', error);
      return {
        success: false,
        error: error.message || 'Помилка підтвердження email'
      };
    }
  }

  /**
   * Повторне відправлення коду підтвердження
   * @param {string} email - Email користувача
   * @returns {Promise<Object>} Результат відправки коду
   */
  static async resendConfirmationCode(email) {
    try {
      console.log('🚀 Cognito resendConfirmationCode:', { email });
      
      const { destination } = await resendSignUpCode({
        username: email
      });
      
      console.log('✅ Cognito resendConfirmationCode success:', { destination });
      return {
        success: true,
        message: 'Код підтвердження відправлено повторно!'
      };
    } catch (error) {
      console.error('❌ Cognito resendConfirmationCode error:', error);
      return {
        success: false,
        error: error.message || 'Помилка відправки коду'
      };
    }
  }

  /**
   * Вхід в систему
   * @param {string} email - Email користувача
   * @param {string} password - Пароль
   * @returns {Promise<Object>} Результат входу
   */
  static async signIn(email, password) {
    try {
      console.log('🚀 Cognito signIn:', { email });
      
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password: password
      });
      
      console.log('✅ Cognito signIn success:', { isSignedIn, nextStep });
      return {
        success: true,
        user: { username: email },
        message: 'Вхід успішний!'
      };
    } catch (error) {
      console.error('❌ Cognito signIn error:', error);
      return {
        success: false,
        error: error.message || 'Помилка входу'
      };
    }
  }

  /**
   * Вихід з системи
   * @returns {Promise<Object>} Результат виходу
   */
  static async signOut() {
    try {
      console.log('🚀 Cognito signOut');
      
      await signOut();
      
      console.log('✅ Cognito signOut success');
      return {
        success: true,
        message: 'Вихід успішний!'
      };
    } catch (error) {
      console.error('❌ Cognito signOut error:', error);
      return {
        success: false,
        error: error.message || 'Помилка виходу'
      };
    }
  }

  /**
   * Отримання поточного користувача
   * @returns {Promise<Object|null>} Поточний користувач або null
   */
  static async getCurrentUser() {
    try {
      const user = await getCurrentUser();
      return user;
    } catch (error) {
      console.log('No authenticated user');
      return null;
    }
  }

  /**
   * Отримання токенів поточного користувача
   * @returns {Promise<Object|null>} Токени або null
   */
  static async getCurrentSession() {
    try {
      const session = await fetchAuthSession();
      return session;
    } catch (error) {
      console.log('No current session');
      return null;
    }
  }
}

export default CognitoService;
