import os
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

def init_monitoring(app):
    dsn = app.config.get("SENTRY_DSN", "")
    if dsn:
        sentry_sdk.init(
            dsn=dsn,
            integrations=[FlaskIntegration()],
            traces_sample_rate=0.1,
        )
