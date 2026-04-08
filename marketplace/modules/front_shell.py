import json

def _read(path, fallback):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return fallback

def _page(title, body):
    return f"""
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>{title}</title>
      <style>
        body {{ font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }}
        a {{ display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }}
        .hero {{ background:linear-gradient(135deg,#1d4ed8,#7c3aed,#0f766e); padding:28px; border-radius:18px; margin:16px 0; }}
        .grid {{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }}
        .card {{ background:#1e293b; padding:16px; border-radius:12px; }}
        h1,h2,h3,p {{ margin-top:0; }}
      </style>
    </head>
    <body>{body}</body>
    </html>
    """

def register(app):
    @app.route("/platform-home")
    def platform_home():
        hero = _read("data/front/hero_messages.json", [{"title":"Welcome","subtitle":"Platform home"}])[0]
        cards = _read("data/front/featured_cards.json", [])
        card_html = "".join(
            f'<div class="card"><h3>{c.get("title","Untitled")}</h3><a href="{c.get("route","/")}">Open</a></div>'
            for c in cards
        )
        body = f"""
        <h1>Platform Home</h1>
        <a href="/role-hub">Role Hub</a>
        <a href="/customer-home">Customer Home</a>
        <a href="/creator-home">Creator Home</a>
        <a href="/operator-home">Operator Home</a>
        <div class="hero">
          <h2>{hero.get("title","Welcome")}</h2>
          <p>{hero.get("subtitle","Platform home")}</p>
          <a href="/holoverse-center">Enter Holoverse</a>
          <a href="/marketplace-center">Explore Marketplace</a>
          <a href="/premium-events">View Premium Events</a>
          <a href="/property-center">Explore Property</a>
        </div>
        <div class="grid">{card_html}</div>
        """
        return _page("Platform Home", body)

    @app.route("/role-hub")
    def role_hub():
        body = """
        <h1>Role Hub</h1>
        <p>Select your platform entry point.</p>
        <a href="/platform-home">Platform Home</a>
        <a href="/customer-home">Customer Home</a>
        <a href="/creator-home">Creator Home</a>
        <a href="/operator-home">Operator Home</a>
        """
        return _page("Role Hub", body)

    @app.route("/customer-home")
    def customer_home():
        body = """
        <h1>Customer Home</h1>
        <p>User-facing entry point for events, commerce, property, and immersive experiences.</p>
        <a href="/platform-home">Platform Home</a>
        <a href="/marketplace-center">Marketplace</a>
        <a href="/holo-products">Holo Products</a>
        <a href="/premium-events">Premium Events</a>
        <a href="/ticket-center">Ticket Center</a>
        <a href="/property-center">Property</a>
        <a href="/holoverse-center">Holoverse</a>
        <a href="/holoverse-viewer">Holo Viewer</a>
        """
        return _page("Customer Home", body)

    @app.route("/creator-home")
    def creator_home():
        body = """
        <h1>Creator Home</h1>
        <p>Creator-facing entry point for studios, listings, stages, and world tools.</p>
        <a href="/platform-home">Platform Home</a>
        <a href="/creator-center">Creator Center</a>
        <a href="/studio-registry">Studio Registry</a>
        <a href="/marketplace-center">Marketplace Center</a>
        <a href="/asset-placement">Asset Placement</a>
        <a href="/holoverse-center">Holoverse</a>
        <a href="/holoverse-rooms">Holo Rooms</a>
        <a href="/holoverse-showcases">Holo Showcases</a>
        <a href="/premium-events">Premium Events</a>
        """
        return _page("Creator Home", body)

    @app.route("/operator-home")
    def operator_home():
        body = """
        <h1>Operator Home</h1>
        <p>Admin/operator entry point for platform management.</p>
        <a href="/platform-home">Platform Home</a>
        <a href="/master-dashboard">Master Dashboard</a>
        <a href="/command-center">Command Center</a>
        <a href="/living-city-center">Living City</a>
        <a href="/property-center">Property</a>
        <a href="/property-operations-center">Property Operations</a>
        <a href="/safety-center">Safety</a>
        <a href="/oasis-center">OASIS</a>
        <a href="/engine-center">Engine</a>
        <a href="/holoverse-center">Holoverse</a>
        <a href="/project-inventory">Project Inventory</a>
        <a href="/route-audit">Route Audit</a>
        """
        return _page("Operator Home", body)
