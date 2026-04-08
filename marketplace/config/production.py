import os

class ProductionConfig:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL") or "sqlite:///instance/platform.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "true").lower() == "true"
    SESSION_COOKIE_HTTPONLY = os.getenv("SESSION_COOKIE_HTTPONLY", "true").lower() == "true"
    SESSION_COOKIE_SAMESITE = "Lax"
    REMEMBER_COOKIE_SECURE = os.getenv("REMEMBER_COOKIE_SECURE", "true").lower() == "true"
    REMEMBER_COOKIE_HTTPONLY = os.getenv("REMEMBER_COOKIE_HTTPONLY", "true").lower() == "true"

    PREFERRED_URL_SCHEME = os.getenv("PREFERRED_URL_SCHEME", "https")
    APP_BASE_URL = os.getenv("APP_BASE_URL", "https://your-domain.com")

    STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY", "")
    SENTRY_DSN = os.getenv("SENTRY_DSN", "")
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
