from flask import Flask
from .routes.main import main_bp
from .routes.api import api_bp

def create_app():
    app = Flask(
        __name__,
        template_folder="../templates",
        static_folder="../static"
    )
    app.config["SECRET_KEY"] = "aame-dev-key"
    app.config["JSON_SORT_KEYS"] = False

    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix="/api")
    return app
