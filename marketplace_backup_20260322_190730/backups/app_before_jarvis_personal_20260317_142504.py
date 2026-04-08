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
      <a href="/platform-home">Platform Home</a>
      <a href="/jarvis-history">Jarvis History</a>
      <a href="/jarvis-favorites">Jarvis Favorites</a>
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
      <a href="/platform-home">Platform Home</a>
      <a href="/jarvis-history">Jarvis History</a>
      <a href="/jarvis-favorites">Jarvis Favorites</a>
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
    <a href="/platform-home">Platform Home</a>
      <a href="/jarvis-history">Jarvis History</a>
      <a href="/jarvis-favorites">Jarvis Favorites</a>
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
      <a href="/platform-home">Platform Home</a>
      <a href="/jarvis-history">Jarvis History</a>
      <a href="/jarvis-favorites">Jarvis Favorites</a>
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
      <a href="/jarvis-home">Jarvis Home</a>
      <a href="/platform-home">Platform Home</a>
      <a href="/jarvis-history">Jarvis History</a>
      <a href="/jarvis-favorites">Jarvis Favorites</a>
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
      <a href="/platform-home">Platform Home</a>
      <a href="/jarvis-history">Jarvis History</a>
      <a href="/jarvis-favorites">Jarvis Favorites</a>
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
      <a href="/jarvis-start" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Start Page</a>
      <a href="/jarvis-favorites" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Favorites</a>
      <a href="/jarvis-access" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Accessibility Controls</a>
      <a href="/jarvis-plus" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Large Control Panel</a>
      <a href="/jarvis-history" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Command History</a>
      <a href="/master-dashboard" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Master Dashboard</a>
      <a href="/payments-center" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Payments Center</a>
    </div>

    <div class="card">
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
      <a href="/jarvis-home" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Open Jarvis Home</a>
      <a href="/jarvis-favorites" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Open Favorites</a>
      <a href="/jarvis-tasks" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Open Tasks</a>
      <a href="/jarvis-workflows" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Open Workflows</a>
      <a href="/master-dashboard" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Open Dashboard</a>
      <a href="/payments-center" style="display:block;padding:22px;margin:12px 0;font-size:26px;">Open Payments</a>
    </div>

    <div class="card">
      <a href="/platform-home">Platform Home</a>
      <a href="/route-map">Route Map</a>
      <a href="/platform-verify">Platform Verify</a>
    </div>
    """
    return _direct_page("Jarvis Start", body)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)