import json

def register_recovery_shell(app):
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
          <p>Modular recovery shell loaded.</p>
          <a href="/">Home</a>
          <a href="/health">Health</a>
          <a href="/safe-ok">Safe OK</a>
          <a href="/build-status">Build Status</a>
          <a href="/command-center">Command Center</a>
          <a href="/progress">Progress</a>
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
          <p>Plain modular shell active.</p>
          <a href="/">Home</a>
          <a href="/health">Health</a>
          <a href="/safe-ok">Safe OK</a>
          <a href="/build-status">Build Status</a>
          <a href="/command-center">Command Center</a>
          <a href="/progress">Progress</a>
          <a href="/project-inventory">Project Inventory</a>
          <a href="/rebuild-map">Rebuild Map</a>
          <a href="/route-audit">Route Audit</a>
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
          <a href="/project-inventory">Project Inventory</a>
          <a href="/rebuild-map">Rebuild Map</a>
          <a href="/route-audit">Route Audit</a>
          <a href="/city-minimap">City Minimap</a>
          <a href="/district-dashboard">District Dashboard</a>
          <a href="/traffic-transport-board">Traffic / Transport Board</a>
          <a href="/living-city-center">Living City Center</a>
          <a href="/property-center">Property Center</a>
          <a href="/property-operations-center">Property Operations</a>
          <a href="/safety-center">Safety Center</a>
          <a href="/oasis-center">OASIS Center</a>
          <a href="/verse-center">Verse Center</a>
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
          <p>Recovery shell is stable.</p>
          <p>Use Project Inventory, Rebuild Map, and Route Audit to restore advanced modules safely.</p>
          <a href="/">Home</a>
          <a href="/health">Health</a>
          <a href="/safe-ok">Safe OK</a>
          <a href="/build-status">Build Status</a>
          <a href="/command-center">Command Center</a>
          <a href="/progress">Progress</a>
          <a href="/project-inventory">Project Inventory</a>
          <a href="/rebuild-map">Rebuild Map</a>
          <a href="/route-audit">Route Audit</a>
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
          <a href="/command-center">Command Center</a>
          <a href="/city-minimap">City Minimap</a>
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
          <a href="/command-center">Command Center</a>
          <a href="/city-minimap">City Minimap</a>
          <a href="/district-dashboard">District Dashboard</a>
          <ul>{rows}</ul>
        </body>
        </html>
        """

    @app.route("/living-city-center")
    def living_city_center_plain():
        return """
        <html><head><meta name='viewport' content='width=device-width,initial-scale=1'>
        <title>Living City Center</title>
        <style>body { font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }
        a { display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }
        ul { line-height:1.8; }</style></head>
        <body><h1>Living City Center</h1><p>Recovery view of the living city engine.</p>
        <a href="/">Home</a><a href="/command-center">Command Center</a><a href="/property-center">Property Center</a><a href="/property-operations-center">Property Operations</a>
        <ul><li>Population Generator</li><li>Job Assignment Engine</li><li>Economy Demand Engine</li><li>Housing Demand Engine</li><li>Behavior Routines</li><li>Social Interaction System</li><li>Civic Center</li><li>Middleverse Bridge</li><li>Device Center</li><li>Accessibility Center</li></ul>
        </body></html>
        """

    @app.route("/property-center")
    def property_center_plain():
        return """
        <html><head><meta name='viewport' content='width=device-width,initial-scale=1'>
        <title>Property Center</title>
        <style>body { font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }
        a { display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }
        ul { line-height:1.8; }</style></head>
        <body><h1>Property Center</h1><p>Recovery view of the property development layer.</p>
        <a href="/">Home</a><a href="/command-center">Command Center</a><a href="/living-city-center">Living City Center</a><a href="/property-operations-center">Property Operations</a>
        <ul><li>Building Registry</li><li>Floor Plans</li><li>Elevator Access</li><li>Rental Center</li><li>Interior Studio</li><li>Media Spaces</li><li>Property Profitability</li></ul>
        </body></html>
        """

    @app.route("/property-operations-center")
    def property_operations_center_plain():
        return """
        <html><head><meta name='viewport' content='width=device-width,initial-scale=1'>
        <title>Property Operations Center</title>
        <style>body { font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }
        a { display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }
        ul { line-height:1.8; }</style></head>
        <body><h1>Property Operations Center</h1><p>Recovery view of property operations and access control.</p>
        <a href="/">Home</a><a href="/command-center">Command Center</a><a href="/living-city-center">Living City Center</a><a href="/property-center">Property Center</a>
        <ul><li>Lease Agreements</li><li>Occupancy Dashboard</li><li>Maintenance Tracker</li><li>Keycard Center</li><li>Room Editor</li><li>Property Value Estimator</li><li>Studio Rental Presets</li><li>VIP Suite Controls</li><li>Security Desk</li><li>Lobby / Reception</li></ul>
        </body></html>
        """

    @app.route("/safety-center")
    def safety_center_plain():
        return """
        <html><head><meta name='viewport' content='width=device-width,initial-scale=1'>
        <title>Safety Center</title>
        <style>body { font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }
        a { display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }
        ul { line-height:1.8; }</style></head>
        <body><h1>Safety Center</h1><p>Recovery view of trust, fraud, and device safety systems.</p>
        <a href="/">Home</a><a href="/command-center">Command Center</a><a href="/build-status">Build Status</a>
        <ul><li>Crime / Risk Registry</li><li>Fraud & Trust Checks</li><li>Bluetooth Pairing</li><li>Device Trust</li><li>Emergency Controls</li></ul>
        </body></html>
        """

    @app.route("/oasis-center")
    def oasis_center_plain():
        return """
        <html><head><meta name='viewport' content='width=device-width,initial-scale=1'>
        <title>OASIS Center</title>
        <style>body { font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }
        a { display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }
        ul { line-height:1.8; }</style></head>
        <body><h1>OASIS Center</h1><p>Recovery view of avatar, teleport, monetization, analytics, and world controls.</p>
        <a href="/">Home</a><a href="/command-center">Command Center</a><a href="/verse-center">Verse Center</a>
        <ul><li>Avatar Model Center</li><li>Teleport Map</li><li>World Monetization</li><li>World Analytics</li><li>NPC Guide Center</li><li>World Controls</li><li>Inventory Sync</li></ul>
        </body></html>
        """

    @app.route("/verse-center")
    def verse_center_plain():
        return """
        <html><head><meta name='viewport' content='width=device-width,initial-scale=1'>
        <title>Verse Center</title>
        <style>body { font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }
        a { display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }
        ul { line-height:1.8; }</style></head>
        <body><h1>Verse Center</h1><p>Recovery view of metaverse, middleverse, and multiverse layers.</p>
        <a href="/">Home</a><a href="/command-center">Command Center</a><a href="/oasis-center">OASIS Center</a>
        <ul><li>Metaverse</li><li>Middleverse</li><li>Multiverse</li><li>Immersive World Structure</li></ul>
        </body></html>
        """

    @app.route("/project-inventory")
    def project_inventory():
        data = {}
        try:
            with open("reports/project_inventory.json", "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            data = {"python_files_checked": [], "data_files": [], "config_files": []}

        py_count = len(data.get("python_files_checked", []))
        data_count = len(data.get("data_files", []))
        cfg_count = len(data.get("config_files", []))

        return f"""
        <html><head><meta name='viewport' content='width=device-width,initial-scale=1'>
        <title>Project Inventory</title>
        <style>body {{ font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }}
        a {{ display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }}</style></head>
        <body><h1>Project Inventory</h1><p>Python files checked: {py_count}</p><p>Data files found: {data_count}</p><p>Config files found: {cfg_count}</p>
        <a href="/">Home</a><a href="/command-center">Command Center</a><a href="/rebuild-map">Rebuild Map</a><a href="/route-audit">Route Audit</a></body></html>
        """

    @app.route("/rebuild-map")
    def rebuild_map():
        return """
        <html><head><meta name='viewport' content='width=device-width,initial-scale=1'>
        <title>Rebuild Map</title>
        <style>body { font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }
        a { display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }
        ul { line-height:1.8; }</style></head>
        <body><h1>Rebuild Map</h1>
        <ul>
          <li>Step 1: Stable plain recovery shell</li>
          <li>Step 2: City pages restored</li>
          <li>Step 3: Living City / Property / Safety / OASIS / Verse centers restored</li>
          <li>Step 4: Rebuild advanced helper pages one route at a time</li>
          <li>Step 5: Restore interactive XR/world systems in verified modules</li>
        </ul>
        <a href="/">Home</a><a href="/command-center">Command Center</a><a href="/project-inventory">Project Inventory</a><a href="/route-audit">Route Audit</a>
        </body></html>
        """

    @app.route("/route-audit")
    def route_audit():
        try:
            with open("reports/route_audit.json", "r", encoding="utf-8") as f:
                audit = json.load(f)
        except Exception:
            audit = {"total": 0, "ok": [], "failed": []}

        ok_html = "".join(f"<li>{x}</li>" for x in audit.get("ok", []))
        fail_html = "".join(f"<li>{x}</li>" for x in audit.get("failed", []))

        return f"""
        <html><head><meta name='viewport' content='width=device-width,initial-scale=1'>
        <title>Route Audit</title>
        <style>body {{ font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }}
        a {{ display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }}
        h2 {{ margin-top:28px; }}</style></head>
        <body>
        <h1>Route Audit</h1>
        <p>Total checked: {audit.get("total", 0)}</p>
        <a href="/">Home</a><a href="/command-center">Command Center</a><a href="/project-inventory">Project Inventory</a>
        <h2>OK Routes</h2><ul>{ok_html}</ul>
        <h2>Failed Routes</h2><ul>{fail_html}</ul>
        </body></html>
        """
