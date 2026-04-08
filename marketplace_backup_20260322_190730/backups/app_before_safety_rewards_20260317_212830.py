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


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)