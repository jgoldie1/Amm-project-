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
        .wrap {{
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }}
        .topbar {{
          position: sticky;
          top: 0;
          background: rgba(15, 23, 42, 0.95);
          padding: 14px 24px;
          border-bottom: 1px solid #334155;
          z-index: 10;
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
        .hero {{
          background: linear-gradient(135deg, #1d4ed8, #7c3aed, #0f766e);
          padding: 28px;
          border-radius: 20px;
          margin: 20px 0;
          box-shadow: 0 10px 30px rgba(0,0,0,0.35);
        }}
        .grid {{
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }}
        .card {{
          background: #1e293b;
          padding: 18px;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
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
        h1,h2,h3,p {{ margin-top: 0; }}
        canvas {{
          width: 100%;
          max-width: 1000px;
          border-radius: 18px;
          border: 1px solid #334155;
          background: #0b1220;
        }}
      </style>
    </head>
    <body>
      <div class="topbar">
        <a href="/platform-home">Platform Home</a>
        <a href="/master-dashboard">Master Dashboard</a>
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
    @app.route("/visual-preview")
    def visual_preview():
        body = """
        <div class="hero">
          <h1>Visual Preview</h1>
          <p>This is the polished preview shell for your platform.</p>
          <a href="/platform-home" style="display:inline-block;padding:12px 16px;background:#111827;color:white;text-decoration:none;border-radius:10px;">Open Platform Home</a>
          <a href="/master-dashboard" style="display:inline-block;padding:12px 16px;background:#111827;color:white;text-decoration:none;border-radius:10px;">Open Master Dashboard</a>
        </div>

        <div class="grid">
          <div class="card">
            <h3>Front Platform</h3>
            <p>User, creator, and operator entry points.</p>
            <a href="/platform-home">Platform Home</a>
            <a href="/role-hub">Role Hub</a>
          </div>

          <div class="card">
            <h3>City + Living World</h3>
            <p>City shell, districts, jobs, economy, and presence.</p>
            <a href="/clickable-map">Clickable Map</a>
            <a href="/living-city-center">Living City</a>
          </div>

          <div class="card">
            <h3>Holoverse</h3>
            <p>Holographic worlds, rooms, events, and showcases.</p>
            <a href="/holoverse-center">Holoverse Center</a>
            <a href="/holoverse-viewer">Holo Viewer</a>
          </div>

          <div class="card">
            <h3>Property + Commerce</h3>
            <p>Buildings, rentals, occupancy, finance, and Holo commerce.</p>
            <a href="/property-center">Property Center</a>
            <a href="/holo-commerce-center">Holo Commerce</a>
          </div>

          <div class="card">
            <h3>Auth + Profiles</h3>
            <p>Login, profiles, favorites, sessions, and private dashboard shell.</p>
            <a href="/auth/login">Auth Login</a>
            <a href="/profile-center">Profile Center</a>
          </div>

          <div class="card">
            <h3>System Control</h3>
            <p>Boot, module status, completion tracking, and audits.</p>
            <a href="/master-dashboard">Master Dashboard</a>
            <a href="/boot-status">Boot Status</a>
          </div>
        </div>

        <div class="card" style="margin-top:20px;">
          <h3>Scene Preview</h3>
          <canvas id="preview" width="1000" height="360"></canvas>
          <script>
            const c = document.getElementById('preview');
            const x = c.getContext('2d');
            const g = x.createLinearGradient(0,0,c.width,c.height);
            g.addColorStop(0,'#1d4ed8');
            g.addColorStop(0.5,'#7c3aed');
            g.addColorStop(1,'#0f766e');
            x.fillStyle = g;
            x.fillRect(0,0,c.width,c.height);

            x.fillStyle = 'rgba(255,255,255,0.95)';
            x.font = '30px Arial';
            x.fillText('Platform Visual Preview', 24, 42);

            x.fillStyle = 'rgba(255,255,255,0.18)';
            x.fillRect(60,90,180,180);
            x.fillRect(300,120,220,150);
            x.fillRect(600,80,260,200);

            x.fillStyle = 'rgba(255,255,255,0.9)';
            x.font = '20px Arial';
            x.fillText('City Zone', 105, 125);
            x.fillText('Creator / Commerce', 330, 155);
            x.fillText('Holoverse Layer', 645, 115);
          </script>
        </div>
        """
        return _page("Visual Preview", body)
