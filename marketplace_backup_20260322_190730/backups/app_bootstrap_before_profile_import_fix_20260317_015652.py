from pathlib import Path
import traceback
from flask import Flask
from flask_migrate import Migrate
from dotenv import load_dotenv
from config.production import ProductionConfig
from modules.auth_system import init_auth, db
from modules.payments_system import init_payments
from modules.monitoring_system import init_monitoring
from modules.recovery_core import register_recovery_core
from modules.module_loader import load_optional_modules

migrate = Migrate()

def create_app():
    load_dotenv()
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(ProductionConfig)

    try:
        init_auth(app)
    except Exception:
        Path("logs").mkdir(exist_ok=True)
        with open("logs/startup_failures.log", "a", encoding="utf-8") as f:
            f.write(traceback.format_exc() + "\n")

    try:
        migrate.init_app(app, db)
    except Exception:
        Path("logs").mkdir(exist_ok=True)
        with open("logs/startup_failures.log", "a", encoding="utf-8") as f:
            f.write(traceback.format_exc() + "\n")

    try:
        init_monitoring(app)
    except Exception:
        Path("logs").mkdir(exist_ok=True)
        with open("logs/startup_failures.log", "a", encoding="utf-8") as f:
            f.write(traceback.format_exc() + "\n")

    try:
        init_payments(app)
    except Exception:
        Path("logs").mkdir(exist_ok=True)
        with open("logs/startup_failures.log", "a", encoding="utf-8") as f:
            f.write(traceback.format_exc() + "\n")

    register_recovery_core(app)

    load_optional_modules(app)

    return app
