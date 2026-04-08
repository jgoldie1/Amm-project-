def _page(title, body):
    return f"""
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>{title}</title>
      <style>
        body {{
          font-family: Arial, sans-serif;
          background: linear-gradient(180deg, #0f172a, #111827);
          color: white;
          margin: 0;
          padding: 0;
        }}
        .topbar {{
          position: sticky;
          top: 0;
          z-index: 20;
          background: rgba(15, 23, 42, 0.96);
          border-bottom: 1px solid #334155;
          padding: 14px 20px;
        }}
        .topbar a {{
          display: inline-block;
          margin: 4px 8px 4px 0;
          padding: 10px 14px;
          background: #2563eb;
          color: white;
          text-decoration: none;
          border-radius: 10px;
        }}
        .wrap {{
          max-width: 1250px;
          margin: 0 auto;
          padding: 24px;
        }}
        .hero {{
          background: linear-gradient(135deg, #1d4ed8, #7c3aed, #0f766e);
          padding: 30px;
          border-radius: 22px;
          margin: 18px 0 22px 0;
          box-shadow: 0 12px 32px rgba(0,0,0,0.35);
        }}
        .grid {{
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }}
        .card {{
          background: #1e293b;
          padding: 18px;
          border-radius: 18px;
          box-shadow: 0 8px 22px rgba(0,0,0,0.22);
        }}
        .card a {{
          display: inline-block;
          margin: 6px 8px 6px 0;
          padding: 10px 14px;
          background: #2563eb;
          color: white;
          text-decoration: none;
          border-radius: 10px;
        }}
        .pill {{
          display: inline-block;
          padding: 8px 12px;
          margin: 4px 8px 4px 0;
          background: rgba(255,255,255,0.14);
          border-radius: 999px;
        }}
        h1,h2,h3,p {{ margin-top: 0; }}
      </style>
    </head>
    <body>
      <div class="topbar">
        <a href="/platform-home">Platform Home</a>
        <a href="/master-dashboard">Master Dashboard</a>
        <a href="/visual-preview">Visual Preview</a>
        <a href="/clickable-map">Clickable Map</a>
        <a href="/holoverse-center">Holoverse</a>
        <a href="/boot-status">Boot Status</a>
      </div>
      <div class="wrap">
        {body}
      </div>
    
<!-- UI Unification Links -->
</body>
    </html>
    """

