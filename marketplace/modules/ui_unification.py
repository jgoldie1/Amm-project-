import json

def _read(path, fallback):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return fallback

def shared_layout(title, inner):
    sections = _read("data/ui/nav_sections.json", [])
    nav_html = ""
    for section in sections:
        links = "".join(
            f'<a href="{route}">{label}</a>'
            for label, route in section.get("links", [])
        )
        nav_html += f'<div class="nav-group"><strong>{section.get("title","Section")}</strong><div>{links}</div></div>'

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
        .shell {{
          display: grid;
          grid-template-columns: 280px 1fr;
          min-height: 100vh;
        }}
        .sidebar {{
          background: rgba(15,23,42,0.98);
          border-right: 1px solid #334155;
          padding: 18px;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }}
        .content {{
          padding: 24px;
        }}
        .brand {{
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 18px;
        }}
        .nav-group {{
          margin-bottom: 18px;
          background: #172033;
          padding: 14px;
          border-radius: 14px;
        }}
        .nav-group strong {{
          display: block;
          margin-bottom: 10px;
          color: #cbd5e1;
        }}
        .nav-group a {{
          display: inline-block;
          margin: 4px 6px 4px 0;
          padding: 9px 12px;
          background: #2563eb;
          color: white;
          text-decoration: none;
          border-radius: 10px;
        }}
        .hero {{
          background: linear-gradient(135deg,#1d4ed8,#7c3aed,#0f766e);
          padding: 28px;
          border-radius: 20px;
          margin-bottom: 18px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.30);
        }}
        .grid {{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:14px;
        }}
        .card {{
          background:#1e293b;
          padding:18px;
          border-radius:16px;
          box-shadow:0 8px 22px rgba(0,0,0,0.22);
        }}
        .card a, .cta {{
          display:inline-block;
          margin:6px 8px 6px 0;
          padding:10px 14px;
          background:#2563eb;
          color:white;
          text-decoration:none;
          border:none;
          border-radius:10px;
        }}
        .pill {{
          display:inline-block;
          padding:8px 12px;
          margin:4px 8px 4px 0;
          background:rgba(255,255,255,0.14);
          border-radius:999px;
        }}
        h1,h2,h3,p {{ margin-top:0; }}
        @media (max-width: 980px) {{
          .shell {{ grid-template-columns: 1fr; }}
          .sidebar {{ position: relative; height: auto; }}
          .grid {{ grid-template-columns: 1fr; }}
        }}
      </style>
    </head>
    <body>
      <div class="shell">
        <aside class="sidebar">
          <div class="brand">Platform UI</div>
          {nav_html}
        </aside>
        <main class="content">
          {inner}
        </main>
      </div>
    </body>
    </html>
    """

def register(app):
    @app.route("/route-map")
    def route_map():
        body = """
        <div class="hero">
          <h1>Route Map</h1>
          <p>Quick visual way to move across the major systems.</p>
          <span class="pill">Front</span>
          <span class="pill">Core</span>
          <span class="pill">World</span>
          <span class="pill">Commerce</span>
          <span class="pill">Identity</span>
        </div>
        <div class="grid">
          <div class="card">
            <h3>Front</h3>
            <a href="/platform-home">Platform Home</a>
            <a href="/customer-home">Customer</a>
            <a href="/creator-home">Creator</a>
            <a href="/operator-home">Operator</a>
          </div>
          <div class="card">
            <h3>World</h3>
            <a href="/clickable-map">Clickable Map</a>
            <a href="/living-city-center">Living City</a>
            <a href="/oasis-center">OASIS</a>
            <a href="/holoverse-center">Holoverse</a>
          </div>
          <div class="card">
            <h3>Commerce</h3>
            <a href="/payments-center">Payments</a>
            <a href="/holo-products-store">Products</a>
            <a href="/premium-events-store">Events</a>
            <a href="/room-booking-store">Bookings</a>
          </div>
        </div>
        """
        return shared_layout("Route Map", body)

    @app.route("/platform-verify")
    def platform_verify():
        checks = [
            ("Platform Home", "/platform-home"),
            ("Master Dashboard", "/master-dashboard"),
            ("Auth Login", "/auth/login"),
            ("Payments Center", "/payments-center"),
            ("Holoverse", "/holoverse-center"),
            ("Boot Status", "/boot-status"),
            ("System Registry", "/system-registry"),
            ("Route Map", "/route-map"),
        ]
        items = "".join(
            f'<li><a href="{route}">{label}</a></li>'
            for label, route in checks
        )
        body = f"""
        <div class="hero">
          <h1>Platform Verify</h1>
          <p>Use this page to quickly confirm the most important surfaces are reachable.</p>
        </div>
        <div class="card">
          <ul>{items}</ul>
        </div>
        """
        return shared_layout("Platform Verify", body)
