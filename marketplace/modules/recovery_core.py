import json
from pathlib import Path

def _read_json(path, fallback):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return fallback

def _html_page(title, body):
    return f"""
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>{title}</title>
      <style>
        body {{ font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }}
        a {{ display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }}
        .grid {{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:20px; }}
        .box {{ padding:18px; border-radius:10px; font-weight:bold; }}
        ul {{ line-height:1.8; }}
        .card {{ background:#1e293b; padding:16px; border-radius:12px; margin:14px 0; }}
      </style>
    </head>
    <body>
      {body}
    </body>
    </html>
    """

def register_recovery_core(app):
    @app.route("/safe-ok")
    def safe_ok():
        body = """
        <h1>Safe OK</h1>
        <p>Recovered working build.</p>
        <p>Server online.</p>
        <p>Recovery core loaded.</p>
        <a href="/">Home</a>
        <a href="/health">Health</a>
        <a href="/safe-ok">Safe OK</a>
        <a href="/build-status">Build Status</a>
        <a href="/command-center">Command Center</a>
        <a href="/progress">Progress</a>
        <a href="/project-inventory">Project Inventory</a>
        <a href="/system-registry">System Registry</a>
        <a href="/completion-board">Completion Board</a>
        <a href="/platform-summary">Platform Summary</a>
        <a href="/route-audit">Route Audit</a>
        <a href="/master-dashboard">Master Dashboard</a>
        <a href="/platform-home">Platform Home</a>
        <a href="/performance-center">Performance Center</a>
        <a href="/profile-center">Profile Center</a>
        """
        return _html_page("Safe OK", body)

    @app.route("/build-status")
    def build_status_plain():
        body = """
        <h1>Build Status</h1>
        <p>Recovered working build is online.</p>
        <p>Modular stabilization shell active.</p>
        <a href="/">Home</a>
        <a href="/health">Health</a>
        <a href="/safe-ok">Safe OK</a>
        <a href="/build-status">Build Status</a>
        <a href="/command-center">Command Center</a>
        <a href="/progress">Progress</a>
        <a href="/project-inventory">Project Inventory</a>
        <a href="/system-registry">System Registry</a>
        <a href="/completion-board">Completion Board</a>
        <a href="/platform-summary">Platform Summary</a>
        <a href="/route-audit">Route Audit</a>
        <a href="/master-dashboard">Master Dashboard</a>
        <a href="/platform-home">Platform Home</a>
        <a href="/performance-center">Performance Center</a>
        <a href="/profile-center">Profile Center</a>
        <a href="/rebuild-map">Rebuild Map</a>
        """
        return _html_page("Build Status", body)

    @app.route("/command-center")
    def command_center_plain():
        body = """
        <h1>Command Center</h1>
        <p>Main stabilized navigation for the platform.</p>
        <a href="/">Home</a>
        <a href="/health">Health</a>
        <a href="/safe-ok">Safe OK</a>
        <a href="/build-status">Build Status</a>
        <a href="/command-center">Command Center</a>
        <a href="/progress">Progress</a>
        <a href="/project-inventory">Project Inventory</a>
        <a href="/system-registry">System Registry</a>
        <a href="/completion-board">Completion Board</a>
        <a href="/platform-summary">Platform Summary</a>
        <a href="/route-audit">Route Audit</a>
        <a href="/master-dashboard">Master Dashboard</a>
        <a href="/platform-home">Platform Home</a>
        <a href="/performance-center">Performance Center</a>
        <a href="/profile-center">Profile Center</a>
        <a href="/rebuild-map">Rebuild Map</a>
        <a href="/city-minimap">City Minimap</a>
        <a href="/district-dashboard">District Dashboard</a>
        <a href="/traffic-transport-board">Traffic / Transport Board</a>
        <a href="/living-city-center">Living City Center</a>
        <a href="/property-center">Property Center</a>
        <a href="/property-operations-center">Property Operations</a>
        <a href="/safety-center">Safety Center</a>
        <a href="/oasis-center">OASIS Center</a>
        <a href="/verse-center">Verse Center</a>
        <a href="/holoverse-center">Holoverse Center</a>
        <a href="/holo-commerce-center">Holo Commerce</a>
        <a href="/holoverse-center">Holoverse Center</a>
        <a href="/holo-commerce-center">Holo Commerce</a>
        """
        return _html_page("Command Center", body)

    @app.route("/progress")
    def progress_plain():
        body = """
        <h1>Progress</h1>
        <p>Recovery shell is stable.</p>
        <p>Use the inventory, route audit, and rebuild map to restore advanced modules safely.</p>
        <a href="/">Home</a>
        <a href="/build-status">Build Status</a>
        <a href="/command-center">Command Center</a>
        <a href="/progress">Progress</a>
        <a href="/project-inventory">Project Inventory</a>
        <a href="/system-registry">System Registry</a>
        <a href="/completion-board">Completion Board</a>
        <a href="/platform-summary">Platform Summary</a>
        <a href="/route-audit">Route Audit</a>
        <a href="/master-dashboard">Master Dashboard</a>
        <a href="/platform-home">Platform Home</a>
        <a href="/performance-center">Performance Center</a>
        <a href="/profile-center">Profile Center</a>
        <a href="/rebuild-map">Rebuild Map</a>
        """
        return _html_page("Progress", body)

    @app.route("/city-minimap")
    def city_minimap_plain():
        body = """
        <h1>City Minimap</h1>
        <p>Stabilized city overview.</p>
        <a href="/">Home</a>
        <a href="/command-center">Command Center</a>
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
        """
        return _html_page("City Minimap", body)

    @app.route("/district-dashboard")
    def district_dashboard_plain():
        districts = _read_json("data/city/districts.json", [])
        rows = "".join(f"<li>{d.get('name')} | {d.get('type')} | {d.get('status')}</li>" for d in districts)
        body = f"""
        <h1>District Dashboard</h1>
        <p>Tracked districts: {len(districts)}</p>
        <a href="/">Home</a>
        <a href="/command-center">Command Center</a>
        <a href="/city-minimap">City Minimap</a>
        <a href="/traffic-transport-board">Traffic / Transport Board</a>
        <ul>{rows}</ul>
        """
        return _html_page("District Dashboard", body)

    @app.route("/traffic-transport-board")
    def traffic_transport_board_plain():
        routes = _read_json("data/city/traffic_board.json", [])
        rows = "".join(f"<li>{r.get('route')} | {r.get('mode')} | {r.get('status')}</li>" for r in routes)
        body = f"""
        <h1>Traffic / Transport Board</h1>
        <p>Tracked routes: {len(routes)}</p>
        <a href="/">Home</a>
        <a href="/command-center">Command Center</a>
        <a href="/city-minimap">City Minimap</a>
        <a href="/district-dashboard">District Dashboard</a>
        <ul>{rows}</ul>
        """
        return _html_page("Traffic / Transport Board", body)

    @app.route("/living-city-center")
    def living_city_center_plain():
        body = """
        <h1>Living City Center</h1>
        <p>Stabilized living city shell.</p>
        <a href="/">Home</a>
        <a href="/command-center">Command Center</a>
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
        """
        return _html_page("Living City Center", body)

    @app.route("/property-center")
    def property_center_plain():
        body = """
        <h1>Property Center</h1>
        <p>Stabilized property shell.</p>
        <a href="/">Home</a>
        <a href="/command-center">Command Center</a>
        <a href="/living-city-center">Living City Center</a>
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
        """
        return _html_page("Property Center", body)

    @app.route("/property-operations-center")
    def property_operations_center_plain():
        body = """
        <h1>Property Operations Center</h1>
        <p>Stabilized property operations shell.</p>
        <a href="/">Home</a>
        <a href="/command-center">Command Center</a>
        <a href="/living-city-center">Living City Center</a>
        <a href="/property-center">Property Center</a>
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
        """
        return _html_page("Property Operations Center", body)

    @app.route("/safety-center")
    def safety_center_plain():
        body = """
        <h1>Safety Center</h1>
        <p>Stabilized trust, fraud, and device safety shell.</p>
        <a href="/">Home</a>
        <a href="/command-center">Command Center</a>
        <a href="/build-status">Build Status</a>
        <ul>
          <li>Crime / Risk Registry</li>
          <li>Fraud & Trust Checks</li>
          <li>Bluetooth Pairing</li>
          <li>Device Trust</li>
          <li>Emergency Controls</li>
        </ul>
        """
        return _html_page("Safety Center", body)

    @app.route("/oasis-center")
    def oasis_center_plain():
        body = """
        <h1>OASIS Center</h1>
        <p>Stabilized avatar, teleport, monetization, analytics, and world control shell.</p>
        <a href="/">Home</a>
        <a href="/command-center">Command Center</a>
        <a href="/verse-center">Verse Center</a>
        <a href="/holoverse-center">Holoverse Center</a>
        <a href="/holo-commerce-center">Holo Commerce</a>
        <ul>
          <li>Avatar Model Center</li>
          <li>Teleport Map</li>
          <li>World Monetization</li>
          <li>World Analytics</li>
          <li>NPC Guide Center</li>
          <li>World Controls</li>
          <li>Inventory Sync</li>
        </ul>
        """
        return _html_page("OASIS Center", body)

    @app.route("/verse-center")
    def verse_center_plain():
        body = """
        <h1>Verse Center</h1>
        <p>Stabilized metaverse / middleverse / multiverse shell.</p>
        <a href="/">Home</a>
        <a href="/command-center">Command Center</a>
        <a href="/oasis-center">OASIS Center</a>
        <a href="/holoverse-center">Holoverse Center</a>
        <a href="/holo-commerce-center">Holo Commerce</a>
        <ul>
          <li>Metaverse</li>
          <li>Middleverse</li>
          <li>Multiverse</li>
          <li>Immersive World Structure</li>
        </ul>
        """
        return _html_page("Verse Center", body)



    @app.route("/creator-center")
    def creator_center_fallback():
        body = """
        <h1>Creator Center</h1>
        <p>Fallback creator center for stable navigation.</p>
        <a href="/command-center">Command Center</a>
        <a href="/holoverse-center">Holoverse Center</a>
        <a href="/holo-commerce-center">Holo Commerce</a>
        <a href="/creator-center">Creator Center</a>
        <ul>
          <li>Studio Registry</li>
          <li>Marketplace Center</li>
          <li>Creator World Tools</li>
          <li>Holoverse Creator Stages</li>
        </ul>
        """
        return _html_page("Creator Center", body)



    @app.route("/auth-login-fallback")
    def auth_login_fallback():
        body = """
        <h1>Auth Login Fallback</h1>
        <p>The auth blueprint is being connected. Use this fallback page until the full auth routes are live.</p>
        <a href="/platform-home">Platform Home</a>
        <a href="/profile-center">Profile Center</a>
        <a href="/basic-profiles">Basic Profiles</a>
        """
        return _html_page("Auth Login Fallback", body)

    @app.route("/project-inventory")
    def project_inventory():
        data = _read_json("reports/project_inventory.json", {"python_files_checked": [], "data_files": [], "config_files": []})
        py_count = len(data.get("python_files_checked", []))
        data_count = len(data.get("data_files", []))
        cfg_count = len(data.get("config_files", []))
        body = f"""
        <h1>Project Inventory</h1>
        <p>Python files checked: {py_count}</p>
        <p>Data files found: {data_count}</p>
        <p>Config files found: {cfg_count}</p>
        <a href="/">Home</a>
        <a href="/command-center">Command Center</a>
        <a href="/rebuild-map">Rebuild Map</a>
        <a href="/route-audit">Route Audit</a>
        <a href="/master-dashboard">Master Dashboard</a>
        <a href="/platform-home">Platform Home</a>
        <a href="/performance-center">Performance Center</a>
        <a href="/profile-center">Profile Center</a>
        """
        return _html_page("Project Inventory", body)

    @app.route("/rebuild-map")
    def rebuild_map():
        body = """
        <h1>Rebuild Map</h1>
        <ul>
          <li>Step 1: Stable plain recovery shell</li>
          <li>Step 2: City pages restored</li>
          <li>Step 3: Living City / Property / Safety / OASIS / Verse centers restored</li>
          <li>Step 4: Rebuild advanced helper pages one route at a time</li>
          <li>Step 5: Restore interactive XR/world systems in verified modules</li>
        </ul>
        <a href="/">Home</a>
        <a href="/command-center">Command Center</a>
        <a href="/project-inventory">Project Inventory</a>
        <a href="/system-registry">System Registry</a>
        <a href="/completion-board">Completion Board</a>
        <a href="/platform-summary">Platform Summary</a>
        <a href="/route-audit">Route Audit</a>
        <a href="/master-dashboard">Master Dashboard</a>
        <a href="/platform-home">Platform Home</a>
        <a href="/performance-center">Performance Center</a>
        <a href="/profile-center">Profile Center</a>
        """
        return _html_page("Rebuild Map", body)

    @app.route("/route-audit")
    def route_audit():
        audit = _read_json("reports/route_audit.json", {"total": 0, "ok": [], "failed": []})
        ok_html = "".join(f"<li>{x}</li>" for x in audit.get("ok", []))
        fail_html = "".join(f"<li>{x}</li>" for x in audit.get("failed", []))
        body = f"""
        <h1>Route Audit</h1>
        <p>Total checked: {audit.get("total", 0)}</p>
        <a href="/">Home</a>
        <a href="/command-center">Command Center</a>
        <a href="/project-inventory">Project Inventory</a>
        <a href="/system-registry">System Registry</a>
        <a href="/completion-board">Completion Board</a>
        <a href="/platform-summary">Platform Summary</a>
        <h2>OK Routes</h2>
        <ul>{ok_html}</ul>
        <h2>Failed Routes</h2>
        <ul>{fail_html}</ul>
        """
        return _html_page("Route Audit", body)
