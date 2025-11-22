from flask import Flask, jsonify
from datetime import datetime

def create_app():
    """Flask application factory"""
    app = Flask(__name__)
    
    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "ok",
            "message": "Server is running",
            "time": datetime.now().isoformat(),
            "service": "PitchLab Backend"
        })
    
    # TODO: Register blueprints here
    # from app.routes.persona_routes import persona_bp
    # app.register_blueprint(persona_bp, url_prefix='/api/persona')
    
    return app