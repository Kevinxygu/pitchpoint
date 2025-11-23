import os
from app import create_app, socketio

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    host = os.getenv('HOST', '0.0.0.0')
    
    print(f"Starting server on {host}:{port}")
    
    socketio.run(
        app, 
        host=host, 
        port=port, 
        debug=True, 
        allow_unsafe_werkzeug=True
    )