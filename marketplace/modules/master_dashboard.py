import json
import uuid
import datetime

def _read(path, fallback):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return fallback

def _write(path, rows):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=2)

def _page(title, body):
    return f"""
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>{title}</title>
      <style>
        body {{ font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }}
        a, button {{ display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border:none; border-radius:8px; }}
        input, textarea {{ width:100%; max-width:760px; padding:10px; margin:8px 0; border-radius:8px; border:1px solid #334155; }}
        .card {{ background:#1e293b; padding:16px; border-radius:12px; margin:14px 0; }}
        .hero {{ background:linear-gradient(135deg,#1d4ed8,#7c3aed,#0f766e); padding:24px; border-radius:16px; margin:16px 0; }}
        .grid {{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }}
        .tile {{ background:#1e293b; padding:16px; border-radius:12px; }}
        ul {{ line-height:1.8; }}
      </style>
    </head>
    <body>{body}
<!-- UI Unification Links -->
</body>
    </html>
    """

def register(app):
    from flask import request, redirect

    @app.route("/master-dashboard")
    def master_dashboard():
        body = """
        <h1>Master Dashboard</h1>
        <p>Main operator dashboard for the stabilized platform.</p>

        <div class="hero">
          <h2>Platform Core</h2>
          <a href="/safe-ok">Safe OK</a>
          <a href="/build-status">Build Status</a>
          <a href="/command-center">Command Center</a>
          <a href="/progress">Progress</a>
          <a href="/project-inventory">Project Inventory</a>
        <a href="/system-registry">System Registry</a>
        <a href="/completion-board">Completion Board</a>
        <a href="/platform-summary">Platform Summary</a>
          <a href="/route-audit">Route Audit</a>
          <a href="/rebuild-map">Rebuild Map</a>
          <a href="/platform-home">Platform Home</a>
        </div>

        <div class="grid">
          <div class="tile">
            <h3>City</h3>
            <a href="/city-minimap">City Minimap</a>
            <a href="/district-dashboard">District Dashboard</a>
            <a href="/traffic-transport-board">Traffic Board</a>
            <a href="/clickable-map">Clickable Map</a>
            <a href="/zone-editor">Zone Editor</a>
            <a href="/route-controls">Route Controls</a>
          </div>

          <div class="tile">
            <h3>Living City</h3>
            <a href="/living-city-center">Living City Center</a>
            <a href="/population-ai">Population AI</a>
            <a href="/job-system">Job System</a>
            <a href="/economy-demand-board">Economy Demand</a>
            <a href="/housing-demand-board">Housing Demand</a>
            <a href="/presence-board">Presence Board</a>
            <a href="/population-ai-plus">Population AI Plus</a>
          </div>

          <div class="tile">
            <h3>Property</h3>
            <a href="/property-center">Property Center</a>
            <a href="/property-operations-center">Property Operations</a>
            <a href="/building-registry">Buildings</a>
            <a href="/rental-center">Rentals</a>
            <a href="/occupancy-board">Occupancy</a>
            <a href="/asset-placement">Asset Placement</a>
            <a href="/property-finance-center">Property Finance</a>
          </div>

          <div class="tile">
            <h3>Safety & Devices</h3>
            <a href="/safety-center">Safety Center</a>
            <a href="/incident-registry">Incidents</a>
            <a href="/trust-center">Trust Center</a>
            <a href="/device-center">Device Center</a>
            <a href="/bluetooth-center">Bluetooth</a>
            <a href="/device-trust-center">Device Trust</a>
            <a href="/accessibility-center">Accessibility</a>
          </div>

          <div class="tile">
            <h3>OASIS & Verse</h3>
            <a href="/oasis-center">OASIS Center</a>
            <a href="/teleport-map">Teleport Map</a>
            <a href="/world-registry">World Registry</a>
            <a href="/verse-center">Verse Center</a>
            <a href="/holoverse-center">Holoverse</a>
          </div>

          <div class="tile">
            <h3>Creator & Commerce</h3>
            <a href="/creator-center">Creator Center</a>
            <a href="/studio-registry">Studio Registry</a>
            <a href="/marketplace-center">Marketplace Center</a>
            <a href="/holo-commerce-center">Holo Commerce</a>
            <a href="/holo-products">Holo Products</a>
            <a href="/premium-events">Premium Events</a>
            <a href="/payments-center">Payments Center</a>
            <a href="/holo-products-store">Products Store</a>
            <a href="/premium-events-store">Events Store</a>
            <a href="/room-booking-store">Room Booking Store</a>
          </div>

          <div class="tile">
            <h3>Engine</h3>
            <a href="/engine-center">Engine Center</a>
            <a href="/webgl-viewer">WebGL Viewer</a>
            <a href="/avatar-preview">Avatar Preview</a>
            <a href="/transport-board">Transport Board</a>
            <a href="/world-streaming-center">World Streaming</a>
          </div>

          <div class="tile">
            <h3>Holoverse</h3>
            <a href="/holoverse-center">Holoverse Center</a>
            <a href="/holoverse-worlds">Holo Worlds</a>
            <a href="/holoverse-rooms">Holo Rooms</a>
            <a href="/holoverse-events">Holo Events</a>
            <a href="/holoverse-ads">Holo Ads</a>
            <a href="/holoverse-showcases">Holo Showcases</a>
            <a href="/holoverse-viewer">Holo Viewer</a>
          </div>

          <div class="tile">
            <h3>Performance & Identity</h3>
            <a href="/performance-center">Performance Center</a>
            <a href="/speed-accelerator">Speed Accelerator</a>
            <a href="/speed-engine">Speed Engine</a>
            <a href="/lag-buster">Lag Buster</a>
            <a href="/profile-center">Profile Center</a>
            <a href="/basic-profiles">Basic Profiles</a>
            <a href="/role-preferences">Role Preferences</a>
            <a href="/favorite-zones">Favorites</a>
            <a href="/private-dashboard-shell">Private Dashboard</a>
          </div>
        </div>

        <a href="/dashboard-admin">Dashboard Admin</a>
        <a href="/admin-center">Admin Center</a>
        <a href="/qa-dashboard">QA Dashboard</a>
        <a href="/deployment-dashboard">Deployment Dashboard</a>
        <a href="/creator-workspace">Creator Workspace</a>
        """
        return _page("Master Dashboard", body)

    @app.route("/dashboard-admin", methods=["GET","POST"])
    def dashboard_admin():
        ann = _read("data/dashboard/announcements.json", [])
        actions = _read("data/dashboard/quick_actions.json", [])

        if request.method == "POST":
            mode = request.form.get("mode","announcement").strip()
            if mode == "announcement":
                ann.append({
                    "id": str(uuid.uuid4()),
                    "title": request.form.get("title","Untitled Announcement").strip() or "Untitled Announcement",
                    "created_at": str(datetime.datetime.now())
                })
                _write("data/dashboard/announcements.json", ann)
            else:
                actions.append({
                    "id": str(uuid.uuid4()),
                    "label": request.form.get("label","Untitled Action").strip() or "Untitled Action",
                    "target": request.form.get("target","/master-dashboard").strip() or "/master-dashboard",
                    "created_at": str(datetime.datetime.now())
                })
                _write("data/dashboard/quick_actions.json", actions)
            return redirect("/dashboard-admin")

        ann_items = "".join(f"<li>{x.get('title')}</li>" for x in ann[-20:])
        act_items = "".join(f"<li>{x.get('label')} → {x.get('target')}</li>" for x in actions[-20:])

        body = f"""
        <h1>Dashboard Admin</h1>
        <a href="/master-dashboard">Master Dashboard</a>

        <div class="card">
          <h3>Add Announcement</h3>
          <form method="post">
            <input type="hidden" name="mode" value="announcement">
            <input name="title" placeholder="Announcement title">
            <button type="submit">Save Announcement</button>
          </form>
        </div>

        <div class="card">
          <h3>Add Quick Action</h3>
          <form method="post">
            <input type="hidden" name="mode" value="action">
            <input name="label" placeholder="Action label">
            <input name="target" placeholder="/target-route">
            <button type="submit">Save Quick Action</button>
          </form>
        </div>

        <div class="card"><h3>Announcements</h3><ul>{ann_items}</ul></div>
        <div class="card"><h3>Quick Actions</h3><ul>{act_items}</ul></div>
        """
        return _page("Dashboard Admin", body)
