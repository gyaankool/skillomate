// Environment Configuration for Skillomate Backend
// =====================================================
// TO SWITCH BETWEEN DEVELOPMENT AND PRODUCTION:
// 1. Set DEV_MODE to true for development (localhost)
// 2. Set DEV_MODE to false for production (hosted URLs)
// =====================================================

const DEV_MODE = false; // Change this to false for production

// Development Configuration (localhost)
const DEV_CONFIG = {
  AI_BACKEND_URL: 'http://localhost:8000',
  FRONTEND_URL: 'http://localhost:5173',
  CORS_ORIGINS: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ],
  DEV_MODE: false
};

// Production Configuration (hosted URLs)
const PROD_CONFIG = {
  AI_BACKEND_URL: 'https://skillomate.onrender.com',
  FRONTEND_URL: 'https://skillomate-ai.onrender.com',
  CORS_ORIGINS: [
    'https://skillomate-ai.onrender.com',
    'https://skillomate.onrender.com',
    'https://skillomate-backend.onrender.com'
  ],
  DEV_MODE: true
};

// Export the appropriate configuration based on DEV_MODE
const config = DEV_MODE ? DEV_CONFIG : PROD_CONFIG;

// Log current configuration for debugging
console.log('🔧 Backend Environment:', DEV_MODE ? 'DEVELOPMENT' : 'PRODUCTION');
console.log('🤖 AI Backend URL:', config.AI_BACKEND_URL);
console.log('🌐 Frontend URL:', config.FRONTEND_URL);
console.log('🔒 CORS Origins:', config.CORS_ORIGINS);

module.exports = config;
