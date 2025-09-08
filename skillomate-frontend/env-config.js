// Environment Configuration for Skillomate Frontend
// =====================================================
// TO SWITCH BETWEEN DEVELOPMENT AND PRODUCTION:
// 1. Set DEV_MODE to true for development (localhost)
// 2. Set DEV_MODE to false for production (hosted URLs)
// =====================================================

const DEV_MODE = false; // Change this to false for production

// Development Configuration (localhost)
const DEV_CONFIG = {
  AI_SERVER_URL: 'http://localhost:8000',
  API_BASE_URL: 'http://localhost:5000/api',
  SOCKET_URL: 'http://localhost:5000',
  DEV_MODE: false
};

// Production Configuration (hosted URLs)
const PROD_CONFIG = {
  AI_SERVER_URL: 'https://skillomate.onrender.com',
  API_BASE_URL: 'https://skillomate-backend.onrender.com/api',
  SOCKET_URL: 'https://skillomate-backend.onrender.com',
  DEV_MODE: false
};

// Export the appropriate configuration based on DEV_MODE
export const config = DEV_MODE ? DEV_CONFIG : PROD_CONFIG;

// Log current configuration for debugging
console.log('🔧 Current Environment:', DEV_MODE ? 'DEVELOPMENT' : 'PRODUCTION');
console.log('🤖 AI Server URL:', config.AI_SERVER_URL);
console.log('🔗 API Base URL:', config.API_BASE_URL);
console.log('🔌 Socket URL:', config.SOCKET_URL);

export default config;
