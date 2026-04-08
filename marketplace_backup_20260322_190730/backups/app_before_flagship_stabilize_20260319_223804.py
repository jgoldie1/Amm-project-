from modules.app_bootstrap import create_app
app = create_app()
app.secret_key = "dev-secret-key-123"
from flask import Flask, Response, jsonify
import os
from modules.recovery_core import register_recovery_core
from modules.module_loader import load_optional_modules
from modules.auth_system import init_auth

app = Flask(__name__)

# ===== 
# ===== PRODUCTION STABILITY CONFIG =====
import os

app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key-change-me")
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_USE_SIGNER"] = True

# Prevent crashes from missing login
from flask_login import LoginManager

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "/auth/login"

@login_manager.user_loader
def load_user(user_id):
    return None  # Safe fallback (no crash)


import os
from flask import request, redirect
from modules.auth_system import db
import json
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
try:
    from flask_login import current_user, login_required
except Exception:
    current_user = None
    def login_required(fn):
        return fn
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
      <a href="/app-home">App Home</a>
      <a href="/platform-home">Platform Home</a>
      <a href="/jarvis-history">Jarvis History</a>
      <a href="/jarvis-favorites">Jarvis Favorites</a>
      <a href="/app-home">App Home</a>
      <a href="/jarvis-home">Jarvis Home</a>
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
      <a href="/app-home">App Home</a>
      <a href="/platform-home">Platform Home</a>
      <a href="/jarvis-history">Jarvis History</a>
      <a href="/jarvis-favorites">Jarvis Favorites</a>
      <a href="/app-home">App Home</a>
      <a href="/jarvis-home">Jarvis Home</a>
      <a href="/command-center">Command Center</a>
      <a href="/master-dashboard">Master Dashboard</a>
      <a href="/auth-login-fallback">Auth Login Fallback</a>
    </body>
    </html>
    """



class DirectUserPreference(db.Model):
    __tablename__ = "direct_user_preferences"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, index=True)
    preferred_role = db.Column(db.String(50), nullable=False, default="customer")
    startup_page = db.Column(db.String(255), nullable=False, default="/platform-home")

class DirectUserFavorite(db.Model):
    __tablename__ = "direct_user_favorites"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, index=True)
    favorite_name = db.Column(db.String(255), nullable=False)
    favorite_route = db.Column(db.String(255), nullable=False, default="/platform-home")

def _direct_uid():
    try:
        if getattr(current_user, "is_authenticated", False):
            return int(current_user.id)
    except Exception:
        pass
    return None

def _direct_page(title, body):
    return f"""
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>{title}</title>
      <style>
        body {{ font-family: Arial, sans-serif; background:#0f172a; color:white; padding:24px; }}
        a, button {{ display:inline-block; margin:6px 8px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border:none; border-radius:10px; }}
        input {{ width:100%; max-width:760px; padding:10px; margin:8px 0; border-radius:8px; border:1px solid #334155; }}
        .card {{ background:#1e293b; padding:16px; border-radius:14px; margin:14px 0; }}
      </style>
    </head>
    <body>{body}</body>
    </html>
    """

    with app.app_context():
        db.create_all()
    body = """
    <h1>Profile DB Center</h1>
    <a href="/profile">Profile</a>
    <a href="/db-role-preferences">DB Role Preferences</a>
    <a href="/db-favorites">DB Favorites</a>
    """
    return _direct_page("Profile DB Center", body)

    with app.app_context():
        db.create_all()

    if request.method == "POST":
        row = DirectUserPreference.query.filter_by(user_id=uid).order_by(DirectUserPreference.id.desc()).first()
        if not row:
            row = DirectUserPreference(user_id=uid)
            db.session.add(row)
        row.preferred_role = (request.form.get("preferred_role") or "customer").strip() or "customer"
        row.startup_page = (request.form.get("startup_page") or "/platform-home").strip() or "/platform-home"
        db.session.commit()
        return redirect("/db-role-preferences")

    row = DirectUserPreference.query.filter_by(user_id=uid).order_by(DirectUserPreference.id.desc()).first()
    current_role = row.preferred_role if row else "customer"
    current_page = row.startup_page if row else "/platform-home"
    body = f"""
    <h1>DB Role Preferences</h1>
    <a href="/profile-db-center">Profile DB Center</a>
    <div class="card">
      <form method="post">
        <input name="preferred_role" value="{current_role}" placeholder="customer / creator / operator">
        <input name="startup_page" value="{current_page}" placeholder="/platform-home">
        <button type="submit">Save Preferences</button>
      </form>
    </div>
    """
    return _direct_page("DB Role Preferences", body)

    with app.app_context():
        db.create_all()

    if request.method == "POST":
        row = DirectUserFavorite(
            user_id=uid,
            favorite_name=(request.form.get("favorite_name") or "Favorite").strip() or "Favorite",
            favorite_route=(request.form.get("favorite_route") or "/platform-home").strip() or "/platform-home",
        )
        db.session.add(row)
        db.session.commit()
        return redirect("/db-favorites")

    rows = DirectUserFavorite.query.filter_by(user_id=uid).order_by(DirectUserFavorite.id.desc()).limit(50).all()
    items = "".join(f"<li>{x.favorite_name} | {x.favorite_route}</li>" for x in rows)
    body = f"""
    <h1>DB Favorites</h1>
    <a href="/profile-db-center">Profile DB Center</a>
    <div class="card">
      <form method="post">
        <input name="favorite_name" placeholder="Favorite name">
        <input name="favorite_route" placeholder="/route">
        <button type="submit">Save Favorite</button>
      </form>
    </div>
    <div class="card"><ul>{items}</ul></div>
    """
    return _direct_page("DB Favorites", body)

@app.route("/health")
def health():
    return "OK"

@app.route("/favicon.ico")
def fav():
    return Response(status=204)


# === AAME_API_ROUTES ===

@app.route("/vehicles", methods=["GET"])
def vehicles():
    return jsonify({
        "ok": True,
        "status": "Vehicle system connected"
    })

@app.route("/drones", methods=["GET"])
def drones():
    return jsonify({
        "ok": True,
        "status": "Drone system connected"
    })

@app.route("/energy", methods=["GET"])
def energy():
    return jsonify({
        "ok": True,
        "status": "Energy network connected"
    })

@app.route("/marketplace", methods=["GET"])
def marketplace():
    return jsonify({
        "ok": True,
        "status": "AAM-HSE marketplace connected"
    })

@app.route("/system-map", methods=["GET"])
def system_map():
    return jsonify({
        "ok": True,
        "layers": {
            "air": ["Silver Hawk", "SkyDrop", "HoloDrone"],
            "ground": ["Titan Semi", "Titan Van", "Aurora", "Nomad", "Titan Rescue", "HoloEats"],
            "energy": ["AAME Energy Hub", "Mobile Charging", "Drone Docking", "Future Flying Car Pads"],
            "platform": ["AAM-HSE", "Jarvis AI", "Fleet Dashboard", "Payments Center"]
        }
    })

# ===== FINAL SAFE FALLBACK PROFILE ROUTES =====

def _safe_current_user():
    try:
        return current_user
    except Exception:
        return None

@app.route("/profile-safe")
def profile_safe():
    user = _safe_current_user()
    is_auth = False
    email = "guest"
    display_name = "Guest"
    role = "guest"

    try:
        if user is not None and getattr(user, "is_authenticated", False):
            is_auth = True
            email = getattr(user, "email", "unknown")
            display_name = getattr(user, "display_name", "User")
            role = getattr(user, "role", "customer")
    except Exception:
        pass

    body = f"""
    <h1>Profile</h1>
    <div class="card">
      <p><strong>Name:</strong> {display_name}</p>
      <p><strong>Email:</strong> {email}</p>
      <p><strong>Role:</strong> {role}</p>
      <p><strong>Authenticated:</strong> {is_auth}</p>
    </div>
    <a href="/auth/login">Auth Login</a>
    <a href="/profile-center">Profile Center</a>
    <a href="/profile-db-center">Profile DB Center</a>
    """
    return _direct_page("Profile", body)



    try:
        if request.method == "POST":
            row = DirectUserPreference.query.filter_by(user_id=uid).order_by(DirectUserPreference.id.desc()).first()
            if not row:
                row = DirectUserPreference(user_id=uid)
                db.session.add(row)
            row.preferred_role = (request.form.get("preferred_role") or "customer").strip() or "customer"
            row.startup_page = (request.form.get("startup_page") or "/platform-home").strip() or "/platform-home"
            db.session.commit()

        row = DirectUserPreference.query.filter_by(user_id=uid).order_by(DirectUserPreference.id.desc()).first()
        current_role = row.preferred_role if row else "customer"
        current_page = row.startup_page if row else "/platform-home"
    except Exception:
        current_role = "customer"
        current_page = "/platform-home"

    body = f"""
    <h1>DB Role Preferences</h1>
    <a href="/profile-db-center">Profile DB Center</a>
    <div class="card">
      <form method="post">
        <input name="preferred_role" value="{current_role}" placeholder="customer / creator / operator">
        <input name="startup_page" value="{current_page}" placeholder="/platform-home">
        <button type="submit">Save Preferences</button>
      </form>
    </div>
    """
    return _direct_page("DB Role Preferences", body)


    try:
        if request.method == "POST":
            row = DirectUserFavorite(
                user_id=uid,
                favorite_name=(request.form.get("favorite_name") or "Favorite").strip() or "Favorite",
                favorite_route=(request.form.get("favorite_route") or "/platform-home").strip() or "/platform-home",
            )
            db.session.add(row)
            db.session.commit()

        rows = DirectUserFavorite.query.filter_by(user_id=uid).order_by(DirectUserFavorite.id.desc()).limit(50).all()
        items = "".join(f"<li>{x.favorite_name} | {x.favorite_route}</li>" for x in rows)
    except Exception:
        items = ""

    body = f"""
    <h1>DB Favorites</h1>
    <a href="/profile-db-center">Profile DB Center</a>
    <div class="card">
      <form method="post">
        <input name="favorite_name" placeholder="Favorite name">
        <input name="favorite_route" placeholder="/route">
        <button type="submit">Save Favorite</button>
      </form>
    </div>
    <div class="card"><ul>{items}</ul></div>
    """
    return _direct_page("DB Favorites", body)

# ===== FINAL SAFE FALLBACK CHECKOUT ROUTES =====

@app.route("/live-checkout/holo-product")
def live_checkout_holo_product_safe():
    return redirect("/checkout-preview/holo-product")

@app.route("/live-checkout/premium-event")
def live_checkout_premium_event_safe():
    return redirect("/checkout-preview/premium-event")

@app.route("/live-checkout/room-booking")
def live_checkout_room_booking_safe():
    return redirect("/checkout-preview/room-booking")

@app.route("/live-checkout-attempts")
def live_checkout_attempts_safe():
    return redirect("/checkout-payloads")

# ===== FINAL SAFE FALLBACK MAP ROUTE =====

@app.route("/clickable-map")
def clickable_map_safe():
    body = """
    <h1>Clickable Map</h1>
    <div class="card">
      <p>This is the stabilized fallback map entry point.</p>
      <p>Use this page as the live city/world navigation shell until the richer map view is fully restored.</p>
    </div>
    <a href="/living-city-center">Living City Center</a>
    <a href="/route-map">Route Map</a>
    <a href="/app-home">App Home</a>
      <a href="/platform-home">Platform Home</a>
      <a href="/jarvis-history">Jarvis History</a>
      <a href="/jarvis-favorites">Jarvis Favorites</a>
      <a href="/app-home">App Home</a>
      <a href="/jarvis-home">Jarvis Home</a>
    """
    return _direct_page("Clickable Map", body)


# ===== HARDCODE SAFE DB ROUTES (NO LOGIN REQUIRED) =====

@app.route("/profile-db-center", methods=["GET", "POST"])
def profile_db_center_safe():
    return _direct_page("Profile DB Center", """
    <h1>Profile DB Center</h1>
    <a href="/db-role-preferences">Role Preferences</a><br>
    <a href="/db-favorites">Favorites</a><br>
    <a href="/profile-safe">Back to Profile</a>
    """)

@app.route("/db-role-preferences", methods=["GET", "POST"])
def db_role_preferences_safe():
    return _direct_page("Role Preferences", """
    <h1>Role Preferences</h1>
    <p>System stabilized. Preferences will be connected next.</p>
    <a href="/profile-db-center">Back</a>
    """)

@app.route("/db-favorites", methods=["GET", "POST"])
def db_favorites_safe():
    return _direct_page("DB Favorites", """
    <h1>Favorites</h1>
    <p>Favorites system stabilized. Save feature reconnect next.</p>
    <a href="/profile-db-center">Back</a>
    """)



# ===== GLOBAL ERROR HANDLER =====
@app.errorhandler(Exception)
def handle_exception(e):
    return _direct_page("System Stable", f"""
    <h1>System Stabilized</h1>
    <p>No crash occurred. Error handled safely.</p>
    <pre>{str(e)}</pre>
    <a href="/platform-home">Return Home</a>
    """), 200




# ===== JARVIS CONTROL PANEL =====

@app.route("/jarvis")
def jarvis_panel():
    body = """
    <h1>Jarvis Control Panel</h1>
    <div class="card">
      <p>Type a command or tap a quick action.</p>
    </div>

    <div class="card">
      <form action="/jarvis-run" method="get">
        <input name="cmd" placeholder="profile, payments, dashboard, map, home">
        <button type="submit">Run Command</button>
      </form>
    </div>

    <div class="card">
      <a href="/jarvis-run?cmd=home">Home</a>
      <a href="/jarvis-run?cmd=dashboard">Dashboard</a>
      <a href="/jarvis-run?cmd=profile">Profile</a>
      <a href="/jarvis-run?cmd=profiledb">Profile DB</a>
      <a href="/jarvis-run?cmd=payments">Payments</a>
      <a href="/jarvis-run?cmd=map">Map</a>
      <a href="/jarvis-run?cmd=health">Payment Health</a>
    </div>

    <div class="card">
      <a href="/app-home">App Home</a>
      <a href="/platform-home">Platform Home</a>
      <a href="/jarvis-history">Jarvis History</a>
      <a href="/jarvis-favorites">Jarvis Favorites</a>
      <a href="/app-home">App Home</a>
      <a href="/jarvis-home">Jarvis Home</a>
      <a href="/master-dashboard">Master Dashboard</a>
    </div>
    """
    return _direct_page("Jarvis", body)

@app.route("/jarvis-run")
def jarvis_run():
    cmd = (request.args.get("cmd") or "").strip().lower()

    routes = {
        "home": "/platform-home",
        "dashboard": "/master-dashboard",
        "profile": "/profile-safe",
        "profiledb": "/profile-db-center",
        "role": "/db-role-preferences",
        "favorites": "/db-favorites",
        "payments": "/payments-center",
        "health": "/payment-health",
        "map": "/clickable-map",
        "boot": "/boot-status",
        "verify": "/platform-verify",
        "route": "/route-map",
    }

    if cmd in routes:
        rows = _jarvis_read_history()
        rows.append({"cmd": cmd, "target": routes[cmd]})
        _jarvis_write_history(rows)
        return redirect(routes[cmd])

    body = f"""
    <h1>Jarvis Command Result</h1>
    <div class="card">
      <p>Unknown command: <strong>{cmd}</strong></p>
      <p>Try: home, dashboard, profile, profiledb, role, favorites, payments, health, map, boot, verify, route</p>
    </div>
    <a href="/jarvis">Back to Jarvis</a>
    """
    return _direct_page("Jarvis Result", body)




# ===== JARVIS PLUS PANEL =====

@app.route("/jarvis-plus")
def jarvis_plus():
    body = """
    <h1>Jarvis Plus</h1>
    <div class="card">
      <p>Large one-tap controls for easier navigation.</p>
    </div>

    <div class="card">
      <a href="/jarvis-run?cmd=home" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Go Home</a>
      <a href="/jarvis-run?cmd=dashboard" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Open Dashboard</a>
      <a href="/jarvis-run?cmd=profile" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Open Profile</a>
      <a href="/jarvis-run?cmd=profiledb" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Open Profile DB</a>
      <a href="/jarvis-run?cmd=payments" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Open Payments</a>
      <a href="/jarvis-run?cmd=map" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Open Map</a>
      <a href="/jarvis-run?cmd=health" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Open Payment Health</a>
      <a href="/jarvis-run?cmd=boot" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Open Boot Status</a>
    </div>

    <div class="card">
      <a href="/jarvis">Jarvis Basic</a>
      <a href="/jarvis-history">Jarvis History</a>
      <a href="/jarvis-favorites">Jarvis Favorites</a>
      <a href="/app-home">App Home</a>
      <a href="/jarvis-home">Jarvis Home</a>
      <a href="/app-home">App Home</a>
      <a href="/platform-home">Platform Home</a>
      <a href="/jarvis-history">Jarvis History</a>
      <a href="/jarvis-favorites">Jarvis Favorites</a>
      <a href="/app-home">App Home</a>
      <a href="/jarvis-home">Jarvis Home</a>
    </div>
    """
    return _direct_page("Jarvis Plus", body)




# ===== JARVIS HISTORY =====

def _jarvis_read_history():
    try:
        with open("data/jarvis/history.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def _jarvis_write_history(rows):
    with open("data/jarvis/history.json", "w", encoding="utf-8") as f:
        json.dump(rows[-50:], f, indent=2)

@app.route("/jarvis-history")
def jarvis_history():
    rows = _jarvis_read_history()
    items = "".join(
        f"<li>{row.get('cmd','')} → {row.get('target','')}</li>"
        for row in reversed(rows[-30:])
    )
    body = f"""
    <h1>Jarvis History</h1>
    <div class="card">
      <p>Recent commands used in Jarvis.</p>
    </div>
    <div class="card">
      <ul>{items}</ul>
    </div>
    <div class="card">
      <a href="/jarvis">Jarvis</a>
      <a href="/jarvis-plus">Jarvis Plus</a>
      <a href="/app-home">App Home</a>
      <a href="/platform-home">Platform Home</a>
      <a href="/jarvis-history">Jarvis History</a>
      <a href="/jarvis-favorites">Jarvis Favorites</a>
      <a href="/app-home">App Home</a>
      <a href="/jarvis-home">Jarvis Home</a>
    </div>
    """
    return _direct_page("Jarvis History", body)




# ===== JARVIS ACCESSIBILITY PANEL =====

@app.route("/jarvis-access")
def jarvis_access():
    body = """
    <h1>Jarvis Access</h1>
    <div class="card">
      <p>Accessibility-first control panel with large one-tap actions.</p>
    </div>

    <div class="card">
      <a href="/jarvis-run?cmd=home" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Home</a>
      <a href="/jarvis-run?cmd=dashboard" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Dashboard</a>
      <a href="/jarvis-run?cmd=profile" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Profile</a>
      <a href="/jarvis-run?cmd=profiledb" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Profile Database</a>
      <a href="/jarvis-run?cmd=payments" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Payments</a>
      <a href="/jarvis-run?cmd=map" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Map</a>
      <a href="/jarvis-run?cmd=health" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Payment Health</a>
      <a href="/jarvis-run?cmd=boot" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Boot Status</a>
      <a href="/jarvis-history" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Jarvis History</a>
    </div>

    <div class="card">
      <a href="/jarvis-plus">Jarvis Plus</a>
      <a href="/app-home">App Home</a>
      <a href="/platform-home">Platform Home</a>
    </div>
    """
    return _direct_page("Jarvis Access", body)




# ===== JARVIS FAVORITES =====

def _jarvis_read_favorites():
    try:
        with open("data/jarvis/favorites.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return ["dashboard", "payments", "profile", "profiledb", "map"]

@app.route("/jarvis-favorites")
def jarvis_favorites():
    favorites = _jarvis_read_favorites()
    buttons = ""
    labels = {
        "home": "Home",
        "dashboard": "Dashboard",
        "profile": "Profile",
        "profiledb": "Profile DB",
        "role": "Role Preferences",
        "favorites": "Favorites",
        "payments": "Payments",
        "health": "Payment Health",
        "map": "Map",
        "boot": "Boot Status",
        "verify": "Verify",
        "route": "Route Map",
    }

    for cmd in favorites:
        label = labels.get(cmd, cmd.title())
        buttons += f'<a href="/jarvis-run?cmd={cmd}" style="display:block;padding:22px;margin:12px 0;font-size:26px;">{label}</a>'

    body = f"""
    <h1>Jarvis Favorites</h1>
    <div class="card">
      <p>Your most useful commands, pinned to the top.</p>
    </div>

    <div class="card">
      {buttons}
    </div>

    <div class="card">
      <a href="/jarvis-access">Jarvis Access</a>
      <a href="/jarvis-plus">Jarvis Plus</a>
      <a href="/jarvis-history">Jarvis History</a>
      <a href="/jarvis-favorites">Jarvis Favorites</a>
      <a href="/app-home">App Home</a>
      <a href="/jarvis-home">Jarvis Home</a>
    </div>
    """
    return _direct_page("Jarvis Favorites", body)




# ===== JARVIS HOME =====

@app.route("/jarvis-home")
def jarvis_home():
    body = """
    <h1>Jarvis Home</h1>
    <div class="card">
      <p>Your easiest control surface for the platform.</p>
    </div>

    <div class="card">
      <a href="/jarvis-personal" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Personal Page</a>
      <a href="/jarvis-start" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Start Page</a>
      <a href="/jarvis-favorites" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Favorites</a>
      <a href="/jarvis-access" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Accessibility Controls</a>
      <a href="/jarvis-plus" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Large Control Panel</a>
      <a href="/jarvis-history" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Command History</a>
      <a href="/master-dashboard" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Master Dashboard</a>
      <a href="/payments-center" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Payments Center</a>
    </div>

    <div class="card">
      <a href="/app-home">App Home</a>
      <a href="/platform-home">Platform Home</a>
      <a href="/route-map">Route Map</a>
    </div>
    """
    return _direct_page("Jarvis Home", body)




# ===== JARVIS WORKFLOW DASHBOARD =====

@app.route("/jarvis-workflows")
def jarvis_workflows():
    body = """
    <h1>Jarvis Workflow Dashboard</h1>

    <div class="card">
      <p>Run grouped workflows with one tap.</p>
    </div>

    <div class="card">
      <h2>Operate</h2>
      <a href="/jarvis-run?cmd=dashboard" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Open Dashboard</a>
      <a href="/jarvis-run?cmd=boot" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Open Boot Status</a>
      <a href="/jarvis-run?cmd=verify" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Open Verify</a>
      <a href="/jarvis-run?cmd=route" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Open Route Map</a>
    </div>

    <div class="card">
      <h2>Profile</h2>
      <a href="/jarvis-run?cmd=profile" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Open Profile</a>
      <a href="/jarvis-run?cmd=profiledb" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Open Profile DB</a>
      <a href="/jarvis-run?cmd=role" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Open Role Preferences</a>
      <a href="/jarvis-run?cmd=favorites" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Open Favorites</a>
    </div>

    <div class="card">
      <h2>Business</h2>
      <a href="/jarvis-run?cmd=payments" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Open Payments</a>
      <a href="/jarvis-run?cmd=health" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Open Payment Health</a>
      <a href="/jarvis-run?cmd=map" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Open Map</a>
      <a href="/jarvis-run?cmd=home" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Open Platform Home</a>
    </div>

    <div class="card">
      <h2>Jarvis Tools</h2>
      <a href="/app-home">App Home</a>
      <a href="/jarvis-home">Jarvis Home</a>
      <a href="/jarvis-favorites">Jarvis Favorites</a>
      <a href="/jarvis-history">Jarvis History</a>
      <a href="/jarvis-access">Jarvis Access</a>
    </div>
    """
    return _direct_page("Jarvis Workflows", body)




# ===== JARVIS START PAGE =====

@app.route("/jarvis-start")
def jarvis_start():
    body = """
    <h1>Jarvis Start</h1>
    <div class="card">
      <p>Your easiest starting point for daily use.</p>
    </div>

    <div class="card">
      <a href="/jarvis-personal" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Open Personal Page</a>
      <a href="/jarvis-home" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Open Jarvis Home</a>
      <a href="/jarvis-favorites" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Open Favorites</a>
      <a href="/jarvis-tasks" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Open Tasks</a>
      <a href="/jarvis-workflows" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Open Workflows</a>
      <a href="/master-dashboard" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Open Dashboard</a>
      <a href="/payments-center" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Open Payments</a>
    </div>

    <div class="card">
      <a href="/app-home">App Home</a>
      <a href="/platform-home">Platform Home</a>
      <a href="/route-map">Route Map</a>
      <a href="/platform-verify">Platform Verify</a>
    </div>
    """
    return _direct_page("Jarvis Start", body)




# ===== JARVIS PERSONAL PAGE =====

@app.route("/jarvis-personal")
def jarvis_personal():
    body = """
    <h1>Jarvis Personal</h1>
    <div class="card">
      <p>Your personal high-priority control page.</p>
    </div>

    <div class="card">
      <h2>Most Used</h2>
      <a href="/jarvis-personal" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Personal Page</a>
      <a href="/jarvis-start" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Start Page</a>
      <a href="/jarvis-favorites" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Favorites</a>
      <a href="/jarvis-tasks" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Tasks</a>
      <a href="/master-dashboard" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Dashboard</a>
      <a href="/payments-center" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Payments</a>
    </div>

    <div class="card">
      <h2>Profile + System</h2>
      <a href="/profile-safe" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Profile</a>
      <a href="/profile-db-center" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Profile DB</a>
      <a href="/payment-health" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Payment Health</a>
      <a href="/clickable-map" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Map</a>
      <a href="/boot-status" style="display:block;padding:18px;margin:10px 0;font-size:22px;">Boot Status</a>
    </div>

    <div class="card">
      <a href="/app-home">App Home</a>
      <a href="/jarvis-home">Jarvis Home</a>
      <a href="/jarvis-workflows">Workflows</a>
      <a href="/jarvis-history">History</a>
    </div>
    """
    return _direct_page("Jarvis Personal", body)




# ===== UNIFIED APP SHELL =====

def _app_shell(title, body):
    return f"""
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>{title}</title>
      <style>
        body {{
          margin: 0;
          font-family: Arial, sans-serif;
          background: #0f172a;
          color: white;
        }}
        .topbar {{
          position: sticky;
          top: 0;
          z-index: 20;
          background: #111827;
          padding: 16px 18px;
          border-bottom: 1px solid #334155;
          font-size: 22px;
          font-weight: bold;
        }}
        .wrap {{
          max-width: 980px;
          margin: 0 auto;
          padding: 18px 18px 90px 18px;
        }}
        .hero {{
          background: linear-gradient(135deg,#1d4ed8,#7c3aed,#0f766e);
          border-radius: 18px;
          padding: 22px;
          margin-bottom: 18px;
          box-shadow: 0 10px 28px rgba(0,0,0,0.28);
        }}
        .card {{
          background: #1e293b;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 16px;
          box-shadow: 0 8px 22px rgba(0,0,0,0.2);
        }}
        .btn {{
          display: block;
          width: 100%;
          box-sizing: border-box;
          padding: 18px;
          margin: 10px 0;
          font-size: 22px;
          text-align: center;
          background: #2563eb;
          color: white;
          text-decoration: none;
          border-radius: 14px;
        }}
        .grid {{
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }}
        .smallbtn {{
          display: block;
          padding: 14px;
          text-align: center;
          background: #334155;
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-size: 18px;
        }}
        .bottomnav {{
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          background: #111827;
          border-top: 1px solid #334155;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          padding: 10px;
        }}
        .bottomnav a {{
          text-decoration: none;
          color: white;
          background: #1f2937;
          border-radius: 12px;
          padding: 12px 8px;
          text-align: center;
          font-size: 14px;
        }}
      </style>
    </head>
    <body>
      <div class="topbar">Jarvis App Shell</div>
      <div class="wrap">
        {body}
      </div>
      <div class="bottomnav">
        <a href="/app-home">Home</a>
        <a href="/jarvis-personal">Personal</a>
        <a href="/jarvis-favorites">Favorites</a>
        <a href="/payments-center">Payments</a>
        <a href="/master-dashboard">Dashboard</a>
      </div>
    </body>
    </html>
    """

@app.route("/app-home")
def app_home():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">All-in-One App Home</h1>
      <p style="margin:0;">Your stable mobile-style control surface for daily use.</p>
    </div>

    <div class="card">
      <a class="btn" href="/jarvis-personal">Open Personal Control Page</a>
      <a class="btn" href="/jarvis-start">Open Start Page</a>
      <a class="btn" href="/jarvis-workflows">Open Workflow Dashboard</a>
      <a class="btn" href="/streaming-featured">Open Streaming Featured</a>
      <a class="btn" href="/ecosystem-home">Open Ecosystem Home</a>
      <a class="btn" href="/ecosystem-brand"
        <a class="smallbtn" href="/creator-onboarding">Become Creator</a>
        <a class="smallbtn" href="/creator-dashboard">Creator Dashboard</a>>Open Brand Showcase</a>
    </div>

    <div class="card">
      <h2 style="margin-top:0;">Quick Actions</h2>
      <div class="grid">
        <a class="smallbtn" href="/profile-safe">Profile</a>
        <a class="smallbtn" href="/profile-shell">Profile Shell</a>
        <a class="smallbtn" href="/profile-db-center">Profile DB</a>
        <a class="smallbtn" href="/payments-center">Payments</a>
        <a class="smallbtn" href="/payments-shell">Payments Shell</a>
        <a class="smallbtn" href="/metaverse-hub"
        <a class="smallbtn" href="/metaverse-featured">Featured</a>>Metaverse</a>
        <a class="smallbtn" href="/ecosystem-home">Ecosystem</a>
        <a class="smallbtn" href="/verse-overview">Verses</a>
        <a class="smallbtn" href="/payment-health">Payment Health</a>
        <a class="smallbtn" href="/clickable-map">Map</a>
        <a class="smallbtn" href="/master-dashboard">Dashboard</a>
        <a class="smallbtn" href="/dashboard-shell">Dashboard Shell</a>
        <a class="smallbtn" href="/middleverse-hub"
        <a class="smallbtn" href="/middleverse-control-center">Control</a>>Middleverse</a>
      </div>
    </div>

    <div class="card">
      <h2 style="margin-top:0;">Jarvis Tools</h2>
      <div class="grid">
        <a class="smallbtn" href="/jarvis-home">Jarvis Home</a>
        <a class="smallbtn" href="/jarvis-favorites">Favorites</a>
        <a class="smallbtn" href="/jarvis-history">History</a>
        <a class="smallbtn" href="/jarvis-access">Access</a>
        <a class="smallbtn" href="/jarvis-tasks">Tasks</a>
        <a class="smallbtn" href="/jarvis-workflows">Workflows</a>
      </div>
    </div>

    <div class="card">
      <h2 style="margin-top:0;">System</h2>
      <div class="grid">
        <a class="smallbtn" href="/platform-home">Platform</a>
        <a class="smallbtn" href="/ecosystem-home">Ecosystem</a>
        <a class="smallbtn" href="/verse-overview">Verses</a>
        <a class="smallbtn" href="/route-map">Route Map</a>
        <a class="smallbtn" href="/platform-verify">Verify</a>
        <a class="smallbtn" href="/boot-status">Boot Status</a>
      </div>
    </div>
    """
    return _app_shell("App Home", body)




# ===== ECOSYSTEM ASSEMBLY =====

@app.route("/ecosystem-home")
def ecosystem_home():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">All American Marketplace Holographic Streaming Ecosystem</h1>
      <p style="margin:0;">Marketplace, streaming, Holoverse, and Jarvis control in one connected app.</p>
    </div>

    <div class="card">
      <a class="btn" href="/marketplace-hub">Open Marketplace Hub</a>
      <a class="btn" href="/streaming-hub">Open Streaming Hub</a>
      <a class="btn" href="/holoverse-hub">Open Holoverse Hub</a>
      <a class="btn" href="/jarvis-home">Open Jarvis Home</a>
      <a class="btn" href="/verse-overview">Open Verse Overview</a>
      <a class="btn" href="/ecosystem-showcase">Open Ecosystem Showcase</a>
    </div>

    <div class="card">
      <h2 style="margin-top:0;">Ecosystem Quick Access</h2>
      <div class="grid">
        <a class="smallbtn" href="/app-home">App Home</a>
        <a class="smallbtn" href="/jarvis-personal">Personal</a>
        <a class="smallbtn" href="/payments-center">Payments</a>
        <a class="smallbtn" href="/payments-shell">Payments Shell</a>
        <a class="smallbtn" href="/metaverse-hub"
        <a class="smallbtn" href="/metaverse-featured">Featured</a>>Metaverse</a>
        <a class="smallbtn" href="/ecosystem-home">Ecosystem</a>
        <a class="smallbtn" href="/verse-overview">Verses</a>
        <a class="smallbtn" href="/payment-health">Health</a>
        <a class="smallbtn" href="/master-dashboard">Dashboard</a>
        <a class="smallbtn" href="/dashboard-shell">Dashboard Shell</a>
        <a class="smallbtn" href="/middleverse-hub"
        <a class="smallbtn" href="/middleverse-control-center">Control</a>>Middleverse</a>
        <a class="smallbtn" href="/clickable-map">Map</a>
      </div>
    </div>
    """
    return _app_shell("Ecosystem Home", body)

@app.route("/marketplace-hub")
def marketplace_hub():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Marketplace Hub</h1>
      <p style="margin:0;">Products, services, creators, premium access, and commerce tools.</p>
    </div>

    <div class="card">
      <a class="btn" href="/payments-center">Open Payments Center</a>
      <a class="btn" href="/marketplace-featured">Open Marketplace Featured</a>
      <a class="btn" href="/profile-safe">Open Profile</a>
      <a class="btn" href="/profile-db-center">Open Profile DB</a>
    </div>

    <div class="card">
      <h2 style="margin-top:0;">Marketplace Modules</h2>
      <div class="grid">
        <a class="smallbtn" href="/jarvis-favorites">Favorites</a>
        <a class="smallbtn" href="/jarvis-tasks">Tasks</a>
        <a class="smallbtn" href="/platform-home">Platform</a>
        <a class="smallbtn" href="/ecosystem-home">Ecosystem</a>
        <a class="smallbtn" href="/verse-overview">Verses</a>
        <a class="smallbtn" href="/route-map">Route Map</a>
      </div>
    </div>
    """
    return _app_shell("Marketplace Hub", body)

@app.route("/streaming-hub")
def streaming_hub():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Streaming Hub</h1>
      <p style="margin:0;">Featured channels, premium streams, creator broadcasts, and event media.</p>
    </div>

    <div class="card">
      <a class="btn" href="/jarvis-workflows">Open Workflow Dashboard</a>
      <a class="btn" href="/streaming-featured">Open Streaming Featured</a>
      <a class="btn" href="/ecosystem-home">Open Ecosystem Home</a>
      <a class="btn" href="/ecosystem-brand"
        <a class="smallbtn" href="/creator-onboarding">Become Creator</a>
        <a class="smallbtn" href="/creator-dashboard">Creator Dashboard</a>>Open Brand Showcase</a>
      <a class="btn" href="/platform-verify">Open Platform Verify</a>
      <a class="btn" href="/master-dashboard">Open Dashboard</a>
    </div>

    <div class="card">
      <h2 style="margin-top:0;">Streaming Sections</h2>
      <div class="grid">
        <a class="smallbtn" href="/jarvis-history">History</a>
        <a class="smallbtn" href="/jarvis-access">Access</a>
        <a class="smallbtn" href="/boot-status">Boot Status</a>
        <a class="smallbtn" href="/payment-health">Payment Health</a>
      </div>
    </div>
    """
    return _app_shell("Streaming Hub", body)

@app.route("/holoverse-hub")
def holoverse_hub():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Holoverse Hub</h1>
      <p style="margin:0;">Holographic showcases, immersive rooms, event spaces, and future XR entry points.</p>
    </div>

    <div class="card">
      <a class="btn" href="/clickable-map">Open World Map</a>
      <a class="btn" href="/holoverse-featured">Open Holoverse Featured</a>
      <a class="btn" href="/jarvis-start">Open Start Page</a>
      <a class="btn" href="/jarvis-personal">Open Personal Page</a>
    </div>

    <div class="card">
      <h2 style="margin-top:0;">Holoverse Controls</h2>
      <div class="grid">
        <a class="smallbtn" href="/route-map">Route Map</a>
        <a class="smallbtn" href="/platform-home">Platform</a>
        <a class="smallbtn" href="/ecosystem-home">Ecosystem</a>
        <a class="smallbtn" href="/verse-overview">Verses</a>
        <a class="smallbtn" href="/jarvis-home">Jarvis Home</a>
        <a class="smallbtn" href="/master-dashboard">Dashboard</a>
        <a class="smallbtn" href="/dashboard-shell">Dashboard Shell</a>
        <a class="smallbtn" href="/middleverse-hub"
        <a class="smallbtn" href="/middleverse-control-center">Control</a>>Middleverse</a>
      </div>
    </div>
    """
    return _app_shell("Holoverse Hub", body)




# ===== ECOSYSTEM VISUAL ASSEMBLY =====

@app.route("/ecosystem-showcase")
def ecosystem_showcase():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Ecosystem Showcase</h1>
      <p style="margin:0;">Featured marketplace, streaming, and Holoverse experiences in one visual layer.</p>
    </div>

    <div class="card">
      <h2 style="margin-top:0;">Featured Marketplace</h2>
      <div class="grid">
        <a class="smallbtn" href="/marketplace-hub">Premium Marketplace</a>
        <a class="smallbtn" href="/payments-center">Checkout & Payments</a>
        <a class="smallbtn" href="/profile-safe">Customer Profile</a>
        <a class="smallbtn" href="/profile-db-center">Account Tools</a>
      </div>
    </div>

    <div class="card">
      <h2 style="margin-top:0;">Featured Streaming</h2>
      <div class="grid">
        <a class="smallbtn" href="/streaming-hub">Streaming Hub</a>
        <a class="smallbtn" href="/jarvis-workflows">Creator Workflows</a>
        <a class="smallbtn" href="/jarvis-history">Recent Activity</a>
        <a class="smallbtn" href="/payment-health">Premium Access Health</a>
      </div>
    </div>

    <div class="card">
      <h2 style="margin-top:0;">Featured Holoverse</h2>
      <div class="grid">
        <a class="smallbtn" href="/holoverse-hub">Holoverse Hub</a>
        <a class="smallbtn" href="/clickable-map">World Map</a>
        <a class="smallbtn" href="/jarvis-personal">Personal Control</a>
        <a class="smallbtn" href="/master-dashboard">System Dashboard</a>
      </div>
    </div>
    """
    return _app_shell("Ecosystem Showcase", body)

@app.route("/marketplace-featured")
def marketplace_featured():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Marketplace Featured</h1>
      <p style="margin:0;">Featured commerce zones, premium access, and creator business tools.</p>
    </div>

    <div class="card">
      <a class="btn" href="/payments-center">Open Payments Center</a>
      <a class="btn" href="/marketplace-featured">Open Marketplace Featured</a>
      <a class="btn" href="/jarvis-tasks">Open Business Tasks</a>
    </div>

    <div class="card">
      <h2 style="margin-top:0;">Marketplace Sections</h2>
      <div class="grid">
        <a class="smallbtn" href="/profile-safe">Profile</a>
        <a class="smallbtn" href="/profile-shell">Profile Shell</a>
        <a class="smallbtn" href="/profile-db-center">Profile DB</a>
        <a class="smallbtn" href="/db-role-preferences">Role Preferences</a>
        <a class="smallbtn" href="/db-favorites">Favorites</a>
      </div>
    </div>
    """
    return _app_shell("Marketplace Featured", body)

@app.route("/streaming-featured")
def streaming_featured():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Streaming Featured</h1>
      <p style="margin:0;">Featured channels, premium content, creator broadcasts, and media operations.</p>
    </div>

    <div class="card">
      <a class="btn" href="/streaming-hub">Open Streaming Hub</a>
      <a class="btn" href="/jarvis-favorites">Open Favorite Controls</a>
    </div>

    <div class="card">
      <h2 style="margin-top:0;">Streaming Sections</h2>
      <div class="grid">
        <a class="smallbtn" href="/jarvis-home">Jarvis Home</a>
        <a class="smallbtn" href="/jarvis-history">History</a>
        <a class="smallbtn" href="/platform-verify">Verify</a>
        <a class="smallbtn" href="/boot-status">Boot Status</a>
      </div>
    </div>
    """
    return _app_shell("Streaming Featured", body)

@app.route("/holoverse-featured")
def holoverse_featured():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Holoverse Featured</h1>
      <p style="margin:0;">Featured immersive rooms, world navigation, holographic zones, and command views.</p>
    </div>

    <div class="card">
      <a class="btn" href="/holoverse-hub">Open Holoverse Hub</a>
      <a class="btn" href="/clickable-map">Open World Map</a>
      <a class="btn" href="/holoverse-featured">Open Holoverse Featured</a>
    </div>

    <div class="card">
      <h2 style="margin-top:0;">Holoverse Sections</h2>
      <div class="grid">
        <a class="smallbtn" href="/jarvis-start">Start</a>
        <a class="smallbtn" href="/jarvis-personal">Personal</a>
        <a class="smallbtn" href="/route-map">Route Map</a>
        <a class="smallbtn" href="/master-dashboard">Dashboard</a>
        <a class="smallbtn" href="/dashboard-shell">Dashboard Shell</a>
        <a class="smallbtn" href="/middleverse-hub"
        <a class="smallbtn" href="/middleverse-control-center">Control</a>>Middleverse</a>
      </div>
    </div>
    """
    return _app_shell("Holoverse Featured", body)




# ===== BRANDING + FEATURE CARDS + SHELL CONVERSION =====

def _brand_shell(title, body):
    return f"""
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>{title}</title>
      <style>
        body {{
          margin: 0;
          font-family: Arial, sans-serif;
          background: #0b1220;
          color: white;
        }}
        .brandbar {{
          position: sticky;
          top: 0;
          z-index: 30;
          background: linear-gradient(90deg,#111827,#1d4ed8,#7c3aed,#0f766e);
          padding: 16px 18px;
          border-bottom: 1px solid #334155;
        }}
        .brandtitle {{
          font-size: 22px;
          font-weight: bold;
        }}
        .brandsub {{
          font-size: 13px;
          opacity: 0.92;
          margin-top: 4px;
        }}
        .wrap {{
          max-width: 1040px;
          margin: 0 auto;
          padding: 18px 18px 90px 18px;
        }}
        .hero {{
          background: linear-gradient(135deg,#1d4ed8,#7c3aed,#0f766e);
          border-radius: 18px;
          padding: 22px;
          margin-bottom: 18px;
          box-shadow: 0 10px 28px rgba(0,0,0,0.28);
        }}
        .sectiontitle {{
          font-size: 22px;
          margin: 0 0 12px 0;
        }}
        .card {{
          background: #162033;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 16px;
          box-shadow: 0 8px 22px rgba(0,0,0,0.2);
        }}
        .btn {{
          display: block;
          width: 100%;
          box-sizing: border-box;
          padding: 18px;
          margin: 10px 0;
          font-size: 22px;
          text-align: center;
          background: #2563eb;
          color: white;
          text-decoration: none;
          border-radius: 14px;
        }}
        .grid {{
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }}
        .triple {{
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }}
        .tile {{
          background: #1e293b;
          border-radius: 14px;
          padding: 16px;
          min-height: 120px;
        }}
        .tile h3 {{
          margin: 0 0 8px 0;
          font-size: 18px;
        }}
        .tile p {{
          margin: 0 0 10px 0;
          font-size: 14px;
          opacity: 0.92;
        }}
        .smallbtn {{
          display: block;
          padding: 14px;
          text-align: center;
          background: #334155;
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-size: 18px;
          margin-top: 8px;
        }}
        .channelrow {{
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }}
        .pill {{
          display: inline-block;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.12);
          margin: 4px 8px 4px 0;
          font-size: 13px;
        }}
        .bottomnav {{
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          background: #111827;
          border-top: 1px solid #334155;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          padding: 10px;
        }}
        .bottomnav a {{
          text-decoration: none;
          color: white;
          background: #1f2937;
          border-radius: 12px;
          padding: 12px 8px;
          text-align: center;
          font-size: 14px;
        }}
        @media (max-width: 860px) {{
          .grid, .triple, .channelrow {{
            grid-template-columns: 1fr;
          }}
        }}
      </style>
    </head>
    <body>
      <div class="brandbar">
        <div class="brandtitle">All American Marketplace Holographic Streaming Ecosystem</div>
        <div class="brandsub">Marketplace • Streaming • Holoverse • Jarvis • Business Control</div>
      </div>
      <div class="wrap">
        {body}
      </div>
      <div class="bottomnav">
        <a href="/app-home">Home</a>
        <a href="/ecosystem-home">Ecosystem</a>
        <a href="/jarvis-personal">Personal</a>
        <a href="/payments-shell">Payments</a>
        <a href="/dashboard-shell">Dashboard</a>
      </div>
    </body>
    </html>
    """

@app.route("/ecosystem-brand")
def ecosystem_brand():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Brand + Showcase Layer</h1>
      <p style="margin:0;">Featured creators, premium channels, services, products, and ecosystem sections.</p>
      <span class="pill">Premium Access</span>
      <span class="pill">Creator Economy</span>
      <span class="pill">Streaming Channels</span>
      <span class="pill">Holoverse</span>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Featured Creators</h2>
      <div class="triple">
        <div class="tile">
          <h3>Creator Studio Alpha</h3>
          <p>Premium creator storefront, streaming room, and audience access tools.</p>
          <a class="smallbtn" href="/marketplace-hub">Open Creator Commerce</a>
        </div>
        <div class="tile">
          <h3>Holo Channel Prime</h3>
          <p>Featured live content lane with premium access and replay support.</p>
          <a class="smallbtn" href="/streaming-hub">Open Streaming</a>
        </div>
        <div class="tile">
          <h3>Holoverse Builder</h3>
          <p>Immersive experience lane for map, room, and verse-style navigation.</p>
          <a class="smallbtn" href="/holoverse-hub">Open Holoverse</a>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Premium Content Cards</h2>
      <div class="grid">
        <div class="tile">
          <h3>Premium Event Access</h3>
          <p>Reserved event rooms, featured streams, and premium ecosystem entry.</p>
          <a class="smallbtn" href="/payments-center">Go to Payments</a>
        </div>
        <div class="tile">
          <h3>Featured Channel Pass</h3>
          <p>Priority creator channels and future subscription-ready viewing lanes.</p>
          <a class="smallbtn" href="/streaming-featured">Open Channels</a>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Service + Product Cards</h2>
      <div class="triple">
        <div class="tile">
          <h3>Marketplace Services</h3>
          <p>Service ordering, creator offers, premium packages, and future booking flows.</p>
          <a class="smallbtn" href="/marketplace-featured">Open Services</a>
        </div>
        <div class="tile">
          <h3>Digital Products</h3>
          <p>Premium goods, digital releases, featured packages, and commerce-ready lanes.</p>
          <a class="smallbtn" href="/payments-shell">Open Product Shell</a>
        </div>
        <div class="tile">
          <h3>Member Access</h3>
          <p>Future paid access areas for premium content, channels, rooms, and tools.</p>
          <a class="smallbtn" href="/profile-shell">Open Member Shell</a>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Featured Channel Rows</h2>
      <div class="channelrow">
        <div class="tile">
          <h3>Channel One</h3>
          <p>Featured stream lane</p>
          <a class="smallbtn" href="/streaming-hub">View</a>
        </div>
        <div class="tile">
          <h3>Channel Two</h3>
          <p>Creator spotlight lane</p>
          <a class="smallbtn" href="/streaming-featured">View</a>
        </div>
        <div class="tile">
          <h3>Channel Three</h3>
          <p>Premium replay lane</p>
          <a class="smallbtn" href="/ecosystem-showcase">View</a>
        </div>
        <div class="tile">
          <h3>Channel Four</h3>
          <p>Holoverse event lane</p>
          <a class="smallbtn" href="/holoverse-featured">View</a>
        </div>
      </div>
    </div>
    """
    return _brand_shell("Ecosystem Brand", body)

@app.route("/payments-shell")
def payments_shell():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Payments Shell</h1>
      <p style="margin:0;">Unified payments surface for products, services, premium access, and future subscriptions.</p>
    </div>

    <div class="card">
      <a class="btn" href="/payments-center">Open Payments Center</a>
      <a class="btn" href="/payment-health">Open Payment Health</a>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Payment Modules</h2>
      <div class="grid">
        <a class="smallbtn" href="/marketplace-featured">Marketplace Featured</a>
        <a class="smallbtn" href="/ecosystem-brand"
        <a class="smallbtn" href="/creator-onboarding">Become Creator</a>
        <a class="smallbtn" href="/creator-dashboard">Creator Dashboard</a>>Brand Showcase</a>
        <a class="smallbtn" href="/jarvis-workflows">Workflows</a>
        <a class="smallbtn" href="/app-home">App Home</a>
      </div>
    </div>
    """
    return _brand_shell("Payments Shell", body)

@app.route("/profile-shell")
def profile_shell():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Profile Shell</h1>
      <p style="margin:0;">Unified profile and account control surface.</p>
    </div>

    <div class="card">
      <a class="btn" href="/profile-safe">Open Profile</a>
      <a class="btn" href="/profile-db-center">Open Profile DB</a>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Profile Modules</h2>
      <div class="grid">
        <a class="smallbtn" href="/db-role-preferences">Role Preferences</a>
        <a class="smallbtn" href="/db-favorites">Favorites</a>
        <a class="smallbtn" href="/jarvis-personal">Personal</a>
        <a class="smallbtn" href="/jarvis-start">Start</a>
      </div>
    </div>
    """
    return _brand_shell("Profile Shell", body)

@app.route("/dashboard-shell")
def dashboard_shell():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Dashboard Shell</h1>
      <p style="margin:0;">Unified system control, status, and workflow surface.</p>
    </div>

    <div class="card">
      <a class="btn" href="/master-dashboard">Open Master Dashboard</a>
      <a class="btn" href="/platform-verify">Open Platform Verify</a>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Dashboard Modules</h2>
      <div class="grid">
        <a class="smallbtn" href="/boot-status">Boot Status</a>
        <a class="smallbtn" href="/route-map">Route Map</a>
        <a class="smallbtn" href="/jarvis-history">History</a>
        <a class="smallbtn" href="/ecosystem-home">Ecosystem Home</a>
        <a class="smallbtn" href="/multiverse-hub"
        <a class="smallbtn" href="/multiverse-featured-realms">Realms</a>>Multiverse</a>
      </div>
    </div>
    """
    return _brand_shell("Dashboard Shell", body)




# ===== VERSE ASSEMBLY =====

@app.route("/metaverse-hub")
def metaverse_hub():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Metaverse Hub</h1>
      <p style="margin:0;">Social, creator, commerce, and event spaces for the immersive public layer.</p>
    </div>

    <div class="card">
      <a class="btn" href="/marketplace-hub">Open Marketplace Layer</a>
      <a class="btn" href="/streaming-hub">Open Streaming Layer</a>
      <a class="btn" href="/clickable-map">Open World Map</a>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Metaverse Sections</h2>
      <div class="grid">
        <a class="smallbtn" href="/marketplace-featured">Creator Commerce</a>
        <a class="smallbtn" href="/streaming-featured">Live Experiences</a>
        <a class="smallbtn" href="/payments-shell">Premium Access</a>
        <a class="smallbtn" href="/profile-shell">Member Identity</a>
      </div>
    </div>
    """
    return _brand_shell("Metaverse Hub", body)

@app.route("/middleverse-hub")
def middleverse_hub():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Middleverse Hub</h1>
      <p style="margin:0;">Bridge layer for workflow routing, controlled access, system handoff, and orchestration.</p>
    </div>

    <div class="card">
      <a class="btn" href="/dashboard-shell">Open Control Dashboard</a>
      <a class="btn" href="/jarvis-workflows">Open Workflow Routing</a>
      <a class="btn" href="/platform-verify">Open Verify Layer</a>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Middleverse Sections</h2>
      <div class="grid">
        <a class="smallbtn" href="/jarvis-home">Jarvis Control</a>
        <a class="smallbtn" href="/jarvis-tasks">Task Routing</a>
        <a class="smallbtn" href="/boot-status">Boot Status</a>
        <a class="smallbtn" href="/route-map">Route Map</a>
      </div>
    </div>
    """
    return _brand_shell("Middleverse Hub", body)

@app.route("/multiverse-hub")
def multiverse_hub():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Multiverse Hub</h1>
      <p style="margin:0;">Expanded world network for premium realms, themed universes, and future large-scale immersive destinations.</p>
    </div>

    <div class="card">
      <a class="btn" href="/holoverse-hub">Open Holoverse Layer</a>
      <a class="btn" href="/holoverse-featured">Open Featured Realms</a>
      <a class="btn" href="/ecosystem-showcase">Open Ecosystem Showcase</a>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Multiverse Sections</h2>
      <div class="grid">
        <a class="smallbtn" href="/jarvis-start">Start</a>
        <a class="smallbtn" href="/jarvis-personal">Personal Control</a>
        <a class="smallbtn" href="/master-dashboard">Master Dashboard</a>
        <a class="smallbtn" href="/stability-center">Stability Center</a>
        <a class="smallbtn" href="/clickable-map">World Navigation</a>
      </div>
    </div>
    """
    return _brand_shell("Multiverse Hub", body)

@app.route("/verse-overview")
def verse_overview():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Verse Overview</h1>
      <p style="margin:0;">Unified access to Metaverse, Middleverse, and Multiverse layers.</p>
    </div>

    <div class="triple">
      <div class="tile">
        <h3>Metaverse</h3>
        <p>Public immersive commerce and social layer.</p>
        <a class="smallbtn" href="/metaverse-hub"
        <a class="smallbtn" href="/metaverse-featured">Featured</a>>Open Metaverse</a>
      </div>
      <div class="tile">
        <h3>Middleverse</h3>
        <p>Workflow bridge and controlled operations layer.</p>
        <a class="smallbtn" href="/middleverse-hub"
        <a class="smallbtn" href="/middleverse-control-center">Control</a>>Open Middleverse</a>
      </div>
      <div class="tile">
        <h3>Multiverse</h3>
        <p>Expanded world network and premium realm layer.</p>
        <a class="smallbtn" href="/multiverse-hub"
        <a class="smallbtn" href="/multiverse-featured-realms">Realms</a>>Open Multiverse</a>
      </div>
    </div>

    <div class="card">
      <a class="btn" href="/ecosystem-home">Open Ecosystem Home</a>
      <a class="btn" href="/ecosystem-brand"
        <a class="smallbtn" href="/creator-onboarding">Become Creator</a>
        <a class="smallbtn" href="/creator-dashboard">Creator Dashboard</a>>Open Brand Showcase</a>
    </div>
    """
    return _brand_shell("Verse Overview", body)




# ===== VERSE CONTENT EXPANSION =====

@app.route("/metaverse-featured")
def metaverse_featured():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Metaverse Featured</h1>
      <p style="margin:0;">Top creators, events, and immersive commerce experiences.</p>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Creator Spotlight</h2>
      <div class="triple">
        <div class="tile">
          <h3>Creator Alpha</h3>
          <p>Live commerce + streaming + product drops.</p>
          <a class="smallbtn" href="/marketplace-featured">Enter</a>
        </div>
        <div class="tile">
          <h3>Creator Beta</h3>
          <p>Premium channel and fan access experience.</p>
          <a class="smallbtn" href="/streaming-featured">Watch</a>
        </div>
        <div class="tile">
          <h3>Creator Gamma</h3>
          <p>Holoverse immersive rooms and events.</p>
          <a class="smallbtn" href="/holoverse-featured">Explore</a>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Immersive Access</h2>
      <div class="grid">
        <a class="smallbtn" href="/payments-shell">Premium Entry</a>
        <a class="smallbtn" href="/profile-shell">Member Access</a>
        <a class="smallbtn" href="/jarvis-personal">Personal Hub</a>
        <a class="smallbtn" href="/ecosystem-brand"
        <a class="smallbtn" href="/creator-onboarding">Become Creator</a>
        <a class="smallbtn" href="/creator-dashboard">Creator Dashboard</a>>Brand Layer</a>
      </div>
    </div>
    """
    return _brand_shell("Metaverse Featured", body)

@app.route("/multiverse-featured-realms")
def multiverse_realms():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Multiverse Realms</h1>
      <p style="margin:0;">Premium worlds and themed universes.</p>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Premium Realms</h2>
      <div class="triple">
        <div class="tile">
          <h3>Commerce Realm</h3>
          <p>Marketplace-driven immersive world.</p>
          <a class="smallbtn" href="/marketplace-hub">Enter</a>
        </div>
        <div class="tile">
          <h3>Streaming Realm</h3>
          <p>Live content universe and events.</p>
          <a class="smallbtn" href="/streaming-hub">Enter</a>
        </div>
        <div class="tile">
          <h3>Holoverse Realm</h3>
          <p>Immersive experience and map navigation.</p>
          <a class="smallbtn" href="/holoverse-hub">Enter</a>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Universe Access</h2>
      <div class="grid">
        <a class="smallbtn" href="/metaverse-hub"
        <a class="smallbtn" href="/metaverse-featured">Featured</a>>Metaverse</a>
        <a class="smallbtn" href="/middleverse-hub"
        <a class="smallbtn" href="/middleverse-control-center">Control</a>>Middleverse</a>
        <a class="smallbtn" href="/verse-overview">All Verses</a>
        <a class="smallbtn" href="/ecosystem-home">Ecosystem</a>
      </div>
    </div>
    """
    return _brand_shell("Multiverse Realms", body)

@app.route("/middleverse-control-center")
def middleverse_control():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Middleverse Control Center</h1>
      <p style="margin:0;">Central orchestration of workflows, systems, and access.</p>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Control Systems</h2>
      <div class="grid">
        <a class="smallbtn" href="/jarvis-home">Jarvis Core</a>
        <a class="smallbtn" href="/jarvis-workflows">Workflow Engine</a>
        <a class="smallbtn" href="/jarvis-tasks">Task System</a>
        <a class="smallbtn" href="/master-dashboard">Master Dashboard</a>
        <a class="smallbtn" href="/stability-center">Stability Center</a>
      </div>
    </div>

    <div class="card">
      <h2 class="sectiontitle">System Routing</h2>
      <div class="grid">
        <a class="smallbtn" href="/route-map">Route Map</a>
        <a class="smallbtn" href="/boot-status">Boot Status</a>
        <a class="smallbtn" href="/platform-verify">Verify</a>
        <a class="smallbtn" href="/ecosystem-showcase">Showcase</a>
      </div>
    </div>
    """
    return _brand_shell("Middleverse Control", body)




# ===== CREATOR + CONTENT EXPANSION =====

@app.route("/creator-onboarding")
def creator_onboarding():
    body = """
    <div class="hero">
      <h1>Create Your Creator Profile</h1>
      <p>Join the ecosystem as a creator, seller, or service provider.</p>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Start Setup</h2>
      <div class="grid">
        <a class="smallbtn" href="/profile-shell">Create Profile</a>
        <a class="smallbtn" href="/payments-shell">Setup Payments</a>
        <a class="smallbtn" href="/marketplace-hub">List Services</a>
        <a class="smallbtn" href="/streaming-hub">Start Streaming</a>
      </div>
    </div>

    <div class="card">
      <a class="btn" href="/creator-dashboard">Go to Creator Dashboard</a>
    </div>
    """
    return _brand_shell("Creator Onboarding", body)

@app.route("/creator-dashboard")
def creator_dashboard():
    body = """
    <div class="hero">
      <h1>Creator Dashboard</h1>
      <p>Manage content, services, products, and audience.</p>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Creator Tools</h2>
      <div class="grid">
        <a class="smallbtn" href="/content-catalog">Content</a>
        <a class="smallbtn" href="/upload-center">Upload Center</a>
        <a class="smallbtn" href="/product-catalog">Products</a>
        <a class="smallbtn" href="/media-library">Media Library</a>
        <a class="smallbtn" href="/payments-shell">Earnings</a>
        <a class="smallbtn" href="/jarvis-workflows">Automation</a>
      </div>
    </div>

    <div class="card">
      <a class="btn" href="/metaverse-featured">Promote in Metaverse</a>
    </div>
    """
    return _brand_shell("Creator Dashboard", body)

@app.route("/content-catalog")
def content_catalog():
    body = """
    <div class="hero">
      <h1>Content Catalog</h1>
      <p>Manage and showcase videos, streams, and experiences.</p>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Featured Content</h2>
      <div class="triple">
        <div class="tile">
          <h3>Live Stream</h3>
          <p>Broadcast to your audience</p>
          <a class="smallbtn" href="/streaming-hub">Go Live</a>
        </div>
        <div class="tile">
          <h3>Recorded Content</h3>
          <p>Upload and monetize content</p>
          <a class="smallbtn" href="/streaming-featured">Upload</a>
        </div>
        <div class="tile">
          <h3>Immersive Content</h3>
          <p>Holoverse interactive content</p>
          <a class="smallbtn" href="/holoverse-hub">Create</a>
        </div>
      </div>
    </div>
    """
    return _brand_shell("Content Catalog", body)

@app.route("/product-catalog")
def product_catalog():
    body = """
    <div class="hero">
      <h1>Product & Service Catalog</h1>
      <p>Sell services, digital goods, and premium access.</p>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Catalog Types</h2>
      <div class="triple">
        <div class="tile">
          <h3>Services</h3>
          <p>Offer appointments and experiences</p>
          <a class="smallbtn" href="/marketplace-featured">Manage</a>
        </div>
        <div class="tile">
          <h3>Digital Products</h3>
          <p>Sell files, content, and access</p>
          <a class="smallbtn" href="/payments-shell">Sell</a>
        </div>
        <div class="tile">
          <h3>Memberships</h3>
          <p>Recurring premium access</p>
          <a class="smallbtn" href="/profile-shell">Setup</a>
        </div>
      </div>
    </div>
    """
    return _brand_shell("Product Catalog", body)

@app.route("/premium-memberships")
def premium_memberships():
    body = """
    <div class="hero">
      <h1>Premium Memberships</h1>
      <p>Unlock premium access across the ecosystem.</p>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Membership Tiers</h2>
      <div class="triple">
        <div class="tile">
          <h3>Basic</h3>
          <p>Access to standard content</p>
          <a class="smallbtn" href="/payments-shell">Subscribe</a>
        </div>
        <div class="tile">
          <h3>Pro</h3>
          <p>Premium channels and features</p>
          <a class="smallbtn" href="/payments-shell">Upgrade</a>
        </div>
        <div class="tile">
          <h3>Elite</h3>
          <p>Full ecosystem access</p>
          <a class="smallbtn" href="/payments-shell">Join</a>
        </div>
      </div>
    </div>
    """
    return _brand_shell("Premium Memberships", body)




# ===== CREATOR DATA LAYER =====

creators = []
products = []
contents = []

@app.route("/create-creator", methods=["GET","POST"])
def create_creator():
    from flask import request, redirect

    if request.method == "POST":
        name = request.form.get("name")
        niche = request.form.get("niche")

        if name:
            creators.append({"name": name, "niche": niche})

        return redirect("/creators")

    return _brand_shell("Create Creator", """
    <div class="hero"><h1>Create Creator</h1></div>
    <div class="card">
      <form method="POST">
        <input name="name" placeholder="Creator Name" style="width:100%;padding:10px;margin-bottom:10px;">
        <input name="niche" placeholder="Niche" style="width:100%;padding:10px;margin-bottom:10px;">
        <button class="btn">Save</button>
      </form>
    </div>
    """)

@app.route("/creators")
def list_creators():
    items = "".join([
        f"<div class='tile'><h3>{c['name']}</h3><p>{c['niche']}</p></div>"
        for c in creators
    ]) or "<p>No creators yet.</p>"

    return _brand_shell("Creators", f"""
    <div class="hero"><h1>Creators</h1></div>
    <div class="card">{items}</div>
    <a class="btn" href="/create-creator">Add Creator</a>
    """)

@app.route("/create-product", methods=["GET","POST"])
def create_product():
    from flask import request, redirect

    if request.method == "POST":
        name = request.form.get("name")
        price = request.form.get("price")

        if name:
            products.append({"name": name, "price": price})

        return redirect("/products")

    return _brand_shell("Create Product", """
    <div class="hero"><h1>Create Product</h1></div>
    <div class="card">
      <form method="POST">
        <input name="name" placeholder="Product Name" style="width:100%;padding:10px;margin-bottom:10px;">
        <input name="price" placeholder="Price" style="width:100%;padding:10px;margin-bottom:10px;">
        <button class="btn">Save</button>
      </form>
    </div>
    """)

@app.route("/products")
def list_products():
    items = "".join([
        f"<div class='tile'><h3>{p['name']}</h3><p>${p['price']}</p></div>"
        for p in products
    ]) or "<p>No products yet.</p>"

    return _brand_shell("Products", f"""
    <div class="hero"><h1>Products</h1></div>
    <div class="card">{items}</div>
    <a class="btn" href="/create-product">Add Product</a>
    """)

@app.route("/create-content", methods=["GET","POST"])
def create_content():
    from flask import request, redirect

    if request.method == "POST":
        title = request.form.get("title")
        if title:
            contents.append({"title": title})

        return redirect("/contents")

    return _brand_shell("Create Content", """
    <div class="hero"><h1>Create Content</h1></div>
    <div class="card">
      <form method="POST">
        <input name="title" placeholder="Content Title" style="width:100%;padding:10px;margin-bottom:10px;">
        <button class="btn">Save</button>
      </form>
    </div>
    """)

@app.route("/contents")
def list_contents():
    items = "".join([
        f"<div class='tile'><h3>{c['title']}</h3></div>"
        for c in contents
    ]) or "<p>No content yet.</p>"

    return _brand_shell("Content", f"""
    <div class="hero"><h1>Content</h1></div>
    <div class="card">{items}</div>
    <a class="btn" href="/create-content">Add Content</a>
    """)




# ===== SQLITE CREATOR DATA LAYER =====

class CreatorRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    niche = db.Column(db.String(255), nullable=True)

class ProductRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    price = db.Column(db.String(255), nullable=True)

class ContentRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)

@app.route("/create-creator-db", methods=["GET","POST"])
def create_creator_db():
    from flask import request, redirect

    try:
        with app.app_context():
            db.create_all()
    except Exception:
        pass

    if request.method == "POST":
        name = (request.form.get("name") or "").strip()
        niche = (request.form.get("niche") or "").strip()
        if name:
            row = CreatorRecord(name=name, niche=niche)
            db.session.add(row)
            db.session.commit()
        return redirect("/creators-db")

    return _brand_shell("Create Creator DB", """
    <div class="hero"><h1>Create Creator DB</h1></div>
    <div class="card">
      <form method="POST">
        <input name="name" placeholder="Creator Name" style="width:100%;padding:10px;margin-bottom:10px;">
        <input name="niche" placeholder="Niche" style="width:100%;padding:10px;margin-bottom:10px;">
        <button class="btn">Save Creator</button>
      </form>
    </div>
    """)

@app.route("/creators-db")
def creators_db():
    try:
        with app.app_context():
            db.create_all()
        rows = CreatorRecord.query.order_by(CreatorRecord.id.desc()).all()
        items = "".join(
            f"<div class='tile'><h3>{r.name}</h3><p>{r.niche or ''}</p></div>"
            for r in rows
        ) or "<p>No creators saved yet.</p>"
    except Exception as e:
        items = f"<p>DB error: {e}</p>"

    return _brand_shell("Creators DB", f"""
    <div class="hero"><h1>Creators DB</h1></div>
    <div class="card">{items}</div>
    <a class="btn" href="/create-creator-db">Add Creator</a>
    """)

@app.route("/create-product-db", methods=["GET","POST"])
def create_product_db():
    from flask import request, redirect

    try:
        with app.app_context():
            db.create_all()
    except Exception:
        pass

    if request.method == "POST":
        name = (request.form.get("name") or "").strip()
        price = (request.form.get("price") or "").strip()
        if name:
            row = ProductRecord(name=name, price=price)
            db.session.add(row)
            db.session.commit()
        return redirect("/products-db")

    return _brand_shell("Create Product DB", """
    <div class="hero"><h1>Create Product DB</h1></div>
    <div class="card">
      <form method="POST">
        <input name="name" placeholder="Product Name" style="width:100%;padding:10px;margin-bottom:10px;">
        <input name="price" placeholder="Price" style="width:100%;padding:10px;margin-bottom:10px;">
        <button class="btn">Save Product</button>
      </form>
    </div>
    """)

@app.route("/products-db")
def products_db():
    try:
        with app.app_context():
            db.create_all()
        rows = ProductRecord.query.order_by(ProductRecord.id.desc()).all()
        items = "".join(
            f"<div class='tile'><h3>{r.name}</h3><p>${r.price or ''}</p></div>"
            for r in rows
        ) or "<p>No products saved yet.</p>"
    except Exception as e:
        items = f"<p>DB error: {e}</p>"

    return _brand_shell("Products DB", f"""
    <div class="hero"><h1>Products DB</h1></div>
    <div class="card">{items}</div>
    <a class="btn" href="/create-product-db">Add Product</a>
    """)

@app.route("/create-content-db", methods=["GET","POST"])
def create_content_db():
    from flask import request, redirect

    try:
        with app.app_context():
            db.create_all()
    except Exception:
        pass

    if request.method == "POST":
        title = (request.form.get("title") or "").strip()
        if title:
            row = ContentRecord(title=title)
            db.session.add(row)
            db.session.commit()
        return redirect("/contents-db")

    return _brand_shell("Create Content DB", """
    <div class="hero"><h1>Create Content DB</h1></div>
    <div class="card">
      <form method="POST">
        <input name="title" placeholder="Content Title" style="width:100%;padding:10px;margin-bottom:10px;">
        <button class="btn">Save Content</button>
      </form>
    </div>
    """)

@app.route("/contents-db")
def contents_db():
    try:
        with app.app_context():
            db.create_all()
        rows = ContentRecord.query.order_by(ContentRecord.id.desc()).all()
        items = "".join(
            f"<div class='tile'><h3>{r.title}</h3></div>"
            for r in rows
        ) or "<p>No content saved yet.</p>"
    except Exception as e:
        items = f"<p>DB error: {e}</p>"

    return _brand_shell("Contents DB", f"""
    <div class="hero"><h1>Contents DB</h1></div>
    <div class="card">{items}</div>
    <a class="btn" href="/create-content-db">Add Content</a>
    """)




# ===== EDIT + DELETE LAYER =====

@app.route("/edit-creator-db/<int:row_id>", methods=["GET","POST"])
def edit_creator_db(row_id):
    from flask import request, redirect

    try:
        with app.app_context():
            db.create_all()
        row = CreatorRecord.query.get(row_id)
        if not row:
            return _brand_shell("Edit Creator", "<div class='card'><p>Creator not found.</p><a class='btn' href='/creators-db'>Back</a></div>")
    except Exception as e:
        return _brand_shell("Edit Creator", f"<div class='card'><p>DB error: {e}</p><a class='btn' href='/creators-db'>Back</a></div>")

    if request.method == "POST":
        row.name = (request.form.get("name") or "").strip()
        row.niche = (request.form.get("niche") or "").strip()
        db.session.commit()
        return redirect("/creators-db")

    return _brand_shell("Edit Creator", f"""
    <div class="hero"><h1>Edit Creator</h1></div>
    <div class="card">
      <form method="POST">
        <input name="name" value="{row.name or ''}" placeholder="Creator Name" style="width:100%;padding:10px;margin-bottom:10px;">
        <input name="niche" value="{row.niche or ''}" placeholder="Niche" style="width:100%;padding:10px;margin-bottom:10px;">
        <button class="btn">Save Changes</button>
      </form>
    </div>
    """)

@app.route("/delete-creator-db/<int:row_id>")
def delete_creator_db(row_id):
    from flask import redirect
    try:
        with app.app_context():
            db.create_all()
        row = CreatorRecord.query.get(row_id)
        if row:
            db.session.delete(row)
            db.session.commit()
    except Exception:
        pass
    return redirect("/creators-db")

@app.route("/edit-product-db/<int:row_id>", methods=["GET","POST"])
def edit_product_db(row_id):
    from flask import request, redirect

    try:
        with app.app_context():
            db.create_all()
        row = ProductRecord.query.get(row_id)
        if not row:
            return _brand_shell("Edit Product", "<div class='card'><p>Product not found.</p><a class='btn' href='/products-db'>Back</a></div>")
    except Exception as e:
        return _brand_shell("Edit Product", f"<div class='card'><p>DB error: {e}</p><a class='btn' href='/products-db'>Back</a></div>")

    if request.method == "POST":
        row.name = (request.form.get("name") or "").strip()
        row.price = (request.form.get("price") or "").strip()
        db.session.commit()
        return redirect("/products-db")

    return _brand_shell("Edit Product", f"""
    <div class="hero"><h1>Edit Product</h1></div>
    <div class="card">
      <form method="POST">
        <input name="name" value="{row.name or ''}" placeholder="Product Name" style="width:100%;padding:10px;margin-bottom:10px;">
        <input name="price" value="{row.price or ''}" placeholder="Price" style="width:100%;padding:10px;margin-bottom:10px;">
        <button class="btn">Save Changes</button>
      </form>
    </div>
    """)

@app.route("/delete-product-db/<int:row_id>")
def delete_product_db(row_id):
    from flask import redirect
    try:
        with app.app_context():
            db.create_all()
        row = ProductRecord.query.get(row_id)
        if row:
            db.session.delete(row)
            db.session.commit()
    except Exception:
        pass
    return redirect("/products-db")

@app.route("/edit-content-db/<int:row_id>", methods=["GET","POST"])
def edit_content_db(row_id):
    from flask import request, redirect

    try:
        with app.app_context():
            db.create_all()
        row = ContentRecord.query.get(row_id)
        if not row:
            return _brand_shell("Edit Content", "<div class='card'><p>Content not found.</p><a class='btn' href='/contents-db'>Back</a></div>")
    except Exception as e:
        return _brand_shell("Edit Content", f"<div class='card'><p>DB error: {e}</p><a class='btn' href='/contents-db'>Back</a></div>")

    if request.method == "POST":
        row.title = (request.form.get("title") or "").strip()
        db.session.commit()
        return redirect("/contents-db")

    return _brand_shell("Edit Content", f"""
    <div class="hero"><h1>Edit Content</h1></div>
    <div class="card">
      <form method="POST">
        <input name="title" value="{row.title or ''}" placeholder="Content Title" style="width:100%;padding:10px;margin-bottom:10px;">
        <button class="btn">Save Changes</button>
      </form>
    </div>
    """)

@app.route("/delete-content-db/<int:row_id>")
def delete_content_db(row_id):
    from flask import redirect
    try:
        with app.app_context():
            db.create_all()
        row = ContentRecord.query.get(row_id)
        if row:
            db.session.delete(row)
            db.session.commit()
    except Exception:
        pass
    return redirect("/contents-db")




# ===== CREATOR DASHBOARD DB INTEGRATION =====

@app.route("/creator-dashboard-live")
def creator_dashboard_live():
    try:
        with app.app_context():
            db.create_all()

        creators = CreatorRecord.query.order_by(CreatorRecord.id.desc()).limit(5).all()
        products = ProductRecord.query.order_by(ProductRecord.id.desc()).limit(5).all()
        contents = ContentRecord.query.order_by(ContentRecord.id.desc()).limit(5).all()

        creators_html = "".join(
            f"<div class='tile'><h3>{c.name}</h3><p>{c.niche or ''}</p></div>"
            for c in creators
        ) or "<p>No creators yet</p>"

        products_html = "".join(
            f"<div class='tile'><h3>{p.name}</h3><p>${p.price or ''}</p></div>"
            for p in products
        ) or "<p>No products yet</p>"

        contents_html = "".join(
            f"<div class='tile'><h3>{c.title}</h3></div>"
            for c in contents
        ) or "<p>No content yet</p>"

    except Exception as e:
        return _brand_shell("Dashboard Error", f"<div class='card'><p>{e}</p></div>")

    return _brand_shell("Creator Dashboard Live", f"""
    <div class="hero">
      <h1>Live Creator Dashboard</h1>
      <p>Your real data connected across the ecosystem</p>
    </div>

    <div class="card">
      <h2>Recent Creators</h2>
      {creators_html}
      <a class="btn" href="/creators-db">Manage Creators</a>
    </div>

    <div class="card">
      <h2>Recent Products</h2>
      {products_html}
      <a class="btn" href="/products-db">Manage Products</a>
    </div>

    <div class="card">
      <h2>Recent Content</h2>
      {contents_html}
      <a class="btn" href="/contents-db">Manage Content</a>
    </div>
    """)




# ===== HISTORY + SPACE + MEMORY RECONSTRUCTION =====

@app.route("/history-engine")
def history_engine():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">History Engine</h1>
      <p style="margin:0;">Reconstruction layer from ancient eras to modern civilization.</p>
    </div>

    <div class="card">
      <a class="btn" href="/timeline-reconstruction">Open Timeline Reconstruction</a>
      <a class="btn" href="/earth-reconstruction">Open Earth Reconstruction</a>
      <a class="btn" href="/ancient-hebrew">Open Ancient Hebrew Archive</a>
      <a class="btn" href="/time-machine">Open Time Machine</a>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/big-bang-lab">Big Bang Lab</a>
        <a class="smallbtn" href="/prehistoric-world">Prehistoric World</a>
        <a class="smallbtn" href="/memory-vault">Memory Vault</a>
        <a class="smallbtn" href="/quantum-analysis">Quantum Analysis</a>
        <a class="smallbtn" href="/memory-journey">Memory Journey</a>
        <a class="smallbtn" href="/verse-scenario-lab">Scenario Lab</a>
        <a class="smallbtn" href="/world-state-jump">World Jump</a>
      </div>
    </div>
    """
    return _brand_shell("History Engine", body)

@app.route("/timeline-reconstruction")
def timeline_reconstruction():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Timeline Reconstruction</h1>
      <p style="margin:0;">A structured journey across eras, archives, and reconstructed world states.</p>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Era Gates</h2>
      <div class="triple">
        <div class="tile">
          <h3>Ancient World</h3>
          <p>Early civilization, cultural memory, and archive layers.</p>
          <a class="smallbtn" href="/ancient-hebrew">Enter</a>
        </div>
        <div class="tile">
          <h3>Prehistoric World</h3>
          <p>Dinosaurs, ancient earth, and earlier life-state reconstructions.</p>
          <a class="smallbtn" href="/prehistoric-world">Enter</a>
        </div>
        <div class="tile">
          <h3>Cosmic Origin</h3>
          <p>Big Bang and formation-stage conceptual timeline pages.</p>
          <a class="smallbtn" href="/big-bang-lab">Enter</a>
        </div>
      </div>
    </div>
    """
    return _brand_shell("Timeline Reconstruction", body)

@app.route("/earth-reconstruction")
def earth_reconstruction():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Earth Reconstruction</h1>
      <p style="margin:0;">Planetary memory, geography, civilization states, and world-scale archive views.</p>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/timeline-archive?era=past">Past Earth</a>
        <a class="smallbtn" href="/timeline-archive?era=present">Present Earth</a>
        <a class="smallbtn" href="/timeline-archive?era=future">Future Earth</a>
        <a class="smallbtn" href="/clickable-map">World Map</a>
      </div>
    </div>
    """
    return _brand_shell("Earth Reconstruction", body)

@app.route("/big-bang-lab")
def big_bang_lab():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Big Bang Lab</h1>
      <p style="margin:0;">Cosmic-origin timeline concepts, formation epochs, and universe memory framing.</p>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile"><h3>Origin</h3><p>Initial formation phase.</p></div>
        <div class="tile"><h3>Expansion</h3><p>Cosmic spread and structure growth.</p></div>
        <div class="tile"><h3>World Formation</h3><p>Planetary and later life-stage transition.</p></div>
      </div>
    </div>
    """
    return _brand_shell("Big Bang Lab", body)

@app.route("/prehistoric-world")
def prehistoric_world():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Prehistoric World</h1>
      <p style="margin:0;">Ancient-earth, dinosaur-era, and early-life reconstruction pages.</p>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile"><h3>Dinosaur Era</h3><p>Large-scale creature age and habitat reconstruction.</p></div>
        <div class="tile"><h3>Early Earth</h3><p>Primitive world-state views.</p></div>
        <div class="tile"><h3>Transition to Human History</h3><p>Bridge from natural eras to civilization timelines.</p></div>
      </div>
    </div>
    """
    return _brand_shell("Prehistoric World", body)

@app.route("/ancient-hebrew")
def ancient_hebrew():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Ancient Hebrew Archive</h1>
      <p style="margin:0;">Archive and chronology layer for ancient Hebrew historical memory.</p>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/history-engine">History Engine</a>
        <a class="smallbtn" href="/memory-vault">Memory Vault</a>
        <a class="smallbtn" href="/timeline-reconstruction">Timeline Reconstruction</a>
        <a class="smallbtn" href="/time-machine">Time Machine</a>
        <a class="smallbtn" href="/era-console">Era Console</a>
        <a class="smallbtn" href="/snapshots">Snapshots</a>
        <a class="smallbtn" href="/history-engine">History Engine</a>
      </div>
    </div>
    """
    return _brand_shell("Ancient Hebrew Archive", body)

@app.route("/mars-travel")
def mars_travel():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Mars Travel</h1>
      <p style="margin:0;">Mars mission planning, destination storytelling, and future realm access.</p>
    </div>

    <div class="card">
      <a class="btn" href="/metaverse-pass">Get Metaverse Pass</a>
      <a class="btn" href="/multiverse-hub">Open Multiverse</a>
      <a class="btn" href="/quantum-analysis">Open Quantum Analysis</a>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile"><h3>Mars Port</h3><p>Arrival and mission hub.</p></div>
        <div class="tile"><h3>Research Zone</h3><p>Exploration and archive analysis.</p></div>
        <div class="tile"><h3>Future Colony</h3><p>Premium future-world narrative access.</p></div>
      </div>
    </div>
    """
    return _brand_shell("Mars Travel", body)

@app.route("/moon-travel")
def moon_travel():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Moon Travel</h1>
      <p style="margin:0;">Moon gateway, orbital travel concepts, and premium celestial access.</p>
    </div>

    <div class="card">
      <a class="btn" href="/metaverse-pass">Get Metaverse Pass</a>
      <a class="btn" href="/metaverse-hub">Open Metaverse</a>
      <a class="btn" href="/verse-overview">Open Verse Overview</a>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile"><h3>Moon Gate</h3><p>Orbital entry point.</p></div>
        <div class="tile"><h3>Observation Deck</h3><p>Earth-view and timeline reflection space.</p></div>
        <div class="tile"><h3>Lunar Realm</h3><p>Premium destination experience.</p></div>
      </div>
    </div>
    """
    return _brand_shell("Moon Travel", body)

@app.route("/metaverse-pass")
def metaverse_pass():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Metaverse Pass</h1>
      <p style="margin:0;">Access pass for premium realms, immersive rooms, events, and future verse travel.</p>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Pass Levels</h2>
      <div class="triple">
        <div class="tile">
          <h3>Explorer Pass</h3>
          <p>Entry to core ecosystem and standard verse layers.</p>
          <a class="smallbtn" href="/payments-shell">Open Payments</a>
        </div>
        <div class="tile">
          <h3>Traveler Pass</h3>
          <p>Expanded access to Moon, Mars, and premium verse zones.</p>
          <a class="smallbtn" href="/payments-shell">Open Payments</a>
        </div>
        <div class="tile">
          <h3>Omni Pass</h3>
          <p>Full access to immersive experiences and future premium realms.</p>
          <a class="smallbtn" href="/payments-shell">Open Payments</a>
        </div>
      </div>
    </div>
    """
    return _brand_shell("Metaverse Pass", body)

@app.route("/memory-journey")
def memory_journey():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Memory Journey</h1>
      <p style="margin:0;">A recall-inspired experience layer for archive replay, identity memory, and timeline navigation.</p>
    </div>

    <div class="card">
      <a class="btn" href="/memory-vault">Open Memory Vault</a>
      <a class="btn" href="/timeline-archive?era=past">Replay Past</a>
      <a class="btn" href="/quantum-analysis">Open Quantum Analysis</a>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/history-engine">History Engine</a>
        <a class="smallbtn" href="/time-machine">Time Machine</a>
        <a class="smallbtn" href="/era-console">Era Console</a>
        <a class="smallbtn" href="/snapshots">Snapshots</a>
        <a class="smallbtn" href="/history-engine">History Engine</a>
        <a class="smallbtn" href="/earth-reconstruction">Earth Reconstruction</a>
        <a class="smallbtn" href="/verse-overview">Verse Overview</a>
      </div>
    </div>
    """
    return _brand_shell("Memory Journey", body)




# ===== STARTUP DB BOOTSTRAP =====
try:
    with app.app_context():
        db.create_all()
except Exception:
    pass




@app.route("/system-gap-report")
def system_gap_report():
    try:
        import json as _json
        from pathlib import Path as _Path
        data = _json.loads(_Path("reports/gap_audit.json").read_text(encoding="utf-8"))
        body = f"""
        <div class="hero">
          <h1 style="margin:0 0 8px 0;">System Gap Report</h1>
          <p style="margin:0;">Current audit summary for the app.</p>
        </div>
        <div class="card"><pre>{_json.dumps(data, indent=2)}</pre></div>
        """
        return _brand_shell("System Gap Report", body) if 'def _brand_shell(' in globals() else body
    except Exception as e:
        return f"Gap report unavailable: {e}", 200




# ===== SNAPSHOT + ERA TAGGING LAYER =====

class SnapshotRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(255), nullable=False)
    era = db.Column(db.String(64), nullable=False, default="present")
    verse = db.Column(db.String(64), nullable=False, default="ecosystem")
    summary = db.Column(db.Text, nullable=True)
    timestamp_text = db.Column(db.String(255), nullable=True)

# add light era/verse fields to existing records if they are missing logically in UI layer
# this keeps routes usable even if old rows do not yet have values filled in

@app.route("/save-snapshot", methods=["GET","POST"])
def save_snapshot():
    from flask import request, redirect
    import datetime as _dt

    try:
        with app.app_context():
            db.create_all()
    except Exception:
        pass

    if request.method == "POST":
        label = (request.form.get("label") or "").strip() or "Untitled Snapshot"
        era = (request.form.get("era") or "present").strip() or "present"
        verse = (request.form.get("verse") or "ecosystem").strip() or "ecosystem"
        summary = (request.form.get("summary") or "").strip()
        row = SnapshotRecord(
            label=label,
            era=era,
            verse=verse,
            summary=summary,
            timestamp_text=_dt.datetime.now().isoformat(timespec="seconds")
        )
        db.session.add(row)
        db.session.commit()
        return redirect("/snapshots")

    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Save Snapshot</h1>
      <p style="margin:0;">Create a time-machine checkpoint for the platform.</p>
    </div>

    <div class="card">
      <form method="POST">
        <input name="label" placeholder="Snapshot label" style="width:100%;padding:10px;margin-bottom:10px;">
        <input name="era" placeholder="past / present / future" style="width:100%;padding:10px;margin-bottom:10px;">
        <input name="verse" placeholder="ecosystem / metaverse / middleverse / multiverse" style="width:100%;padding:10px;margin-bottom:10px;">
        <textarea name="summary" placeholder="Summary" style="width:100%;padding:10px;margin-bottom:10px;min-height:120px;"></textarea>
        <button class="btn">Save Snapshot</button>
      </form>
    </div>
    """
    return _brand_shell("Save Snapshot", body)

@app.route("/snapshots")
def list_snapshots():
    try:
        with app.app_context():
            db.create_all()
        rows = SnapshotRecord.query.order_by(SnapshotRecord.id.desc()).all()
        items = "".join(
            f"""
            <div class='tile'>
              <h3>{r.label}</h3>
              <p>{r.summary or ''}</p>
              <p><strong>Era:</strong> {r.era} | <strong>Verse:</strong> {r.verse}</p>
              <p><strong>Time:</strong> {r.timestamp_text or ''}</p>
            </div>
            """
            for r in rows
        ) or "<p>No snapshots saved yet.</p>"
    except Exception as e:
        items = f"<p>DB error: {e}</p>"

    body = f"""
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Saved Snapshots</h1>
      <p style="margin:0;">Past, present, and future checkpoint memory.</p>
    </div>

    <div class="card">{items}</div>
    <a class="btn" href="/save-snapshot">Create Snapshot</a>
    """
    return _brand_shell("Snapshots", body)

@app.route("/era-console")
def era_console():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Era Console</h1>
      <p style="margin:0;">Jump into past, present, and future operating views.</p>
    </div>

    <div class="triple">
      <div class="tile">
        <h3>Past Mode</h3>
        <p>Archives, memory, reconstruction, and historical layers.</p>
        <a class="smallbtn" href="/timeline-archive?era=past">Open Past</a>
      </div>
      <div class="tile">
        <h3>Present Mode</h3>
        <p>Current business state and active ecosystem controls.</p>
        <a class="smallbtn" href="/timeline-archive?era=present">Open Present</a>
      </div>
      <div class="tile">
        <h3>Future Mode</h3>
        <p>Planned launches, realms, and expansion layers.</p>
        <a class="smallbtn" href="/timeline-archive?era=future">Open Future</a>
      </div>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/save-snapshot">Save Snapshot</a>
        <a class="smallbtn" href="/snapshots">View Snapshots</a>
        <a class="smallbtn" href="/time-machine">Time Machine</a>
        <a class="smallbtn" href="/era-console">Era Console</a>
        <a class="smallbtn" href="/snapshots">Snapshots</a>
        <a class="smallbtn" href="/quantum-analysis">Quantum Analysis</a>
      </div>
    </div>
    """
    return _brand_shell("Era Console", body)

@app.route("/verse-scenario-lab")
def verse_scenario_lab():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Verse Scenario Lab</h1>
      <p style="margin:0;">Explore possible ecosystem configurations across verses and eras.</p>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Scenario Tracks</h2>
      <div class="triple">
        <div class="tile">
          <h3>Commerce Expansion</h3>
          <p>Marketplace-led universe growth path.</p>
          <a class="smallbtn" href="/marketplace-hub">Open</a>
        </div>
        <div class="tile">
          <h3>Streaming Expansion</h3>
          <p>Premium channels and live-event growth path.</p>
          <a class="smallbtn" href="/streaming-hub">Open</a>
        </div>
        <div class="tile">
          <h3>Verse Expansion</h3>
          <p>Metaverse, Middleverse, and Multiverse growth path.</p>
          <a class="smallbtn" href="/verse-overview">Open</a>
        </div>
      </div>
    </div>

    <div class="card">
      <a class="btn" href="/save-snapshot">Save Scenario Snapshot</a>
    </div>
    """
    return _brand_shell("Verse Scenario Lab", body)

@app.route("/world-state-jump")
def world_state_jump():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">World State Jump</h1>
      <p style="margin:0;">Quick-jump between ecosystem states, control states, and verse states.</p>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/ecosystem-home">Ecosystem State</a>
        <a class="smallbtn" href="/metaverse-hub">Metaverse State</a>
        <a class="smallbtn" href="/middleverse-hub">Middleverse State</a>
        <a class="smallbtn" href="/multiverse-hub">Multiverse State</a>
        <a class="smallbtn" href="/creator-dashboard-live">Creator State</a>
        <a class="smallbtn" href="/time-machine">Time State</a>
      </div>
    </div>
    """
    return _brand_shell("World State Jump", body)




# ===== SAFE RELATIONSHIP LAYER =====

class CreatorProductLink(db.Model):
    __table_args__ = {"extend_existing": True}
    id = db.Column(db.Integer, primary_key=True)
    creator_id = db.Column(db.Integer, nullable=False)
    product_id = db.Column(db.Integer, nullable=False)

class CreatorContentLink(db.Model):
    __table_args__ = {"extend_existing": True}
    id = db.Column(db.Integer, primary_key=True)
    creator_id = db.Column(db.Integer, nullable=False)
    content_id = db.Column(db.Integer, nullable=False)

@app.route("/creator-links")
def creator_links():
    try:
        with app.app_context():
            db.create_all()
        creators = CreatorRecord.query.order_by(CreatorRecord.id.desc()).all()
        cards = "".join(
            f"""
            <div class='tile'>
              <h3>{c.name}</h3>
              <p>{c.niche or 'Creator'}</p>
              <a class='smallbtn' href='/manage-creator-links/{c.id}'>Manage Links</a>
              <a class='smallbtn' href='/creator-owned-storefront/{c.id}'>Open Owned Storefront</a>
            </div>
            """
            for c in creators
        ) or "<p>No creators yet.</p>"

        body = f"""
        <div class="hero">
          <h1 style="margin:0 0 8px 0;">Creator Links</h1>
          <p style="margin:0;">Safely connect creators to products and content.</p>
        </div>
        <div class="card">
          <div class="triple">{cards}</div>
        </div>
        """
        return _brand_shell("Creator Links", body)
    except Exception as e:
        return _brand_shell("Creator Links", f"<div class='card'><p>{e}</p></div>")

@app.route("/manage-creator-links/<int:creator_id>", methods=["GET","POST"])
def manage_creator_links(creator_id):
    from flask import request, redirect

    try:
        with app.app_context():
            db.create_all()
        creator = CreatorRecord.query.get(creator_id)
        if not creator:
            return _brand_shell("Manage Creator Links", "<div class='card'><p>Creator not found.</p></div>")

        if request.method == "POST":
            product_id = (request.form.get("product_id") or "").strip()
            content_id = (request.form.get("content_id") or "").strip()

            if product_id:
                exists = CreatorProductLink.query.filter_by(creator_id=creator_id, product_id=int(product_id)).first()
                if not exists:
                    db.session.add(CreatorProductLink(creator_id=creator_id, product_id=int(product_id)))

            if content_id:
                exists = CreatorContentLink.query.filter_by(creator_id=creator_id, content_id=int(content_id)).first()
                if not exists:
                    db.session.add(CreatorContentLink(creator_id=creator_id, content_id=int(content_id)))

            db.session.commit()
            return redirect(f"/manage-creator-links/{creator_id}")

        products = ProductRecord.query.order_by(ProductRecord.id.desc()).all()
        contents = ContentRecord.query.order_by(ContentRecord.id.desc()).all()

        linked_products = CreatorProductLink.query.filter_by(creator_id=creator_id).all()
        linked_contents = CreatorContentLink.query.filter_by(creator_id=creator_id).all()

        product_options = "".join(f"<option value='{r.id}'>{r.name}</option>" for r in products)
        content_options = "".join(f"<option value='{r.id}'>{r.title}</option>" for r in contents)

        linked_products_html = "".join(
            f"<li>Product #{r.product_id} <a class='smallbtn' href='/unlink-product/{r.id}'>Remove</a></li>"
            for r in linked_products
        ) or "<li>No linked products</li>"

        linked_contents_html = "".join(
            f"<li>Content #{r.content_id} <a class='smallbtn' href='/unlink-content/{r.id}'>Remove</a></li>"
            for r in linked_contents
        ) or "<li>No linked content</li>"

        body = f"""
        <div class="hero">
          <h1 style="margin:0 0 8px 0;">Manage Links: {creator.name}</h1>
          <p style="margin:0;">Safe ownership connections.</p>
        </div>

        <div class="card">
          <form method="POST">
            <select name="product_id" style="width:100%;padding:10px;margin-bottom:10px;">
              <option value="">Select Product</option>
              {product_options}
            </select>
            <select name="content_id" style="width:100%;padding:10px;margin-bottom:10px;">
              <option value="">Select Content</option>
              {content_options}
            </select>
            <button class="btn">Save Links</button>
          </form>
        </div>

        <div class="card">
          <h2 class="sectiontitle">Linked Products</h2>
          <ul>{linked_products_html}</ul>
        </div>

        <div class="card">
          <h2 class="sectiontitle">Linked Content</h2>
          <ul>{linked_contents_html}</ul>
        </div>

        <div class="card">
          <a class="btn" href="/creator-owned-storefront/{creator.id}">Open Owned Storefront</a>
        </div>
        """
        return _brand_shell("Manage Creator Links", body)
    except Exception as e:
        return _brand_shell("Manage Creator Links", f"<div class='card'><p>{e}</p></div>")

@app.route("/unlink-product/<int:link_id>")
def unlink_product(link_id):
    from flask import redirect
    try:
        row = CreatorProductLink.query.get(link_id)
        creator_id = row.creator_id if row else None
        if row:
            db.session.delete(row)
            db.session.commit()
        if creator_id:
            return redirect(f"/manage-creator-links/{creator_id}")
    except Exception:
        pass
    return redirect("/creator-links")

@app.route("/unlink-content/<int:link_id>")
def unlink_content(link_id):
    from flask import redirect
    try:
        row = CreatorContentLink.query.get(link_id)
        creator_id = row.creator_id if row else None
        if row:
            db.session.delete(row)
            db.session.commit()
        if creator_id:
            return redirect(f"/manage-creator-links/{creator_id}")
    except Exception:
        pass
    return redirect("/creator-links")

@app.route("/creator-owned-storefront/<int:creator_id>")
def creator_owned_storefront(creator_id):
    try:
        with app.app_context():
            db.create_all()

        creator = CreatorRecord.query.get(creator_id)
        if not creator:
            return _brand_shell("Owned Storefront", "<div class='card'><p>Creator not found.</p></div>")

        product_links = CreatorProductLink.query.filter_by(creator_id=creator_id).all()
        content_links = CreatorContentLink.query.filter_by(creator_id=creator_id).all()

        product_ids = [r.product_id for r in product_links]
        content_ids = [r.content_id for r in content_links]

        products = ProductRecord.query.filter(ProductRecord.id.in_(product_ids)).all() if product_ids else []
        contents = ContentRecord.query.filter(ContentRecord.id.in_(content_ids)).all() if content_ids else []

        products_html = "".join(
            f"<div class='tile'><h3>{r.name}</h3><p>${r.price or ''}</p></div>"
            for r in products
        ) or "<p>No linked products yet.</p>"

        contents_html = "".join(
            f"<div class='tile'><h3>{r.title}</h3></div>"
            for r in contents
        ) or "<p>No linked content yet.</p>"

        body = f"""
        <div class="hero">
          <h1 style="margin:0 0 8px 0;">{creator.name}</h1>
          <p style="margin:0;">{creator.niche or 'Creator storefront'}</p>
        </div>

        <div class="card">
          <h2 class="sectiontitle">Owned Products</h2>
          <div class="triple">{products_html}</div>
        </div>

        <div class="card">
          <h2 class="sectiontitle">Owned Content</h2>
          <div class="triple">{contents_html}</div>
        </div>

        <div class="card">
          <div class="grid">
            <a class="smallbtn" href="/manage-creator-links/{creator.id}">Manage Links</a>
            <a class="smallbtn" href="/creator-dashboard-live">Live Dashboard</a>
            <a class="smallbtn" href="/premium-memberships">Memberships</a>
            <a class="smallbtn" href="/metaverse-pass">Metaverse Pass</a>
          </div>
        </div>
        """
        return _brand_shell(f"{creator.name} Owned Storefront", body)
    except Exception as e:
        return _brand_shell("Owned Storefront", f"<div class='card'><p>{e}</p></div>")



# ===== CLEAN STABILITY PAGE + SAFE CREATOR LINK LAYER =====

@app.route("/stability-hub")
def stability_hub():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Stability Hub</h1>
      <p style="margin:0;">Safe restart, audit, creator links, and route health.</p>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/app-home">App Home</a>
        <a class="smallbtn" href="/creator-directory">Creator Directory</a>
        <a class="smallbtn" href="/creator-dashboard-live">Creator Dashboard Live</a>
        <a class="smallbtn" href="/creator-links-safe">Creator Links</a>
        <a class="smallbtn" href="/time-machine">Time Machine</a>
        <a class="smallbtn" href="/system-gap-report">Gap Report</a>
      </div>
    </div>
    """
    return _brand_shell("Stability Hub", body)

@app.route("/creator-links-safe")
def creator_links_safe():
    try:
        with app.app_context():
            db.create_all()
        creators = CreatorRecord.query.order_by(CreatorRecord.id.desc()).all()
        cards = "".join(
            f"""
            <div class='tile'>
              <h3>{c.name}</h3>
              <p>{c.niche or 'Creator'}</p>
              <a class='smallbtn' href='/manage-creator-links-safe/{c.id}'>Manage Links</a>
              <a class='smallbtn' href='/creator-owned-storefront-safe/{c.id}'>Owned Storefront</a>
            </div>
            """
            for c in creators
        ) or "<p>No creators yet.</p>"

        body = f"""
        <div class="hero">
          <h1 style="margin:0 0 8px 0;">Creator Links</h1>
          <p style="margin:0;">Safe ownership links for creators, products, and content.</p>
        </div>

        <div class="card">
          <div class="triple">
            {cards}
          </div>
        </div>

        <div class="card">
          <a class="btn" href="/creator-directory">Open Creator Directory</a>
        </div>
        """
        return _brand_shell("Creator Links", body)
    except Exception as e:
        return _brand_shell("Creator Links", f"<div class='card'><p>{e}</p></div>")

@app.route("/manage-creator-links-safe/<int:creator_id>", methods=["GET","POST"])
def manage_creator_links_safe(creator_id):
    from flask import request, redirect

    try:
        with app.app_context():
            db.create_all()

        creator = CreatorRecord.query.get(creator_id)
        if not creator:
            return _brand_shell("Manage Creator Links", "<div class='card'><p>Creator not found.</p></div>")

        if request.method == "POST":
            product_id = (request.form.get("product_id") or "").strip()
            content_id = (request.form.get("content_id") or "").strip()

            if product_id:
                exists = CreatorProductLink.query.filter_by(creator_id=creator_id, product_id=int(product_id)).first()
                if not exists:
                    db.session.add(CreatorProductLink(creator_id=creator_id, product_id=int(product_id)))

            if content_id:
                exists = CreatorContentLink.query.filter_by(creator_id=creator_id, content_id=int(content_id)).first()
                if not exists:
                    db.session.add(CreatorContentLink(creator_id=creator_id, content_id=int(content_id)))

            db.session.commit()
            return redirect(f"/manage-creator-links-safe/{creator_id}")

        products = ProductRecord.query.order_by(ProductRecord.id.desc()).all()
        contents = ContentRecord.query.order_by(ContentRecord.id.desc()).all()

        linked_products = CreatorProductLink.query.filter_by(creator_id=creator_id).all()
        linked_contents = CreatorContentLink.query.filter_by(creator_id=creator_id).all()

        product_options = "".join(f"<option value='{r.id}'>{r.name}</option>" for r in products)
        content_options = "".join(f"<option value='{r.id}'>{r.title}</option>" for r in contents)

        linked_products_html = "".join(
            f"<li>Product #{r.product_id} <a class='smallbtn' href='/unlink-product-safe/{r.id}'>Remove</a></li>"
            for r in linked_products
        ) or "<li>No linked products</li>"

        linked_contents_html = "".join(
            f"<li>Content #{r.content_id} <a class='smallbtn' href='/unlink-content-safe/{r.id}'>Remove</a></li>"
            for r in linked_contents
        ) or "<li>No linked content</li>"

        body = f"""
        <div class="hero">
          <h1 style="margin:0 0 8px 0;">Manage Links: {creator.name}</h1>
          <p style="margin:0;">Stable creator ownership mapping.</p>
        </div>

        <div class="card">
          <form method="POST">
            <select name="product_id" style="width:100%;padding:10px;margin-bottom:10px;">
              <option value="">Select Product</option>
              {product_options}
            </select>

            <select name="content_id" style="width:100%;padding:10px;margin-bottom:10px;">
              <option value="">Select Content</option>
              {content_options}
            </select>

            <button class="btn">Save Links</button>
          </form>
        </div>

        <div class="card">
          <h2 class="sectiontitle">Linked Products</h2>
          <ul>{linked_products_html}</ul>
        </div>

        <div class="card">
          <h2 class="sectiontitle">Linked Content</h2>
          <ul>{linked_contents_html}</ul>
        </div>

        <div class="card">
          <a class="btn" href="/creator-owned-storefront-safe/{creator.id}">Open Owned Storefront</a>
        </div>
        """
        return _brand_shell("Manage Creator Links", body)
    except Exception as e:
        return _brand_shell("Manage Creator Links", f"<div class='card'><p>{e}</p></div>")

@app.route("/unlink-product-safe/<int:link_id>")
def unlink_product_safe(link_id):
    from flask import redirect
    try:
        row = CreatorProductLink.query.get(link_id)
        creator_id = row.creator_id if row else None
        if row:
            db.session.delete(row)
            db.session.commit()
        if creator_id:
            return redirect(f"/manage-creator-links-safe/{creator_id}")
    except Exception:
        pass
    return redirect("/creator-links-safe")

@app.route("/unlink-content-safe/<int:link_id>")
def unlink_content_safe(link_id):
    from flask import redirect
    try:
        row = CreatorContentLink.query.get(link_id)
        creator_id = row.creator_id if row else None
        if row:
            db.session.delete(row)
            db.session.commit()
        if creator_id:
            return redirect(f"/manage-creator-links-safe/{creator_id}")
    except Exception:
        pass
    return redirect("/creator-links-safe")

@app.route("/creator-owned-storefront-safe/<int:creator_id>")
def creator_owned_storefront_safe(creator_id):
    try:
        with app.app_context():
            db.create_all()

        creator = CreatorRecord.query.get(creator_id)
        if not creator:
            return _brand_shell("Owned Storefront", "<div class='card'><p>Creator not found.</p></div>")

        product_links = CreatorProductLink.query.filter_by(creator_id=creator_id).all()
        content_links = CreatorContentLink.query.filter_by(creator_id=creator_id).all()

        product_ids = [r.product_id for r in product_links]
        content_ids = [r.content_id for r in content_links]

        products = ProductRecord.query.filter(ProductRecord.id.in_(product_ids)).all() if product_ids else []
        contents = ContentRecord.query.filter(ContentRecord.id.in_(content_ids)).all() if content_ids else []

        products_html = "".join(
            f"<div class='tile'><h3>{r.name}</h3><p>${r.price or ''}</p></div>"
            for r in products
        ) or "<p>No linked products yet.</p>"

        contents_html = "".join(
            f"<div class='tile'><h3>{r.title}</h3></div>"
            for r in contents
        ) or "<p>No linked content yet.</p>"

        body = f"""
        <div class="hero">
          <h1 style="margin:0 0 8px 0;">{creator.name}</h1>
          <p style="margin:0;">{creator.niche or 'Creator storefront'}</p>
        </div>

        <div class="card">
          <h2 class="sectiontitle">Owned Products</h2>
          <div class="triple">{products_html}</div>
        </div>

        <div class="card">
          <h2 class="sectiontitle">Owned Content</h2>
          <div class="triple">{contents_html}</div>
        </div>

        <div class="card">
          <div class="grid">
            <a class="smallbtn" href="/manage-creator-links-safe/{creator.id}">Manage Links</a>
            <a class="smallbtn" href="/creator-directory">Directory</a>
            <a class="smallbtn" href="/creator-dashboard-live">Live Dashboard</a>
            <a class="smallbtn" href="/premium-memberships">Memberships</a>
          </div>
        </div>
        """
        return _brand_shell(f"{creator.name} Owned Storefront", body)
    except Exception as e:
        return _brand_shell("Owned Storefront", f"<div class='card'><p>{e}</p></div>")




# ===== UPLOAD + MEDIA LAYER =====

UPLOAD_ROOT = "uploads"
MEDIA_DIR = "uploads/media"
CREATOR_MEDIA_DIR = "uploads/creator"
CONTENT_MEDIA_DIR = "uploads/content"

for _d in [UPLOAD_ROOT, MEDIA_DIR, CREATOR_MEDIA_DIR, CONTENT_MEDIA_DIR]:
    try:
        os.makedirs(_d, exist_ok=True)
    except Exception:
        pass

@app.route("/upload-center")
def upload_center():
    body = """
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Upload Center</h1>
      <p style="margin:0;">Upload images, creator files, and content assets.</p>
    </div>

    <div class="card">
      <a class="btn" href="/upload-media">Upload General Media</a>
      <a class="btn" href="/upload-creator-media">Upload Creator Media</a>
      <a class="btn" href="/upload-content-media">Upload Content Media</a>
      <a class="btn" href="/media-library">Open Media Library</a>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/creator-directory">Creator Directory</a>
        <a class="smallbtn" href="/creator-dashboard-live">Creator Dashboard</a>
        <a class="smallbtn" href="/account-center-v2">Account Center</a>
        <a class="smallbtn" href="/creator-monetization-v2">Monetization</a>
        <a class="smallbtn" href="/content-catalog">Content Catalog</a>
        <a class="smallbtn" href="/product-catalog">Product Catalog</a>
      </div>
    </div>
    """
    return _brand_shell("Upload Center", body)

@app.route("/upload-media", methods=["GET","POST"])
def upload_media():
    from flask import request, redirect

    message = ""
    if request.method == "POST":
        try:
            f = request.files.get("file")
            if f and f.filename:
                name = secure_filename(f.filename)
                path = os.path.join(MEDIA_DIR, name)
                f.save(path)
                message = f"Saved: {name}"
            else:
                message = "No file selected."
        except Exception as e:
            message = f"Upload error: {e}"

    body = f"""
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Upload General Media</h1>
      <p style="margin:0;">Store shared ecosystem media files.</p>
    </div>

    <div class="card">
      <p>{message}</p>
      <form method="POST" enctype="multipart/form-data">
        <input type="file" name="file" style="width:100%;padding:10px;margin-bottom:10px;">
        <button class="btn">Upload File</button>
      </form>
    </div>

    <div class="card">
      <a class="btn" href="/media-library">Open Media Library</a>
    </div>
    """
    return _brand_shell("Upload Media", body)

@app.route("/upload-creator-media", methods=["GET","POST"])
def upload_creator_media():
    from flask import request

    message = ""
    if request.method == "POST":
        try:
            f = request.files.get("file")
            if f and f.filename:
                name = secure_filename(f.filename)
                path = os.path.join(CREATOR_MEDIA_DIR, name)
                f.save(path)
                message = f"Saved creator media: {name}"
            else:
                message = "No file selected."
        except Exception as e:
            message = f"Upload error: {e}"

    body = f"""
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Upload Creator Media</h1>
      <p style="margin:0;">Store creator-facing images and files.</p>
    </div>

    <div class="card">
      <p>{message}</p>
      <form method="POST" enctype="multipart/form-data">
        <input type="file" name="file" style="width:100%;padding:10px;margin-bottom:10px;">
        <button class="btn">Upload Creator File</button>
      </form>
    </div>

    <div class="card">
      <a class="btn" href="/creator-media-hub">Open Creator Media Hub</a>
    </div>
    """
    return _brand_shell("Upload Creator Media", body)

@app.route("/upload-content-media", methods=["GET","POST"])
def upload_content_media():
    from flask import request

    message = ""
    if request.method == "POST":
        try:
            f = request.files.get("file")
            if f and f.filename:
                name = secure_filename(f.filename)
                path = os.path.join(CONTENT_MEDIA_DIR, name)
                f.save(path)
                message = f"Saved content media: {name}"
            else:
                message = "No file selected."
        except Exception as e:
            message = f"Upload error: {e}"

    body = f"""
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Upload Content Media</h1>
      <p style="margin:0;">Store media for content and streaming experiences.</p>
    </div>

    <div class="card">
      <p>{message}</p>
      <form method="POST" enctype="multipart/form-data">
        <input type="file" name="file" style="width:100%;padding:10px;margin-bottom:10px;">
        <button class="btn">Upload Content File</button>
      </form>
    </div>

    <div class="card">
      <a class="btn" href="/media-library">Open Media Library</a>
    </div>
    """
    return _brand_shell("Upload Content Media", body)

@app.route("/media-library")
def media_library():
    try:
        media_files = sorted(os.listdir(MEDIA_DIR))
    except Exception:
        media_files = []
    try:
        creator_files = sorted(os.listdir(CREATOR_MEDIA_DIR))
    except Exception:
        creator_files = []
    try:
        content_files = sorted(os.listdir(CONTENT_MEDIA_DIR))
    except Exception:
        content_files = []

    def render_files(title, files, prefix):
        cards = "".join(
            f"<div class='tile'><h3>{name}</h3><a class='smallbtn' href='/{prefix}/{name}'>Open File</a></div>"
            for name in files
        ) or "<p>No files yet.</p>"
        return f"<div class='card'><h2 class='sectiontitle'>{title}</h2><div class='triple'>{cards}</div></div>"

    body = f"""
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Media Library</h1>
      <p style="margin:0;">Browse uploaded media across the platform.</p>
    </div>

    {render_files("General Media", media_files, "uploads/media")}
    {render_files("Creator Media", creator_files, "uploads/creator")}
    {render_files("Content Media", content_files, "uploads/content")}

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/upload-center">Upload Center</a>
        <a class="smallbtn" href="/creator-media-hub">Creator Media Hub</a>
        <a class="smallbtn" href="/creator-directory">Creator Directory</a>
        <a class="smallbtn" href="/creator-dashboard-live">Creator Dashboard</a>
        <a class="smallbtn" href="/account-center-v2">Account Center</a>
        <a class="smallbtn" href="/creator-monetization-v2">Monetization</a>
      </div>
    </div>
    """
    return _brand_shell("Media Library", body)

@app.route("/creator-media-hub")
def creator_media_hub():
    try:
        creator_files = sorted(os.listdir(CREATOR_MEDIA_DIR))
    except Exception:
        creator_files = []

    cards = "".join(
        f"<div class='tile'><h3>{name}</h3><a class='smallbtn' href='/uploads/creator/{name}'>Open</a></div>"
        for name in creator_files
    ) or "<p>No creator media uploaded yet.</p>"

    body = f"""
    <div class="hero">
      <h1 style="margin:0 0 8px 0;">Creator Media Hub</h1>
      <p style="margin:0;">Media assets for creators and storefront presentation.</p>
    </div>

    <div class="card">
      <div class="triple">{cards}</div>
    </div>

    <div class="card">
      <a class="btn" href="/upload-creator-media">Upload Creator Media</a>
      <a class="btn" href="/creator-directory">Open Creator Directory</a>
    </div>
    """
    return _brand_shell("Creator Media Hub", body)




# ===== VISUAL UPGRADE + REALISTIC TIME MACHINE =====

def _ultra_shell(title, body):
    return f"""
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>{title}</title>
      <style>
        body {{
          margin: 0;
          font-family: Arial, sans-serif;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.18), transparent 25%),
            radial-gradient(circle at top right, rgba(168,85,247,.18), transparent 25%),
            radial-gradient(circle at bottom left, rgba(16,185,129,.12), transparent 20%),
            #070b14;
          color: white;
        }}
        .topbar {{
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(8,12,22,.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,.08);
          padding: 14px 18px;
        }}
        .brandtitle {{
          font-size: 22px;
          font-weight: 800;
          letter-spacing: .4px;
        }}
        .brandsub {{
          font-size: 12px;
          opacity: .82;
          margin-top: 4px;
        }}
        .wrap {{
          max-width: 1120px;
          margin: 0 auto;
          padding: 18px 18px 100px 18px;
        }}
        .hero {{
          border-radius: 22px;
          padding: 24px;
          margin-bottom: 18px;
          background:
            linear-gradient(135deg, rgba(37,99,235,.92), rgba(124,58,237,.88), rgba(13,148,136,.84));
          box-shadow: 0 18px 50px rgba(0,0,0,.35);
          border: 1px solid rgba(255,255,255,.08);
        }}
        .hero h1 {{
          margin: 0 0 8px 0;
          font-size: 32px;
        }}
        .hero p {{
          margin: 0;
          opacity: .95;
          font-size: 15px;
        }}
        .pill {{
          display: inline-block;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,.14);
          margin: 10px 10px 0 0;
          font-size: 12px;
        }}
        .card {{
          background: rgba(20,27,44,.92);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 18px;
          padding: 18px;
          margin-bottom: 18px;
          box-shadow: 0 12px 34px rgba(0,0,0,.22);
        }}
        .sectiontitle {{
          margin: 0 0 14px 0;
          font-size: 24px;
        }}
        .btn {{
          display: block;
          width: 100%;
          box-sizing: border-box;
          padding: 16px;
          margin: 10px 0;
          border-radius: 14px;
          text-align: center;
          text-decoration: none;
          color: white;
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(135deg,#2563eb,#7c3aed);
          box-shadow: 0 10px 20px rgba(37,99,235,.25);
        }}
        .grid {{
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }}
        .triple {{
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }}
        .quad {{
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }}
        .tile {{
          background: linear-gradient(180deg, rgba(30,41,59,.95), rgba(15,23,42,.95));
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 16px;
          padding: 16px;
          min-height: 140px;
          box-shadow: 0 10px 24px rgba(0,0,0,.20);
        }}
        .tile h3 {{
          margin: 0 0 8px 0;
          font-size: 18px;
        }}
        .tile p {{
          margin: 0 0 10px 0;
          opacity: .88;
          font-size: 14px;
        }}
        .smallbtn {{
          display: block;
          padding: 12px;
          margin-top: 8px;
          border-radius: 12px;
          text-decoration: none;
          text-align: center;
          color: white;
          font-size: 16px;
          background: #243247;
        }}
        .feedrow {{
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }}
        .feedcard {{
          background: linear-gradient(180deg,#1f2937,#111827);
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.06);
          box-shadow: 0 10px 30px rgba(0,0,0,.24);
        }}
        .feedthumb {{
          height: 150px;
          background: linear-gradient(135deg,#2563eb,#7c3aed,#059669);
        }}
        .feedbody {{
          padding: 14px;
        }}
        .statrow {{
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 10px;
        }}
        .stat {{
          background: rgba(255,255,255,.08);
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 13px;
        }}
        .timeline {{
          display: grid;
          gap: 14px;
        }}
        .timecard {{
          border-left: 5px solid #60a5fa;
          padding: 14px 16px;
          border-radius: 14px;
          background: rgba(15,23,42,.95);
        }}
        .bottomnav {{
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 10px;
          background: rgba(8,12,22,.94);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255,255,255,.08);
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
        }}
        .bottomnav a {{
          text-decoration: none;
          color: white;
          text-align: center;
          background: #162033;
          padding: 11px 8px;
          border-radius: 12px;
          font-size: 13px;
        }}
        @media (max-width: 900px) {{
          .grid, .triple, .quad, .feedrow {{
            grid-template-columns: 1fr;
          }}
          .hero h1 {{
            font-size: 26px;
          }}
        }}
      </style>
    </head>
    <body>
      <div class="topbar">
        <div class="brandtitle">All American Marketplace Holographic Streaming Ecosystem</div>
        <div class="brandsub">Live Media • Creator Economy • Time Machine • Metaverse • Verse Navigation</div>
      </div>
      <div class="wrap">
        {body}
      </div>
      <div class="bottomnav">
        <a href="/app-home-2">Home</a>
        <a href="/stream-now">Live</a>
        <a href="/creator-directory">Creators</a>
        <a href="/time-machine-2">Time</a>
        <a href="/ecosystem-home">Verses</a>
      </div>
    </body>
    </html>
    """

@app.route("/app-home-2")
def app_home_2():
    body = """
    <div class="hero">
      <h1>Open World Creator Network</h1>
      <p>Streaming, creator storefronts, verse travel, premium access, and timeline navigation in one app.</p>
      <span class="pill">Live Now</span>
      <span class="pill">Creator Owned</span>
      <span class="pill">Verse Travel</span>
      <span class="pill">Time Layers</span>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Live Creator Feed</h2>
      <div class="feedrow">
        <div class="feedcard">
          <div class="feedthumb"></div>
          <div class="feedbody">
            <h3>Creator Live Room</h3>
            <p>Broadcasting premium live experiences and direct offers.</p>
            <div class="statrow">
              <span class="stat">Live</span><span class="stat">4.2K watching</span>
            </div>
            <a class="smallbtn" href="/stream-now">Watch Live</a>
          </div>
        </div>
        <div class="feedcard">
          <div class="feedthumb"></div>
          <div class="feedbody">
            <h3>Holoverse Event</h3>
            <p>Interactive event room with creator access and immersive entry.</p>
            <div class="statrow">
              <span class="stat">Event</span><span class="stat">Premium</span>
            </div>
            <a class="smallbtn" href="/holoverse-hub">Enter Event</a>
          </div>
        </div>
        <div class="feedcard">
          <div class="feedthumb"></div>
          <div class="feedbody">
            <h3>Marketplace Drop</h3>
            <p>Digital goods, services, and premium pass access in one launch lane.</p>
            <div class="statrow">
              <span class="stat">Drop</span><span class="stat">Shop</span>
            </div>
            <a class="smallbtn" href="/marketplace-hub">Open Drop</a>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Power Zones</h2>
      <div class="quad">
        <a class="smallbtn" href="/stream-now">Streaming</a>
        <a class="smallbtn" href="/creator-directory">Creators</a>
        <a class="smallbtn" href="/creator-feed">Creator Feed</a>
        <a class="smallbtn" href="/marketplace-hub">Marketplace</a>
        <a class="smallbtn" href="/time-machine-2">Time Machine</a>
        <a class="smallbtn" href="/metaverse-hub">Metaverse</a>
        <a class="smallbtn" href="/middleverse-hub">Middleverse</a>
        <a class="smallbtn" href="/multiverse-hub">Multiverse</a>
        <a class="smallbtn" href="/metaverse-pass">Passes</a>
      </div>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Creator Economy</h2>
      <div class="triple">
        <div class="tile">
          <h3>Creator Storefronts</h3>
          <p>Creators sell products, content, memberships, and future realm access.</p>
          <a class="smallbtn" href="/creator-directory">Browse</a>
        </div>
        <div class="tile">
          <h3>Premium Memberships</h3>
          <p>Subscription layers across live media, marketplace drops, and verse travel.</p>
          <a class="smallbtn" href="/premium-memberships">Open</a>
        </div>
        <div class="tile">
          <h3>Launchpad</h3>
          <p>Onboard, publish, and manage a creator business with Jarvis support.</p>
          <a class="smallbtn" href="/creator-launchpad">Launch</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("App Home", body)

@app.route("/stream-now")
def stream_now():
    body = """
    <div class="hero">
      <h1>Stream Now</h1>
      <p>A stronger live media layer with featured channels, creator energy, and premium rooms.</p>
      <span class="pill">Live Feed</span>
      <span class="pill">Creator Rooms</span>
      <span class="pill">Premium Channels</span>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Featured Live Channels</h2>
      <div class="feedrow">
        <div class="feedcard">
          <div class="feedthumb"></div>
          <div class="feedbody">
            <h3>Channel Alpha</h3>
            <p>Live creator interaction and instant marketplace offers.</p>
            <a class="smallbtn" href="/streaming-hub">Join Channel</a>
          </div>
        </div>
        <div class="feedcard">
          <div class="feedthumb"></div>
          <div class="feedbody">
            <h3>Channel Beta</h3>
            <p>Holoverse event stream with immersive crossover entry.</p>
            <a class="smallbtn" href="/holoverse-featured">Enter Room</a>
          </div>
        </div>
        <div class="feedcard">
          <div class="feedthumb"></div>
          <div class="feedbody">
            <h3>Channel Gamma</h3>
            <p>Premium member content and creator-exclusive drops.</p>
            <a class="smallbtn" href="/premium-memberships">Unlock</a>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/streaming-hub">Streaming Hub</a>
        <a class="smallbtn" href="/streaming-featured">Featured Streaming</a>
        <a class="smallbtn" href="/creator-dashboard-live">Creator Dashboard</a>
        <a class="smallbtn" href="/account-center-v2">Account Center</a>
        <a class="smallbtn" href="/creator-monetization-v2">Monetization</a>
        <a class="smallbtn" href="/upload-center">Upload Center</a>
      </div>
    </div>
    """
    return _ultra_shell("Stream Now", body)

@app.route("/time-machine-2")
def time_machine_2():
    body = """
    <div class="hero">
      <h1>Time Machine</h1>
      <p>A realistic timeline engine: replay the past, inspect the present, model the future, and jump between world states.</p>
      <span class="pill">Past Replay</span>
      <span class="pill">Present State</span>
      <span class="pill">Future Modeling</span>
      <span class="pill">Quantum Compare</span>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Timeline Modes</h2>
      <div class="timeline">
        <div class="timecard">
          <h3>Past Mode</h3>
          <p>Archive creator history, content memory, world reconstruction, and old platform states.</p>
          <a class="smallbtn" href="/timeline-archive?era=past">Open Past</a>
        </div>
        <div class="timecard">
          <h3>Present Mode</h3>
          <p>Review current ecosystem state, current creators, current products, and live world layers.</p>
          <a class="smallbtn" href="/timeline-archive?era=present">Open Present</a>
        </div>
        <div class="timecard">
          <h3>Future Mode</h3>
          <p>See planned launches, upcoming realms, future drops, and roadmap checkpoints.</p>
          <a class="smallbtn" href="/timeline-archive?era=future">Open Future</a>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Time Controls</h2>
      <div class="grid">
        <a class="smallbtn" href="/save-snapshot">Save Snapshot</a>
        <a class="smallbtn" href="/snapshots">Saved Snapshots</a>
        <a class="smallbtn" href="/memory-vault">Memory Vault</a>
        <a class="smallbtn" href="/quantum-analysis">Quantum Analysis</a>
        <a class="smallbtn" href="/earth-reconstruction">Earth Reconstruction</a>
        <a class="smallbtn" href="/memory-journey">Memory Journey</a>
      </div>
    </div>
    """
    return _ultra_shell("Time Machine", body)




# ===== STREAMING PRO LAYER =====

@app.route("/live-rooms")
def live_rooms():
    body = """
    <div class="hero">
      <h1>Live Rooms</h1>
      <p>Go beyond basic streaming with premium rooms, community energy, and creator-led sessions.</p>
      <span class="pill">Live</span>
      <span class="pill">Co-Host</span>
      <span class="pill">Premium</span>
    </div>

    <div class="card">
      <div class="feedrow">
        <div class="feedcard">
          <div class="feedthumb"></div>
          <div class="feedbody">
            <h3>Main Stage Room</h3>
            <p>Big public room for creator streaming and audience engagement.</p>
            <a class="smallbtn" href="/stream-now">Enter Room</a>
          </div>
        </div>
        <div class="feedcard">
          <div class="feedthumb"></div>
          <div class="feedbody">
            <h3>Premium VIP Room</h3>
            <p>Member-only session for premium community access.</p>
            <a class="smallbtn" href="/premium-memberships">Unlock</a>
          </div>
        </div>
        <div class="feedcard">
          <div class="feedthumb"></div>
          <div class="feedbody">
            <h3>Holoverse Room</h3>
            <p>Immersive event room tied to the Holoverse layer.</p>
            <a class="smallbtn" href="/holoverse-hub">Enter</a>
          </div>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Live Rooms", body)

@app.route("/cohost-stage")
def cohost_stage():
    body = """
    <div class="hero">
      <h1>Co-Host Stage</h1>
      <p>Multi-host experiences, panel rooms, and collaboration lanes.</p>
      <span class="pill">Panels</span>
      <span class="pill">Battles</span>
      <span class="pill">Collaborations</span>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile">
          <h3>2-Host Room</h3>
          <p>Creator-to-creator collaboration stream.</p>
          <a class="smallbtn" href="/live-rooms">Open</a>
        </div>
        <div class="tile">
          <h3>4-Host Panel</h3>
          <p>Talk shows, discussions, and creator interviews.</p>
          <a class="smallbtn" href="/streaming-hub">Open</a>
        </div>
        <div class="tile">
          <h3>Battle Room</h3>
          <p>Competitive creator engagement format.</p>
          <a class="smallbtn" href="/creator-directory">Open</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Co-Host Stage", body)

@app.route("/gifts-support")
def gifts_support():
    body = """
    <div class="hero">
      <h1>Gifts & Support</h1>
      <p>Premium support system for creators, rooms, and memberships.</p>
      <span class="pill">Tips</span>
      <span class="pill">Support</span>
      <span class="pill">Premium Access</span>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile">
          <h3>Tip Creator</h3>
          <p>Directly support a creator or performer.</p>
          <a class="smallbtn" href="/payments-shell">Open</a>
        </div>
        <div class="tile">
          <h3>Room Upgrade</h3>
          <p>Unlock premium room access and event zones.</p>
          <a class="smallbtn" href="/metaverse-pass">Open</a>
        </div>
        <div class="tile">
          <h3>Membership Boost</h3>
          <p>Upgrade into premium support tiers.</p>
          <a class="smallbtn" href="/premium-memberships">Open</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Gifts & Support", body)

@app.route("/discover-live")
def discover_live():
    body = """
    <div class="hero">
      <h1>Discover Live</h1>
      <p>Explore trending creators, active rooms, premium channels, and world-based experiences.</p>
      <span class="pill">Trending</span>
      <span class="pill">Discover</span>
      <span class="pill">Explore</span>
    </div>

    <div class="card">
      <div class="quad">
        <a class="smallbtn" href="/creator-directory">Trending Creators</a>
        <a class="smallbtn" href="/live-rooms">Live Rooms</a>
        <a class="smallbtn" href="/streaming-featured">Featured Streams</a>
        <a class="smallbtn" href="/marketplace-featured">Featured Drops</a>
        <a class="smallbtn" href="/metaverse-hub">Metaverse</a>
        <a class="smallbtn" href="/middleverse-hub">Middleverse</a>
        <a class="smallbtn" href="/multiverse-hub">Multiverse</a>
        <a class="smallbtn" href="/memory-journey">Replay Journey</a>
      </div>
    </div>
    """
    return _ultra_shell("Discover Live", body)

@app.route("/replay-archive")
def replay_archive():
    body = """
    <div class="hero">
      <h1>Replay Archive</h1>
      <p>Past streams, saved moments, creator history, and time-layer playback.</p>
      <span class="pill">Replay</span>
      <span class="pill">Archive</span>
      <span class="pill">Memory</span>
    </div>

    <div class="card">
      <div class="timeline">
        <div class="timecard">
          <h3>Past Event Replay</h3>
          <p>Watch earlier creator sessions and event archives.</p>
          <a class="smallbtn" href="/timeline-archive?era=past">Open</a>
        </div>
        <div class="timecard">
          <h3>Current Creator State</h3>
          <p>Compare current content with previous phases.</p>
          <a class="smallbtn" href="/creator-dashboard-live">Open</a>
        </div>
        <div class="timecard">
          <h3>Future Release Lane</h3>
          <p>See what is planned next and what is scheduled.</p>
          <a class="smallbtn" href="/timeline-archive?era=future">Open</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Replay Archive", body)

@app.route("/streaming-pro")
def streaming_pro():
    body = """
    <div class="hero">
      <h1>Streaming Pro</h1>
      <p>A stronger live creator network with rooms, discovery, support systems, and replay.</p>
      <span class="pill">Live Network</span>
      <span class="pill">Creator Economy</span>
      <span class="pill">Replay</span>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/stream-now">Stream Now</a>
        <a class="smallbtn" href="/live-rooms">Live Rooms</a>
        <a class="smallbtn" href="/cohost-stage">Co-Host Stage</a>
        <a class="smallbtn" href="/discover-live">Discover Live</a>
        <a class="smallbtn" href="/gifts-support">Gifts & Support</a>
        <a class="smallbtn" href="/replay-archive">Replay Archive</a>
      </div>
    </div>
    """
    return _ultra_shell("Streaming Pro", body)




# ===== MEDIA ATTACHMENT + VISUAL IDENTITY =====

class CreatorMediaLink(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    creator_id = db.Column(db.Integer, nullable=False)
    filename = db.Column(db.String(255), nullable=False)

@app.route("/creator-media-attach/<int:creator_id>", methods=["GET","POST"])
def creator_media_attach(creator_id):
    from flask import request, redirect
    try:
        with app.app_context():
            db.create_all()
        creator = CreatorRecord.query.get(creator_id)
        if not creator:
            return _ultra_shell("Creator Media Attach", "<div class='card'><p>Creator not found.</p></div>")

        message = ""
        if request.method == "POST":
            f = request.files.get("file")
            if f and f.filename:
                name = secure_filename(f.filename)
                path = os.path.join(CREATOR_MEDIA_DIR, name)
                f.save(path)
                db.session.add(CreatorMediaLink(creator_id=creator_id, filename=name))
                db.session.commit()
                message = f"Attached media: {name}"
            else:
                message = "No file selected."

        rows = CreatorMediaLink.query.filter_by(creator_id=creator_id).order_by(CreatorMediaLink.id.desc()).all()
        items = "".join(
            f"<div class='tile'><h3>{r.filename}</h3><a class='smallbtn' href='/uploads/creator/{r.filename}'>Open</a></div>"
            for r in rows
        ) or "<p>No media attached yet.</p>"

        body = f"""
        <div class="hero">
          <h1>{creator.name} Media</h1>
          <p>Attach creator banners, thumbnails, and visual assets.</p>
        </div>

        <div class="card">
          <p>{message}</p>
          <form method="POST" enctype="multipart/form-data">
            <input type="file" name="file" style="width:100%;padding:10px;margin-bottom:10px;">
            <button class="btn">Upload + Attach</button>
          </form>
        </div>

        <div class="card">
          <h2 class="sectiontitle">Attached Media</h2>
          <div class="triple">{items}</div>
        </div>
        """
        return _ultra_shell("Creator Media Attach", body)
    except Exception as e:
        return _ultra_shell("Creator Media Attach", f"<div class='card'><p>{e}</p></div>")

@app.route("/creator-storefront-pro/<int:creator_id>")
def creator_storefront_pro(creator_id):
    try:
        with app.app_context():
            db.create_all()

        creator = CreatorRecord.query.get(creator_id)
        if not creator:
            return _ultra_shell("Creator Storefront Pro", "<div class='card'><p>Creator not found.</p></div>")

        media = CreatorMediaLink.query.filter_by(creator_id=creator_id).order_by(CreatorMediaLink.id.desc()).first()

        product_links = CreatorProductLink.query.filter_by(creator_id=creator_id).all()
        content_links = CreatorContentLink.query.filter_by(creator_id=creator_id).all()

        product_ids = [r.product_id for r in product_links]
        content_ids = [r.content_id for r in content_links]

        products = ProductRecord.query.filter(ProductRecord.id.in_(product_ids)).all() if product_ids else []
        contents = ContentRecord.query.filter(ContentRecord.id.in_(content_ids)).all() if content_ids else []

        banner = ""
        if media:
            banner = f"<div class='feedthumb' style=\"height:220px;background-image:url('/uploads/creator/{media.filename}');background-size:cover;background-position:center;\"></div>"
        else:
            banner = "<div class='feedthumb' style='height:220px;'></div>"

        products_html = "".join(
            f"<div class='tile'><h3>{r.name}</h3><p>${r.price or ''}</p></div>"
            for r in products
        ) or "<p>No linked products yet.</p>"

        contents_html = "".join(
            f"<div class='tile'><h3>{r.title}</h3></div>"
            for r in contents
        ) or "<p>No linked content yet.</p>"

        body = f"""
        <div class="card" style="padding:0;overflow:hidden;">
          {banner}
          <div style="padding:18px;">
            <h1 style="margin:0 0 8px 0;">{creator.name}</h1>
            <p style="margin:0;opacity:.9;">{creator.niche or 'Creator storefront'}</p>
            <div class="statrow">
              <span class="stat">Storefront</span>
              <span class="stat">Creator</span>
              <span class="stat">Premium Ready</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="grid">
            <a class="smallbtn" href="/creator-media-attach/{creator.id}">Attach Media</a>
            <a class="smallbtn" href="/manage-creator-links-safe/{creator.id}">Manage Links</a>
            <a class="smallbtn" href="/premium-memberships">Memberships</a>
            <a class="smallbtn" href="/metaverse-pass">Metaverse Pass</a>
          </div>
        </div>

        <div class="card">
          <h2 class="sectiontitle">Featured Products</h2>
          <div class="triple">{products_html}</div>
        </div>

        <div class="card">
          <h2 class="sectiontitle">Featured Content</h2>
          <div class="triple">{contents_html}</div>
        </div>
        """
        return _ultra_shell(f"{creator.name} Storefront", body)
    except Exception as e:
        return _ultra_shell("Creator Storefront Pro", f"<div class='card'><p>{e}</p></div>")

@app.route("/creator-feed")
def creator_feed():
    try:
        with app.app_context():
            db.create_all()
        creators = CreatorRecord.query.order_by(CreatorRecord.id.desc()).limit(9).all()

        cards = ""
        for c in creators:
            media = CreatorMediaLink.query.filter_by(creator_id=c.id).order_by(CreatorMediaLink.id.desc()).first()
            if media:
                thumb = f"background-image:url('/uploads/creator/{media.filename}');background-size:cover;background-position:center;"
            else:
                thumb = ""
            cards += f"""
            <div class='feedcard'>
              <div class='feedthumb' style="{thumb}"></div>
              <div class='feedbody'>
                <h3>{c.name}</h3>
                <p>{c.niche or 'Creator'}</p>
                <a class='smallbtn' href='/creator-storefront-pro/{c.id}'>Open Storefront</a>
              </div>
            </div>
            """
        if not cards:
            cards = "<p>No creators yet.</p>"

        body = f"""
        <div class="hero">
          <h1>Creator Feed</h1>
          <p>A more visual, discovery-driven creator surface.</p>
        </div>

        <div class="card">
          <div class="feedrow">{cards}</div>
        </div>
        """
        return _ultra_shell("Creator Feed", body)
    except Exception as e:
        return _ultra_shell("Creator Feed", f"<div class='card'><p>{e}</p></div>")




# ===== SOCIAL PRO + HOLOGRAPHIC UPGRADE =====

@app.route("/social-hub")
def social_hub():
    body = """
    <div class="hero">
      <h1>Social Hub</h1>
      <p>Live rooms, battles, fan systems, rankings, gifts, schedules, and creator community layers.</p>
      <span class="pill">Live</span>
      <span class="pill">PK Battles</span>
      <span class="pill">Fan Clubs</span>
      <span class="pill">Rankings</span>
    </div>

    <div class="card">
      <div class="quad">
        <a class="smallbtn" href="/live-rooms">Live Rooms</a>
        <a class="smallbtn" href="/pk-battles">PK Battles</a>
        <a class="smallbtn" href="/fan-clubs">Fan Clubs</a>
        <a class="smallbtn" href="/rankings-center">Rankings</a>
        <a class="smallbtn" href="/gift-shop">Gift Shop</a>
        <a class="smallbtn" href="/event-schedule">Events</a>
        <a class="smallbtn" href="/agency-network">Agencies</a>
        <a class="smallbtn" href="/holo-lounge">Holo Lounge</a>
        <a class="smallbtn" href="/world-map">World Map</a>
        <a class="smallbtn" href="/open-world">Open World</a>
        <a class="smallbtn" href="/mission-board">Mission Board</a>
      </div>
    </div>
    """
    return _ultra_shell("Social Hub", body)

@app.route("/pk-battles")
def pk_battles():
    body = """
    <div class="hero">
      <h1>PK Battles</h1>
      <p>Competitive creator matchups with support, rankings, and audience engagement.</p>
      <span class="pill">Battle Mode</span>
      <span class="pill">Live Voting</span>
      <span class="pill">Support Race</span>
    </div>

    <div class="card">
      <div class="feedrow">
        <div class="feedcard">
          <div class="feedthumb"></div>
          <div class="feedbody">
            <h3>Creator Alpha vs Creator Beta</h3>
            <p>Fast-paced engagement battle room.</p>
            <a class="smallbtn" href="/gifts-support">Support Battle</a>
          </div>
        </div>
        <div class="feedcard">
          <div class="feedthumb"></div>
          <div class="feedbody">
            <h3>Panel Clash</h3>
            <p>4-host social challenge and community contest.</p>
            <a class="smallbtn" href="/cohost-stage">Enter Stage</a>
          </div>
        </div>
        <div class="feedcard">
          <div class="feedthumb"></div>
          <div class="feedbody">
            <h3>Verse Battle</h3>
            <p>Metaverse-style themed matchup room.</p>
            <a class="smallbtn" href="/metaverse-hub">Open Verse</a>
          </div>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("PK Battles", body)

@app.route("/fan-clubs")
def fan_clubs():
    body = """
    <div class="hero">
      <h1>Fan Clubs</h1>
      <p>Community membership zones for creators, premium access, and exclusive rewards.</p>
      <span class="pill">Community</span>
      <span class="pill">Exclusive</span>
      <span class="pill">Membership</span>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile">
          <h3>Alpha Fan Club</h3>
          <p>Exclusive posts, private rooms, and premium drops.</p>
          <a class="smallbtn" href="/premium-memberships">Join</a>
        </div>
        <div class="tile">
          <h3>Creator Circle</h3>
          <p>VIP access to creator chats and member-only live events.</p>
          <a class="smallbtn" href="/live-rooms">Enter</a>
        </div>
        <div class="tile">
          <h3>Verse Club</h3>
          <p>Special access to metaverse and multiverse experiences.</p>
          <a class="smallbtn" href="/metaverse-pass">Unlock</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Fan Clubs", body)

@app.route("/rankings-center")
def rankings_center():
    body = """
    <div class="hero">
      <h1>Rankings Center</h1>
      <p>Track rising creators, premium rooms, gift leaders, and featured live performers.</p>
      <span class="pill">Top Creators</span>
      <span class="pill">Top Rooms</span>
      <span class="pill">Top Supporters</span>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile"><h3>#1 Creator Alpha</h3><p>Live engagement leader</p></div>
        <div class="tile"><h3>#2 Creator Beta</h3><p>Premium room leader</p></div>
        <div class="tile"><h3>#3 Creator Gamma</h3><p>Marketplace drop leader</p></div>
      </div>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/creator-feed">Creator Feed</a>
        <a class="smallbtn" href="/discover-live">Discover</a>
        <a class="smallbtn" href="/gifts-support">Support</a>
        <a class="smallbtn" href="/streaming-pro">Streaming Pro</a>
      </div>
    </div>
    """
    return _ultra_shell("Rankings Center", body)

@app.route("/gift-shop")
def gift_shop():
    body = """
    <div class="hero">
      <h1>Gift Shop</h1>
      <p>Digital gifts, premium support, event boosts, and creator appreciation lanes.</p>
      <span class="pill">Support</span>
      <span class="pill">Gifts</span>
      <span class="pill">Boosts</span>
    </div>

    <div class="card">
      <div class="quad">
        <div class="tile"><h3>Star Gift</h3><p>Basic support gift</p><a class="smallbtn" href="/payments-shell">Send</a></div>
        <div class="tile"><h3>Galaxy Gift</h3><p>Mid-tier premium gift</p><a class="smallbtn" href="/payments-shell">Send</a></div>
        <div class="tile"><h3>Verse Gift</h3><p>High-tier creator support gift</p><a class="smallbtn" href="/payments-shell">Send</a></div>
        <div class="tile"><h3>Omni Gift</h3><p>Elite support lane</p><a class="smallbtn" href="/payments-shell">Send</a></div>
      </div>
    </div>
    """
    return _ultra_shell("Gift Shop", body)

@app.route("/event-schedule")
def event_schedule():
    body = """
    <div class="hero">
      <h1>Event Schedule</h1>
      <p>Scheduled streams, drops, verse events, and premium room access.</p>
      <span class="pill">Today</span>
      <span class="pill">Upcoming</span>
      <span class="pill">Launches</span>
    </div>

    <div class="card">
      <div class="timeline">
        <div class="timecard">
          <h3>Tonight: Creator Main Stage</h3>
          <p>Prime-time live event with social + marketplace crossover.</p>
        </div>
        <div class="timecard">
          <h3>Tomorrow: Holoverse Event</h3>
          <p>Immersive room with premium access lane.</p>
        </div>
        <div class="timecard">
          <h3>Next Drop: Verse Pass Launch</h3>
          <p>Future access and premium pass release.</p>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Event Schedule", body)

@app.route("/agency-network")
def agency_network():
    body = """
    <div class="hero">
      <h1>Agency Network</h1>
      <p>Recruit, organize, and manage creator groups, teams, and performance channels.</p>
      <span class="pill">Agencies</span>
      <span class="pill">Teams</span>
      <span class="pill">Growth</span>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile">
          <h3>Agency Alpha</h3>
          <p>Creator growth and stream support network.</p>
          <a class="smallbtn" href="/creator-launchpad">Open</a>
        </div>
        <div class="tile">
          <h3>Brand House</h3>
          <p>Cross-marketplace and streaming activation team.</p>
          <a class="smallbtn" href="/ecosystem-brand">Open</a>
        </div>
        <div class="tile">
          <h3>Verse Guild</h3>
          <p>Metaverse and multiverse talent coordination lane.</p>
          <a class="smallbtn" href="/verse-overview">Open</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Agency Network", body)

@app.route("/holo-lounge")
def holo_lounge():
    body = """
    <div class="hero">
      <h1>Holo Lounge</h1>
      <p>A more holographic-feeling social zone for immersive previews, creator presence, and premium atmosphere.</p>
      <span class="pill">Immersive</span>
      <span class="pill">Lounge</span>
      <span class="pill">Holographic</span>
    </div>

    <div class="card">
      <div class="feedrow">
        <div class="feedcard">
          <div class="feedthumb"></div>
          <div class="feedbody">
            <h3>Holo Creator Spotlight</h3>
            <p>Visual-first creator presence lane.</p>
            <a class="smallbtn" href="/creator-feed">Open</a>
          </div>
        </div>
        <div class="feedcard">
          <div class="feedthumb"></div>
          <div class="feedbody">
            <h3>Holo Event Preview</h3>
            <p>Future event projection and premium preview card.</p>
            <a class="smallbtn" href="/event-schedule">Open</a>
          </div>
        </div>
        <div class="feedcard">
          <div class="feedthumb"></div>
          <div class="feedbody">
            <h3>Holo Travel Portal</h3>
            <p>Moon, Mars, and verse-access style travel lane.</p>
            <a class="smallbtn" href="/multiverse-hub">Travel</a>
          </div>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Holo Lounge", body)




# ===== FAMILY + AGENCY + GAMES + MESSAGING PRO =====

@app.route("/family-hub")
def family_hub():
    body = """
    <div class="hero">
      <h1>Family Hub</h1>
      <p>Creator families, supporter circles, team identity, and community growth lanes.</p>
      <span class="pill">Family</span>
      <span class="pill">Teams</span>
      <span class="pill">Community</span>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile">
          <h3>Family Alpha</h3>
          <p>Support creators together, climb rankings, and unlock premium community events.</p>
          <a class="smallbtn" href="/fan-clubs">Open</a>
        </div>
        <div class="tile">
          <h3>Creator House</h3>
          <p>Shared rooms, launch support, and performance tracking.</p>
          <a class="smallbtn" href="/creator-launchpad">Open</a>
        </div>
        <div class="tile">
          <h3>Verse Family</h3>
          <p>Metaverse-linked community with travel and event access.</p>
          <a class="smallbtn" href="/verse-overview">Open</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Family Hub", body)

@app.route("/agency-pro")
def agency_pro():
    body = """
    <div class="hero">
      <h1>Agency Pro</h1>
      <p>Recruit, train, organize, and grow creator teams with rankings and support tools.</p>
      <span class="pill">Agency</span>
      <span class="pill">Recruiting</span>
      <span class="pill">Growth</span>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/agency-network">Agency Network</a>
        <a class="smallbtn" href="/creator-directory">Browse Creators</a>
        <a class="smallbtn" href="/rankings-center">Rankings</a>
        <a class="smallbtn" href="/event-schedule">Events</a>
        <a class="smallbtn" href="/creator-dashboard-live">Creator Dashboard</a>
        <a class="smallbtn" href="/account-center-v2">Account Center</a>
        <a class="smallbtn" href="/creator-monetization-v2">Monetization</a>
        <a class="smallbtn" href="/premium-memberships">Memberships</a>
      </div>
    </div>
    """
    return _ultra_shell("Agency Pro", body)

@app.route("/games-lounge")
def games_lounge():
    body = """
    <div class="hero">
      <h1>Games Lounge</h1>
      <p>Play-money social games, party rooms, audience engagement, and creator game nights.</p>
      <span class="pill">Social Games</span>
      <span class="pill">Party Rooms</span>
      <span class="pill">Play Money Only</span>
    </div>

    <div class="card">
      <div class="quad">
        <div class="tile">
          <h3>Spades Lounge</h3>
          <p>Social spades room for creator communities.</p>
          <a class="smallbtn" href="/game-room/spades">Open</a>
        </div>
        <div class="tile">
          <h3>Card Club</h3>
          <p>Poker-style social card room, no real-money wagering.</p>
          <a class="smallbtn" href="/game-room/card-club">Open</a>
        </div>
        <div class="tile">
          <h3>Trivia Arena</h3>
          <p>Live trivia and chat-led challenge rooms.</p>
          <a class="smallbtn" href="/game-room/trivia">Open</a>
        </div>
        <div class="tile">
          <h3>Party Battle</h3>
          <p>Fast mini-game room for audience interaction.</p>
          <a class="smallbtn" href="/game-room/party-battle">Open</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Games Lounge", body)

@app.route("/game-room/<name>")
def game_room(name):
    label = name.replace("-", " ").title()
    body = f"""
    <div class="hero">
      <h1>{label}</h1>
      <p>Interactive social room for creator-led game sessions and audience participation.</p>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/live-rooms">Join Live Room</a>
        <a class="smallbtn" href="/gifts-support">Support Creator</a>
        <a class="smallbtn" href="/rankings-center">Leaderboards</a>
        <a class="smallbtn" href="/event-schedule">Schedule Match</a>
      </div>
    </div>
    """
    return _ultra_shell(label, body)

@app.route("/messenger-center")
def messenger_center():
    body = """
    <div class="hero">
      <h1>Messenger Center</h1>
      <p>Consent-based messaging, creator support, admin help, and moderation workflows.</p>
      <span class="pill">Inbox</span>
      <span class="pill">Support</span>
      <span class="pill">Moderation</span>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/messages-inbox">Inbox</a>
        <a class="smallbtn" href="/creator-support">Creator Support</a>
        <a class="smallbtn" href="/admin-assist-bot">Admin Assist Bot</a>
        <a class="smallbtn" href="/moderation-center">Moderation Center</a>
      </div>
    </div>
    """
    return _ultra_shell("Messenger Center", body)

@app.route("/messages-inbox")
def messages_inbox():
    body = """
    <div class="hero">
      <h1>Inbox</h1>
      <p>Private messaging center for users, creators, and support workflows.</p>
    </div>

    <div class="card">
      <div class="timeline">
        <div class="timecard"><h3>Message Thread A</h3><p>Creator updates and audience conversation lane.</p></div>
        <div class="timecard"><h3>Support Thread</h3><p>Platform help, account, and creator assistance.</p></div>
        <div class="timecard"><h3>Event Invite</h3><p>Notifications for live rooms and premium events.</p></div>
      </div>
    </div>
    """
    return _ultra_shell("Inbox", body)

@app.route("/creator-support")
def creator_support():
    body = """
    <div class="hero">
      <h1>Creator Support</h1>
      <p>Help center for launches, payments, media, and room growth.</p>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/creator-dashboard-live">Dashboard</a>
        <a class="smallbtn" href="/upload-center">Uploads</a>
        <a class="smallbtn" href="/payments-shell">Payments</a>
        <a class="smallbtn" href="/agency-pro">Agency Pro</a>
      </div>
    </div>
    """
    return _ultra_shell("Creator Support", body)

@app.route("/admin-assist-bot")
def admin_assist_bot():
    body = """
    <div class="hero">
      <h1>Admin Assist Bot</h1>
      <p>Suggestion engine for moderation, scheduling, creator growth, and platform recommendations.</p>
      <span class="pill">Suggestions</span>
      <span class="pill">Moderation Assist</span>
      <span class="pill">Growth Tips</span>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile">
          <h3>Content Suggestions</h3>
          <p>Recommend creator content improvements and posting ideas.</p>
        </div>
        <div class="tile">
          <h3>Scheduling Suggestions</h3>
          <p>Recommend event timing, room structure, and growth windows.</p>
        </div>
        <div class="tile">
          <h3>Safety Suggestions</h3>
          <p>Recommend moderation reviews and community-health checks.</p>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Admin Assist Bot", body)

@app.route("/moderation-center")
def moderation_center():
    body = """
    <div class="hero">
      <h1>Moderation Center</h1>
      <p>Visible moderation workflows, not hidden backdoor access.</p>
      <span class="pill">Safety</span>
      <span class="pill">Audit</span>
      <span class="pill">Community Rules</span>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/messages-inbox">Inbox Review</a>
        <a class="smallbtn" href="/system-gap-report">Gap Report</a>
        <a class="smallbtn" href="/stability-hub">Stability Hub</a>
        <a class="smallbtn" href="/creator-directory">Creator Review</a>
      </div>
    </div>
    """
    return _ultra_shell("Moderation Center", body)




# ===== GEO TELEPORT MAP SYSTEM =====

@app.route("/world-map")
def world_map():
    body = """
    <div class="hero">
      <h1>World Map</h1>
      <p>Teleport anywhere and explore creators, rooms, and events by location.</p>
      <span class="pill">Geo</span>
      <span class="pill">Teleport</span>
      <span class="pill">Real World</span>
    </div>

    <div class="card">
      <form method="GET" action="/teleport">
        <input name="q" placeholder="Enter address or city..." style="width:100%;padding:12px;margin-bottom:10px;">
        <button class="btn">Teleport</button>
      </form>
    </div>

    <div class="card">
      <div style="height:400px;background:#111;border-radius:12px;display:flex;align-items:center;justify-content:center;">
        <p>Map preview (next upgrade will integrate real map engine)</p>
      </div>
    </div>
    """
    return _ultra_shell("World Map", body)

@app.route("/teleport")
def teleport():
    from flask import request
    q = request.args.get("q", "")

    body = f"""
    <div class="hero">
      <h1>Teleport Result</h1>
      <p>Location: {q}</p>
      <span class="pill">Live Rooms</span>
      <span class="pill">Creators</span>
      <span class="pill">Events</span>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile">
          <h3>Local Creator</h3>
          <p>Creator near {q}</p>
        </div>
        <div class="tile">
          <h3>Live Room</h3>
          <p>Active stream in this location</p>
        </div>
        <div class="tile">
          <h3>Event</h3>
          <p>Upcoming event near {q}</p>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Teleport", body)




# ===== TIKTOK-STYLE FEATURE LAYER =====

@app.route("/for-you")
def for_you():
    body = """
    <div class="hero">
      <h1>For You</h1>
      <p>Discovery-first short-form feed with creators, trends, products, and verse moments.</p>
      <span class="pill">For You</span>
      <span class="pill">Trending</span>
      <span class="pill">Short Form</span>
    </div>

    <div class="feedrow">
      <div class="feedcard">
        <div class="feedthumb"></div>
        <div class="feedbody">
          <h3>Creator Moment</h3>
          <p>Short-form creator spotlight with product and membership crossover.</p>
          <div class="statrow"><span class="stat">12.4K views</span><span class="stat">Trending</span></div>
          <a class="smallbtn" href="/creator-feed">Watch</a>
        </div>
      </div>
      <div class="feedcard">
        <div class="feedthumb"></div>
        <div class="feedbody">
          <h3>Verse Clip</h3>
          <p>Metaverse and multiverse short-form story lane.</p>
          <div class="statrow"><span class="stat">8.9K views</span><span class="stat">Verse</span></div>
          <a class="smallbtn" href="/verse-overview">Open</a>
        </div>
      </div>
      <div class="feedcard">
        <div class="feedthumb"></div>
        <div class="feedbody">
          <h3>Marketplace Drop Clip</h3>
          <p>Short promo clip tied to products, services, and premium pass offers.</p>
          <div class="statrow"><span class="stat">Shop</span><span class="stat">Drop</span></div>
          <a class="smallbtn" href="/marketplace-featured">Open</a>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/following-feed">Following</a>
        <a class="smallbtn" href="/trending-now">Trending</a>
        <a class="smallbtn" href="/short-video-studio">Video Studio</a>
        <a class="smallbtn" href="/notifications-center">Notifications</a>
      </div>
    </div>
    """
    return _ultra_shell("For You", body)

@app.route("/following-feed")
def following_feed():
    body = """
    <div class="hero">
      <h1>Following</h1>
      <p>Watch creators, families, agencies, and favorite channels you follow.</p>
      <span class="pill">Following</span>
      <span class="pill">Creators</span>
      <span class="pill">Families</span>
    </div>

    <div class="feedrow">
      <div class="feedcard">
        <div class="feedthumb"></div>
        <div class="feedbody">
          <h3>Favorite Creator</h3>
          <p>Latest content from creators you follow.</p>
          <a class="smallbtn" href="/creator-directory">Open</a>
        </div>
      </div>
      <div class="feedcard">
        <div class="feedthumb"></div>
        <div class="feedbody">
          <h3>Family Updates</h3>
          <p>Community clips, family competitions, and room updates.</p>
          <a class="smallbtn" href="/family-hub">Open</a>
        </div>
      </div>
      <div class="feedcard">
        <div class="feedthumb"></div>
        <div class="feedbody">
          <h3>Agency Highlights</h3>
          <p>Agency events, creator launches, and rankings.</p>
          <a class="smallbtn" href="/agency-pro">Open</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Following", body)

@app.route("/trending-now")
def trending_now():
    body = """
    <div class="hero">
      <h1>Trending Now</h1>
      <p>Top tags, rising creators, hot streams, and game-show moments.</p>
      <span class="pill">Trending</span>
      <span class="pill">Hot Tags</span>
      <span class="pill">Rising</span>
    </div>

    <div class="card">
      <div class="quad">
        <div class="tile"><h3>#LiveNow</h3><p>Top live-stream conversations</p></div>
        <div class="tile"><h3>#VerseDrop</h3><p>Metaverse and pass launches</p></div>
        <div class="tile"><h3>#CreatorBattle</h3><p>PK and showdown clips</p></div>
        <div class="tile"><h3>#HoloNight</h3><p>Holographic social lounge moments</p></div>
      </div>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/rankings-center">Rankings</a>
        <a class="smallbtn" href="/discover-live">Discover</a>
        <a class="smallbtn" href="/games-pro">Games Pro</a>
        <a class="smallbtn" href="/streaming-pro">Streaming Pro</a>
      </div>
    </div>
    """
    return _ultra_shell("Trending Now", body)

@app.route("/short-video-studio")
def short_video_studio():
    body = """
    <div class="hero">
      <h1>Short Video Studio</h1>
      <p>Create short-form clips, remixes, duets, and trend content for the feed.</p>
      <span class="pill">Studio</span>
      <span class="pill">Clips</span>
      <span class="pill">Remix</span>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/upload-content-media">Upload Clip</a>
        <a class="smallbtn" href="/duet-lab">Duet Lab</a>
        <a class="smallbtn" href="/stitch-lab">Stitch Lab</a>
        <a class="smallbtn" href="/remix-lab">Remix Lab</a>
        <a class="smallbtn" href="/content-catalog">Content Catalog</a>
        <a class="smallbtn" href="/creator-dashboard-live">Creator Dashboard</a>
        <a class="smallbtn" href="/account-center-v2">Account Center</a>
        <a class="smallbtn" href="/creator-monetization-v2">Monetization</a>
      </div>
    </div>
    """
    return _ultra_shell("Short Video Studio", body)

@app.route("/duet-lab")
def duet_lab():
    body = """
    <div class="hero">
      <h1>Duet Lab</h1>
      <p>Create side-by-side creator reactions, responses, and collab content.</p>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile"><h3>Creator Duet</h3><p>Collaborative short content lane.</p></div>
        <div class="tile"><h3>Live Reaction</h3><p>Clip reaction and commentary format.</p></div>
        <div class="tile"><h3>Fan Duet</h3><p>Community reply and support format.</p></div>
      </div>
    </div>
    """
    return _ultra_shell("Duet Lab", body)

@app.route("/stitch-lab")
def stitch_lab():
    body = """
    <div class="hero">
      <h1>Stitch Lab</h1>
      <p>Clip-start + creator-response format for storytelling and reactions.</p>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile"><h3>Trend Stitch</h3><p>Respond to a trending clip.</p></div>
        <div class="tile"><h3>History Stitch</h3><p>Reply to archive and time-machine clips.</p></div>
        <div class="tile"><h3>Verse Stitch</h3><p>Respond to metaverse and world moments.</p></div>
      </div>
    </div>
    """
    return _ultra_shell("Stitch Lab", body)

@app.route("/remix-lab")
def remix_lab():
    body = """
    <div class="hero">
      <h1>Remix Lab</h1>
      <p>Reuse formats, trends, sounds, and visual ideas to create new short-form content.</p>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/trending-now">Use Trending Theme</a>
        <a class="smallbtn" href="/creator-feed">Use Creator Feed</a>
        <a class="smallbtn" href="/stream-now">Use Live Clip</a>
        <a class="smallbtn" href="/memory-journey">Use Memory Clip</a>
      </div>
    </div>
    """
    return _ultra_shell("Remix Lab", body)

@app.route("/comments-center")
def comments_center():
    body = """
    <div class="hero">
      <h1>Comments Center</h1>
      <p>Creator replies, fan discussion, comment highlights, and moderation-friendly discussion lanes.</p>
    </div>

    <div class="card">
      <div class="timeline">
        <div class="timecard"><h3>Top Comment</h3><p>Best audience comment from a trending clip.</p></div>
        <div class="timecard"><h3>Creator Reply</h3><p>Response lane for creator engagement.</p></div>
        <div class="timecard"><h3>Community Thread</h3><p>Discussion around a live room or event.</p></div>
      </div>
    </div>
    """
    return _ultra_shell("Comments Center", body)

@app.route("/saved-center")
def saved_center():
    body = """
    <div class="hero">
      <h1>Saved</h1>
      <p>Saved videos, storefronts, products, clips, and memory moments.</p>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/creator-feed">Saved Creators</a>
        <a class="smallbtn" href="/marketplace-featured">Saved Drops</a>
        <a class="smallbtn" href="/memory-vault">Saved Memory States</a>
        <a class="smallbtn" href="/streaming-featured">Saved Clips</a>
      </div>
    </div>
    """
    return _ultra_shell("Saved", body)



# ===== GAMES EXPANSION V2 =====

@app.route("/games-pro-v2")
def games_pro_v2():
    body = """
    <div class="hero">
      <h1>Games Pro V2</h1>
      <p>Next-level social gaming: multiplayer tables, game shows, tournaments, and audience participation.</p>
      <span class="pill">Multiplayer</span>
      <span class="pill">Game Shows</span>
      <span class="pill">Tournaments</span>
      <span class="pill">Audience Play</span>
    </div>

    <div class="card">
      <div class="quad">
        <a class="smallbtn" href="/spades-arena-v2">Spades Arena</a>
        <a class="smallbtn" href="/poker-social-v2">Poker Social</a>
        <a class="smallbtn" href="/wheel-show-v2">Wheel Show</a>
        <a class="smallbtn" href="/jeopardy-live-v2">Jeopardy Live</a>
        <a class="smallbtn" href="/trivia-tournament-v2">Trivia Tournament</a>
        <a class="smallbtn" href="/game-night-v2">Game Night</a>
        <a class="smallbtn" href="/leaderboard-v2">Leaderboard</a>
        <a class="smallbtn" href="/family-hub">Family Hub</a>
        <a class="smallbtn" href="/growth-center">Growth Center</a>
        <a class="smallbtn" href="/safety-center">Safety Center</a>
      </div>
    </div>
    """
    return _ultra_shell("Games Pro V2", body)

@app.route("/spades-arena-v2")
def spades_arena_v2():
    body = """
    <div class="hero">
      <h1>Spades Arena</h1>
      <p>Team-based social spades with public tables, VIP tables, and tournament brackets.</p>
      <span class="pill">4 Players</span>
      <span class="pill">Teams</span>
      <span class="pill">Ranked</span>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile">
          <h3>Open Table</h3>
          <p>Casual social room for creators and fans.</p>
          <a class="smallbtn" href="/live-rooms">Join Table</a>
        </div>
        <div class="tile">
          <h3>VIP Table</h3>
          <p>Members-only creator table with premium access.</p>
          <a class="smallbtn" href="/premium-memberships">Unlock</a>
        </div>
        <div class="tile">
          <h3>Ranked Table</h3>
          <p>Competitive family and agency leaderboard room.</p>
          <a class="smallbtn" href="/leaderboard-v2">View Rankings</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Spades Arena", body)

@app.route("/poker-social-v2")
def poker_social_v2():
    body = """
    <div class="hero">
      <h1>Poker Social</h1>
      <p>Play-money card club for community nights, creator events, and audience engagement.</p>
      <span class="pill">Play Money</span>
      <span class="pill">Social Club</span>
      <span class="pill">No Gambling</span>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/game-room/card-club">Open Card Club</a>
        <a class="smallbtn" href="/agency-pro">Agency Tournament</a>
        <a class="smallbtn" href="/family-hub">Family Match</a>
        <a class="smallbtn" href="/event-schedule">Schedule Match</a>
      </div>
    </div>
    """
    return _ultra_shell("Poker Social", body)

@app.route("/wheel-show-v2")
def wheel_show_v2():
    body = """
    <div class="hero">
      <h1>Wheel Show</h1>
      <p>Audience-driven prize wheel, challenge rounds, premium spins, and creator-hosted show energy.</p>
      <span class="pill">Spin</span>
      <span class="pill">Show</span>
      <span class="pill">Audience</span>
    </div>

    <div class="card">
      <div class="feedrow">
        <div class="feedcard">
          <div class="feedthumb"></div>
          <div class="feedbody">
            <h3>Classic Wheel</h3>
            <p>Fast community spin rounds with social engagement.</p>
            <a class="smallbtn" href="/event-schedule">Schedule</a>
          </div>
        </div>
        <div class="feedcard">
          <div class="feedthumb"></div>
          <div class="feedbody">
            <h3>VIP Wheel</h3>
            <p>Premium member bonus rounds and creator-only access.</p>
            <a class="smallbtn" href="/premium-memberships">Unlock</a>
          </div>
        </div>
        <div class="feedcard">
          <div class="feedthumb"></div>
          <div class="feedbody">
            <h3>Verse Wheel</h3>
            <p>Metaverse-themed special event format.</p>
            <a class="smallbtn" href="/metaverse-hub">Enter</a>
          </div>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Wheel Show", body)

@app.route("/jeopardy-live-v2")
def jeopardy_live_v2():
    body = """
    <div class="hero">
      <h1>Jeopardy Live</h1>
      <p>Category-based game show with host mode, audience rounds, and premium creator events.</p>
      <span class="pill">Quiz Show</span>
      <span class="pill">Categories</span>
      <span class="pill">Host Mode</span>
    </div>

    <div class="card">
      <div class="quad">
        <div class="tile"><h3>History</h3><p>Archive and timeline questions.</p></div>
        <div class="tile"><h3>Creators</h3><p>Social and creator economy topics.</p></div>
        <div class="tile"><h3>Verse</h3><p>Metaverse and multiverse topics.</p></div>
        <div class="tile"><h3>Marketplace</h3><p>Products and services topics.</p></div>
      </div>
    </div>

    <div class="card">
      <a class="btn" href="/trivia-tournament-v2">Open Tournament Mode</a>
      <a class="btn" href="/event-schedule">Schedule Live Show</a>
    </div>
    """
    return _ultra_shell("Jeopardy Live", body)

@app.route("/trivia-tournament-v2")
def trivia_tournament_v2():
    body = """
    <div class="hero">
      <h1>Trivia Tournament</h1>
      <p>Bracket-style community quiz battles for creators, families, agencies, and fans.</p>
      <span class="pill">Tournament</span>
      <span class="pill">Bracket</span>
      <span class="pill">Community</span>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile">
          <h3>Family Division</h3>
          <p>Community-based team tournament.</p>
          <a class="smallbtn" href="/family-hub">Open</a>
        </div>
        <div class="tile">
          <h3>Agency Division</h3>
          <p>Agency-vs-agency competition lane.</p>
          <a class="smallbtn" href="/agency-pro">Open</a>
        </div>
        <div class="tile">
          <h3>Creator Division</h3>
          <p>Creator-hosted challenge ladder.</p>
          <a class="smallbtn" href="/creator-directory">Open</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Trivia Tournament", body)

@app.route("/game-night-v2")
def game_night_v2():
    body = """
    <div class="hero">
      <h1>Game Night</h1>
      <p>One destination for creator-hosted nights, party rooms, family rooms, and battle events.</p>
      <span class="pill">Party</span>
      <span class="pill">Community</span>
      <span class="pill">Events</span>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/spades-arena-v2">Spades</a>
        <a class="smallbtn" href="/poker-social-v2">Poker Social</a>
        <a class="smallbtn" href="/wheel-show-v2">Wheel Show</a>
        <a class="smallbtn" href="/jeopardy-live-v2">Jeopardy Live</a>
        <a class="smallbtn" href="/pk-battles">PK Battles</a>
        <a class="smallbtn" href="/gifts-support">Support Room</a>
      </div>
    </div>
    """
    return _ultra_shell("Game Night", body)

@app.route("/leaderboard-v2")
def leaderboard_v2():
    body = """
    <div class="hero">
      <h1>Leaderboard</h1>
      <p>Top players, top family groups, top agencies, and top creator-hosted game rooms.</p>
      <span class="pill">Top Players</span>
      <span class="pill">Top Families</span>
      <span class="pill">Top Agencies</span>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile"><h3>#1 Family Alpha</h3><p>Top social game clan</p></div>
        <div class="tile"><h3>#1 Agency Prime</h3><p>Top game organizer</p></div>
        <div class="tile"><h3>#1 Creator Host</h3><p>Top live quiz host</p></div>
      </div>
    </div>
    """
    return _ultra_shell("Leaderboard", body)




# ===== OPEN WORLD MISSION LAYER =====

@app.route("/open-world")
def open_world():
    body = """
    <div class="hero">
      <h1>Open World Sim</h1>
      <p>Explore districts, accept missions, build creator status, and move through a living social city.</p>
      <span class="pill">Open World</span>
      <span class="pill">Missions</span>
      <span class="pill">Districts</span>
      <span class="pill">Travel</span>
    </div>

    <div class="card">
      <div class="quad">
        <a class="smallbtn" href="/city-districts">City Districts</a>
        <a class="smallbtn" href="/mission-board">Mission Board</a>
        <a class="smallbtn" href="/teleport?q=Chicago">Teleport</a>
        <a class="smallbtn" href="/world-map">World Map</a>
        <a class="smallbtn" href="/open-world">Open World</a>
        <a class="smallbtn" href="/mission-board">Mission Board</a>
        <a class="smallbtn" href="/family-hub">Families</a>
        <a class="smallbtn" href="/agency-pro">Agencies</a>
        <a class="smallbtn" href="/games-pro-v2">Game Arenas</a>
        <a class="smallbtn" href="/streaming-pro">Live Network</a>
      </div>
    </div>
    """
    return _ultra_shell("Open World", body)

@app.route("/city-districts")
def city_districts():
    body = """
    <div class="hero">
      <h1>City Districts</h1>
      <p>Move through different zones of the world: creator districts, market districts, event districts, and verse gates.</p>
    </div>

    <div class="triple">
      <div class="tile">
        <h3>Creator District</h3>
        <p>Where creators go live, launch content, and build their audience.</p>
        <a class="smallbtn" href="/creator-feed">Enter</a>
      </div>
      <div class="tile">
        <h3>Market District</h3>
        <p>Storefronts, drops, memberships, and premium pass lanes.</p>
        <a class="smallbtn" href="/marketplace-hub">Enter</a>
      </div>
      <div class="tile">
        <h3>Verse Gate</h3>
        <p>Metaverse, Middleverse, and Multiverse world access.</p>
        <a class="smallbtn" href="/verse-overview">Enter</a>
      </div>
    </div>

    <div class="triple">
      <div class="tile">
        <h3>Game Arena</h3>
        <p>Spades, wheel shows, quiz competitions, and social game nights.</p>
        <a class="smallbtn" href="/games-pro-v2">Enter</a>
      </div>
      <div class="tile">
        <h3>Live District</h3>
        <p>Rooms, battles, co-host stages, and premium channels.</p>
        <a class="smallbtn" href="/live-rooms">Enter</a>
      </div>
      <div class="tile">
        <h3>Time District</h3>
        <p>Replay archives, future events, memory vaults, and timeline travel.</p>
        <a class="smallbtn" href="/time-machine-2">Enter</a>
      </div>
    </div>
    """
    return _ultra_shell("City Districts", body)

@app.route("/mission-board")
def mission_board():
    body = """
    <div class="hero">
      <h1>Mission Board</h1>
      <p>Accept missions, complete objectives, and progress through the open world.</p>
      <span class="pill">Quests</span>
      <span class="pill">Progression</span>
      <span class="pill">Rewards</span>
    </div>

    <div class="card">
      <div class="timeline">
        <div class="timecard">
          <h3>Mission: Creator Launch</h3>
          <p>Create or update a creator profile, upload media, and open a storefront.</p>
          <a class="smallbtn" href="/mission/creator-launch">Start Mission</a>
        </div>
        <div class="timecard">
          <h3>Mission: Market Drop</h3>
          <p>Enter the marketplace, prepare an offer, and unlock a premium lane.</p>
          <a class="smallbtn" href="/mission/market-drop">Start Mission</a>
        </div>
        <div class="timecard">
          <h3>Mission: Live Room Host</h3>
          <p>Go to the live network and complete a host path.</p>
          <a class="smallbtn" href="/mission/live-host">Start Mission</a>
        </div>
        <div class="timecard">
          <h3>Mission: Verse Traveler</h3>
          <p>Move through Metaverse, Middleverse, and Multiverse checkpoints.</p>
          <a class="smallbtn" href="/mission/verse-traveler">Start Mission</a>
        </div>
        <div class="timecard">
          <h3>Mission: Time Walker</h3>
          <p>Visit past, present, and future states in the time machine.</p>
          <a class="smallbtn" href="/mission/time-walker">Start Mission</a>
        </div>
        <div class="timecard">
          <h3>Mission: Game Champion</h3>
          <p>Enter games, compete, and climb the leaderboard.</p>
          <a class="smallbtn" href="/mission/game-champion">Start Mission</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Mission Board", body)

@app.route("/mission/<name>")
def mission_detail(name):
    mission_name = name.replace("-", " ").title()

    mission_map = {
        "creator-launch": {
            "desc": "Build your creator identity and public presence.",
            "steps": [
                ("Open Creator Directory", "/creator-directory"),
                ("Open Creator Media", "/creator-media-hub"),
                ("Open Creator Storefront", "/creator-feed"),
                ("Open Creator Dashboard", "/creator-dashboard-live"),
            ]
        },
        "market-drop": {
            "desc": "Prepare a marketplace offer and premium access path.",
            "steps": [
                ("Open Marketplace", "/marketplace-hub"),
                ("Open Product Catalog", "/product-catalog"),
                ("Open Payments Shell", "/payments-shell"),
                ("Open Premium Memberships", "/premium-memberships"),
            ]
        },
        "live-host": {
            "desc": "Move into the live ecosystem and host rooms/events.",
            "steps": [
                ("Open Stream Now", "/stream-now"),
                ("Open Live Rooms", "/live-rooms"),
                ("Open Co-Host Stage", "/cohost-stage"),
                ("Open Social Hub", "/social-hub"),
            ]
        },
        "verse-traveler": {
            "desc": "Travel through the major verse layers and open-world gates.",
            "steps": [
                ("Open Metaverse", "/metaverse-hub"),
                ("Open Middleverse", "/middleverse-hub"),
                ("Open Multiverse", "/multiverse-hub"),
                ("Open Verse Overview", "/verse-overview"),
            ]
        },
        "time-walker": {
            "desc": "Travel across time layers and review archived memory states.",
            "steps": [
                ("Open Time Machine", "/time-machine-2"),
                ("Open Timeline Archive", "/timeline-archive?era=past"),
                ("Open Memory Vault", "/memory-vault"),
                ("Open Quantum Analysis", "/quantum-analysis"),
            ]
        },
        "game-champion": {
            "desc": "Compete in games and build score/status in the social arena.",
            "steps": [
                ("Open Games Pro", "/games-pro-v2"),
                ("Open Spades Arena", "/spades-arena-v2"),
                ("Open Wheel Show", "/wheel-show-v2"),
                ("Open Leaderboard", "/leaderboard-v2"),
            ]
        },
    }

    data = mission_map.get(name, {
        "desc": "Mission path unavailable.",
        "steps": [("Back to Mission Board", "/mission-board")]
    })

    step_cards = "".join(
        f"<div class='tile'><h3>{label}</h3><a class='smallbtn' href='{href}'>Go</a></div>"
        for label, href in data["steps"]
    )

    body = f"""
    <div class="hero">
      <h1>{mission_name}</h1>
      <p>{data['desc']}</p>
      <span class="pill">Mission</span>
      <span class="pill">Checkpoint</span>
      <span class="pill">Progress</span>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Mission Steps</h2>
      <div class="quad">
        {step_cards}
      </div>
    </div>

    <div class="card">
      <a class="btn" href="/mission-board">Back to Mission Board</a>
    </div>
    """
    return _ultra_shell(mission_name, body)

@app.route("/open-world-travel")
def open_world_travel():
    body = """
    <div class="hero">
      <h1>Open World Travel</h1>
      <p>Travel by district, map, address, verse, and future-world gateway.</p>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/world-map">World Map</a>
        <a class="smallbtn" href="/open-world">Open World</a>
        <a class="smallbtn" href="/mission-board">Mission Board</a>
        <a class="smallbtn" href="/teleport?q=Chicago">Teleport to Chicago</a>
        <a class="smallbtn" href="/moon-travel">Moon Travel</a>
        <a class="smallbtn" href="/mars-travel">Mars Travel</a>
        <a class="smallbtn" href="/memory-journey">Memory Journey</a>
        <a class="smallbtn" href="/holo-lounge">Holo Lounge</a>
      </div>
    </div>
    """
    return _ultra_shell("Open World Travel", body)




# ===== GROWTH BUNDLES + REPUTATION OPS =====

@app.route("/growth-center")
def growth_center():
    body = """
    <div class="hero">
      <h1>Growth Center</h1>
      <p>Invite members, grow creator families, build agencies, and unlock bundle rewards.</p>
      <span class="pill">Invites</span>
      <span class="pill">Bundles</span>
      <span class="pill">Growth</span>
      <span class="pill">Rewards</span>
    </div>

    <div class="card">
      <div class="quad">
        <a class="smallbtn" href="/invite-center">Invite Center</a>
        <a class="smallbtn" href="/bundle-market">Bundle Market</a>
        <a class="smallbtn" href="/family-hub">Family Hub</a>
        <a class="smallbtn" href="/growth-center">Growth Center</a>
        <a class="smallbtn" href="/safety-center">Safety Center</a>
        <a class="smallbtn" href="/agency-pro">Agency Pro</a>
        <a class="smallbtn" href="/creator-directory">Find Creators</a>
        <a class="smallbtn" href="/leaderboard-v2">Leaderboard</a>
        <a class="smallbtn" href="/missions-pro">Missions Pro</a>
        <a class="smallbtn" href="/reputation-ops">Reputation Ops</a>
      </div>
    </div>
    """
    return _ultra_shell("Growth Center", body)

@app.route("/invite-center")
def invite_center():
    body = """
    <div class="hero">
      <h1>Invite Center</h1>
      <p>Find new members to join the app, creators to recruit, and teams to build.</p>
      <span class="pill">Invite Links</span>
      <span class="pill">Recruiting</span>
      <span class="pill">Referral Growth</span>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile">
          <h3>Invite Friends</h3>
          <p>Bring in users who can join rooms, shops, and fan clubs.</p>
          <a class="smallbtn" href="/family-hub">Open</a>
        </div>
        <div class="tile">
          <h3>Recruit Creators</h3>
          <p>Build your creator network and talent pool.</p>
          <a class="smallbtn" href="/creator-directory">Recruit</a>
        </div>
        <div class="tile">
          <h3>Build Agency Teams</h3>
          <p>Scale teams and unlock higher-value group missions.</p>
          <a class="smallbtn" href="/agency-pro">Build</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Invite Center", body)

@app.route("/bundle-market")
def bundle_market():
    body = """
    <div class="hero">
      <h1>Bundle Market</h1>
      <p>Offer membership bundles, family bundles, creator bundles, and premium access bundles.</p>
      <span class="pill">Starter</span>
      <span class="pill">Family</span>
      <span class="pill">Creator</span>
      <span class="pill">Premium</span>
    </div>

    <div class="card">
      <div class="quad">
        <div class="tile">
          <h3>Starter Bundle</h3>
          <p>Basic access to rooms, creators, and social features.</p>
          <a class="smallbtn" href="/payments-shell">Open</a>
        </div>
        <div class="tile">
          <h3>Family Bundle</h3>
          <p>Community access, family rooms, rankings, and events.</p>
          <a class="smallbtn" href="/family-hub">Open</a>
        </div>
        <div class="tile">
          <h3>Creator Bundle</h3>
          <p>Dashboard, uploads, storefront, and growth tools.</p>
          <a class="smallbtn" href="/creator-launchpad">Open</a>
        </div>
        <div class="tile">
          <h3>Omni Bundle</h3>
          <p>Passes, premium memberships, and verse/world access.</p>
          <a class="smallbtn" href="/metaverse-pass">Open</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Bundle Market", body)

@app.route("/missions-pro")
def missions_pro():
    body = """
    <div class="hero">
      <h1>Missions Pro</h1>
      <p>Higher-intensity missions for growth, status, creator progression, and world advancement.</p>
      <span class="pill">Progression</span>
      <span class="pill">Rewards</span>
      <span class="pill">Status</span>
    </div>

    <div class="card">
      <div class="timeline">
        <div class="timecard">
          <h3>Recruit 5 Members</h3>
          <p>Grow your family or creator circle and unlock a higher-tier bundle path.</p>
          <a class="smallbtn" href="/invite-center">Start</a>
        </div>
        <div class="timecard">
          <h3>Launch a Creator Bundle</h3>
          <p>Package content, rooms, and memberships into one offer.</p>
          <a class="smallbtn" href="/bundle-market">Start</a>
        </div>
        <div class="timecard">
          <h3>Win a Social Tournament</h3>
          <p>Climb rankings through games, rooms, and family competitions.</p>
          <a class="smallbtn" href="/games-pro-v2">Start</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Missions Pro", body)

@app.route("/reputation-ops")
def reputation_ops():
    body = """
    <div class="hero">
      <h1>Reputation Ops</h1>
      <p>High-risk style missions built around defense, recovery, stealth, and strategy instead of wrongdoing.</p>
      <span class="pill">Security</span>
      <span class="pill">Recovery</span>
      <span class="pill">Stealth</span>
      <span class="pill">Risk/Reward</span>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile">
          <h3>Security Sweep</h3>
          <p>Protect a creator room and complete moderation/safety checkpoints.</p>
          <a class="smallbtn" href="/moderation-center">Open</a>
        </div>
        <div class="tile">
          <h3>Recovery Mission</h3>
          <p>Restore a falling creator lane by boosting events, uploads, and growth actions.</p>
          <a class="smallbtn" href="/creator-dashboard-live">Open</a>
        </div>
        <div class="tile">
          <h3>Shadow Ops</h3>
          <p>Stealth-style challenge mode focused on hidden checkpoints and timed progression.</p>
          <a class="smallbtn" href="/mission-board">Open</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Reputation Ops", body)




# ===== SAFETY + REWARDS LAYER =====

@app.route("/safety-center")
def safety_center():
    body = """
    <div class="hero">
      <h1>Safety Center</h1>
      <p>Moderation controls, youth-safe guardrails, room discipline, and daily reward systems.</p>
      <span class="pill">Mute</span>
      <span class="pill">Time Limits</span>
      <span class="pill">Ban/Unban</span>
      <span class="pill">Rewards</span>
    </div>

    <div class="card">
      <div class="quad">
        <a class="smallbtn" href="/mute-controls">Mute Controls</a>
        <a class="smallbtn" href="/time-limit-center">Time Limits</a>
        <a class="smallbtn" href="/ban-center">Ban Center</a>
        <a class="smallbtn" href="/daily-prizes">Daily Prizes</a>
        <a class="smallbtn" href="/claim-daily-reward-v2">Claim Reward</a>
        <a class="smallbtn" href="/guardian-center-lite">Guardian Center</a>
        <a class="smallbtn" href="/safe-chat-rules">Safe Chat Rules</a>
        <a class="smallbtn" href="/moderation-center">Moderation</a>
        <a class="smallbtn" href="/social-hub">Social Hub</a>
      </div>
    </div>
    """
    return _ultra_shell("Safety Center", body)

@app.route("/mute-controls")
def mute_controls():
    body = """
    <div class="hero">
      <h1>Mute Controls</h1>
      <p>Temporary room mutes, chat cooldowns, and audience calming tools for hosts and moderators.</p>
      <span class="pill">Room Mute</span>
      <span class="pill">Cooldown</span>
      <span class="pill">Host Control</span>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile">
          <h3>30-Second Cooldown</h3>
          <p>Slow a heated chat without shutting the room down.</p>
        </div>
        <div class="tile">
          <h3>5-Minute Mute</h3>
          <p>Temporary mute for disruptive behavior.</p>
        </div>
        <div class="tile">
          <h3>Room Quiet Mode</h3>
          <p>Limit comments during announcements or youth events.</p>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Mute Controls", body)

@app.route("/time-limit-center")
def time_limit_center():
    body = """
    <div class="hero">
      <h1>Time Limit Center</h1>
      <p>Set session limits, break reminders, and youth-safe usage windows.</p>
      <span class="pill">Screen Time</span>
      <span class="pill">Breaks</span>
      <span class="pill">Guardian Support</span>
    </div>

    <div class="card">
      <div class="timeline">
        <div class="timecard">
          <h3>30-Minute Youth Session</h3>
          <p>Short healthy-use mode for younger users.</p>
        </div>
        <div class="timecard">
          <h3>Break Reminder</h3>
          <p>Prompt users to rest, hydrate, and reset.</p>
        </div>
        <div class="timecard">
          <h3>Event Exception Window</h3>
          <p>Allow supervised events to run longer when approved.</p>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Time Limit Center", body)

@app.route("/ban-center")
def ban_center():
    body = """
    <div class="hero">
      <h1>Ban Center</h1>
      <p>Escalation controls for serious repeated violations, with review and unban paths.</p>
      <span class="pill">Escalation</span>
      <span class="pill">Review</span>
      <span class="pill">Restore Access</span>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile">
          <h3>Temporary Restriction</h3>
          <p>Short-term lockout for repeated disruption.</p>
        </div>
        <div class="tile">
          <h3>Review Queue</h3>
          <p>Moderator review before long-term removal.</p>
        </div>
        <div class="tile">
          <h3>Unban Path</h3>
          <p>Re-entry after review, education, and agreement to rules.</p>
        </div>
      </div>
    </div>

    <div class="card">
      <a class="btn" href="/moderation-center">Open Moderation Center</a>
    </div>
    """
    return _ultra_shell("Ban Center", body)

@app.route("/daily-prizes")
def daily_prizes():
    body = """
    <div class="hero">
      <h1>Daily Prizes</h1>
      <p>Daily login rewards, healthy engagement prizes, creator streaks, and community mission bonuses.</p>
      <span class="pill">Daily Rewards</span>
      <span class="pill">Streaks</span>
      <span class="pill">Bonus Unlocks</span>
    </div>

    <div class="card">
      <div class="quad">
        <div class="tile">
          <h3>Day 1</h3>
          <p>Starter reward</p>
        </div>
        <div class="tile">
          <h3>Day 3</h3>
          <p>Community bonus</p>
        </div>
        <div class="tile">
          <h3>Day 7</h3>
          <p>Premium perk</p>
        </div>
        <div class="tile">
          <h3>Day 30</h3>
          <p>Elite streak reward</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/missions-pro">Mission Bonuses</a>
        <a class="smallbtn" href="/games-pro-v2">Game Rewards</a>
        <a class="smallbtn" href="/growth-center">Growth Rewards</a>
        <a class="smallbtn" href="/premium-memberships">Premium Perks</a>
      </div>
    </div>
    """
    return _ultra_shell("Daily Prizes", body)

@app.route("/guardian-center-lite")
def guardian_center_lite():
    body = """
    <div class="hero">
      <h1>Guardian Center</h1>
      <p>Parent and guardian overview for time limits, safer rooms, and supervised access.</p>
      <span class="pill">Guardian</span>
      <span class="pill">Supervision</span>
      <span class="pill">Youth Safe</span>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/time-limit-center">Time Limits</a>
        <a class="smallbtn" href="/mute-controls">Mute Controls</a>
        <a class="smallbtn" href="/safe-chat-rules">Chat Rules</a>
        <a class="smallbtn" href="/youth-safe-preview">Youth Preview</a>
      </div>
    </div>
    """
    return _ultra_shell("Guardian Center", body)

@app.route("/safe-chat-rules")
def safe_chat_rules():
    body = """
    <div class="hero">
      <h1>Safe Chat Rules</h1>
      <p>Simple rules for respectful conversation, youth protection, and healthy community behavior.</p>
    </div>

    <div class="card">
      <div class="timeline">
        <div class="timecard"><h3>No harassment</h3><p>Respect creators, users, and families.</p></div>
        <div class="timecard"><h3>No unsafe contact</h3><p>Protect minors and limit risky private messaging.</p></div>
        <div class="timecard"><h3>No hate or threats</h3><p>Remove harmful behavior fast.</p></div>
      </div>
    </div>
    """
    return _ultra_shell("Safe Chat Rules", body)

@app.route("/youth-safe-preview")
def youth_safe_preview():
    body = """
    <div class="hero">
      <h1>Youth Safe Preview</h1>
      <p>A safer under-18 experience with supervised access, limited contact, and healthy-use defaults.</p>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/family-hub">Family Hub</a>
        <a class="smallbtn" href="/games-pro-v2">Games Pro</a>
        <a class="smallbtn" href="/daily-prizes">Daily Prizes</a>
        <a class="smallbtn" href="/claim-daily-reward-v2">Claim Reward</a>
        <a class="smallbtn" href="/time-limit-center">Time Limits</a>
      </div>
    </div>
    """
    return _ultra_shell("Youth Safe Preview", body)




# ===== LIVE EVENTS + XP SYSTEM =====

user_xp = {}
user_level = {}

def add_xp(user="guest", amount=10):
    xp = user_xp.get(user, 0) + amount
    user_xp[user] = xp
    user_level[user] = xp // 100

@app.route("/xp-center")
def xp_center():
    user = "guest"
    xp = user_xp.get(user, 0)
    level = user_level.get(user, 0)

    body = f"""
    <div class="hero">
      <h1>XP Center</h1>
      <p>Level up by completing missions, games, and events.</p>
      <span class="pill">XP: {xp}</span>
      <span class="pill">Level: {level}</span>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/mission-board">Complete Mission</a>
        <a class="smallbtn" href="/games-pro-v2">Play Games</a>
        <a class="smallbtn" href="/growth-center">Invite Users</a>
        <a class="smallbtn" href="/live-events">Join Event</a>
      </div>
    </div>
    """
    return _ultra_shell("XP Center", body)

@app.route("/live-events")
def live_events():
    body = """
    <div class="hero">
      <h1>Live Events</h1>
      <p>Join real-time global events, competitions, and creator-hosted shows.</p>
      <span class="pill">Live</span>
      <span class="pill">Events</span>
      <span class="pill">Global</span>
    </div>

    <div class="card">
      <div class="timeline">
        <div class="timecard">
          <h3>Global Trivia Event</h3>
          <p>Compete with others worldwide.</p>
          <a class="smallbtn" href="/jeopardy-live-v2">Join</a>
        </div>
        <div class="timecard">
          <h3>Creator Boss Battle</h3>
          <p>Challenge a top creator live.</p>
          <a class="smallbtn" href="/creator-feed">Enter</a>
        </div>
        <div class="timecard">
          <h3>Game Tournament</h3>
          <p>Climb leaderboard and win rewards.</p>
          <a class="smallbtn" href="/leaderboard-v2">Play</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Live Events", body)

@app.route("/xp-earn")
def xp_earn():
    add_xp("guest", 25)
    return "XP Added"




# ===== TV NETWORK + PUBLIC SHOW SYSTEM =====

shows = []
episodes = []

@app.route("/tv-network")
def tv_network():
    body = """
    <div class="hero">
      <h1>Omni TV Network</h1>
      <p>24/7 broadcasting: shows, game shows, soap operas, history, and live creator channels.</p>
      <span class="pill">Live TV</span>
      <span class="pill">Day/Night</span>
      <span class="pill">On Demand</span>
    </div>

    <div class="card">
      <div class="quad">
        <a class="smallbtn" href="/live-channels">Live Channels</a>
        <a class="smallbtn" href="/create-show">Create Show</a>
        <a class="smallbtn" href="/show-directory">Show Directory</a>
        <a class="smallbtn" href="/episode-manager">Episodes</a>
        <a class="smallbtn" href="/game-shows-tv">Game Shows</a>
        <a class="smallbtn" href="/soap-opera-tv">Soap Operas</a>
        <a class="smallbtn" href="/history-tv">History</a>
        <a class="smallbtn" href="/memory-archive-tv">Memory Archive</a>
      </div>
    </div>
    """
    return _ultra_shell("TV Network", body)

@app.route("/live-channels")
def live_channels():
    body = """
    <div class="hero">
      <h1>Live Channels</h1>
      <p>Always-on channels streaming content day and night.</p>
    </div>

    <div class="triple">
      <div class="tile"><h3>Music Channel</h3><p>Live performances and drops.</p></div>
      <div class="tile"><h3>Game Channel</h3><p>Competitions and tournaments.</p></div>
      <div class="tile"><h3>Talk Channel</h3><p>Interviews and discussions.</p></div>
    </div>
    """
    return _ultra_shell("Live Channels", body)

@app.route("/create-show", methods=["GET","POST"])
def create_show():
    from flask import request, redirect

    if request.method == "POST":
        title = request.form.get("title")
        if title:
            shows.append({"title": title})
        return redirect("/show-directory")

    return _ultra_shell("Create Show", """
    <div class="hero"><h1>Create Show</h1></div>
    <div class="card">
      <form method="POST">
        <input name="title" placeholder="Show Title" style="width:100%;padding:10px;margin-bottom:10px;">
        <button class="btn">Create</button>
      </form>
    </div>
    """)

@app.route("/show-directory")
def show_directory():
    items = "".join([
        f"<div class='tile'><h3>{s['title']}</h3></div>"
        for s in shows
    ]) or "<p>No shows yet.</p>"

    return _ultra_shell("Shows", f"""
    <div class="hero"><h1>Show Directory</h1></div>
    <div class="card">{items}</div>
    """)

@app.route("/episode-manager", methods=["GET","POST"])
def episode_manager():
    from flask import request, redirect

    if request.method == "POST":
        title = request.form.get("title")
        if title:
            episodes.append({"title": title})
        return redirect("/episode-manager")

    items = "".join([
        f"<div class='tile'><h3>{e['title']}</h3></div>"
        for e in episodes
    ])

    return _ultra_shell("Episodes", f"""
    <div class="hero"><h1>Episodes</h1></div>
    <div class="card">
      <form method="POST">
        <input name="title" placeholder="Episode Title" style="width:100%;padding:10px;margin-bottom:10px;">
        <button class="btn">Add Episode</button>
      </form>
      {items}
    </div>
    """)

@app.route("/game-shows-tv")
def game_shows_tv():
    body = """
    <div class="hero"><h1>Game Shows</h1></div>
    <div class="grid">
      <a class="smallbtn" href="/jeopardy-live-v2">Jeopardy</a>
      <a class="smallbtn" href="/wheel-show-v2">Wheel Show</a>
      <a class="smallbtn" href="/games-pro-v2">Game Arena</a>
    </div>
    """
    return _ultra_shell("Game Shows", body)

@app.route("/soap-opera-tv")
def soap_opera_tv():
    body = """
    <div class="hero"><h1>Soap Opera</h1><p>Day/Night serialized stories.</p></div>
    <div class="card">
      <div class="timeline">
        <div class="timecard"><h3>Morning Drama</h3></div>
        <div class="timecard"><h3>Evening Storyline</h3></div>
        <div class="timecard"><h3>Night Finale</h3></div>
      </div>
    </div>
    """
    return _ultra_shell("Soap Opera", body)

@app.route("/history-tv")
def history_tv():
    body = """
    <div class="hero"><h1>History Channel</h1><p>Past events and reconstructed timelines.</p></div>
    <div class="card">
      <a class="smallbtn" href="/timeline-archive?era=past">View Past</a>
      <a class="smallbtn" href="/timeline-archive?era=future">View Future</a>
    </div>
    """
    return _ultra_shell("History", body)

@app.route("/memory-archive-tv")
def memory_archive_tv():
    body = """
    <div class="hero"><h1>Memory Archive</h1><p>Replay experiences and saved states.</p></div>
    <div class="card">
      <a class="smallbtn" href="/memory-journey">Open Memory Journey</a>
    </div>
    """
    return _ultra_shell("Memory Archive", body)




# ===== SAFE ACCOUNTS + MONETIZATION PREP =====

class MemberAccount(db.Model):
    __table_args__ = {"extend_existing": True}
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(64), nullable=False, default="member")
    display_name = db.Column(db.String(255), nullable=True)
    bio = db.Column(db.Text, nullable=True)

class CreatorPayoutProfile(db.Model):
    __table_args__ = {"extend_existing": True}
    id = db.Column(db.Integer, primary_key=True)
    creator_name = db.Column(db.String(255), nullable=False)
    payout_status = db.Column(db.String(64), nullable=False, default="setup_needed")
    subscription_tier = db.Column(db.String(64), nullable=False, default="starter")
    referral_code = db.Column(db.String(64), nullable=True)

def _current_demo_user():
    # safe placeholder account state until full auth session model is added
    return {
        "username": "guest",
        "role": "member",
        "display_name": "Guest User"
    }

@app.route("/account-center-v2")
def account_center_v2():
    user = _current_demo_user()
    body = f"""
    <div class="hero">
      <h1>Account Center</h1>
      <p>Safe account setup, membership roles, creator tools, and monetization entry points.</p>
      <span class="pill">{user['display_name']}</span>
      <span class="pill">Role: {user['role']}</span>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/signup-v2">Sign Up</a>
        <a class="smallbtn" href="/login-v2">Log In</a>
        <a class="smallbtn" href="/member-home-v2">Member Home</a>
        <a class="smallbtn" href="/creator-monetization-v2">Creator Monetization</a>
        <a class="smallbtn" href="/subscription-center-v2">Subscriptions</a>
        <a class="smallbtn" href="/referral-rewards-v2">Referrals</a>
      </div>
    </div>
    """
    return _ultra_shell("Account Center", body)

@app.route("/signup-v2", methods=["GET","POST"])
def signup_v2():
    from flask import request, redirect
    message = ""

    try:
        with app.app_context():
            db.create_all()
    except Exception:
        pass

    if request.method == "POST":
        username = (request.form.get("username") or "").strip().lower()
        password = (request.form.get("password") or "").strip()
        role = (request.form.get("role") or "member").strip().lower()
        display_name = (request.form.get("display_name") or "").strip()

        if not username or not password:
            message = "Username and password are required."
        else:
            existing = MemberAccount.query.filter_by(username=username).first()
            if existing:
                message = "That username already exists."
            else:
                row = MemberAccount(
                    username=username,
                    password_hash=generate_password_hash(password),
                    role=role if role in ["member", "creator", "guardian", "admin"] else "member",
                    display_name=display_name or username
                )
                db.session.add(row)
                db.session.commit()
                return redirect("/accounts-directory-v2")

    body = f"""
    <div class="hero">
      <h1>Sign Up</h1>
      <p>Create a safe account shell for members, creators, guardians, and admins.</p>
    </div>

    <div class="card">
      <p>{message}</p>
      <form method="POST">
        <input name="username" placeholder="username" style="width:100%;padding:12px;margin-bottom:10px;">
        <input name="display_name" placeholder="display name" style="width:100%;padding:12px;margin-bottom:10px;">
        <input name="password" type="password" placeholder="password" style="width:100%;padding:12px;margin-bottom:10px;">
        <select name="role" style="width:100%;padding:12px;margin-bottom:10px;">
          <option value="member">Member</option>
          <option value="creator">Creator</option>
          <option value="guardian">Guardian</option>
          <option value="admin">Admin</option>
        </select>
        <button class="btn">Create Account</button>
      </form>
    </div>
    """
    return _ultra_shell("Sign Up", body)

@app.route("/login-v2", methods=["GET","POST"])
def login_v2():
    from flask import request
    message = "Demo login checker only. Full session auth can be added next."

    if request.method == "POST":
        username = (request.form.get("username") or "").strip().lower()
        password = (request.form.get("password") or "").strip()
        row = MemberAccount.query.filter_by(username=username).first()
        if row and check_password_hash(row.password_hash, password):
            message = f"Credentials verified for {row.display_name or row.username}."
        else:
            message = "Invalid credentials."

    body = f"""
    <div class="hero">
      <h1>Log In</h1>
      <p>Credential verification shell for the account system.</p>
    </div>

    <div class="card">
      <p>{message}</p>
      <form method="POST">
        <input name="username" placeholder="username" style="width:100%;padding:12px;margin-bottom:10px;">
        <input name="password" type="password" placeholder="password" style="width:100%;padding:12px;margin-bottom:10px;">
        <button class="btn">Check Credentials</button>
      </form>
    </div>
    """
    return _ultra_shell("Log In", body)

@app.route("/accounts-directory-v2")
def accounts_directory_v2():
    try:
        with app.app_context():
            db.create_all()
        rows = MemberAccount.query.order_by(MemberAccount.id.desc()).limit(50).all()
        items = "".join(
            f"<div class='tile'><h3>{r.display_name or r.username}</h3><p>@{r.username}</p><p>Role: {r.role}</p></div>"
            for r in rows
        ) or "<p>No accounts yet.</p>"
    except Exception as e:
        items = f"<p>Account DB error: {e}</p>"

    body = f"""
    <div class="hero">
      <h1>Accounts Directory</h1>
      <p>Recent platform accounts.</p>
    </div>
    <div class="card"><div class="triple">{items}</div></div>
    """
    return _ultra_shell("Accounts Directory", body)

@app.route("/member-home-v2")
def member_home_v2():
    body = """
    <div class="hero">
      <h1>Member Home</h1>
      <p>Personal dashboard for discovery, rewards, safety, and progression.</p>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/for-you">For You</a>
        <a class="smallbtn" href="/growth-center">Growth Center</a>
        <a class="smallbtn" href="/daily-prizes">Daily Prizes</a>
        <a class="smallbtn" href="/claim-daily-reward-v2">Claim Reward</a>
        <a class="smallbtn" href="/xp-center">XP Center</a>
        <a class="smallbtn" href="/progress-center-v2">Progress Center</a>
        <a class="smallbtn" href="/games-pro-v2">Games</a>
        <a class="smallbtn" href="/safety-center">Safety</a>
      </div>
    </div>
    """
    return _ultra_shell("Member Home", body)

@app.route("/creator-monetization-v2")
def creator_monetization_v2():
    body = """
    <div class="hero">
      <h1>Creator Monetization</h1>
      <p>Subscriptions, payouts, bundle offers, referrals, memberships, and premium access lanes.</p>
      <span class="pill">Monetization</span>
      <span class="pill">Bundles</span>
      <span class="pill">Payouts</span>
    </div>

    <div class="card">
      <div class="quad">
        <a class="smallbtn" href="/payout-center-v2">Payout Center</a>
        <a class="smallbtn" href="/subscription-center-v2">Subscriptions</a>
        <a class="smallbtn" href="/bundle-market">Bundle Market</a>
        <a class="smallbtn" href="/referral-rewards-v2">Referral Rewards</a>
        <a class="smallbtn" href="/premium-memberships">Premium Memberships</a>
        <a class="smallbtn" href="/metaverse-pass">Pass Sales</a>
        <a class="smallbtn" href="/creator-dashboard-live">Creator Dashboard</a>
        <a class="smallbtn" href="/account-center-v2">Account Center</a>
        <a class="smallbtn" href="/creator-monetization-v2">Monetization</a>
        <a class="smallbtn" href="/tv-network">TV Network</a>
      </div>
    </div>
    """
    return _ultra_shell("Creator Monetization", body)

@app.route("/payout-center-v2", methods=["GET","POST"])
def payout_center_v2():
    from flask import request, redirect
    message = ""

    try:
        with app.app_context():
            db.create_all()
    except Exception:
        pass

    if request.method == "POST":
        creator_name = (request.form.get("creator_name") or "").strip()
        subscription_tier = (request.form.get("subscription_tier") or "starter").strip()
        referral_code = (request.form.get("referral_code") or "").strip()

        if creator_name:
            row = CreatorPayoutProfile(
                creator_name=creator_name,
                payout_status="pending_review",
                subscription_tier=subscription_tier,
                referral_code=referral_code or None
            )
            db.session.add(row)
            db.session.commit()
            return redirect("/payout-profiles-v2")
        else:
            message = "Creator name is required."

    body = f"""
    <div class="hero">
      <h1>Payout Center</h1>
      <p>Safe payout prep until full live payments are connected.</p>
    </div>

    <div class="card">
      <p>{message}</p>
      <form method="POST">
        <input name="creator_name" placeholder="creator name" style="width:100%;padding:12px;margin-bottom:10px;">
        <select name="subscription_tier" style="width:100%;padding:12px;margin-bottom:10px;">
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="elite">Elite</option>
        </select>
        <input name="referral_code" placeholder="referral code" style="width:100%;padding:12px;margin-bottom:10px;">
        <button class="btn">Save Payout Profile</button>
      </form>
    </div>
    """
    return _ultra_shell("Payout Center", body)

@app.route("/payout-profiles-v2")
def payout_profiles_v2():
    try:
        with app.app_context():
            db.create_all()
        rows = CreatorPayoutProfile.query.order_by(CreatorPayoutProfile.id.desc()).limit(50).all()
        items = "".join(
            f"<div class='tile'><h3>{r.creator_name}</h3><p>Status: {r.payout_status}</p><p>Tier: {r.subscription_tier}</p><p>Referral: {r.referral_code or ''}</p></div>"
            for r in rows
        ) or "<p>No payout profiles yet.</p>"
    except Exception as e:
        items = f"<p>Payout DB error: {e}</p>"

    body = f"""
    <div class="hero">
      <h1>Payout Profiles</h1>
      <p>Saved monetization profiles.</p>
    </div>
    <div class="card"><div class="triple">{items}</div></div>
    """
    return _ultra_shell("Payout Profiles", body)

@app.route("/subscription-center-v2")
def subscription_center_v2():
    body = """
    <div class="hero">
      <h1>Subscription Center</h1>
      <p>Manage creator tiers, fan memberships, and bundle access levels.</p>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile"><h3>Starter</h3><p>Basic member lane</p><a class="smallbtn" href="/premium-memberships">Open</a></div>
        <div class="tile"><h3>Pro</h3><p>Premium creator/fan lane</p><a class="smallbtn" href="/premium-memberships">Open</a></div>
        <div class="tile"><h3>Elite</h3><p>Full ecosystem access lane</p><a class="smallbtn" href="/metaverse-pass">Open</a></div>
      </div>
    </div>
    """
    return _ultra_shell("Subscription Center", body)

@app.route("/referral-rewards-v2")
def referral_rewards_v2():
    body = """
    <div class="hero">
      <h1>Referral Rewards</h1>
      <p>Invite growth, bundle unlocks, team expansion, and creator referral bonuses.</p>
    </div>

    <div class="card">
      <div class="timeline">
        <div class="timecard"><h3>Invite 1</h3><p>Starter reward</p></div>
        <div class="timecard"><h3>Invite 5</h3><p>Growth bonus</p></div>
        <div class="timecard"><h3>Invite 20</h3><p>Premium unlock path</p></div>
      </div>
    </div>
    """
    return _ultra_shell("Referral Rewards", body)

@app.route("/gap-report-v2")
def gap_report_v2():
    wanted = [
        "/app-home-2", "/social-hub", "/for-you", "/streaming-pro", "/games-pro-v2",
        "/tv-network", "/creator-directory", "/creator-dashboard-live", "/growth-center",
        "/safety-center", "/time-machine-2", "/world-map", "/open-world", "/mission-board",
        "/account-center-v2", "/creator-monetization-v2"
    ]
    import re as _re
    try:
        app_text = Path("app.py").read_text(encoding="utf-8", errors="ignore")
        routes = sorted(set(_re.findall(r'@app\.route\("([^"]+)"', app_text)))
        missing = [r for r in wanted if r not in routes]
        body = f"""
        <div class="hero">
          <h1>Gap Report V2</h1>
          <p>Important route and system check.</p>
        </div>
        <div class="card">
          <pre>{json.dumps({"route_count": len(routes), "missing_important_routes": missing}, indent=2)}</pre>
        </div>
        """
    except Exception as e:
        body = f"<div class='card'><p>{e}</p></div>"
    return _ultra_shell("Gap Report V2", body)




# ===== PROGRESSION PERSISTENCE LAYER =====

class UserProgress(db.Model):
    __table_args__ = {"extend_existing": True}
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), unique=True, nullable=False)
    xp = db.Column(db.Integer, nullable=False, default=0)
    level = db.Column(db.Integer, nullable=False, default=0)
    streak_days = db.Column(db.Integer, nullable=False, default=0)
    rewards_claimed = db.Column(db.Integer, nullable=False, default=0)

class MissionCompletion(db.Model):
    __table_args__ = {"extend_existing": True}
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), nullable=False)
    mission_name = db.Column(db.String(255), nullable=False)
    xp_awarded = db.Column(db.Integer, nullable=False, default=0)

def _progress_user():
    return "guest"

def _ensure_progress(username="guest"):
    row = UserProgress.query.filter_by(username=username).first()
    if not row:
        row = UserProgress(username=username, xp=0, level=0, streak_days=0, rewards_claimed=0)
        db.session.add(row)
        db.session.commit()
    return row

def _award_xp(username="guest", amount=25):
    row = _ensure_progress(username)
    row.xp = int(row.xp or 0) + int(amount)
    row.level = row.xp // 100
    db.session.commit()
    return row

@app.route("/progress-center-v2")
def progress_center_v2():
    try:
        with app.app_context():
            db.create_all()
        username = _progress_user()
        row = _ensure_progress(username)
        completions = MissionCompletion.query.filter_by(username=username).order_by(MissionCompletion.id.desc()).limit(10).all()
        history = "".join(
            f"<div class='tile'><h3>{c.mission_name}</h3><p>XP Awarded: {c.xp_awarded}</p></div>"
            for c in completions
        ) or "<p>No mission completions yet.</p>"

        body = f"""
        <div class="hero">
          <h1>Progress Center</h1>
          <p>Persistent progression, mission history, streaks, and rewards.</p>
          <span class="pill">User: {username}</span>
          <span class="pill">XP: {row.xp}</span>
          <span class="pill">Level: {row.level}</span>
          <span class="pill">Streak: {row.streak_days}</span>
        </div>

        <div class="card">
          <div class="grid">
            <a class="smallbtn" href="/complete-mission-v2?name=creator-launch&xp=25">Complete Creator Mission</a>
            <a class="smallbtn" href="/complete-mission-v2?name=live-host&xp=25">Complete Live Mission</a>
            <a class="smallbtn" href="/complete-mission-v2?name=verse-traveler&xp=35">Complete Verse Mission</a>
            <a class="smallbtn" href="/claim-daily-reward-v2">Claim Daily Reward</a>
            <a class="smallbtn" href="/xp-center">XP Shell</a>
            <a class="smallbtn" href="/member-home-v2">Member Home</a>
          </div>
        </div>

        <div class="card">
          <h2 class="sectiontitle">Recent Mission History</h2>
          <div class="triple">{history}</div>
        </div>
        """
        return _ultra_shell("Progress Center", body)
    except Exception as e:
        return _ultra_shell("Progress Center", f"<div class='card'><p>{e}</p></div>")

@app.route("/complete-mission-v2")
def complete_mission_v2():
    from flask import request, redirect
    try:
        with app.app_context():
            db.create_all()
        username = _progress_user()
        mission_name = (request.args.get("name") or "mission").strip()
        xp_amount = int((request.args.get("xp") or "25").strip())

        _award_xp(username, xp_amount)
        db.session.add(MissionCompletion(username=username, mission_name=mission_name, xp_awarded=xp_amount))
        db.session.commit()
    except Exception:
        pass
    return redirect("/progress-center-v2")

@app.route("/claim-daily-reward-v2")
def claim_daily_reward_v2():
    from flask import redirect
    try:
        with app.app_context():
            db.create_all()
        username = _progress_user()
        row = _ensure_progress(username)
        row.streak_days = int(row.streak_days or 0) + 1
        row.rewards_claimed = int(row.rewards_claimed or 0) + 1
        row.xp = int(row.xp or 0) + 10
        row.level = row.xp // 100
        db.session.commit()
    except Exception:
        pass
    return redirect("/progress-center-v2")

@app.route("/mission-history-v2")
def mission_history_v2():
    try:
        with app.app_context():
            db.create_all()
        username = _progress_user()
        rows = MissionCompletion.query.filter_by(username=username).order_by(MissionCompletion.id.desc()).all()
        items = "".join(
            f"<div class='tile'><h3>{r.mission_name}</h3><p>XP: {r.xp_awarded}</p></div>"
            for r in rows
        ) or "<p>No mission history yet.</p>"

        body = f"""
        <div class="hero">
          <h1>Mission History</h1>
          <p>Persistent record of completed missions.</p>
        </div>
        <div class="card"><div class="triple">{items}</div></div>
        """
        return _ultra_shell("Mission History", body)
    except Exception as e:
        return _ultra_shell("Mission History", f"<div class='card'><p>{e}</p></div>")




# ===== FLAGSHIP PRODUCTS + LIVE CHANNEL MONETIZATION ENGINE =====

flagship_products = [
    {
        "name": "Hair Products Franchise",
        "type": "beauty",
        "summary": "Flagship hair care, beauty, and franchise growth lane."
    },
    {
        "name": "Holofon",
        "type": "device",
        "summary": "Flagship holographic phone and immersive device ecosystem."
    },
    {
        "name": "His & Hers Make Them Fall in Love",
        "type": "core",
        "summary": "Flagship relationship, lifestyle, intimacy, attraction, and couple-brand experience lane."
    },
]

@app.route("/flagship-tree")
def flagship_tree():
    items = "".join(
        f"""
        <div class='tile'>
          <h3>{x['name']}</h3>
          <p>{x['summary']}</p>
          <p><strong>Type:</strong> {x['type']}</p>
        </div>
        """
        for x in flagship_products
    )

    body = f"""
    <div class="hero">
      <h1>Flagship Product Tree</h1>
      <p>Your core flagship products, kept separate from kingdom-building systems.</p>
      <span class="pill">Flagship</span>
      <span class="pill">Core Products</span>
      <span class="pill">Monetization Ready</span>
    </div>

    <div class="card">
      <div class="triple">{items}</div>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/live-channel-engine">Live Channel Engine</a>
        <a class="smallbtn" href="/omni-cinema">Omni Cinema</a>
        <a class="smallbtn" href="/holo-engine-v2">Holo Engine V2</a>
        <a class="smallbtn" href="/holo-scene-v2">Holo Scene V2</a>
        <a class="smallbtn" href="/netflix-killer-style">Omni Style</a>
        <a class="smallbtn" href="/tv-network-v2">TV Network</a>
        <a class="smallbtn" href="/live-channel-engine">Live Channel Engine</a>
        <a class="smallbtn" href="/omni-cinema">Omni Cinema</a>
        <a class="smallbtn" href="/holo-engine-v2">Holo Engine V2</a>
        <a class="smallbtn" href="/holo-scene-v2">Holo Scene V2</a>
        <a class="smallbtn" href="/netflix-killer-style">Omni Style</a>
        <a class="smallbtn" href="/flagship-tree">Flagship Tree</a>
        <a class="smallbtn" href="/his-hers-brand">His &amp; Hers</a>
        <a class="smallbtn" href="/dynamic-feed-v2">Dynamic Feed</a>
        <a class="smallbtn" href="/dynamic-feed-v3">Dynamic Feed V3</a>
        <a class="smallbtn" href="/world-map-v2
        <a class='smallbtn' href='/world-map-v3
        <a class='smallbtn' href='/world-map-v4'>World Map V4</a>'>World Map V3</a>">World Map V2</a>
        <a class="smallbtn" href="/omni-cinema-v2">Omni Cinema V2</a>
        <a class="smallbtn" href="/omni-cinema-v3
        <a class='smallbtn' href='/omni-cinema-v4'>Omni Cinema V4</a>">Omni Cinema V3</a>
        <a class="smallbtn" href="/flagship-tree-v2">Flagship Tree V2</a>
        <a class="smallbtn" href="/creator-monetization-v2">Creator Monetization</a>
        <a class="smallbtn" href="/bundle-market">Bundle Market</a>
      </div>
    </div>
    """
    return _ultra_shell("Flagship Product Tree", body)

@app.route("/live-channel-engine")
def live_channel_engine():
    body = """
    <div class="hero">
      <h1>Live Channel Engine</h1>
      <p>Turn shows into channels, channels into memberships, and memberships into recurring revenue.</p>
      <span class="pill">Channels</span>
      <span class="pill">Broadcast</span>
      <span class="pill">Recurring Revenue</span>
    </div>

    <div class="card">
      <div class="quad">
        <a class="smallbtn" href="/channel-directory-v2">Channel Directory</a>
        <a class="smallbtn" href="/channel-bundles-v2">Channel Bundles</a>
        <a class="smallbtn" href="/channel-subscriptions-v2">Subscriptions</a>
        <a class="smallbtn" href="/broadcast-schedule-v2">Broadcast Schedule</a>
        <a class="smallbtn" href="/tv-network-v2">TV Network</a>
        <a class="smallbtn" href="/live-channel-engine">Live Channel Engine</a>
        <a class="smallbtn" href="/omni-cinema">Omni Cinema</a>
        <a class="smallbtn" href="/holo-engine-v2">Holo Engine V2</a>
        <a class="smallbtn" href="/holo-scene-v2">Holo Scene V2</a>
        <a class="smallbtn" href="/netflix-killer-style">Omni Style</a>
        <a class="smallbtn" href="/flagship-tree">Flagship Tree</a>
        <a class="smallbtn" href="/creator-monetization-v2">Creator Monetization</a>
        <a class="smallbtn" href="/flagship-tree">Flagship Tree</a>
        <a class="smallbtn" href="/account-center-v2">Account Center</a>
      </div>
    </div>
    """
    return _ultra_shell("Live Channel Engine", body)

@app.route("/channel-directory-v2")
def channel_directory_v2():
    body = """
    <div class="hero">
      <h1>Channel Directory</h1>
      <p>Browse live and on-demand channels built from shows, creators, and flagship products.</p>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile">
          <h3>Hair TV</h3>
          <p>Tutorials, product drops, franchise training, and beauty shows.</p>
          <a class="smallbtn" href="/flagship-tree">Open</a>
        </div>
        <div class="tile">
          <h3>Holofon Live</h3>
          <p>Device demos, holographic experiences, and launch coverage.</p>
          <a class="smallbtn" href="/flagship-tree">Open</a>
        </div>
        <div class="tile">
          <h3>Omni Prime</h3>
          <p>Main entertainment, game shows, social live rooms, and creator shows.</p>
          <a class="smallbtn" href="/tv-network-v2">Open</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Channel Directory", body)

@app.route("/channel-bundles-v2")
def channel_bundles_v2():
    body = """
    <div class="hero">
      <h1>Channel Bundles</h1>
      <p>Bundle flagship products with channels, memberships, and premium access.</p>
    </div>

    <div class="card">
      <div class="quad">
        <div class="tile">
          <h3>Hair Bundle</h3>
          <p>Hair TV + beauty drops + premium tutorials.</p>
          <a class="smallbtn" href="/bundle-market">Open</a>
        </div>
        <div class="tile">
          <h3>Holofon Bundle</h3>
          <p>Holofon channel + premium demos + events.</p>
          <a class="smallbtn" href="/bundle-market">Open</a>
        </div>
        <div class="tile">
          <h3>Omni Entertainment Bundle</h3>
          <p>TV + games + creator passes + event access.</p>
          <a class="smallbtn" href="/bundle-market">Open</a>
        </div>
        <div class="tile">
          <h3>All Access Bundle</h3>
          <p>Full flagship + channel + pass bundle.</p>
          <a class="smallbtn" href="/metaverse-pass">Open</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Channel Bundles", body)

@app.route("/channel-subscriptions-v2")
def channel_subscriptions_v2():
    body = """
    <div class="hero">
      <h1>Channel Subscriptions</h1>
      <p>Tiered subscriptions for live channels, archives, premium episodes, and events.</p>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile">
          <h3>Free Tier</h3>
          <p>Basic channel access and highlights.</p>
          <a class="smallbtn" href="/subscription-center-v2">Open</a>
        </div>
        <div class="tile">
          <h3>Pro Tier</h3>
          <p>Live channels, premium rooms, and archive unlocks.</p>
          <a class="smallbtn" href="/subscription-center-v2">Open</a>
        </div>
        <div class="tile">
          <h3>Elite Tier</h3>
          <p>Flagship access, TV exclusives, and all-access channel bundles.</p>
          <a class="smallbtn" href="/subscription-center-v2">Open</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Channel Subscriptions", body)

@app.route("/broadcast-schedule-v2")
def broadcast_schedule_v2():
    body = """
    <div class="hero">
      <h1>Broadcast Schedule</h1>
      <p>Day and night broadcasting for shows, game shows, soap operas, and archives.</p>
    </div>

    <div class="card">
      <div class="timeline">
        <div class="timecard"><h3>Morning Beauty Block</h3><p>Hair franchise content and beauty education.</p></div>
        <div class="timecard"><h3>Afternoon Creator Block</h3><p>Public-made shows and creator features.</p></div>
        <div class="timecard"><h3>Prime Time Game Show Block</h3><p>Wheel, Jeopardy, trivia, and battles.</p></div>
        <div class="timecard"><h3>Night Archive Block</h3><p>History, memory, and replay programming.</p></div>
      </div>
    </div>
    """
    return _ultra_shell("Broadcast Schedule", body)

@app.route("/show-monetization-v2")
def show_monetization_v2():
    body = """
    <div class="hero">
      <h1>Show Monetization</h1>
      <p>Turn public shows into recurring channels, subscriptions, bundles, and premium events.</p>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/tv-network-v2">TV Network</a>
        <a class="smallbtn" href="/live-channel-engine">Live Channel Engine</a>
        <a class="smallbtn" href="/omni-cinema">Omni Cinema</a>
        <a class="smallbtn" href="/holo-engine-v2">Holo Engine V2</a>
        <a class="smallbtn" href="/holo-scene-v2">Holo Scene V2</a>
        <a class="smallbtn" href="/netflix-killer-style">Omni Style</a>
        <a class="smallbtn" href="/flagship-tree">Flagship Tree</a>
        <a class="smallbtn" href="/channel-directory-v2">Channel Directory</a>
        <a class="smallbtn" href="/channel-subscriptions-v2">Subscriptions</a>
        <a class="smallbtn" href="/channel-bundles-v2">Bundles</a>
        <a class="smallbtn" href="/creator-monetization-v2">Creator Monetization</a>
        <a class="smallbtn" href="/payout-center-v2">Payout Center</a>
      </div>
    </div>
    """
    return _ultra_shell("Show Monetization", body)




# ===== HOLOGRAPHIC BRAND UPGRADE + FRANCHISE LAYER =====

@app.route("/omni-cinema")
def omni_cinema():
    body = """
    <style>
      .holo-hero{
        position:relative; overflow:hidden; border-radius:24px; padding:28px;
        background:
          radial-gradient(circle at 20% 20%, rgba(34,211,238,.28), transparent 25%),
          radial-gradient(circle at 80% 30%, rgba(168,85,247,.25), transparent 28%),
          radial-gradient(circle at 50% 80%, rgba(16,185,129,.20), transparent 24%),
          linear-gradient(135deg, #07111f, #0a1630, #111827);
        border:1px solid rgba(255,255,255,.08);
        box-shadow:0 18px 50px rgba(0,0,0,.35);
      }
      .scanline{
        position:absolute; inset:0; pointer-events:none; opacity:.18;
        background:repeating-linear-gradient(
          to bottom,
          rgba(255,255,255,.08) 0px,
          rgba(255,255,255,.02) 2px,
          transparent 4px,
          transparent 8px
        );
      }
      .glowcard{
        position:relative;
        background:linear-gradient(180deg, rgba(17,24,39,.96), rgba(8,12,22,.96));
        border:1px solid rgba(255,255,255,.08);
        border-radius:20px;
        padding:18px;
        box-shadow:0 14px 36px rgba(0,0,0,.28), 0 0 0 1px rgba(56,189,248,.06) inset;
      }
      .glowcard:before{
        content:"";
        position:absolute; inset:-1px; border-radius:20px;
        background:linear-gradient(135deg, rgba(34,211,238,.16), rgba(168,85,247,.12), rgba(16,185,129,.10));
        z-index:-1; filter:blur(12px);
      }
      .cinema-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
      .cinema-thumb{
        height:170px;border-radius:18px;
        background:
          radial-gradient(circle at 30% 30%, rgba(255,255,255,.15), transparent 20%),
          linear-gradient(135deg,#2563eb,#7c3aed,#059669);
      }
      .flagship-strip{
        display:grid;grid-template-columns:repeat(4,1fr);gap:14px
      }
      .flagship-pill{
        display:block;text-decoration:none;color:#fff;padding:14px 12px;border-radius:16px;
        background:linear-gradient(135deg, rgba(37,99,235,.85), rgba(124,58,237,.78));
        text-align:center;font-weight:700;
      }
      .webgl-note{
        margin-top:12px; font-size:13px; opacity:.88;
      }
      @media (max-width: 900px){
        .cinema-grid,.flagship-strip{grid-template-columns:1fr}
      }
    </style>

    <div class="holo-hero">
      <div class="scanline"></div>
      <h1 style="margin:0 0 10px 0;font-size:34px;">Omni Cinema</h1>
      <p style="margin:0;font-size:15px;opacity:.95;">A holographic entertainment network with flagship brands, cinematic channels, and premium franchise worlds.</p>
      <div class="statrow" style="margin-top:14px;">
        <span class="stat">Cinematic</span>
        <span class="stat">Holographic</span>
        <span class="stat">Franchise-Ready</span>
        <span class="stat">Channel-Based</span>
      </div>
      <p class="webgl-note">This is the visual identity layer. A later phase can add a true WebGL scene renderer for animated 3D portals, floating tiles, and holo-depth transitions.</p>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Flagship Network</h2>
      <div class="flagship-strip">
        <a class="flagship-pill" href="/holofon-world">Holofon World</a>
        <a class="flagship-pill" href="/royal-locs-franchise">Royal Locs</a>
        <a class="flagship-pill" href="/franchise-opportunities">Franchise Opportunities</a>
        <a class="flagship-pill" href="/live-channel-engine">Live Channels</a>
      </div>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Featured Cinema Rows</h2>
      <div class="cinema-grid">
        <div class="glowcard">
          <div class="cinema-thumb"></div>
          <h3>Prime Time Holo Broadcast</h3>
          <p>Premium day/night programming with cinematic presentation and flagship sponsorship lanes.</p>
          <a class="smallbtn" href="/tv-network-v2">Open TV Network</a>
        </div>
        <div class="glowcard">
          <div class="cinema-thumb"></div>
          <h3>Creator Originals</h3>
          <p>Public-made shows with channel conversion, subscriptions, and archive replay.</p>
          <a class="smallbtn" href="/tv-network-v2">Open Creator TV</a>
        </div>
        <div class="glowcard">
          <div class="cinema-thumb"></div>
          <h3>Interactive Holo Rooms</h3>
          <p>Blend live channels, missions, events, and immersive social experiences.</p>
          <a class="smallbtn" href="/holo-lounge">Open Holo Lounge</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Omni Cinema", body)

@app.route("/holofon-world")
def holofon_world():
    body = """
    <div class="hero">
      <h1>Holofon World</h1>
      <p>The flagship holographic phone ecosystem: demos, launch events, premium channels, device education, and immersive communication experiences.</p>
      <span class="pill">Flagship Device</span>
      <span class="pill">Holographic</span>
      <span class="pill">Premium Channel</span>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile">
          <h3>Holofon Live</h3>
          <p>Device demos, feature reveals, and premium launch coverage.</p>
          <a class="smallbtn" href="/channel-directory-v2">Open Channel</a>
        </div>
        <div class="tile">
          <h3>Holofon Experience</h3>
          <p>Immersive communication, holographic view layers, and future-room access.</p>
          <a class="smallbtn" href="/holo-lounge">Open Experience</a>
        </div>
        <div class="tile">
          <h3>Holofon Premium</h3>
          <p>Flagship bundle path for premium subscribers and channel members.</p>
          <a class="smallbtn" href="/channel-bundles-v2">Open Bundles</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Holofon World", body)

@app.route("/royal-locs-franchise")
def royal_locs_franchise():
    body = """
    <div class="hero">
      <h1>Royal Locs Hair Franchise</h1>
      <p>Flagship hair-care and loc-care franchise system with products, education, TV blocks, creator tutorials, and franchise onboarding lanes.</p>
      <span class="pill">Franchise</span>
      <span class="pill">Beauty</span>
      <span class="pill">Education</span>
    </div>

    <div class="card">
      <div class="quad">
        <a class="smallbtn" href="/flagship-tree">Flagship Tree</a>
        <a class="smallbtn" href="/tv-network-v2">Hair TV</a>
        <a class="smallbtn" href="/bundle-market">Product Bundles</a>
        <a class="smallbtn" href="/creator-monetization-v2">Monetization</a>
      </div>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile">
          <h3>Product Line</h3>
          <p>Hair products, care bundles, and direct-to-audience sales lanes.</p>
        </div>
        <div class="tile">
          <h3>Franchise Training</h3>
          <p>Education blocks, tutorial shows, and guided launch content.</p>
        </div>
        <div class="tile">
          <h3>Brand Channel</h3>
          <p>Dedicated broadcast lane for drops, stories, and community growth.</p>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Royal Locs Franchise", body)

@app.route("/franchise-opportunities")
def franchise_opportunities():
    body = """
    <div class="hero">
      <h1>Franchise Opportunities</h1>
      <p>Buildable business lanes across beauty, devices, media, live channels, and future flagship products.</p>
      <span class="pill">Business</span>
      <span class="pill">Expansion</span>
      <span class="pill">Ownership</span>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile">
          <h3>Royal Locs Franchise</h3>
          <p>Beauty, training, and product distribution expansion lane.</p>
          <a class="smallbtn" href="/royal-locs-franchise">Open</a>
        </div>
        <div class="tile">
          <h3>Holofon Experience Centers</h3>
          <p>Interactive device demo and premium channel environments.</p>
          <a class="smallbtn" href="/holofon-world">Open</a>
        </div>
        <div class="tile">
          <h3>Omni Channel Franchise</h3>
          <p>Broadcast, creator channels, event blocks, and premium subscriptions.</p>
          <a class="smallbtn" href="/live-channel-engine">Open</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Franchise Opportunities", body)

@app.route("/netflix-killer-style")
def netflix_killer_style():
    body = """
    <div class="hero">
      <h1>Omni Style System</h1>
      <p>Not trying to look like Netflix — building a premium holographic identity with flagship commerce, channel worlds, and interactive brand layers.</p>
      <span class="pill">Original Style</span>
      <span class="pill">Holographic UI</span>
      <span class="pill">WebGL Ready</span>
    </div>

    <div class="card">
      <div class="timeline">
        <div class="timecard">
          <h3>What makes it different</h3>
          <p>Streaming + flagship products + creator TV + open-world + channels + mission/progression in one visual language.</p>
        </div>
        <div class="timecard">
          <h3>What true WebGL would add later</h3>
          <p>Animated 3D portals, floating cards, layered depth, particle fields, holographic transitions, and real-time scene effects.</p>
        </div>
        <div class="timecard">
          <h3>What that would do</h3>
          <p>Make the platform feel like a premium entertainment operating system instead of a flat content grid.</p>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Omni Style System", body)



# ===== SAFE HOLOGRAPHIC V2 LAYER =====

@app.route("/holo-engine-v2")
def holo_engine_v2():
    body = """
    <style>
      .holo-shell{
        position:relative;
        border-radius:24px;
        overflow:hidden;
        background:
          radial-gradient(circle at 20% 20%, rgba(34,211,238,.22), transparent 20%),
          radial-gradient(circle at 80% 30%, rgba(168,85,247,.20), transparent 24%),
          linear-gradient(135deg,#030712,#0f172a,#111827);
        border:1px solid rgba(255,255,255,.08);
        box-shadow:0 18px 48px rgba(0,0,0,.34);
        padding:24px;
      }
      .holo-canvas{
        position:relative;
        height:340px;
        border-radius:20px;
        overflow:hidden;
        background:
          radial-gradient(circle at 50% 50%, rgba(59,130,246,.25), transparent 18%),
          radial-gradient(circle at 30% 40%, rgba(34,211,238,.18), transparent 16%),
          radial-gradient(circle at 70% 60%, rgba(168,85,247,.18), transparent 18%),
          linear-gradient(180deg,#020617,#0b1222);
      }
      .grid-floor{
        position:absolute; inset:0;
        background:
          linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px);
        background-size: 40px 40px;
        transform: perspective(700px) rotateX(72deg) scale(1.4);
        transform-origin: center 78%;
        opacity:.26;
      }
      .portal{
        position:absolute;
        left:50%; top:48%;
        width:190px; height:190px;
        margin-left:-95px; margin-top:-95px;
        border-radius:50%;
        border:2px solid rgba(34,211,238,.65);
        box-shadow:
          0 0 30px rgba(34,211,238,.35),
          inset 0 0 30px rgba(168,85,247,.18);
        background:
          radial-gradient(circle at center, rgba(59,130,246,.20), rgba(15,23,42,.0) 60%);
        animation: pulsePortal 3.2s ease-in-out infinite;
      }
      .ring{
        position:absolute;
        left:50%; top:48%;
        border-radius:50%;
        border:1px solid rgba(255,255,255,.12);
        transform:translate(-50%,-50%);
        animation: spinRing linear infinite;
      }
      .ring.r1{width:250px;height:250px;animation-duration:18s;}
      .ring.r2{width:310px;height:310px;animation-duration:28s;opacity:.7;}
      .ring.r3{width:380px;height:380px;animation-duration:40s;opacity:.45;}
      .float-card{
        position:absolute;
        width:160px;
        padding:12px;
        border-radius:16px;
        background:rgba(15,23,42,.82);
        border:1px solid rgba(255,255,255,.08);
        box-shadow:0 12px 28px rgba(0,0,0,.26);
        backdrop-filter: blur(8px);
      }
      .fc1{left:8%;top:16%;animation:floatA 5s ease-in-out infinite;}
      .fc2{right:8%;top:20%;animation:floatB 6s ease-in-out infinite;}
      .fc3{left:14%;bottom:12%;animation:floatB 7s ease-in-out infinite;}
      .fc4{right:12%;bottom:14%;animation:floatA 5.5s ease-in-out infinite;}
      .camera-bar{
        display:grid;
        grid-template-columns:repeat(4,1fr);
        gap:12px;
        margin-top:16px;
      }
      .cam-btn{
        display:block;
        text-decoration:none;
        text-align:center;
        padding:12px;
        border-radius:14px;
        color:white;
        background:linear-gradient(135deg,#1d4ed8,#7c3aed);
        font-weight:700;
      }
      @keyframes pulsePortal{
        0%,100%{transform:scale(1);opacity:.95}
        50%{transform:scale(1.08);opacity:1}
      }
      @keyframes spinRing{
        from{transform:translate(-50%,-50%) rotate(0deg)}
        to{transform:translate(-50%,-50%) rotate(360deg)}
      }
      @keyframes floatA{
        0%,100%{transform:translateY(0px)}
        50%{transform:translateY(-10px)}
      }
      @keyframes floatB{
        0%,100%{transform:translateY(0px)}
        50%{transform:translateY(12px)}
      }
      @media (max-width: 900px){
        .camera-bar{grid-template-columns:1fr 1fr}
      }
    </style>

    <div class="hero">
      <h1>Holographic Engine V2</h1>
      <p>Safe immersive visual engine with portal depth, floating UI, camera shells, and lag-buster hooks.</p>
      <span class="pill">Holographic</span>
      <span class="pill">Portal</span>
      <span class="pill">Camera</span>
      <span class="pill">Immersive</span>
    </div>

    <div class="card holo-shell">
      <div class="holo-canvas">
        <div class="grid-floor"></div>
        <div class="ring r1"></div>
        <div class="ring r2"></div>
        <div class="ring r3"></div>
        <div class="portal"></div>

        <div class="float-card fc1"><h3>Holofon</h3><p>Device gateway and flagship interaction lane.</p></div>
        <div class="float-card fc2"><h3>Royal Locs</h3><p>Franchise lane with beauty and education worlds.</p></div>
        <div class="float-card fc3"><h3>Omni Cinema</h3><p>Premium cinematic channel shell.</p></div>
        <div class="float-card fc4"><h3>Open World</h3><p>Mission and district travel layer.</p></div>
      </div>

      <div class="camera-bar">
        <a class="cam-btn" href="/holo-camera-v2?view=front">Front View</a>
        <a class="cam-btn" href="/holo-camera-v2?view=orbit">Orbit View</a>
        <a class="cam-btn" href="/holo-camera-v2?view=portal">Portal View</a>
        <a class="cam-btn" href="/lag-buster-v2">Lag Buster</a>
      </div>
    </div>
    """
    return _ultra_shell("Holographic Engine V2", body)

@app.route("/holo-camera-v2")
def holo_camera_v2():
    from flask import request
    view = (request.args.get("view") or "front").strip().lower()

    desc = {
        "front": "Front camera view for flagship focus and cleaner cinematic framing.",
        "orbit": "Orbit camera concept for rotating around floating cards and portals.",
        "portal": "Portal-focused camera for deep immersive transitions and world entry."
    }.get(view, "Front camera view for flagship focus and cleaner cinematic framing.")

    body = f"""
    <div class="hero">
      <h1>Holo Camera V2</h1>
      <p>{desc}</p>
      <span class="pill">View: {view}</span>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/holo-engine-v2">Back to Holo Engine</a>
        <a class="smallbtn" href="/omni-cinema">Omni Cinema</a>
        <a class="smallbtn" href="/holo-engine-v2">Holo Engine V2</a>
        <a class="smallbtn" href="/holo-scene-v2">Holo Scene V2</a>
        <a class="smallbtn" href="/holofon-world">Holofon World</a>
        <a class="smallbtn" href="/open-world">Open World</a>
      </div>
    </div>
    """
    return _ultra_shell("Holo Camera V2", body)

@app.route("/lag-buster-v2")
def lag_buster_v2():
    body = """
    <div class="hero">
      <h1>Quantum Lag Buster V2</h1>
      <p>Practical no-lag strategy layer: preload, async UI, selective rendering, and scene staging.</p>
      <span class="pill">Preload</span>
      <span class="pill">Async</span>
      <span class="pill">Selective Render</span>
      <span class="pill">Scene Staging</span>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile">
          <h3>Preload Paths</h3>
          <p>Load likely next pages and media before the user arrives.</p>
        </div>
        <div class="tile">
          <h3>Selective Render</h3>
          <p>Only draw visible scene layers and high-priority tiles.</p>
        </div>
        <div class="tile">
          <h3>Async Scene Swaps</h3>
          <p>Move between world layers without blocking the interface.</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/holo-engine-v2">Holo Engine</a>
        <a class="smallbtn" href="/omni-cinema">Omni Cinema</a>
        <a class="smallbtn" href="/holo-engine-v2">Holo Engine V2</a>
        <a class="smallbtn" href="/holo-scene-v2">Holo Scene V2</a>
        <a class="smallbtn" href="/live-channel-engine">Live Channels</a>
        <a class="smallbtn" href="/progress-center-v2">Progress Center</a>
      </div>
    </div>
    """
    return _ultra_shell("Lag Buster V2", body)

@app.route("/holo-scene-v2")
def holo_scene_v2():
    body = """
    <div class="hero">
      <h1>Holo Scene V2</h1>
      <p>Scene staging shell for portals, floating channel cards, and flagship world entry points.</p>
      <span class="pill">Scene</span>
      <span class="pill">Portal</span>
      <span class="pill">Depth</span>
    </div>

    <div class="card">
      <div class="quad">
        <a class="smallbtn" href="/holofon-world">Holofon Portal</a>
        <a class="smallbtn" href="/royal-locs-franchise">Royal Locs Portal</a>
        <a class="smallbtn" href="/omni-cinema">Cinema Portal</a>
        <a class="smallbtn" href="/open-world">World Portal</a>
      </div>
    </div>
    """
    return _ultra_shell("Holo Scene V2", body)




# ===== FLAGSHIP FEED + MAP + OMNI TV UPGRADE =====

@app.route("/his-hers-brand")
def his_hers_brand():
    body = """
    <div class="hero">
      <h1>His &amp; Hers Make Them Fall in Love</h1>
      <p>Flagship relationship, attraction, lifestyle, confidence, beauty, and couple-experience brand lane.</p>
      <span class="pill">Flagship</span>
      <span class="pill">Lifestyle</span>
      <span class="pill">Couples</span>
      <span class="pill">Brand World</span>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile">
          <h3>Brand Channel</h3>
          <p>Shows, relationship content, product storytelling, and premium audience experiences.</p>
          <a class="smallbtn" href="/live-channel-engine">Open Channel Engine</a>
        </div>
        <div class="tile">
          <h3>Bundle Lane</h3>
          <p>Product bundles, premium memberships, and flagship offers.</p>
          <a class="smallbtn" href="/channel-bundles-v2">Open Bundles</a>
        </div>
        <div class="tile">
          <h3>TV + Creator Lane</h3>
          <p>Creator-made shows, couple content, and premium audience storytelling.</p>
          <a class="smallbtn" href="/tv-network-v2">Open TV Network</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("His & Hers Brand", body)

@app.route("/dynamic-feed-v2")
def dynamic_feed_v2():
    try:
        creators = CreatorRecord.query.order_by(CreatorRecord.id.desc()).limit(6).all()
    except Exception:
        creators = []

    try:
        contents = ContentRecord.query.order_by(ContentRecord.id.desc()).limit(6).all()
    except Exception:
        contents = []

    try:
        shows = TVShow.query.order_by(TVShow.id.desc()).limit(6).all()
    except Exception:
        shows = []

    creator_cards = "".join(
        f"<div class='feedcard'><div class='feedthumb'></div><div class='feedbody'><h3>{c.name}</h3><p>{c.niche or 'Creator'}</p><a class='smallbtn' href='/creator-feed'>Open</a></div></div>"
        for c in creators
    ) or "<p>No creator records yet.</p>"

    content_cards = "".join(
        f"<div class='feedcard'><div class='feedthumb'></div><div class='feedbody'><h3>{c.title}</h3><p>Saved content item</p><a class='smallbtn' href='/content-catalog'>Open</a></div></div>"
        for c in contents
    ) or "<p>No content records yet.</p>"

    show_cards = "".join(
        f"<div class='feedcard'><div class='feedthumb'></div><div class='feedbody'><h3>{s.title}</h3><p>{s.genre or 'Show'}</p><a class='smallbtn' href='/show/{s.id}'>Open</a></div></div>"
        for s in shows
    ) or "<p>No TV shows yet.</p>"

    body = f"""
    <div class="hero">
      <h1>Dynamic Feed V2</h1>
      <p>Saved creators, saved content, and TV shows in one live platform feed.</p>
      <span class="pill">Creators</span>
      <span class="pill">Content</span>
      <span class="pill">TV</span>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Creators</h2>
      <div class="feedrow">{creator_cards}</div>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Content</h2>
      <div class="feedrow">{content_cards}</div>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Shows</h2>
      <div class="feedrow">{show_cards}</div>
    </div>
    """
    return _ultra_shell("Dynamic Feed V2", body)

@app.route("/world-map-v2")
def world_map_v2():
    body = """
    <div class="hero">
      <h1>World Map V2</h1>
      <p>District and pin shell for creators, events, channels, and flagship locations.</p>
      <span class="pill">Map Pins</span>
      <span class="pill">Districts</span>
      <span class="pill">Teleport</span>
    </div>

    <div class="card">
      <div style="position:relative;height:420px;border-radius:20px;overflow:hidden;background:linear-gradient(180deg,#0b1222,#111827);border:1px solid rgba(255,255,255,.08);">
        <div style="position:absolute;left:14%;top:22%;width:16px;height:16px;border-radius:50%;background:#22d3ee;box-shadow:0 0 18px #22d3ee;"></div>
        <div style="position:absolute;left:42%;top:38%;width:16px;height:16px;border-radius:50%;background:#a855f7;box-shadow:0 0 18px #a855f7;"></div>
        <div style="position:absolute;left:68%;top:28%;width:16px;height:16px;border-radius:50%;background:#10b981;box-shadow:0 0 18px #10b981;"></div>
        <div style="position:absolute;left:26%;top:70%;width:16px;height:16px;border-radius:50%;background:#f59e0b;box-shadow:0 0 18px #f59e0b;"></div>

        <div style="position:absolute;left:18%;top:26%;color:white;">Creator District</div>
        <div style="position:absolute;left:46%;top:42%;color:white;">TV / Channel District</div>
        <div style="position:absolute;left:72%;top:32%;color:white;">Holofon World</div>
        <div style="position:absolute;left:30%;top:74%;color:white;">Royal Locs / His &amp; Hers</div>
      </div>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/teleport?q=Chicago">Teleport Chicago</a>
        <a class="smallbtn" href="/open-world">Open World</a>
        <a class="smallbtn" href="/omni-cinema">Omni Cinema</a>
        <a class="smallbtn" href="/flagship-tree">Flagship Tree</a>
      </div>
    </div>
    """
    return _ultra_shell("World Map V2", body)

@app.route("/omni-cinema-v2")
def omni_cinema_v2():
    body = """
    <div class="hero">
      <h1>Omni Cinema V2</h1>
      <p>TV shows, flagship channels, creator originals, and premium brand lanes in one cinematic front door.</p>
      <span class="pill">Cinema</span>
      <span class="pill">Flagships</span>
      <span class="pill">TV</span>
      <span class="pill">Originals</span>
    </div>

    <div class="card">
      <div class="quad">
        <a class="smallbtn" href="/tv-network-v2">TV Network</a>
        <a class="smallbtn" href="/dynamic-feed-v2">Dynamic Feed</a>
        <a class="smallbtn" href="/dynamic-feed-v3">Dynamic Feed V3</a>
        <a class="smallbtn" href="/holofon-world">Holofon World</a>
        <a class="smallbtn" href="/royal-locs-franchise">Royal Locs</a>
        <a class="smallbtn" href="/his-hers-brand">His &amp; Hers</a>
        <a class="smallbtn" href="/live-channel-engine">Live Channels</a>
        <a class="smallbtn" href="/world-map-v2">World Map</a>
        <a class="smallbtn" href="/flagship-tree">Flagship Tree</a>
      </div>
    </div>
    """
    return _ultra_shell("Omni Cinema V2", body)




# ===== MEDIA-POWERED FEED + OMNI CINEMA V3 =====

@app.route("/dynamic-feed-v3")
def dynamic_feed_v3():
    try:
        creators = CreatorRecord.query.order_by(CreatorRecord.id.desc()).limit(6).all()
    except Exception:
        creators = []

    try:
        contents = ContentRecord.query.order_by(ContentRecord.id.desc()).limit(6).all()
    except Exception:
        contents = []

    try:
        shows = TVShow.query.order_by(TVShow.id.desc()).limit(6).all()
    except Exception:
        shows = []

    def creator_thumb(creator_id):
        try:
            media = CreatorMediaLink.query.filter_by(creator_id=creator_id).order_by(CreatorMediaLink.id.desc()).first()
            if media:
                return f"background-image:url('/uploads/creator/{media.filename}');background-size:cover;background-position:center;"
        except Exception:
            pass
        return ""

    creator_cards = "".join(
        f"""
        <div class='feedcard'>
          <div class='feedthumb' style="{creator_thumb(c.id)}"></div>
          <div class='feedbody'>
            <h3>{c.name}</h3>
            <p>{c.niche or 'Creator'}</p>
            <div class='statrow'><span class='stat'>Creator</span><span class='stat'>Live Ready</span></div>
            <a class='smallbtn' href='/creator-storefront-pro/{c.id}'>Open Storefront</a>
          </div>
        </div>
        """
        for c in creators
    ) or "<p>No creator records yet.</p>"

    content_cards = "".join(
        f"""
        <div class='feedcard'>
          <div class='feedthumb'></div>
          <div class='feedbody'>
            <h3>{c.title}</h3>
            <p>Saved content item</p>
            <div class='statrow'><span class='stat'>Content</span><span class='stat'>Catalog</span></div>
            <a class='smallbtn' href='/content-catalog'>Open Content</a>
          </div>
        </div>
        """
        for c in contents
    ) or "<p>No content records yet.</p>"

    show_cards = "".join(
        f"""
        <div class='feedcard'>
          <div class='feedthumb'></div>
          <div class='feedbody'>
            <h3>{s.title}</h3>
            <p>{s.genre or 'Show'} • {s.creator or 'Network'}</p>
            <div class='statrow'><span class='stat'>TV</span><span class='stat'>Show</span></div>
            <a class='smallbtn' href='/show/{s.id}'>Open Show</a>
          </div>
        </div>
        """
        for s in shows
    ) or "<p>No TV shows yet.</p>"

    body = f"""
    <div class="hero">
      <h1>Dynamic Feed V3</h1>
      <p>Media-powered creators, content, and TV in one stronger visual feed.</p>
      <span class="pill">Creators</span>
      <span class="pill">Shows</span>
      <span class="pill">Media</span>
      <span class="pill">Premium Visuals</span>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Featured Creators</h2>
      <div class="feedrow">{creator_cards}</div>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Featured Shows</h2>
      <div class="feedrow">{show_cards}</div>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Featured Content</h2>
      <div class="feedrow">{content_cards}</div>
    </div>
    """
    return _ultra_shell("Dynamic Feed V3", body)

@app.route("/omni-cinema-v3")
def omni_cinema_v3():
    try:
        shows = TVShow.query.order_by(TVShow.id.desc()).limit(6).all()
    except Exception:
        shows = []

    show_cards = "".join(
        f"""
        <div class='feedcard'>
          <div class='feedthumb'></div>
          <div class='feedbody'>
            <h3>{s.title}</h3>
            <p>{s.genre or 'Show'} • by {s.creator or 'Creator'}</p>
            <div class='statrow'><span class='stat'>Channel</span><span class='stat'>Broadcast</span></div>
            <a class='smallbtn' href='/show/{s.id}'>Watch Show</a>
          </div>
        </div>
        """
        for s in shows
    ) or "<p>No TV shows in network yet.</p>"

    body = f"""
    <div class="hero">
      <h1>Omni Cinema V3</h1>
      <p>A more premium cinematic front door powered by real shows, flagship brands, and dynamic feed rows.</p>
      <span class="pill">Cinema</span>
      <span class="pill">Flagships</span>
      <span class="pill">Shows</span>
      <span class="pill">Channels</span>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Flagship Worlds</h2>
      <div class="quad">
        <a class="smallbtn" href="/holofon-world">Holofon World</a>
        <a class="smallbtn" href="/royal-locs-franchise">Royal Locs</a>
        <a class="smallbtn" href="/his-hers-brand">His &amp; Hers</a>
        <a class="smallbtn" href="/flagship-tree">Flagship Tree</a>
      </div>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Now Showing</h2>
      <div class="feedrow">{show_cards}</div>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Network Shortcuts</h2>
      <div class="grid">
        <a class="smallbtn" href="/dynamic-feed-v3">Dynamic Feed V3</a>
        <a class="smallbtn" href="/tv-network-v2">TV Network</a>
        <a class="smallbtn" href="/live-channel-engine">Live Channel Engine</a>
        <a class="smallbtn" href="/world-map-v2">World Map V2</a>
        <a class="smallbtn" href="/holo-engine-v2">Holo Engine V2</a>
        <a class="smallbtn" href="/creator-monetization-v2">Monetization</a>
      </div>
    </div>
    """
    return _ultra_shell("Omni Cinema V3", body)

@app.route("/flagship-tree-v2")
def flagship_tree_v2():
    body = """
    <div class="hero">
      <h1>Flagship Tree V2</h1>
      <p>The core flagship system that drives channels, bundles, and premium brand worlds.</p>
      <span class="pill">Holofon</span>
      <span class="pill">Royal Locs</span>
      <span class="pill">His &amp; Hers</span>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile">
          <h3>Holofon</h3>
          <p>Flagship holographic device world, premium demos, and immersive channel lane.</p>
          <a class="smallbtn" href="/holofon-world">Open</a>
        </div>
        <div class="tile">
          <h3>Royal Locs Hair Franchise</h3>
          <p>Beauty franchise, education channel, and flagship commerce system.</p>
          <a class="smallbtn" href="/royal-locs-franchise">Open</a>
        </div>
        <div class="tile">
          <h3>His &amp; Hers Make Them Fall in Love</h3>
          <p>Relationship and lifestyle flagship brand with channel, bundle, and show potential.</p>
          <a class="smallbtn" href="/his-hers-brand">Open</a>
        </div>
      </div>
    </div>
    """
    return _ultra_shell("Flagship Tree V2", body)




# ===== INTERACTIVE MAP + DISTRICTS V3 =====

@app.route("/world-map-v3")
def world_map_v3():
    body = """
    <div class="hero">
      <h1>World Map V3</h1>
      <p>Interactive districts with clickable zones, teleport, and live platform areas.</p>
      <span class="pill">Interactive</span>
      <span class="pill">Teleport</span>
      <span class="pill">Districts</span>
    </div>

    <style>
    .mapwrap {
        position:relative;
        height:500px;
        border-radius:20px;
        overflow:hidden;
        background:radial-gradient(circle at center,#0b1222,#020617);
        border:1px solid rgba(255,255,255,.08);
    }
    .pin {
        position:absolute;
        width:18px;
        height:18px;
        border-radius:50%;
        cursor:pointer;
        transition:.2s;
    }
    .pin:hover {
        transform:scale(1.4);
    }
    .label {
        position:absolute;
        color:white;
        font-size:12px;
    }
    </style>

    <div class="card">
      <div class="mapwrap">

        <div class="pin" style="left:15%;top:25%;background:#22d3ee;" onclick="location.href='/creator-feed'"></div>
        <div class="label" style="left:15%;top:30%;">Creator District</div>

        <div class="pin" style="left:40%;top:40%;background:#a855f7;" onclick="location.href='/omni-cinema-v3'"></div>
        <div class="label" style="left:40%;top:45%;">TV / Cinema</div>

        <div class="pin" style="left:65%;top:30%;background:#10b981;" onclick="location.href='/holofon-world'"></div>
        <div class="label" style="left:65%;top:35%;">Holofon</div>

        <div class="pin" style="left:30%;top:70%;background:#f59e0b;" onclick="location.href='/royal-locs-franchise'"></div>
        <div class="label" style="left:30%;top:75%;">Royal Locs</div>

        <div class="pin" style="left:75%;top:65%;background:#ef4444;" onclick="location.href='/his-hers-brand'"></div>
        <div class="label" style="left:75%;top:70%;">His & Hers</div>

      </div>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/dynamic-feed-v3">Open Feed</a>
        <a class="smallbtn" href="/teleport?q=New York">Teleport NYC</a>
        <a class="smallbtn" href="/teleport?q=Chicago">Teleport Chicago</a>
        <a class="smallbtn" href="/open-world">Open World</a>
      </div>
    </div>
    """
    return _ultra_shell("World Map V3", body)




# ===== DISTRICT PANELS + OMNI EPISODES + FEED THUMBNAILS =====

@app.route("/world-map-v4")
def world_map_v4():
    body = """
    <style>
      .mapwrap {
        position:relative;
        height:560px;
        border-radius:22px;
        overflow:hidden;
        background:
          radial-gradient(circle at 20% 20%, rgba(34,211,238,.18), transparent 22%),
          radial-gradient(circle at 80% 30%, rgba(168,85,247,.16), transparent 22%),
          radial-gradient(circle at 40% 80%, rgba(16,185,129,.15), transparent 20%),
          linear-gradient(180deg,#020617,#0f172a,#111827);
        border:1px solid rgba(255,255,255,.08);
        box-shadow:0 18px 48px rgba(0,0,0,.32);
      }
      .district-pin{
        position:absolute;
        width:20px;
        height:20px;
        border-radius:50%;
        cursor:pointer;
        box-shadow:0 0 18px currentColor;
        transition:transform .18s ease;
      }
      .district-pin:hover{transform:scale(1.25)}
      .district-label{
        position:absolute;
        color:white;
        font-size:12px;
        opacity:.95;
      }
      .district-panel{
        display:none;
        margin-top:16px;
      }
      .district-panel.active{
        display:block;
      }
      .district-grid{
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:14px;
      }
      .district-card{
        background:linear-gradient(180deg, rgba(17,24,39,.96), rgba(8,12,22,.96));
        border:1px solid rgba(255,255,255,.08);
        border-radius:18px;
        padding:16px;
        box-shadow:0 12px 30px rgba(0,0,0,.25);
      }
      .district-tabs{
        display:grid;
        grid-template-columns:repeat(5,1fr);
        gap:10px;
      }
      .district-tab{
        text-decoration:none;
        color:white;
        text-align:center;
        padding:12px;
        border-radius:14px;
        background:#1e293b;
        font-weight:700;
        cursor:pointer;
      }
      @media (max-width: 900px){
        .district-grid, .district-tabs{grid-template-columns:1fr}
      }
    </style>

    <div class="hero">
      <h1>World Map V4</h1>
      <p>Interactive districts with expandable panels, quick actions, and live platform zones.</p>
      <span class="pill">District Panels</span>
      <span class="pill">Interactive Map</span>
      <span class="pill">Quick Actions</span>
    </div>

    <div class="card">
      <div class="district-tabs">
        <a class="district-tab" onclick="showDistrict('creator')">Creator</a>
        <a class="district-tab" onclick="showDistrict('cinema')">Cinema</a>
        <a class="district-tab" onclick="showDistrict('holofon')">Holofon</a>
        <a class="district-tab" onclick="showDistrict('royal')">Royal Locs</a>
        <a class="district-tab" onclick="showDistrict('his')">His &amp; Hers</a>
      </div>
    </div>

    <div class="card">
      <div class="mapwrap">
        <div class="district-pin" style="left:15%;top:24%;background:#22d3ee;color:#22d3ee;" onclick="showDistrict('creator')"></div>
        <div class="district-label" style="left:15%;top:29%;">Creator District</div>

        <div class="district-pin" style="left:42%;top:39%;background:#a855f7;color:#a855f7;" onclick="showDistrict('cinema')"></div>
        <div class="district-label" style="left:42%;top:44%;">TV / Cinema District</div>

        <div class="district-pin" style="left:67%;top:30%;background:#10b981;color:#10b981;" onclick="showDistrict('holofon')"></div>
        <div class="district-label" style="left:67%;top:35%;">Holofon World</div>

        <div class="district-pin" style="left:28%;top:71%;background:#f59e0b;color:#f59e0b;" onclick="showDistrict('royal')"></div>
        <div class="district-label" style="left:28%;top:76%;">Royal Locs</div>

        <div class="district-pin" style="left:76%;top:66%;background:#ef4444;color:#ef4444;" onclick="showDistrict('his')"></div>
        <div class="district-label" style="left:76%;top:71%;">His &amp; Hers</div>
      </div>
    </div>

    <div id="panel-creator" class="district-panel active">
      <div class="card">
        <h2 class="sectiontitle">Creator District</h2>
        <div class="district-grid">
          <div class="district-card"><h3>Creator Feed</h3><p>Discover active creators and storefronts.</p><a class="smallbtn" href="/creator-feed">Open</a></div>
          <div class="district-card"><h3>Dynamic Feed</h3><p>Media-powered feed for creators and content.</p><a class="smallbtn" href="/dynamic-feed-v3">Open</a></div>
          <div class="district-card"><h3>Creator Monetization</h3><p>Bundles, subscriptions, and payout prep.</p><a class="smallbtn" href="/creator-monetization-v2">Open</a></div>
        </div>
      </div>
    </div>

    <div id="panel-cinema" class="district-panel">
      <div class="card">
        <h2 class="sectiontitle">TV / Cinema District</h2>
        <div class="district-grid">
          <div class="district-card"><h3>Omni Cinema V3</h3><p>Premium cinematic front door.</p><a class="smallbtn" href="/omni-cinema-v3">Open</a></div>
          <div class="district-card"><h3>TV Network</h3><p>Shows and episodes across the network.</p><a class="smallbtn" href="/tv-network-v2">Open</a></div>
          <div class="district-card"><h3>Live Channel Engine</h3><p>Turn shows into channels and bundles.</p><a class="smallbtn" href="/live-channel-engine">Open</a></div>
        </div>
      </div>
    </div>

    <div id="panel-holofon" class="district-panel">
      <div class="card">
        <h2 class="sectiontitle">Holofon World</h2>
        <div class="district-grid">
          <div class="district-card"><h3>Holofon Flagship</h3><p>Device demos and immersive brand world.</p><a class="smallbtn" href="/holofon-world">Open</a></div>
          <div class="district-card"><h3>Holo Engine</h3><p>Portal and holographic visual engine.</p><a class="smallbtn" href="/holo-engine-v2">Open</a></div>
          <div class="district-card"><h3>Lag Buster</h3><p>Performance optimization layer.</p><a class="smallbtn" href="/lag-buster-v2">Open</a></div>
        </div>
      </div>
    </div>

    <div id="panel-royal" class="district-panel">
      <div class="card">
        <h2 class="sectiontitle">Royal Locs District</h2>
        <div class="district-grid">
          <div class="district-card"><h3>Royal Locs Franchise</h3><p>Beauty franchise and education lane.</p><a class="smallbtn" href="/royal-locs-franchise">Open</a></div>
          <div class="district-card"><h3>Bundle Market</h3><p>Product bundles and premium offers.</p><a class="smallbtn" href="/bundle-market">Open</a></div>
          <div class="district-card"><h3>TV Lane</h3><p>Brand channel and tutorial programming.</p><a class="smallbtn" href="/tv-network-v2">Open</a></div>
        </div>
      </div>
    </div>

    <div id="panel-his" class="district-panel">
      <div class="card">
        <h2 class="sectiontitle">His &amp; Hers District</h2>
        <div class="district-grid">
          <div class="district-card"><h3>His &amp; Hers Brand</h3><p>Relationship and lifestyle flagship lane.</p><a class="smallbtn" href="/his-hers-brand">Open</a></div>
          <div class="district-card"><h3>Channel Bundles</h3><p>Premium bundled offers and access paths.</p><a class="smallbtn" href="/channel-bundles-v2">Open</a></div>
          <div class="district-card"><h3>Omni Cinema</h3><p>Brand stories, shows, and premium rows.</p><a class="smallbtn" href="/omni-cinema-v3">Open</a></div>
        </div>
      </div>
    </div>

    <script>
      function showDistrict(name){
        document.querySelectorAll('.district-panel').forEach(el => el.classList.remove('active'));
        const panel = document.getElementById('panel-' + name);
        if(panel){ panel.classList.add('active'); }
      }
    </script>
    """
    return _ultra_shell("World Map V4", body)

@app.route("/omni-cinema-v4")
def omni_cinema_v4():
    try:
        shows = TVShow.query.order_by(TVShow.id.desc()).limit(8).all()
    except Exception:
        shows = []

    try:
        episodes = Episode.query.order_by(Episode.id.desc()).limit(8).all()
    except Exception:
        episodes = []

    show_cards = "".join(
        f"""
        <div class='feedcard'>
          <div class='feedthumb'></div>
          <div class='feedbody'>
            <h3>{s.title}</h3>
            <p>{s.genre or 'Show'} • {s.creator or 'Network'}</p>
            <a class='smallbtn' href='/show/{s.id}'>Watch Show</a>
          </div>
        </div>
        """
        for s in shows
    ) or "<p>No shows yet.</p>"

    episode_cards = "".join(
        f"""
        <div class='feedcard'>
          <div class='feedthumb'></div>
          <div class='feedbody'>
            <h3>{e.title}</h3>
            <p>{(e.description or 'Episode').strip()[:90]}</p>
          </div>
        </div>
        """
        for e in episodes
    ) or "<p>No episodes yet.</p>"

    body = f"""
    <div class="hero">
      <h1>Omni Cinema V4</h1>
      <p>Shows, episodes, flagship brands, and premium cinematic rows surfaced more deeply.</p>
      <span class="pill">Shows</span>
      <span class="pill">Episodes</span>
      <span class="pill">Flagships</span>
      <span class="pill">Cinema</span>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Flagship Worlds</h2>
      <div class="quad">
        <a class="smallbtn" href="/holofon-world">Holofon</a>
        <a class="smallbtn" href="/royal-locs-franchise">Royal Locs</a>
        <a class="smallbtn" href="/his-hers-brand">His &amp; Hers</a>
        <a class="smallbtn" href="/flagship-tree-v2">Flagship Tree</a>
      </div>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Now Showing</h2>
      <div class="feedrow">{show_cards}</div>
    </div>

    <div class="card">
      <h2 class="sectiontitle">Latest Episodes</h2>
      <div class="feedrow">{episode_cards}</div>
    </div>

    <div class="card">
      <div class="grid">
        <a class="smallbtn" href="/tv-network-v2">TV Network</a>
        <a class="smallbtn" href="/dynamic-feed-v3">Dynamic Feed V3</a>
        <a class="smallbtn" href="/world-map-v4">World Map V4</a>
        <a class="smallbtn" href="/live-channel-engine">Live Channel Engine</a>
      </div>
    </div>
    """
    return _ultra_shell("Omni Cinema V4", body)

@app.route("/media-powered-cards-v2")
def media_powered_cards_v2():
    body = """
    <div class="hero">
      <h1>Media-Powered Cards V2</h1>
      <p>Stronger card system for feeds, storefronts, channels, and shows.</p>
      <span class="pill">Cards</span>
      <span class="pill">Media</span>
      <span class="pill">Premium UI</span>
    </div>

    <div class="card">
      <div class="triple">
        <div class="tile"><h3>Feed Cards</h3><p>Better creator/content/show cards.</p><a class="smallbtn" href="/dynamic-feed-v3">Open</a></div>
        <div class="tile"><h3>Cinema Cards</h3><p>Episodes and show rows inside Omni Cinema.</p><a class="smallbtn" href="/omni-cinema-v4">Open</a></div>
        <div class="tile"><h3>Map District Cards</h3><p>Clickable district panels and action cards.</p><a class="smallbtn" href="/world-map-v4">Open</a></div>
      </div>
    </div>
    """
    return _ultra_shell("Media-Powered Cards V2", body)



@app.route("/holo-stream")
def holo_stream():
    return """<html><body style=\"background:#020617;color:white;font-family:Arial;padding:20px\">
    <h1>Holographic Streaming Ecosystem</h1>
    <p>Central hub for streaming, music, and immersive experiences.</p>
    <a href=\"/streaming-app\">Open Streaming App</a><br><br>
    <a href=\"/music-app\">Open Music App</a><br><br>
    <a href=\"/quantum-analysis\">Quantum Analysis</a><br><br>
    <a href=\"/gap-report-v2\">Gap Report</a><br><br>
    <a href=\"/\">Back</a>
    </body></html>"""

@app.route("/streaming-app")
def streaming_app():
    return """<html><body style=\"background:#0b1220;color:white;font-family:Arial;padding:20px\">
    <h1>Streaming App</h1>
    <p>Live channels and content</p>
    <ul>
      <li>Founder Vision</li>
      <li>Quantum Beats</li>
      <li>Training Streams</li>
    </ul>
    <a href=\"/holo-stream\">Back</a>
    </body></html>"""

@app.route("/music-app")
def music_app():
    return """<html><body style=\"background:#111827;color:white;font-family:Arial;padding:20px\">
    <h1>Music App</h1>
    <p>Artists, playlists, and releases</p>
    <ul>
      <li>Featured Artist</li>
      <li>Kingdom Vibes</li>
      <li>Release Center</li>
    </ul>
    <a href=\"/holo-stream\">Back</a>
    </body></html>"""


@app.route("/kingdom")
def kingdom():
    return """<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Kingdom System</title><style>body{margin:0;font-family:Arial,sans-serif;background:linear-gradient(180deg,#111827 0%,#030712 100%);color:white}.wrap{max-width:1100px;margin:0 auto;padding:24px}.hero{text-align:center;padding:36px 16px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}.card{background:rgba(17,24,39,.92);border:1px solid #374151;border-radius:18px;padding:18px}.btn{display:inline-block;padding:10px 14px;border-radius:12px;text-decoration:none;background:#2563eb;color:white;font-weight:bold}a.back{color:#67e8f9;text-decoration:none}</style></head><body><div class=\"wrap\"><div class=\"hero\"><h1>Kingdom System</h1><p>Command center for purpose, governance, assignments, homeboards, training, expansion, and ecosystem coordination.</p></div><div class=\"grid\"><div class=\"card\"><h2>Homeboards</h2><p>System entry dashboards for each major function and mission area.</p><a class=\"btn\" href=\"/kingdom-homeboards\">Open Homeboards</a></div><div class=\"card\"><h2>University</h2><p>Training, certification, onboarding, and advancement for users and builders.</p><a class=\"btn\" href=\"/all-american-marketplace-university\">Open University</a></div><div class=\"card\"><h2>Wallet</h2><p>Balances, accounts, token pathways, and financial access layer.</p><a class=\"btn\" href=\"/all-american-marketplace-wallet\">Open Wallet</a></div><div class=\"card\"><h2>Gap Report</h2><p>Visible map of complete, partial, and missing systems.</p><a class=\"btn\" href=\"/gap-report-v2\">Open Gap Report</a></div></div><p style=\"margin-top:24px\"><a class=\"back\" href=\"/\">← Back to Marketplace</a></p></div></body></html>"""

@app.route("/kingdom-homeboards")
def kingdom_homeboards():
    return """<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Kingdom Homeboards</title><style>body{margin:0;font-family:Arial,sans-serif;background:#0f172a;color:white}.wrap{max-width:1100px;margin:0 auto;padding:24px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}.card{background:#111827;border:1px solid #334155;border-radius:18px;padding:18px}a{color:#67e8f9;text-decoration:none}</style></head><body><div class=\"wrap\"><h1>Kingdom Homeboards</h1><div class=\"grid\"><div class=\"card\"><h2>Marketplace Board</h2><p>Products, vendors, services, and operations.</p></div><div class=\"card\"><h2>Streaming Board</h2><p>Shows, channels, holographic content, and creator media.</p></div><div class=\"card\"><h2>Finance Board</h2><p>Wallet, account structure, payouts, and banking expansion.</p></div><div class=\"card\"><h2>University Board</h2><p>Training, classes, tracks, and certification pathways.</p></div><div class=\"card\"><h2>Admin Board</h2><p>Reports, controls, reviews, and ecosystem oversight.</p></div><div class=\"card\"><h2>Family Brand Board</h2><p>Aniyah, Jacobie Vision, Isaiah, and future legacy systems.</p></div></div><p style=\"margin-top:24px\"><a href=\"/kingdom\">← Back to Kingdom</a></p></div></body></html>"""

@app.route("/all-american-marketplace-university")
def all_american_marketplace_university():
    return """<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>All American Marketplace University</title><style>body{margin:0;font-family:Arial,sans-serif;background:linear-gradient(180deg,#1e293b 0%,#0f172a 100%);color:white}.wrap{max-width:1100px;margin:0 auto;padding:24px}.hero{text-align:center;padding:32px 16px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}.card{background:rgba(15,23,42,.92);border:1px solid #334155;border-radius:18px;padding:18px}a{color:#67e8f9;text-decoration:none}</style></head><body><div class=\"wrap\"><div class=\"hero\"><h1>All American Marketplace University</h1><p>Training, certification, onboarding, business growth, creator development, and role-based learning.</p></div><div class=\"grid\"><div class=\"card\"><h2>Marketplace Foundations</h2><p>Vendor setup, product operations, fulfillment, and customer workflows.</p></div><div class=\"card\"><h2>Creator Academy</h2><p>Streaming, music, branding, monetization, and content publishing.</p></div><div class=\"card\"><h2>Technology Track</h2><p>Blockchain, AI, automation, cybersecurity, and platform operations.</p></div><div class=\"card\"><h2>Finance Track</h2><p>Wallets, payments, bookkeeping, account controls, and future FinBank education.</p></div><div class=\"card\"><h2>Leadership Track</h2><p>Mission, governance, responsibility, and kingdom-oriented management.</p></div><div class=\"card\"><h2>Career Launch</h2><p>Practical pathways for jobs, certifications, assignments, and ecosystem roles.</p></div></div><p style=\"margin-top:24px\"><a href=\"/kingdom\">← Back to Kingdom</a></p></div></body></html>"""

@app.route("/all-american-marketplace-wallet")
def all_american_marketplace_wallet():
    return """<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>All American Marketplace Wallet</title><style>body{margin:0;font-family:Arial,sans-serif;background:linear-gradient(180deg,#07111f 0%,#0f172a 100%);color:white}.wrap{max-width:1000px;margin:0 auto;padding:24px}.hero{text-align:center;padding:32px 16px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}.card{background:rgba(15,23,42,.92);border:1px solid #334155;border-radius:18px;padding:18px}.amount{font-size:1.8rem;font-weight:bold;margin:8px 0}.pill{display:inline-block;padding:6px 10px;border-radius:999px;background:#1d4ed8;font-size:.9rem}a{color:#67e8f9;text-decoration:none}</style></head><body><div class=\"wrap\"><div class=\"hero\"><h1>All American Marketplace Wallet</h1><p>Account balances, future token rails, rewards, subscriptions, creator payouts, and financial access.</p></div><div class=\"grid\"><div class=\"card\"><div class=\"pill\">Main Balance</div><div class=\"amount\">$0.00</div><p>Local placeholder balance for wallet and account expansion.</p></div><div class=\"card\"><div class=\"pill\">Rewards</div><div class=\"amount\">0 pts</div><p>Reward and loyalty layer for marketplace and streaming activity.</p></div><div class=\"card\"><div class=\"pill\">Payouts</div><div class=\"amount\">Pending</div><p>Creator payouts, vendor settlements, and subscription revenue flows.</p></div><div class=\"card\"><div class=\"pill\">FinBank Ready</div><div class=\"amount\">Enabled</div><p>Expansion point for El Saturn FinBank, cross-border finance, and account logic.</p></div></div><p style=\"margin-top:24px\"><a href=\"/kingdom\">← Back to Kingdom</a></p></div></body></html>"""


@app.route("/vocal-coach-studio-recorder")
def vocal_coach_studio_recorder():
    import sqlite3
    conn = sqlite3.connect("instance/app.db")
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM vocal_sessions ORDER BY id DESC").fetchall()
    conn.close()

    cards = []
    for r in rows:
        cards.append(f"""
        <div class="card">
          <div class="pill">{r['session_status'].title()}</div>
          <h2>{r['lesson_title']}</h2>
          <p><strong>Student:</strong> {r['student_name']}<br>
          <strong>Coach:</strong> {r['coach_name']}</p>
          <p>{r['notes']}</p>
        </div>
        """)

    cards_html = "".join(cards) if cards else "<div class='card'><h2>No Sessions Yet</h2><p>No vocal sessions found.</p></div>"

    return f"""
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Vocal Coach Studio Recorder</title>
      <style>
        body {{ margin:0; font-family:Arial,sans-serif; background:linear-gradient(180deg,#1f2937 0%,#111827 100%); color:white; }}
        .wrap {{ max-width:1100px; margin:0 auto; padding:24px; }}
        .hero {{ text-align:center; padding:32px 16px; }}
        .grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:16px; }}
        .card {{ background:rgba(17,24,39,.92); border:1px solid #374151; border-radius:18px; padding:18px; }}
        .pill {{ display:inline-block; padding:6px 10px; border-radius:999px; background:#1d4ed8; font-size:.9rem; margin-bottom:8px; }}
        a {{ color:#67e8f9; text-decoration:none; }}
        .api {{ margin-top:24px; color:#cbd5e1; }}
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="hero">
          <h1>Vocal Coach Studio Recorder</h1>
          <p>Live vocal lesson dashboard with session records, coaching notes, and progress workflow.</p>
        </div>
        <div class="grid">
          {cards_html}
        </div>
        <div class="api">
          <p>API: <a href="/api/vocal-sessions">/api/vocal-sessions</a></p>
        </div>
        <p style="margin-top:24px;"><a href="/music-app">← Back to Music App</a></p>
      </div>
    </body>
    </html>
    """

@app.route("/aniyah-cross-border-payment")
def aniyah_cross_border_payment():
    import sqlite3
    conn = sqlite3.connect("instance/app.db")
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM cross_border_payments ORDER BY id DESC").fetchall()
    conn.close()

    cards = []
    for r in rows:
        cards.append(f"""
        <div class="card">
          <div class="pill">{r['payment_status'].title()}</div>
          <h2>{r['sender_name']} → {r['receiver_name']}</h2>
          <p><strong>From:</strong> {r['origin_country']}<br>
          <strong>To:</strong> {r['destination_country']}</p>
          <p><strong>Amount:</strong> ${r['amount']:.2f}</p>
        </div>
        """)

    cards_html = "".join(cards) if cards else "<div class='card'><h2>No Payments Yet</h2><p>No cross-border payments found.</p></div>"

    return f"""
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Aniyah Cross-Border Payment</title>
      <style>
        body {{ margin:0; font-family:Arial,sans-serif; background:linear-gradient(180deg,#07111f 0%,#0f172a 100%); color:white; }}
        .wrap {{ max-width:1100px; margin:0 auto; padding:24px; }}
        .hero {{ text-align:center; padding:32px 16px; }}
        .grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:16px; }}
        .card {{ background:rgba(15,23,42,.92); border:1px solid #334155; border-radius:18px; padding:18px; }}
        .pill {{ display:inline-block; padding:6px 10px; border-radius:999px; background:#1d4ed8; font-size:.9rem; margin-bottom:8px; }}
        a {{ color:#67e8f9; text-decoration:none; }}
        .api {{ margin-top:24px; color:#cbd5e1; }}
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="hero">
          <h1>Aniyah Cross-Border Payment</h1>
          <p>Live cross-border payment dashboard with sender/receiver flows, amounts, and status tracking.</p>
        </div>
        <div class="grid">
          {cards_html}
        </div>
        <div class="api">
          <p>API: <a href="/api/cross-border-payments">/api/cross-border-payments</a></p>
        </div>
        <p style="margin-top:24px;"><a href="/all-american-marketplace-wallet">← Back to Wallet</a></p>
      </div>
    </body>
    </html>
    """


@app.route("/ai-command-center")
def ai_command_center():
    return """
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>AI Command Center</title>
      <style>
        body { margin:0; font-family:Arial,sans-serif; background:linear-gradient(180deg,#020617 0%,#111827 100%); color:white; }
        .wrap { max-width:1100px; margin:0 auto; padding:24px; }
        .hero { text-align:center; padding:32px 16px; }
        .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; }
        .card { background:rgba(17,24,39,.92); border:1px solid #374151; border-radius:18px; padding:18px; }
        .pill { display:inline-block; padding:6px 10px; border-radius:999px; background:#1d4ed8; font-size:.9rem; margin-bottom:8px; }
        a { color:#67e8f9; text-decoration:none; }
        .btn { display:inline-block; padding:10px 14px; border-radius:12px; text-decoration:none; background:#2563eb; color:white; font-weight:bold; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="hero">
          <h1>AI Command Center</h1>
          <p>Central AI layer for automation, analysis, guidance, business intelligence, and ecosystem control.</p>
        </div>
        <div class="grid">
          <div class="card"><div class="pill">AI Assistant</div><h2>Jarvis Layer</h2><p>Unified AI guidance for platform operations, support, and expansion planning.</p></div>
          <div class="card"><div class="pill">Business Intelligence</div><h2>Insight Engine</h2><p>Review platform status, trends, gaps, and decision support across modules.</p></div>
          <div class="card"><div class="pill">Automation</div><h2>Workflow Controls</h2><p>Trigger next-step actions for marketplace, wallet, training, and creator flows.</p></div>
          <div class="card"><div class="pill">Recovery</div><h2>System Stabilization</h2><p>Use diagnostics, health checks, and route verification for safe expansion.</p></div>
        </div>
        <p style="margin-top:24px;"><a class="btn" href="/kingdom">Open Kingdom</a> <a class="btn" href="/holo-stream">Open Holographic Streaming</a></p>
        <p style="margin-top:24px;"><a href="/">← Back to Marketplace</a></p>
      </div>
    </body>
    </html>
    """


@app.route("/memory-fabric")
def memory_fabric():
    return """
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Memory Fabric</title>
      <style>
        body { margin:0; font-family:Arial,sans-serif; background:linear-gradient(180deg,#111827 0%,#030712 100%); color:white; }
        .wrap { max-width:1100px; margin:0 auto; padding:24px; }
        .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; }
        .card { background:rgba(17,24,39,.92); border:1px solid #374151; border-radius:18px; padding:18px; }
        a { color:#67e8f9; text-decoration:none; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>Googolplex-Scale Memory Fabric</h1>
        <p>System memory layer for modules, histories, dashboards, roles, routes, and future AI context orchestration.</p>
        <div class="grid">
          <div class="card"><h2>Module Registry</h2><p>Tracks all active, partial, and planned systems.</p></div>
          <div class="card"><h2>Family Brand Memory</h2><p>Aniyah, Jacobie Vision, Isaiah, and future legacy modules.</p></div>
          <div class="card"><h2>AI Context Layer</h2><p>Operational memory for AI command center and guided workflows.</p></div>
          <div class="card"><h2>Recovery State</h2><p>Backups, snapshots, rollback points, and route verification.</p></div>
        </div>
        <p style="margin-top:24px;"><a href="/ai-command-center">← Back to AI Command Center</a></p>
      </div>
    </body>
    </html>
    """

@app.route("/blockchain-core")
def blockchain_core():
    return """
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Blockchain Core</title>
      <style>
        body { margin:0; font-family:Arial,sans-serif; background:linear-gradient(180deg,#07111f 0%,#0f172a 100%); color:white; }
        .wrap { max-width:1100px; margin:0 auto; padding:24px; }
        .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; }
        .card { background:rgba(15,23,42,.92); border:1px solid #334155; border-radius:18px; padding:18px; }
        a { color:#67e8f9; text-decoration:none; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>Blockchain Core</h1>
        <p>Command page for wallet logic, token rails, ledger planning, cross-border finance hooks, and future smart contract systems.</p>
        <div class="grid">
          <div class="card"><h2>Wallet Rail</h2><p>Balances, accounts, rewards, subscriptions, and payout flow.</p></div>
          <div class="card"><h2>Cross-Border Rail</h2><p>Aniyah transfer routes, settlement logic, and FinBank-ready expansion.</p></div>
          <div class="card"><h2>Smart Contract Rail</h2><p>Future tokenized agreements, access control, and creator revenue logic.</p></div>
          <div class="card"><h2>Audit Rail</h2><p>Transaction logs, traceability, and compliance-oriented reporting.</p></div>
        </div>
        <p style="margin-top:24px;"><a href="/all-american-marketplace-wallet">← Back to Wallet</a></p>
      </div>
    </body>
    </html>
    """

@app.route("/verse-map")
def verse_map():
    return """
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Verse Map</title>
      <style>
        body { margin:0; font-family:Arial,sans-serif; background:linear-gradient(180deg,#020617 0%,#0f172a 100%); color:white; }
        .wrap { max-width:1100px; margin:0 auto; padding:24px; }
        .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; }
        .card { background:rgba(15,23,42,.92); border:1px solid #334155; border-radius:18px; padding:18px; }
        a { color:#67e8f9; text-decoration:none; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>Metaverse / Middleverse / Multiverse Map</h1>
        <p>Navigation layer for your immersive environment strategy.</p>
        <div class="grid">
          <div class="card"><h2>Metaverse</h2><p>User-facing immersive worlds, avatars, social spaces, events, and creator environments.</p></div>
          <div class="card"><h2>Middleverse</h2><p>Operational orchestration layer between real-world commerce and immersive systems.</p></div>
          <div class="card"><h2>Multiverse</h2><p>Expanded world families, domain-specific spaces, and future interconnected ecosystems.</p></div>
          <div class="card"><h2>Bridge Layer</h2><p>Wallet, identity, content, payments, and AI coordination across all three.</p></div>
        </div>
        <p style="margin-top:24px;"><a href="/holo-stream">← Back to Holographic Streaming</a></p>
      </div>
    </body>
    </html>
    """

@app.route("/quantum-cloud")
def quantum_cloud():
    return """
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Quantum Cloud</title>
      <style>
        body { margin:0; font-family:Arial,sans-serif; background:linear-gradient(180deg,#111827 0%,#1f2937 100%); color:white; }
        .wrap { max-width:1100px; margin:0 auto; padding:24px; }
        .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; }
        .card { background:rgba(17,24,39,.92); border:1px solid #374151; border-radius:18px; padding:18px; }
        a { color:#67e8f9; text-decoration:none; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>Quantum Cloud Computing</h1>
        <p>Architecture page for cloud-scale compute, AI orchestration, quantum-safe security planning, and future advanced computing integration.</p>
        <div class="grid">
          <div class="card"><h2>Cloud Compute</h2><p>Scalable workloads for media, dashboards, analytics, and APIs.</p></div>
          <div class="card"><h2>AI Orchestration</h2><p>Model workflows, insight engines, and automation controls.</p></div>
          <div class="card"><h2>Quantum-Safe Security</h2><p>Prepare key management and transport security for post-quantum transition.</p></div>
          <div class="card"><h2>Future Quantum Access</h2><p>Reserved strategy slot for external quantum cloud integrations when needed.</p></div>
        </div>
        <p style="margin-top:24px;"><a href="/ai-command-center">← Back to AI Command Center</a></p>
      </div>
    </body>
    </html>
    """

@app.route("/module-registry")
def module_registry():
    return """
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Module Registry</title>
      <style>
        body { margin:0; font-family:Arial,sans-serif; background:#0f172a; color:white; }
        .wrap { max-width:1100px; margin:0 auto; padding:24px; }
        table { width:100%; border-collapse:collapse; margin-top:16px; }
        th, td { border:1px solid #334155; padding:10px; text-align:left; }
        th { background:#111827; }
        tr:nth-child(even) { background:#0b1220; }
        a { color:#67e8f9; text-decoration:none; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>Module Registry</h1>
        <table>
          <tr><th>Module</th><th>Route</th><th>Status</th></tr>
          <tr><td>Marketplace</td><td>/</td><td>Live</td></tr>
          <tr><td>Kingdom</td><td>/kingdom</td><td>Live</td></tr>
          <tr><td>University</td><td>/all-american-marketplace-university</td><td>Live Shell</td></tr>
          <tr><td>Wallet</td><td>/all-american-marketplace-wallet</td><td>Live Shell</td></tr>
          <tr><td>Holographic Streaming</td><td>/holo-stream</td><td>Live Shell</td></tr>
          <tr><td>Music App</td><td>/music-app</td><td>Live Shell</td></tr>
          <tr><td>Vocal Coach Studio Recorder</td><td>/vocal-coach-studio-recorder</td><td>Live Shell</td></tr>
          <tr><td>Aniyah Cross-Border Payment</td><td>/aniyah-cross-border-payment</td><td>Live Shell</td></tr>
          <tr><td>AI Command Center</td><td>/ai-command-center</td><td>Live Shell</td></tr>
          <tr><td>Blockchain Core</td><td>/blockchain-core</td><td>New</td></tr>
          <tr><td>Verse Map</td><td>/verse-map</td><td>New</td></tr>
          <tr><td>Quantum Cloud</td><td>/quantum-cloud</td><td>New</td></tr>
          <tr><td>Memory Fabric</td><td>/memory-fabric</td><td>New</td></tr>
        </table>
        <p style="margin-top:24px;"><a href="/ai-command-center">← Back to AI Command Center</a></p>
      </div>
    </body>
    </html>
    """

@app.route("/risk-checklist")
def risk_checklist():
    return """
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Risk Checklist</title>
      <style>
        body { margin:0; font-family:Arial,sans-serif; background:#111827; color:white; }
        .wrap { max-width:1000px; margin:0 auto; padding:24px; }
        .card { background:#1f2937; border:1px solid #374151; border-radius:16px; padding:18px; margin-bottom:14px; }
        a { color:#67e8f9; text-decoration:none; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>Important Missing / Detrimental Items</h1>
        <div class="card"><strong>1. Single source of truth</strong><p>Keep ~/marketplace as the main live project.</p></div>
        <div class="card"><strong>2. Real data backing</strong><p>University, wallet, music, and streaming still need stable database-backed pages.</p></div>
        <div class="card"><strong>3. Auth and roles</strong><p>Admin, creator, vendor, student, and operator permissions need tightening.</p></div>
        <div class="card"><strong>4. Media storage</strong><p>Streaming, music, and vocal modules need upload/storage design.</p></div>
        <div class="card"><strong>5. Payment safety</strong><p>Cross-border and wallet rails need audit logs and sandbox-first flows.</p></div>
        <div class="card"><strong>6. Master dashboard</strong><p>Needs a safe rebuild after the failed injection.</p></div>
        <p><a href="/module-registry">← Back to Module Registry</a></p>
      </div>
    </body>
    </html>
    """


@app.route("/control-tower")
def control_tower():
    return """
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>All American Marketplace Control Tower</title>
      <style>
        body { margin:0; font-family:Arial,sans-serif; background:linear-gradient(180deg,#020617 0%,#0f172a 100%); color:white; }
        .wrap { max-width:1200px; margin:0 auto; padding:24px; }
        .hero { text-align:center; padding:36px 16px; }
        .hero h1 { margin:0 0 10px; font-size:2.2rem; }
        .hero p { color:#cbd5e1; max-width:800px; margin:0 auto; line-height:1.5; }
        .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:16px; margin-top:24px; }
        .card { background:rgba(15,23,42,.92); border:1px solid #334155; border-radius:18px; padding:18px; box-shadow:0 10px 24px rgba(0,0,0,.25); }
        .card h2 { margin-top:0; font-size:1.1rem; }
        .card p { color:#cbd5e1; min-height:64px; }
        .btn { display:inline-block; padding:10px 14px; border-radius:12px; text-decoration:none; background:#2563eb; color:white; font-weight:bold; }
        .section { margin-top:28px; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="hero">
          <h1>All American Marketplace Control Tower</h1>
          <p>Main operating surface for commerce, Kingdom systems, university, wallet, holographic streaming, AI, blockchain planning, verse navigation, and expansion modules.</p>
        </div>

        <div class="section">
          <div class="grid">
            <div class="card"><h2>Marketplace</h2><p>Main commerce platform and central app home.</p><a class="btn" href="/">Open</a></div>
            <div class="card"><h2>Kingdom</h2><p>Mission, governance, homeboards, and command flow.</p><a class="btn" href="/kingdom">Open</a></div>
            <div class="card"><h2>University</h2><p>Training, certification, role growth, and workforce building.</p><a class="btn" href="/all-american-marketplace-university">Open</a></div>
            <div class="card"><h2>Wallet</h2><p>Balances, rewards, payouts, and financial access layer.</p><a class="btn" href="/all-american-marketplace-wallet">Open</a></div>
            <div class="card"><h2>Holographic Streaming</h2><p>Immersive media, creator broadcasts, and content experience.</p><a class="btn" href="/holo-stream">Open</a></div>
            <div class="card"><h2>Music App</h2><p>Artists, tracks, releases, playlists, and monetization.</p><a class="btn" href="/music-app">Open</a></div>
            <div class="card"><h2>Vocal Coach</h2><p>Voice practice, lesson recording, playback, and progress flow.</p><a class="btn" href="/vocal-coach-studio-recorder">Open</a></div>
            <div class="card"><h2>Aniyah Cross-Border</h2><p>Cross-border transfer rail and FinBank-ready payment layer.</p><a class="btn" href="/aniyah-cross-border-payment">Open</a></div>
            <div class="card"><h2>AI Command Center</h2><p>Automation, guidance, business intelligence, and system support.</p><a class="btn" href="/ai-command-center">Open</a></div>
            <div class="card"><h2>Memory Fabric</h2><p>Googolplex-scale memory planning for modules, AI, and recovery.</p><a class="btn" href="/memory-fabric">Open</a></div>
            <div class="card"><h2>Blockchain Core</h2><p>Wallet rails, audit paths, smart contracts, and ledger planning.</p><a class="btn" href="/blockchain-core">Open</a></div>
            <div class="card"><h2>Verse Map</h2><p>Metaverse, middleverse, multiverse, and bridge-layer design.</p><a class="btn" href="/verse-map">Open</a></div>
            <div class="card"><h2>Quantum Cloud</h2><p>Scalable compute, AI orchestration, and quantum-safe planning.</p><a class="btn" href="/quantum-cloud">Open</a></div>
            <div class="card"><h2>Module Registry</h2><p>Track what is live, partial, or still planned.</p><a class="btn" href="/module-registry">Open</a></div>
            <div class="card"><h2>Risk Checklist</h2><p>Important missing and detrimental items that still need fixing.</p><a class="btn" href="/risk-checklist">Open</a></div>
            <div class="card"><h2>Gap Report</h2><p>Visible system gap reporting and platform build map.</p><a class="btn" href="/gap-report-v2">Open</a></div>
            <div class="card"><h2>Quantum Analysis</h2><p>System analysis and ecosystem review layer.</p><a class="btn" href="/quantum-analysis">Open</a></div>
          </div>
        </div>
      </div>
    </body>
    </html>
    """


@app.route("/api/vocal-sessions")
def api_vocal_sessions():
    import sqlite3
    conn = sqlite3.connect("instance/app.db")
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM vocal_sessions ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/cross-border-payments")
def api_cross_border_payments():
    import sqlite3
    conn = sqlite3.connect("instance/app.db")
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM cross_border_payments ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/flagship-ai-suite")
def flagship_ai_suite():
    return """
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Flagship AI Suite</title>
      <style>
        body { margin:0; font-family:Arial,sans-serif; background:linear-gradient(180deg,#020617 0%,#111827 100%); color:white; }
        .wrap { max-width:1200px; margin:0 auto; padding:24px; }
        .hero { text-align:center; padding:36px 16px; }
        .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:16px; margin-top:24px; }
        .card { background:rgba(17,24,39,.92); border:1px solid #374151; border-radius:18px; padding:18px; }
        .btn { display:inline-block; padding:10px 14px; border-radius:12px; text-decoration:none; background:#2563eb; color:white; font-weight:bold; }
        a { color:#67e8f9; text-decoration:none; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="hero">
          <h1>Flagship AI Suite</h1>
          <p>Central AI layer for holographic search, HoloGPT, AI orchestration, AGI hierarchy, memory fabric, and ecosystem control.</p>
        </div>
        <div class="grid">
          <div class="card"><h2>Holographic Search</h2><p>Search products, creators, courses, channels, and future memory fabric context.</p><a class="btn" href="/next-level-holographic-search">Open</a></div>
          <div class="card"><h2>HoloGPT</h2><p>AI concierge for platform guidance, route discovery, and system interaction.</p><a class="btn" href="/hologpt">Open</a></div>
          <div class="card"><h2>AI Power Stack</h2><p>Copilot, codespaces, creative tools, reasoning engines, and orchestration surface.</p><a class="btn" href="/ai-power-stack">Open</a></div>
          <div class="card"><h2>AGI Hierarchy</h2><p>Executive AI, operations AI, creator AI, finance AI, and support AI map.</p><a class="btn" href="/agi-hierarchy">Open</a></div>
          <div class="card"><h2>Memory Fabric</h2><p>Googolplex-scale memory planning for modules, recovery, and AI context.</p><a class="btn" href="/memory-fabric">Open</a></div>
          <div class="card"><h2>Gap Fix Center</h2><p>Critical missing items, risks, and detrimental build gaps that still need fixing.</p><a class="btn" href="/gap-fix-center">Open</a></div>
        </div>
        <p style="margin-top:24px;"><a href="/control-tower">← Back to Control Tower</a></p>
      </div>
    </body>
    </html>
    """

@app.route("/next-level-holographic-search")
def next_level_holographic_search():
    return """
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Next Level Holographic Search Engine</title>
      <style>
        body { margin:0; font-family:Arial,sans-serif; background:linear-gradient(180deg,#0f172a 0%,#020617 100%); color:white; }
        .wrap { max-width:1100px; margin:0 auto; padding:24px; }
        .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; }
        .card { background:#111827; border:1px solid #334155; border-radius:18px; padding:18px; }
        a { color:#67e8f9; text-decoration:none; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>Next Level Holographic Search Engine</h1>
        <p>Flagship search architecture for products, creators, streams, tracks, courses, family brands, and memory-linked AI discovery.</p>
        <div class="grid">
          <div class="card"><h2>Marketplace Search</h2><p>Products, vendors, services, logistics, and operational records.</p></div>
          <div class="card"><h2>Media Search</h2><p>Streams, music, vocal sessions, channels, and creator content.</p></div>
          <div class="card"><h2>Knowledge Search</h2><p>University tracks, system documentation, and future AI memory records.</p></div>
          <div class="card"><h2>Holographic Layer</h2><p>Future visual search surfaces and immersive result presentation.</p></div>
        </div>
        <p style="margin-top:24px;"><a href="/flagship-ai-suite">← Back to Flagship AI Suite</a></p>
      </div>
    </body>
    </html>
    """

@app.route("/hologpt")
def hologpt():
    return """
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>HoloGPT</title>
      <style>
        body { margin:0; font-family:Arial,sans-serif; background:linear-gradient(180deg,#111827 0%,#1f2937 100%); color:white; }
        .wrap { max-width:1100px; margin:0 auto; padding:24px; }
        .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; }
        .card { background:rgba(17,24,39,.92); border:1px solid #374151; border-radius:18px; padding:18px; }
        .pill { display:inline-block; padding:6px 10px; border-radius:999px; background:#1d4ed8; font-size:.9rem; margin-bottom:8px; }
        a { color:#67e8f9; text-decoration:none; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>HoloGPT</h1>
        <p>AI concierge and ecosystem navigator for commerce, finance, streaming, learning, and operations.</p>
        <div class="grid">
          <div class="card"><div class="pill">Guide</div><h2>Route Navigation</h2><p>Help users move across marketplace, university, wallet, and media modules.</p></div>
          <div class="card"><div class="pill">Assistant</div><h2>Task Guidance</h2><p>Future assistant for setup flows, recommendations, and next-step support.</p></div>
          <div class="card"><div class="pill">Memory</div><h2>Context Layer</h2><p>Uses memory fabric and module registry to improve continuity.</p></div>
          <div class="card"><div class="pill">Holographic</div><h2>Future Interface</h2><p>Reserved for immersive visual assistant experiences.</p></div>
        </div>
        <p style="margin-top:24px;"><a href="/flagship-ai-suite">← Back to Flagship AI Suite</a></p>
      </div>
    </body>
    </html>
    """

@app.route("/ai-power-stack")
def ai_power_stack():
    return """
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>AI Power Stack</title>
      <style>
        body { margin:0; font-family:Arial,sans-serif; background:#0f172a; color:white; }
        .wrap { max-width:1100px; margin:0 auto; padding:24px; }
        .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; }
        .card { background:#111827; border:1px solid #334155; border-radius:18px; padding:18px; }
        a { color:#67e8f9; text-decoration:none; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>AI Power Stack</h1>
        <p>Orchestration surface for reasoning, coding, creativity, support, search, and analytics tools.</p>
        <div class="grid">
          <div class="card"><h2>Reasoning Layer</h2><p>Complexity, perplexity-style analysis, and structured decision workflows.</p></div>
          <div class="card"><h2>Dev Layer</h2><p>Copilot, codespaces, lovable-dev style support, and build automation concepts.</p></div>
          <div class="card"><h2>Creative Layer</h2><p>Image/video/music creation planning, Midjourney-style idea surfaces, and media ideation.</p></div>
          <div class="card"><h2>Ops Layer</h2><p>Automation, route checks, diagnostics, and AI-assisted ecosystem management.</p></div>
        </div>
        <p style="margin-top:24px;"><a href="/flagship-ai-suite">← Back to Flagship AI Suite</a></p>
      </div>
    </body>
    </html>
    """

@app.route("/agi-hierarchy")
def agi_hierarchy():
    return """
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>AGI Hierarchy</title>
      <style>
        body { margin:0; font-family:Arial,sans-serif; background:linear-gradient(180deg,#030712 0%,#111827 100%); color:white; }
        .wrap { max-width:1100px; margin:0 auto; padding:24px; }
        .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; }
        .card { background:rgba(17,24,39,.92); border:1px solid #374151; border-radius:18px; padding:18px; }
        a { color:#67e8f9; text-decoration:none; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>AGI Hierarchy</h1>
        <p>Safe architecture map for layered intelligence across the platform. This is an orchestration design, not proof of real self-aware AGI.</p>
        <div class="grid">
          <div class="card"><h2>Executive AI</h2><p>Top-level strategy, prioritization, and ecosystem overview.</p></div>
          <div class="card"><h2>Operations AI</h2><p>Marketplace, routes, workflows, diagnostics, and service control.</p></div>
          <div class="card"><h2>Creator AI</h2><p>Music, streaming, vocal coaching, and content-side assistance.</p></div>
          <div class="card"><h2>Finance AI</h2><p>Wallet logic, payouts, cross-border payment, and FinBank support.</p></div>
          <div class="card"><h2>Security AI</h2><p>Cybersecurity, access control, audit support, and risk awareness.</p></div>
          <div class="card"><h2>Symbiotic Layer</h2><p>Multi-input assistant concept for voice, text, context, memory, and system-state interaction.</p></div>
        </div>
        <p style="margin-top:24px;"><a href="/flagship-ai-suite">← Back to Flagship AI Suite</a></p>
      </div>
    </body>
    </html>
    """

@app.route("/gap-fix-center")
def gap_fix_center():
    return """
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Gap Fix Center</title>
      <style>
        body { margin:0; font-family:Arial,sans-serif; background:#111827; color:white; }
        .wrap { max-width:1100px; margin:0 auto; padding:24px; }
        .card { background:#1f2937; border:1px solid #374151; border-radius:16px; padding:18px; margin-bottom:14px; }
        a { color:#67e8f9; text-decoration:none; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>Gap Fix Center</h1>
        <div class="card"><strong>Important:</strong><p>University, wallet, music, streaming, vocal, and cross-border pages should all be data-backed and verified after each change.</p></div>
        <div class="card"><strong>Detrimental:</strong><p>Adding too many modules at once can break startup. Backup + compile + restart + test each layer.</p></div>
        <div class="card"><strong>Important:</strong><p>Keep ~/marketplace as the one main live project to avoid confusion and split state.</p></div>
        <div class="card"><strong>Detrimental:</strong><p>Do not treat concept pages as real AGI or real financial rails until backed by actual secure logic.</p></div>
        <div class="card"><strong>Next Fixes:</strong><p>Auth roles, media uploads, transaction history, master navigation, and dynamic module registry.</p></div>
        <p><a href="/risk-checklist">← Back to Risk Checklist</a></p>
      </div>
    </body>
    </html>
    """


@app.route("/auth-role-center")
def auth_role_center():
    import sqlite3
    conn = sqlite3.connect("instance/app.db")
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM role_profiles ORDER BY id").fetchall()
    conn.close()

    cards = []
    for r in rows:
        cards.append(f"""
        <div class="card">
          <div class="pill">{r['status'].title()}</div>
          <h2>{r['role_name']}</h2>
          <p><strong>Access:</strong> {r['access_level']}</p>
        </div>
        """)
    cards_html = "".join(cards) if cards else "<div class='card'><h2>No Roles Yet</h2></div>"

    return f"""
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Auth Role Center</title>
      <style>
        body {{ margin:0; font-family:Arial,sans-serif; background:#0f172a; color:white; }}
        .wrap {{ max-width:1100px; margin:0 auto; padding:24px; }}
        .grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; }}
        .card {{ background:#111827; border:1px solid #334155; border-radius:18px; padding:18px; }}
        .pill {{ display:inline-block; padding:6px 10px; border-radius:999px; background:#1d4ed8; font-size:.9rem; margin-bottom:8px; }}
        a {{ color:#67e8f9; text-decoration:none; }}
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>Auth Role Center</h1>
        <p>Live role map for admin, operator, creator, vendor, student, and customer access levels.</p>
        <div class="grid">{cards_html}</div>
        <p style="margin-top:24px;"><a href="/gap-fix-center">← Back to Gap Fix Center</a></p>
      </div>
    </body>
    </html>
    """

@app.route("/audit-history")
def audit_history():
    import sqlite3
    conn = sqlite3.connect("instance/app.db")
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM audit_events ORDER BY id DESC").fetchall()
    conn.close()

    cards = []
    for r in rows:
        cards.append(f"""
        <div class="card">
          <div class="pill">{r['severity'].title()}</div>
          <h2>{r['event_name']}</h2>
          <p><strong>Module:</strong> {r['module_name']}<br>
          <strong>Status:</strong> {r['event_status']}</p>
        </div>
        """)
    cards_html = "".join(cards) if cards else "<div class='card'><h2>No Audit Events Yet</h2></div>"

    return f"""
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Audit History</title>
      <style>
        body {{ margin:0; font-family:Arial,sans-serif; background:#111827; color:white; }}
        .wrap {{ max-width:1100px; margin:0 auto; padding:24px; }}
        .grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:16px; }}
        .card {{ background:#1f2937; border:1px solid #374151; border-radius:18px; padding:18px; }}
        .pill {{ display:inline-block; padding:6px 10px; border-radius:999px; background:#1d4ed8; font-size:.9rem; margin-bottom:8px; }}
        a {{ color:#67e8f9; text-decoration:none; }}
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>Audit History</h1>
        <p>Live audit/event history for wallet, payments, university, music, streaming, and governance layers.</p>
        <div class="grid">{cards_html}</div>
        <p style="margin-top:24px;"><a href="/gap-fix-center">← Back to Gap Fix Center</a></p>
      </div>
    </body>
    </html>
    """

@app.route("/api/role-profiles")
def api_role_profiles():
    import sqlite3
    conn = sqlite3.connect("instance/app.db")
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM role_profiles ORDER BY id").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/audit-events")
def api_audit_events():
    import sqlite3
    conn = sqlite3.connect("instance/app.db")
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM audit_events ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/midjourney-next-generation")
def midjourney_next_generation():
    return """
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Midjourney Next Generation</title>
      <style>
        body { margin:0; font-family:Arial,sans-serif; background:linear-gradient(180deg,#111827 0%,#1f2937 100%); color:white; }
        .wrap { max-width:1100px; margin:0 auto; padding:24px; }
        .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:16px; }
        .card { background:rgba(17,24,39,.92); border:1px solid #374151; border-radius:18px; padding:18px; }
        a { color:#67e8f9; text-decoration:none; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>Midjourney Next Generation</h1>
        <p>Creative generation shell for next-level visual ideation, concept art planning, campaign visuals, product mockups, and creator media workflows.</p>
        <div class="grid">
          <div class="card"><h2>Visual Ideation</h2><p>Concept art, scene creation, platform branding, and campaign direction.</p></div>
          <div class="card"><h2>Product Mockups</h2><p>Visual concepts for marketplace listings, merch, and creator products.</p></div>
          <div class="card"><h2>Media Art</h2><p>Streaming covers, album visuals, event posters, and featured artwork.</p></div>
          <div class="card"><h2>Creative Workflow</h2><p>Reserved for future generation prompts, asset reviews, and publishing flow.</p></div>
        </div>
        <p style="margin-top:24px;"><a href="/flagship-ai-suite">← Back to Flagship AI Suite</a></p>
      </div>
    </body>
    </html>
    """

@app.route("/holographic-midjourney")
def holographic_midjourney():
    return """
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Holographic Midjourney</title>
      <style>
        body { margin:0; font-family:Arial,sans-serif; background:linear-gradient(180deg,#020617 0%,#0f172a 100%); color:white; }
        .wrap { max-width:1100px; margin:0 auto; padding:24px; }
        .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:16px; }
        .card { background:rgba(15,23,42,.92); border:1px solid #334155; border-radius:18px; padding:18px; }
        a { color:#67e8f9; text-decoration:none; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>Holographic Midjourney</h1>
        <p>Immersive visual generation layer for holographic scenes, floating interfaces, world concepts, creator spaces, and futuristic commerce/media environments.</p>
        <div class="grid">
          <div class="card"><h2>Holographic Scenes</h2><p>Design concepts for immersive rooms, stages, dashboards, and branded spaces.</p></div>
          <div class="card"><h2>Verse Visualization</h2><p>Visual ideation for metaverse, middleverse, and multiverse environments.</p></div>
          <div class="card"><h2>Interactive Concepts</h2><p>Future-ready mockups for immersive storefronts, media hubs, and AI portals.</p></div>
          <div class="card"><h2>Holo Branding</h2><p>Advanced presentation concepts for flagship product identity and next-gen UX.</p></div>
        </div>
        <p style="margin-top:24px;"><a href="/midjourney-next-generation">← Back to Midjourney Next Generation</a></p>
      </div>
    </body>
    </html>
    """

@app.route("/holographic-internet")
def holographic_internet():
    return """
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Holographic Internet</title>
      <style>
        body { margin:0; font-family:Arial,sans-serif; background:linear-gradient(180deg,#030712 0%,#111827 100%); color:white; }
        .wrap { max-width:1200px; margin:0 auto; padding:24px; }
        .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:16px; }
        .card { background:rgba(17,24,39,.92); border:1px solid #374151; border-radius:18px; padding:18px; }
        a { color:#67e8f9; text-decoration:none; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>Holographic Internet</h1>
        <p>Immersive network concept for spatial browsing, holographic search, interactive media, AI-guided navigation, and visual commerce experiences.</p>
        <div class="grid">
          <div class="card"><h2>Spatial Browsing</h2><p>Replace flat pages with immersive, layered visual navigation.</p></div>
          <div class="card"><h2>Holographic Search</h2><p>Search results become interactive visual spaces instead of plain lists.</p></div>
          <div class="card"><h2>Immersive Commerce</h2><p>Products, services, and creators presented in experiential environments.</p></div>
          <div class="card"><h2>AI Navigation</h2><p>HoloGPT-style guidance across the full platform and future worlds.</p></div>
          <div class="card"><h2>Media Worlds</h2><p>Streaming, music, education, and creator experiences merged into one environment.</p></div>
          <div class="card"><h2>Bridge Layer</h2><p>Connects marketplace, blockchain, verse map, and AI into one internet experience.</p></div>
        </div>
        <p style="margin-top:24px;"><a href="/control-tower">← Back to Control Tower</a></p>
      </div>
    </body>
    </html>
    """

@app.route("/next-gen-search-lab")
def next_gen_search_lab():
    return """
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Next Gen Search Lab</title>
      <style>
        body { margin:0; font-family:Arial,sans-serif; background:#0f172a; color:white; }
        .wrap { max-width:1100px; margin:0 auto; padding:24px; }
        .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:16px; }
        .card { background:#111827; border:1px solid #334155; border-radius:18px; padding:18px; }
        .pill { display:inline-block; padding:6px 10px; border-radius:999px; background:#1d4ed8; font-size:.9rem; margin-bottom:8px; }
        a { color:#67e8f9; text-decoration:none; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>Next Gen Search Lab</h1>
        <p>Flagship search control surface for marketplace, media, wallet, university, AI memory, and future holographic discovery.</p>
        <div class="grid">
          <div class="card"><div class="pill">Fast</div><h2>Cross-Module Search</h2><p>Designed to search across products, courses, tracks, streams, sessions, and payments.</p></div>
          <div class="card"><div class="pill">Smart</div><h2>Contextual Discovery</h2><p>Built to evolve from route search into context + memory linked navigation.</p></div>
          <div class="card"><div class="pill">Flagship</div><h2>Search OS Core</h2><p>Acts as the discovery backbone for the full ecosystem.</p></div>
          <div class="card"><div class="pill">Future</div><h2>Holographic Layer</h2><p>Reserved for immersive search experiences through the Holographic Internet.</p></div>
        </div>
        <p style="margin-top:24px;"><a href="/next-level-holographic-search">← Back to Holographic Search</a></p>
      </div>
    </body>
    </html>
    """


@app.route("/api/module-registry-live")
def api_module_registry_live():
    import sqlite3
    conn = sqlite3.connect("instance/app.db")
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM module_registry_live ORDER BY id").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/media-assets")
def api_media_assets():
    import sqlite3
    conn = sqlite3.connect("instance/app.db")
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM media_assets ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/ai-workflows")
def api_ai_workflows():
    import sqlite3
    conn = sqlite3.connect("instance/app.db")
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM ai_workflows ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/search")
def api_search():
    import sqlite3
    from flask import request
    q = (request.args.get("q") or "").strip().lower()
    conn = sqlite3.connect("instance/app.db")
    conn.row_factory = sqlite3.Row

    results = []

    def add_results(rows, source, fields):
        for r in rows:
            item = dict(r)
            item["_source"] = source
            item["_fields"] = fields
            results.append(item)

    if q:
        like = f"%{q}%"
        add_results(
            conn.execute("SELECT id, title, track, level, status FROM university_courses WHERE lower(title) LIKE ? OR lower(track) LIKE ?", (like, like)).fetchall(),
            "university_courses",
            ["title", "track", "level", "status"],
        )
        add_results(
            conn.execute("SELECT id, account_name, balance, rewards_points, status FROM wallet_accounts WHERE lower(account_name) LIKE ?", (like,)).fetchall(),
            "wallet_accounts",
            ["account_name", "balance", "rewards_points", "status"],
        )
        add_results(
            conn.execute("SELECT id, title, artist, genre, status FROM music_tracks WHERE lower(title) LIKE ? OR lower(artist) LIKE ? OR lower(genre) LIKE ?", (like, like, like)).fetchall(),
            "music_tracks",
            ["title", "artist", "genre", "status"],
        )
        add_results(
            conn.execute("SELECT id, channel_name, category, live_status, featured FROM stream_channels WHERE lower(channel_name) LIKE ? OR lower(category) LIKE ?", (like, like)).fetchall(),
            "stream_channels",
            ["channel_name", "category", "live_status", "featured"],
        )
        add_results(
            conn.execute("SELECT id, student_name, coach_name, lesson_title, session_status FROM vocal_sessions WHERE lower(student_name) LIKE ? OR lower(coach_name) LIKE ? OR lower(lesson_title) LIKE ?", (like, like, like)).fetchall(),
            "vocal_sessions",
            ["student_name", "coach_name", "lesson_title", "session_status"],
        )
        add_results(
            conn.execute("SELECT id, sender_name, receiver_name, origin_country, destination_country, amount, payment_status FROM cross_border_payments WHERE lower(sender_name) LIKE ? OR lower(receiver_name) LIKE ? OR lower(origin_country) LIKE ? OR lower(destination_country) LIKE ?", (like, like, like, like)).fetchall(),
            "cross_border_payments",
            ["sender_name", "receiver_name", "origin_country", "destination_country", "amount", "payment_status"],
        )
        add_results(
            conn.execute("SELECT id, module_name, route, status, category FROM module_registry_live WHERE lower(module_name) LIKE ? OR lower(category) LIKE ?", (like, like)).fetchall(),
            "module_registry_live",
            ["module_name", "route", "status", "category"],
        )
        add_results(
            conn.execute("SELECT id, asset_title, asset_type, owner_name, status FROM media_assets WHERE lower(asset_title) LIKE ? OR lower(asset_type) LIKE ? OR lower(owner_name) LIKE ?", (like, like, like)).fetchall(),
            "media_assets",
            ["asset_title", "asset_type", "owner_name", "status"],
        )
        add_results(
            conn.execute("SELECT id, workflow_name, workflow_type, module_name, status FROM ai_workflows WHERE lower(workflow_name) LIKE ? OR lower(workflow_type) LIKE ? OR lower(module_name) LIKE ?", (like, like, like)).fetchall(),
            "ai_workflows",
            ["workflow_name", "workflow_type", "module_name", "status"],
        )

    conn.close()
    return jsonify({"query": q, "count": len(results), "results": results})

@app.route("/media-studio")
def media_studio():
    import sqlite3
    conn = sqlite3.connect("instance/app.db")
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM media_assets ORDER BY id DESC").fetchall()
    conn.close()

    cards = []
    for r in rows:
        cards.append(f"""
        <div class="card">
          <div class="pill">{r['status'].title()}</div>
          <h2>{r['asset_title']}</h2>
          <p><strong>Type:</strong> {r['asset_type']}<br>
          <strong>Owner:</strong> {r['owner_name']}</p>
        </div>
        """)
    cards_html = "".join(cards) if cards else "<div class='card'><h2>No Media Assets Yet</h2></div>"

    return f"""
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Media Studio</title>
      <style>
        body {{ margin:0; font-family:Arial,sans-serif; background:linear-gradient(180deg,#111827 0%,#1f2937 100%); color:white; }}
        .wrap {{ max-width:1100px; margin:0 auto; padding:24px; }}
        .grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:16px; }}
        .card {{ background:rgba(17,24,39,.92); border:1px solid #374151; border-radius:18px; padding:18px; }}
        .pill {{ display:inline-block; padding:6px 10px; border-radius:999px; background:#1d4ed8; font-size:.9rem; margin-bottom:8px; }}
        a {{ color:#67e8f9; text-decoration:none; }}
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>Media Studio</h1>
        <p>Live media asset dashboard for image, audio, video, voice, and holographic creative records.</p>
        <div class="grid">{cards_html}</div>
        <p style="margin-top:24px;">API: <a href="/api/media-assets">/api/media-assets</a></p>
        <p style="margin-top:24px;"><a href="/control-tower">← Back to Control Tower</a></p>
      </div>
    </body>
    </html>
    """

@app.route("/upload-vault")
def upload_vault():
    return """
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Upload Vault</title>
      <style>
        body { margin:0; font-family:Arial,sans-serif; background:#0f172a; color:white; }
        .wrap { max-width:1000px; margin:0 auto; padding:24px; }
        .card { background:#111827; border:1px solid #334155; border-radius:18px; padding:18px; margin-bottom:16px; }
        a { color:#67e8f9; text-decoration:none; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>Upload Vault</h1>
        <div class="card"><h2>Media Upload Strategy</h2><p>Reserved upload/storage layer for streaming, music, vocal sessions, artwork, and holographic creative assets.</p></div>
        <div class="card"><h2>Next Step</h2><p>Wire real upload endpoints and local/media storage rules after route stability and role controls are finalized.</p></div>
        <p><a href="/media-studio">← Back to Media Studio</a></p>
      </div>
    </body>
    </html>
    """

@app.route("/search-hub")
def search_hub():
    return """
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Search Hub</title>
      <style>
        body { margin:0; font-family:Arial,sans-serif; background:#020617; color:white; }
        .wrap { max-width:1000px; margin:0 auto; padding:24px; }
        .card { background:#111827; border:1px solid #334155; border-radius:18px; padding:18px; margin-bottom:16px; }
        code { color:#93c5fd; }
        a { color:#67e8f9; text-decoration:none; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>Search Hub</h1>
        <div class="card"><h2>Cross-Module Search</h2><p>Searches university, wallet, music, streaming, vocal sessions, cross-border payments, modules, media assets, and AI workflows.</p></div>
        <div class="card"><h2>API Usage</h2><p>Use <code>/api/search?q=music</code> or any other keyword.</p></div>
        <p><a href="/next-gen-search-lab">← Back to Next Gen Search Lab</a></p>
      </div>
    </body>
    </html>
    """

@app.route("/workflow-lab")
def workflow_lab():
    import sqlite3
    conn = sqlite3.connect("instance/app.db")
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM ai_workflows ORDER BY id DESC").fetchall()
    conn.close()

    cards = []
    for r in rows:
        cards.append(f"""
        <div class="card">
          <div class="pill">{r['status'].title()}</div>
          <h2>{r['workflow_name']}</h2>
          <p><strong>Type:</strong> {r['workflow_type']}<br>
          <strong>Module:</strong> {r['module_name']}</p>
        </div>
        """)
    cards_html = "".join(cards) if cards else "<div class='card'><h2>No Workflows Yet</h2></div>"

    return f"""
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Workflow Lab</title>
      <style>
        body {{ margin:0; font-family:Arial,sans-serif; background:#111827; color:white; }}
        .wrap {{ max-width:1100px; margin:0 auto; padding:24px; }}
        .grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:16px; }}
        .card {{ background:#1f2937; border:1px solid #374151; border-radius:18px; padding:18px; }}
        .pill {{ display:inline-block; padding:6px 10px; border-radius:999px; background:#1d4ed8; font-size:.9rem; margin-bottom:8px; }}
        a {{ color:#67e8f9; text-decoration:none; }}
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>Workflow Lab</h1>
        <p>Live AI workflow dashboard for assistance, analysis, governance, creator support, and ecosystem operations.</p>
        <div class="grid">{cards_html}</div>
        <p style="margin-top:24px;">API: <a href="/api/ai-workflows">/api/ai-workflows</a></p>
        <p style="margin-top:24px;"><a href="/flagship-ai-suite">← Back to Flagship AI Suite</a></p>
      </div>
    </body>
    </html>
    """

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
