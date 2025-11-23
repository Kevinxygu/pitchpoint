from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv
import os

load_dotenv()

# Get allowed origins for CORS
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')

socketio = SocketIO(
    cors_allowed_origins=allowed_origins,
    logger=True,
    engineio_logger=True
)

def create_app():
    app = Flask(__name__)
    
    # Configure CORS for all routes
    # Get allowed origins from environment or use defaults
    allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
    
    CORS(app, resources={
        r"/*": {
            "origins": allowed_origins,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    # Initialize SocketIO
    socketio.init_app(app)
    
    # Register routes
    from app.routes import voice_routes, feedback_routes
    app.register_blueprint(voice_routes.bp)
    app.register_blueprint(feedback_routes.bp)
    
    @app.route('/health', methods=['GET'])
    def health_check():
        return {'status': 'healthy', 'port': os.getenv('PORT', '8080')}, 200
    
    return app