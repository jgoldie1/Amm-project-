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





@app.route("/safe-status")
def safe_status():
    body = ""
    body += section("Safe Status", [
        "Recovered working build",
        "Server online",
        "Ready for small verified patches only"
    ])
    body += section("Key Links", [
        "/",
        "/health",
        "/safe-status"
    ])
    return page("Safe Status", body)



@app.route("/safe-ok")
def safe_ok():
    return """
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>Safe OK</title>
      <style>
        body { font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }
        a { display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }
      </style>
    </head>
    <body>
      <h1>Safe OK</h1>
      <p>Recovered working build.</p>
      <p>Server online.</p>
      <p>Use tiny verified patches only.</p>
      <a href="/">Home</a>
      <a href="/health">Health</a>
      <a href="/safe-ok">Safe OK</a>
    </body>
    </html>
    """



@app.route("/build-status")
def build_status_plain():
    return """
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>Build Status</title>
      <style>
        body { font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }
        a { display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }
      </style>
    </head>
    <body>
      <h1>Build Status</h1>
      <p>Recovered working build is online.</p>
      <p>Server is responding.</p>
      <p>Using plain recovery pages for stability.</p>
      <a href="/">Home</a>
      <a href="/health">Health</a>
      <a href="/safe-ok">Safe OK</a>
      <a href="/build-status">Build Status</a>
      <a href="/command-center">Command Center</a>
      <a href="/progress">Progress</a>
    </body>
    </html>
    """

@app.route("/command-center")
def command_center_plain():
    return """
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>Command Center</title>
      <style>
        body { font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }
        a { display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }
      </style>
    </head>
    <body>
      <h1>Command Center</h1>
      <p>Main recovery navigation for the platform.</p>
      <a href="/">Home</a>
      <a href="/health">Health</a>
      <a href="/safe-ok">Safe OK</a>
      <a href="/build-status">Build Status</a>
      <a href="/command-center">Command Center</a>
      <a href="/progress">Progress</a>
      <a href="/city-minimap">City Minimap</a>
      <a href="/district-dashboard">District Dashboard</a>
      <a href="/traffic-transport-board">Traffic / Transport Board</a>
      <a href="/living-city-center">Living City Center</a>
      <a href="/property-center">Property Center</a>
      <a href="/property-operations-center">Property Operations</a>
      <a href="/safety-center">Safety Center</a>
    </body>
    </html>
    """

@app.route("/progress")
def progress_plain():
    return """
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>Progress</title>
      <style>
        body { font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }
        a { display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }
      </style>
    </head>
    <body>
      <h1>Progress</h1>
      <p>Recovery navigation is working.</p>
      <p>This page is the stable checkpoint for rebuilding the platform UI safely.</p>
      <a href="/">Home</a>
      <a href="/health">Health</a>
      <a href="/safe-ok">Safe OK</a>
      <a href="/build-status">Build Status</a>
      <a href="/command-center">Command Center</a>
      <a href="/progress">Progress</a>
    </body>
    </html>
    """



@app.route("/city-minimap")
def city_minimap_plain():
    return """
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>City Minimap</title>
      <style>
        body { font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }
        a { display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }
        .grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:20px; }
        .box { padding:18px; border-radius:10px; font-weight:bold; }
      </style>
    </head>
    <body>
      <h1>City Minimap</h1>
      <p>Plain recovery view of the city zones.</p>
      <a href="/">Home</a>
      <a href="/build-status">Build Status</a>
      <a href="/command-center">Command Center</a>
      <a href="/progress">Progress</a>
      <a href="/city-minimap">City Minimap</a>
      <a href="/district-dashboard">District Dashboard</a>
      <a href="/traffic-transport-board">Traffic / Transport Board</a>

      <div class="grid">
        <div class="box" style="background:#2563eb;">Creator District</div>
        <div class="box" style="background:#16a34a;">Marketplace District</div>
        <div class="box" style="background:#7c3aed;">VIP Event Zone</div>
        <div class="box" style="background:#f59e0b;">Transport Hub</div>
        <div class="box" style="background:#0f766e;">Wildlife Zone</div>
        <div class="box" style="background:#dc2626;">Future Expansion</div>
      </div>
    </body>
    </html>
    """

