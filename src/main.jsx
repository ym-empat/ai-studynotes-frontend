import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from "react-oidc-context";

// Cognito configuration from environment variables
const cognitoAuthConfig = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI || "http://localhost:5174",
  response_type: import.meta.env.VITE_COGNITO_RESPONSE_TYPE || "code",
  scope: import.meta.env.VITE_COGNITO_SCOPE || "email openid phone",
};

// Validate required environment variables
const requiredEnvVars = [
  'VITE_COGNITO_AUTHORITY',
  'VITE_COGNITO_CLIENT_ID',
  'VITE_COGNITO_REDIRECT_URI'
];

const missingEnvVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingEnvVars.length > 0) {
  console.warn('Missing required environment variables:', missingEnvVars);
  console.warn('Using fallback values. Please create a .env file with proper configuration.');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
