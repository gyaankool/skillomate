# Environment Configuration for GetSkilled Homework Helper AI Backend
# =====================================================
# TO SWITCH BETWEEN DEVELOPMENT AND PRODUCTION:
# 1. Set DEV_MODE to True for development (localhost)
# 2. Set DEV_MODE to False for production (hosted URLs)
# =====================================================

import os

DEV_MODE = True  # Change this to False for production

# Development Configuration (localhost)
DEV_CONFIG = {
    'CORS_ORIGINS': [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5000'
    ],
    'BACKEND_URL': 'http://localhost:8000',
    'DEV_MODE': True
}

# Production Configuration (hosted URLs)
PROD_CONFIG = {
    'CORS_ORIGINS': [
        'https://skillomate-ai.onrender.com',
        'https://skillomate.onrender.com',
        'https://skillomate-backend.onrender.com'
    ],
    'BACKEND_URL': 'https://skillomate-backend.onrender.com',
    'DEV_MODE': False
}

# Export the appropriate configuration based on DEV_MODE
config = DEV_CONFIG if DEV_MODE else PROD_CONFIG

# Log current configuration for debugging
print(f"🔧 AI Backend Environment: {'DEVELOPMENT' if DEV_MODE else 'PRODUCTION'}")
print(f"🌐 CORS Origins: {config['CORS_ORIGINS']}")
print(f"🔗 Backend URL: {config['BACKEND_URL']}")

# Export configuration
__all__ = ['config', 'DEV_MODE']
