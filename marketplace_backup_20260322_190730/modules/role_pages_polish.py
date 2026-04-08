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
        <a href="/customer-home">Customer</a>
        <a href="/creator-home">Creator</a>
        <a href="/operator-home">Operator</a>
        <a href="/master-dashboard">Master Dashboard</a>
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
    @app.route("/customer-home")
    def customer_home_polished():
        body = """
        <div class="hero">
          <h1>Customer Home</h1>
          <p>Browse products, property, events, and immersive Holoverse experiences.</p>
          <span class="pill">Marketplace</span>
          <span class="pill">Property</span>
          <span class="pill">Events</span>
          <span class="pill">Holoverse</span>
        </div>
        <div class="grid">
          <div class="card">
            <h3>Shop</h3>
            <a href="/marketplace-center">Marketplace</a>
            <a href="/holo-products">Holo Products</a>
            <a href="/holo-commerce-center">Holo Commerce</a>
          </div>
          <div class="card">
            <h3>Events</h3>
            <a href="/premium-events">Premium Events</a>
            <a href="/ticket-center">Ticket Center</a>
            <a href="/holoverse-events">Holoverse Events</a>
          </div>
          <div class="card">
            <h3>Places</h3>
            <a href="/property-center">Property Center</a>
            <a href="/holoverse-center">Holoverse Center</a>
            <a href="/holoverse-viewer">Holo Viewer</a>
          </div>
        </div>
        """
        return _page("Customer Home", body)

    @app.route("/creator-home")
    def creator_home_polished():
        body = """
        <div class="hero">
          <h1>Creator Home</h1>
          <p>Manage studios, listings, stages, showcases, and immersive creator spaces.</p>
          <span class="pill">Studios</span>
          <span class="pill">Listings</span>
          <span class="pill">Showcases</span>
          <span class="pill">Holoverse</span>
        </div>
        <div class="grid">
          <div class="card">
            <h3>Create</h3>
            <a href="/creator-center">Creator Center</a>
            <a href="/studio-registry">Studio Registry</a>
            <a href="/marketplace-center">Marketplace Center</a>
          </div>
          <div class="card">
            <h3>Display</h3>
            <a href="/holoverse-showcases">Holo Showcases</a>
            <a href="/asset-placement">Asset Placement</a>
            <a href="/holoverse-rooms">Holo Rooms</a>
          </div>
          <div class="card">
            <h3>Earn</h3>
            <a href="/holo-commerce-center">Holo Commerce</a>
            <a href="/premium-events">Premium Events</a>
            <a href="/premium-room-bookings">Room Bookings</a>
          </div>
        </div>
        """
        return _page("Creator Home", body)

    @app.route("/operator-home")
    def operator_home_polished():
        body = """
        <div class="hero">
          <h1>Operator Home</h1>
          <p>Control the platform, monitor startup health, and manage all major systems.</p>
          <span class="pill">Recovery</span>
          <span class="pill">City</span>
          <span class="pill">Safety</span>
          <span class="pill">System Control</span>
        </div>
        <div class="grid">
          <div class="card">
            <h3>System</h3>
            <a href="/master-dashboard">Master Dashboard</a>
            <a href="/system-registry">System Registry</a>
            <a href="/completion-board">Completion Board</a>
          </div>
          <div class="card">
            <h3>Boot</h3>
            <a href="/boot-status">Boot Status</a>
            <a href="/boot-logs">Boot Logs</a>
            <a href="/stability-center">Stability Center</a>
          </div>
          <div class="card">
            <h3>Core Ops</h3>
            <a href="/living-city-center">Living City</a>
            <a href="/property-center">Property</a>
            <a href="/safety-center">Safety</a>
          </div>
        </div>
        """
        return _page("Operator Home", body)
