from flask import Flask, Response
import os

app = Flask(__name__)

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



# -------------------------
# Build Status Page
# -------------------------

@app.route("/build-status")
def build_status():
    body = ""
    body += section("Build Status", [
        "App is running",
        "Base server is active",
        "Health route is active",
        "Current mode: recovered working build"
    ])
    body += section("Quick Links", [
        "/",
        "/health",
        "/build-status"
    ])
    body += section("What This Does", [
        "Confirms the live build is running",
        "Gives you a stable checkpoint page before the next feature patch"
    ])
    return page("Build Status", body)



# -------------------------
# City Control Patch
# -------------------------

def _safe_rows(path):
    try:
        return _load(path, [])
    except Exception:
        return []

@app.route("/progress")
def progress_page():
    users = _safe_rows("users_live.json")
    passports = _safe_rows("passport/passport_users.json")
    media = _safe_rows("media_assets.json")
    districts = _safe_rows("city/districts.json")
    traffic = _safe_rows("city/traffic_board.json")

    body = ""
    body += section("Progress", [
        f"Users: {len(users)}",
        f"Passport Users: {len(passports)}",
        f"Media Assets: {len(media)}",
        f"Districts: {len(districts)}",
        f"Traffic Routes: {len(traffic)}"
    ])
    body += section("What This Does", [
        "Shows a simple progress summary for the working build",
        "Gives you a stable visibility page"
    ])
    return page("Progress", body)

@app.route("/command-center")
def command_center_page():
    body = ""
    body += section("Command Center", [
        "Build Status",
        "Progress",
        "City Minimap",
        "District Dashboard",
        "Traffic and Transport Board"
    ])
    body += """
    <div class="card">
        <h3>Main Controls</h3>
        <a class="btn" href="/build-status">Build Status</a>
        <a class="btn" href="/progress">Progress</a>
        <a class="btn" href="/city-minimap">City Minimap</a>
        <a class="btn" href="/district-dashboard">District Dashboard</a>
        <a class="btn" href="/traffic-transport-board">Traffic / Transport Board</a>
        <a class="btn" href="/health">Health</a>
    </div>
    """
    body += section("What This Does", [
        "Creates a simple control room for the live app",
        "Makes navigation easier while keeping the patch small and safe"
    ])
    return page("Command Center", body)

@app.route("/city-minimap")
def city_minimap():
    body = """
    <div class="card">
        <h3>Live City Minimap</h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
            <div style="background:#2563eb;padding:18px;border-radius:10px;">Creator District</div>
            <div style="background:#16a34a;padding:18px;border-radius:10px;">Marketplace District</div>
            <div style="background:#7c3aed;padding:18px;border-radius:10px;">VIP Event Zone</div>
            <div style="background:#f59e0b;padding:18px;border-radius:10px;">Transport Hub</div>
            <div style="background:#0f766e;padding:18px;border-radius:10px;">Wildlife Zone</div>
            <div style="background:#dc2626;padding:18px;border-radius:10px;">Future Expansion</div>
        </div>
    </div>
    """
    body += section("What This Does", [
        "Creates a visible world/city overview",
        "Makes districts easier to understand and navigate"
    ])
    return page("City Minimap", body)

@app.route("/district-dashboard")
def district_dashboard():
    districts = _safe_rows("city/districts.json")
    body = ""
    body += section("District Dashboard", [f"District count: {len(districts)}"])
    if districts:
        body += section("Districts", [
            f"{x.get('name')} | {x.get('type')} | {x.get('status')}"
            for x in districts
        ])
    body += section("What This Does", [
        "Creates a simple district operations view",
        "Prepares the city/world layer for growth"
    ])
    return page("District Dashboard", body)

@app.route("/traffic-transport-board")
def traffic_transport_board():
    routes = _safe_rows("city/traffic_board.json")
    body = ""
    body += section("Traffic / Transport Board", [f"Tracked routes: {len(routes)}"])
    if routes:
        body += section("Routes", [
            f"{x.get('route')} | {x.get('mode')} | {x.get('status')}"
            for x in routes
        ])
    body += section("What This Does", [
        "Creates a transport and route status board",
        "Prepares the app for richer traffic and travel systems later"
    ])
    return page("Traffic / Transport Board", body)

@app.route("/health")
def health():
    return "OK"

@app.route("/favicon.ico")
def fav():
    return Response(status=204)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
