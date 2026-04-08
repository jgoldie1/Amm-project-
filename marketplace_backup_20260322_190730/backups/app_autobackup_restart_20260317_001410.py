from modules.app_bootstrap import create_app
app = create_app()
from flask import Flask, Response
import os
from modules.recovery_core import register_recovery_core
from modules.module_loader import load_optional_modules
from modules.auth_system import init_auth

app = Flask(__name__)

import os
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL",
    "sqlite:///instance/platform.db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


app.config.setdefault("SECRET_KEY", os.getenv("SECRET_KEY", "dev-secret-key"))
app.config.setdefault("SQLALCHEMY_DATABASE_URI", os.getenv("DATABASE_URL", "sqlite:///instance/app.db"))
app.config.setdefault("SQLALCHEMY_TRACK_MODIFICATIONS", False)

init_auth(app)
register_recovery_core(app)
load_optional_modules(app)

def page(title, body):
    return f"""
    <html>
    <head>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>All American Marketplace</title>
        <style>
            body {{
                background:#0b1220;
                color:white;
                font-family:Arial,sans-serif;
                text-align:center;
                padding:16px;
                margin:0;
            }}
            .box {{
                background:#182235;
                border:2px solid #334155;
                border-radius:16px;
                padding:20px;
                margin:16px auto;
                max-width:920px;
            }}
            .btn {{
                display:block;
                background:#0284c7;
                color:white;
                text-decoration:none;
                padding:18px;
                margin:12px auto;
                border-radius:14px;
                max-width:520px;
                font-weight:bold;
                font-size:20px;
            }}
        </style>
    </head>
    <body>
        <div class="box">
            <h1>All American Marketplace</h1>
            <p>{title}</p>
        </div>
        {body}
        <div class="box">
            <a class="btn" href="/">Home</a>
            <a class="btn" href="/dashboard">Dashboard</a>
            <a class="btn" href="/modules">Module Inventory</a>
            <a class="btn" href="/health">Health</a>
        </div>
    </body>
    </html>
    """

@app.route("/")
def home():
    return page("Recovered Local Shell", """
    <div class="box">
        <p>Server is working.</p>
        <p>This is the stable checkpoint page.</p>
    </div>
    """)

@app.route("/dashboard")
def dashboard():
    return page("Dashboard", """
    <div class="box">
        <p>Marketplace</p>
        <p>Streaming Ecosystem</p>
        <p>Quantum Speed Accelerator</p>
        <p>Quantum Lag Buster</p>
        <p>Omniverse 360 Insurance</p>
        <p>Aniyah App</p>
        <p>Cross Border</p>
        <p>FinBank</p>
        <p>Holoverse</p>
        <p>Cyber Security</p>
        <p>Employment</p>
        <p>AI TV</p>
        <p>Metaverse / Middleverse / Multiverse</p>
    </div>
    """)

@app.route("/modules")
def modules():
    return page("Module Inventory", """
    <div class="box">
        <p>All American Marketplace</p>
        <p>Holographic Streaming Ecosystem</p>
        <p>Streaming Network Omni</p>
        <p>Quantum Speed Accelerator</p>
        <p>Quantum Lag Buster</p>
        <p>Omniverse 360 Insurance</p>
        <p>Jarvis</p>
        <p>Aniyah Vocal Training</p>
        <p>Aniyah Cross Border</p>
        <p>FinBank</p>
        <p>Jacobie Vision Holoverse</p>
        <p>Jacobie Cyber Security</p>
        <p>Jacobie Employment</p>
        <p>Isaiah Anyone Can Be a Star AI TV</p>
        <p>Metaverse</p>
        <p>Middleverse</p>
        <p>Multiverse</p>
    </div>
    """)



@app.route("/auth-login-fallback")
def auth_login_fallback_plain():
    return """
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>Auth Login Fallback</title>
      <style>
        body { font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }
        a { display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }
        .card { background:#1e293b; padding:16px; border-radius:12px; margin:14px 0; }
      </style>
    </head>
    <body>
      <h1>Auth Login Fallback</h1>
      <div class="card">
        <p>The full auth routes are not mounted on this build yet.</p>
        <p>This fallback keeps a visible identity entry point alive while the auth module is stabilized.</p>
      </div>
      <a href="/platform-home">Platform Home</a>
      <a href="/master-dashboard">Master Dashboard</a>
      <a href="/profile-center">Profile Center</a>
      <a href="/basic-profiles">Basic Profiles</a>
      <a href="/role-hub">Role Hub</a>
    </body>
    </html>
    """

@app.route("/startup-diagnostics")
def startup_diagnostics_plain():
    return """
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>Startup Diagnostics</title>
      <style>
        body { font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }
        a { display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }
        .card { background:#1e293b; padding:16px; border-radius:12px; margin:14px 0; }
      </style>
    </head>
    <body>
      <h1>Startup Diagnostics</h1>
      <div class="card">
        <p>Use this page to verify that the shell is running even when deeper modules fail.</p>
      </div>
      <a href="/">Home</a>
      <a href="/platform-home">Platform Home</a>
      <a href="/command-center">Command Center</a>
      <a href="/master-dashboard">Master Dashboard</a>
      <a href="/auth-login-fallback">Auth Login Fallback</a>
    </body>
    </html>
    """

@app.route("/health")
def health():
    return "OK"

@app.route("/favicon.ico")
def fav():
    return Response(status=204)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)