def register(app):
    @app.route("/platform-home")
    def platform_home_polished():
        body = """
        <div class="hero">
          <h1>Platform Home</h1>
          <p>A premium immersive creator, city, property, safety, and Holoverse ecosystem.</p>
          <a href="/customer-home" style="display:inline-block;padding:12px 16px;background:#111827;color:white;text-decoration:none;border-radius:10px;">Customer View</a>
          <a href="/creator-home" style="display:inline-block;padding:12px 16px;background:#111827;color:white;text-decoration:none;border-radius:10px;">Creator View</a>
          <a href="/operator-home" style="display:inline-block;padding:12px 16px;background:#111827;color:white;text-decoration:none;border-radius:10px;">Operator View</a>
          <div style="margin-top:14px;">
            <span class="pill">City</span>
            <span class="pill">Property</span>
            <span class="pill">Safety</span>
            <span class="pill">OASIS</span>
            <span class="pill">Holoverse</span>
            <span class="pill">Commerce</span>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <h3>Explore</h3>
            <p>Start from the user-facing side of the platform.</p>
            <a href="/customer-home">Customer Home</a>
            <a href="/marketplace-center">Marketplace</a>
            <a href="/premium-events">Premium Events</a>
            <a href="/property-center">Property</a>
          </div>

          <div class="card">
            <h3>Create</h3>
            <p>Access creator tools, studios, listings, and Holoverse spaces.</p>
            <a href="/creator-home">Creator Home</a>
            <a href="/creator-center">Creator Center</a>
            <a href="/studio-registry">Studio Registry</a>
            <a href="/holoverse-showcases">Holo Showcases</a>
          </div>

          <div class="card">
            <h3>Operate</h3>
            <p>Open the operator shell, recovery tools, and system controls.</p>
            <a href="/operator-home">Operator Home</a>
            <a href="/master-dashboard">Master Dashboard</a>
            <a href="/system-registry">System Registry</a>
            <a href="/boot-status">Boot Status</a>
          </div>

          <div class="card">
            <h3>Living World</h3>
            <p>City map, living population, jobs, housing, and presence.</p>
            <a href="/clickable-map">Clickable Map</a>
            <a href="/living-city-center">Living City</a>
            <a href="/population-ai">Population AI</a>
            <a href="/presence-board">Presence Board</a>
          </div>

          <div class="card">
            <h3>Holoverse</h3>
            <p>Holographic worlds, rooms, events, ads, and showcases.</p>
            <a href="/holoverse-center">Holoverse Center</a>
            <a href="/holoverse-viewer">Holo Viewer</a>
            <a href="/holoverse-events">Holo Events</a>
            <a href="/holo-commerce-center">Holo Commerce</a>
          </div>

          <div class="card">
            <h3>Identity</h3>
            <p>Auth, profiles, continuity, favorites, and quick launch.</p>
            <a href="/auth/login">Auth Login</a>
            <a href="/profile-center">Profile Center</a>
            <a href="/continuity-center">Continuity Center</a>
            <a href="/quick-launch-dashboard">Quick Launch</a>
          </div>
        </div>
        """
        return _page("Platform Home", body)

    @app.route("/master-dashboard")
    def master_dashboard_polished():
        body = """
        <div class="hero">
          <h1>Master Dashboard</h1>
          <p>Main operator dashboard for the stabilized platform.</p>
          <a href="/platform-summary" style="display:inline-block;padding:12px 16px;background:#111827;color:white;text-decoration:none;border-radius:10px;">Platform Summary</a>
          <a href="/completion-board" style="display:inline-block;padding:12px 16px;background:#111827;color:white;text-decoration:none;border-radius:10px;">Completion Board</a>
          <a href="/stabilize-toolkit" style="display:inline-block;padding:12px 16px;background:#111827;color:white;text-decoration:none;border-radius:10px;">Stabilize Toolkit</a>
        </div>

        <div class="grid">
          <div class="card">
            <h3>Core</h3>
            <a href="/safe-ok">Safe OK</a>
            <a href="/build-status">Build Status</a>
            <a href="/progress">Progress</a>
            <a href="/route-audit">Route Audit</a>
            <a href="/project-inventory">Inventory</a>
          </div>

          <div class="card">
            <h3>System</h3>
            <a href="/system-registry">System Registry</a>
            <a href="/module-status-board">Module Status</a>
            <a href="/completion-board">Completion Board</a>
            <a href="/production-readiness">Production Readiness</a>
            <a href="/platform-summary">Platform Summary</a>
          </div>

          <div class="card">
            <h3>Startup</h3>
            <a href="/boot-status">Boot Status</a>
            <a href="/boot-logs">Boot Logs</a>
            <a href="/stability-center">Stability Center</a>
            <a href="/continuity-center">Continuity Center</a>
          </div>

          <div class="card">
            <h3>City + Living</h3>
            <a href="/city-minimap">City Minimap</a>
            <a href="/clickable-map">Clickable Map</a>
            <a href="/living-city-center">Living City</a>
            <a href="/population-ai-plus">Population AI Plus</a>
          </div>

          <div class="card">
            <h3>Property + Safety</h3>
            <a href="/property-center">Property Center</a>
            <a href="/property-finance-center">Property Finance</a>
            <a href="/safety-center">Safety Center</a>
            <a href="/device-center">Device Center</a>
          </div>

          <div class="card">
            <h3>World + Holoverse</h3>
            <a href="/oasis-center">OASIS</a>
            <a href="/verse-center">Verse</a>
            <a href="/holoverse-center">Holoverse</a>
            <a href="/holoverse-viewer">Holo Viewer</a>
          </div>

          <div class="card">
            <h3>Commerce</h3>
            <a href="/creator-center">Creator Center</a>
            <a href="/marketplace-center">Marketplace</a>
            <a href="/holo-commerce-center">Holo Commerce</a>
            <a href="/premium-events">Premium Events</a>
          </div>

          <div class="card">
            <h3>Performance</h3>
            <a href="/performance-center">Performance Center</a>
            <a href="/speed-accelerator">Speed Accelerator</a>
            <a href="/speed-engine">Speed Engine</a>
            <a href="/lag-buster">Lag Buster</a>
          </div>

          <div class="card">
            <h3>Identity</h3>
            <a href="/auth/login">Auth Login</a>
            <a href="/profile-center">Profile Center</a>
            <a href="/role-preferences">Role Preferences</a>
            <a href="/private-dashboard-shell">Private Dashboard</a>
          </div>
        </div>
        """
        return _page("Master Dashboard", body)
