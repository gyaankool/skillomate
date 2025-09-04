"""
Configuration file for Skillomate AI Homework Solver
"""

import os

# Server Configuration
FLASK_PORT = int(os.getenv('FLASK_PORT', 8000))
FLASK_HOST = os.getenv('FLASK_HOST', '0.0.0.0')
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'

# OpenAI Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')

# Cache Configuration
CACHE_DIR = os.getenv('CACHE_DIR', 'cache')
CACHE_DB_PATH = os.path.join(CACHE_DIR, 'skillomate_cache.db')
CACHE_JSON_PATH = os.path.join(CACHE_DIR, 'qa_cache.json')
CACHE_RETENTION_DAYS = int(os.getenv('CACHE_RETENTION_DAYS', 30))

# Audio Configuration
AUDIO_CHUNK = 1024
AUDIO_FORMAT = 'paInt16'
AUDIO_CHANNELS = 1
AUDIO_RATE = 44100

# API Configuration
API_RATE_LIMIT = int(os.getenv('API_RATE_LIMIT', 100))
API_RATE_WINDOW = int(os.getenv('API_RATE_WINDOW', 900))  # 15 minutes

# Logging Configuration
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

# Frontend Configuration
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

# Node.js Backend Configuration (for authentication)
NODE_BACKEND_URL = os.getenv('NODE_BACKEND_URL', 'http://localhost:5000')