@app.route("/district-dashboard")
def district_dashboard_plain():
    districts = []
    try:
        with open("data/city/districts.json", "r", encoding="utf-8") as f:
            districts = json.load(f)
    except Exception:
        districts = []

    rows = "".join(
        f"<li>{d.get('name')} | {d.get('type')} | {d.get('status')}</li>"
        for d in districts
    )

    return f"""
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>District Dashboard</title>
      <style>
        body {{ font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }}
        a {{ display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }}
      </style>
    </head>
    <body>
      <h1>District Dashboard</h1>
      <p>Tracked districts: {len(districts)}</p>
      <a href="/">Home</a>
      <a href="/build-status">Build Status</a>
      <a href="/command-center">Command Center</a>
      <a href="/progress">Progress</a>
      <a href="/city-minimap">City Minimap</a>
      <a href="/district-dashboard">District Dashboard</a>
      <a href="/traffic-transport-board">Traffic / Transport Board</a>
      <ul>{rows}</ul>
    </body>
    </html>
    """

@app.route("/traffic-transport-board")
def traffic_transport_board_plain():
    routes = []
    try:
        with open("data/city/traffic_board.json", "r", encoding="utf-8") as f:
            routes = json.load(f)
    except Exception:
        routes = []

    rows = "".join(
        f"<li>{r.get('route')} | {r.get('mode')} | {r.get('status')}</li>"
        for r in routes
    )

    return f"""
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>Traffic / Transport Board</title>
      <style>
        body {{ font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }}
        a {{ display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }}
      </style>
    </head>
    <body>
      <h1>Traffic / Transport Board</h1>
      <p>Tracked routes: {len(routes)}</p>
      <a href="/">Home</a>
      <a href="/build-status">Build Status</a>
      <a href="/command-center">Command Center</a>
      <a href="/progress">Progress</a>
      <a href="/city-minimap">City Minimap</a>
      <a href="/district-dashboard">District Dashboard</a>
      <a href="/traffic-transport-board">Traffic / Transport Board</a>
      <ul>{rows}</ul>
    </body>
    </html>
    """



@app.route("/living-city-center")
def living_city_center_plain():
    return """
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>Living City Center</title>
      <style>
        body { font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }
        a { display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }
        ul { line-height:1.8; }
      </style>
    </head>
    <body>
      <h1>Living City Center</h1>
      <p>Recovery view of the living city engine.</p>
      <a href="/">Home</a>
      <a href="/build-status">Build Status</a>
      <a href="/command-center">Command Center</a>
      <a href="/progress">Progress</a>
      <a href="/living-city-center">Living City Center</a>
      <a href="/property-center">Property Center</a>
      <a href="/property-operations-center">Property Operations</a>
      <ul>
        <li>Population Generator</li>
        <li>Job Assignment Engine</li>
        <li>Economy Demand Engine</li>
        <li>Housing Demand Engine</li>
        <li>Behavior Routines</li>
        <li>Social Interaction System</li>
        <li>Civic Center</li>
        <li>Middleverse Bridge</li>
        <li>Device Center</li>
        <li>Accessibility Center</li>
      </ul>
    </body>
    </html>
    """

@app.route("/property-center")
def property_center_plain():
    return """
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>Property Center</title>
      <style>
        body { font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }
        a { display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }
        ul { line-height:1.8; }
      </style>
    </head>
    <body>
      <h1>Property Center</h1>
      <p>Recovery view of the property development layer.</p>
      <a href="/">Home</a>
      <a href="/build-status">Build Status</a>
      <a href="/command-center">Command Center</a>
      <a href="/progress">Progress</a>
      <a href="/living-city-center">Living City Center</a>
      <a href="/property-center">Property Center</a>
      <a href="/property-operations-center">Property Operations</a>
      <ul>
        <li>Building Registry</li>
        <li>Floor Plans</li>
        <li>Elevator Access</li>
        <li>Rental Center</li>
        <li>Interior Studio</li>
        <li>Media Spaces</li>
        <li>Property Profitability</li>
      </ul>
    </body>
    </html>
    """

@app.route("/property-operations-center")
def property_operations_center_plain():
    return """
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>Property Operations Center</title>
      <style>
        body { font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }
        a { display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }
        ul { line-height:1.8; }
      </style>
    </head>
    <body>
      <h1>Property Operations Center</h1>
      <p>Recovery view of property operations and access control.</p>
      <a href="/">Home</a>
      <a href="/build-status">Build Status</a>
      <a href="/command-center">Command Center</a>
      <a href="/progress">Progress</a>
      <a href="/living-city-center">Living City Center</a>
      <a href="/property-center">Property Center</a>
      <a href="/property-operations-center">Property Operations</a>
      <ul>
        <li>Lease Agreements</li>
        <li>Occupancy Dashboard</li>
        <li>Maintenance Tracker</li>
        <li>Keycard Center</li>
        <li>Room Editor</li>
        <li>Property Value Estimator</li>
        <li>Studio Rental Presets</li>
        <li>VIP Suite Controls</li>
        <li>Security Desk</li>
        <li>Lobby / Reception</li>
      </ul>
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
