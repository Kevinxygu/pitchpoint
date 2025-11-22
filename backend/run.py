from app.main import create_app
from app.config import config

app = create_app()

if __name__ == '__main__':
    print(f"🚀 Server starting on http://{config.HOST}:{config.PORT}")
    print(f"📊 Health check: http://{config.HOST}:{config.PORT}/health")
    print(f"🤖 Persona API: http://{config.HOST}:{config.PORT}/api/persona/generate")
    
    app.run(
        host=config.HOST,
        port=config.PORT,
        debug=config.DEBUG
    )

