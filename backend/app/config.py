import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""
    
    # Flask
    # SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Server
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 8080))
    
    # API Keys
    # CLAUDE_API_KEY = os.getenv('CLAUDE_API_KEY')
    # ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')
    
    # API URLs
    # CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
    # ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1'
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')

config = Config()