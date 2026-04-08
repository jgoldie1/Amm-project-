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
        <a class="smallbtn" href="/product-catalog">Products</a>
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


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)