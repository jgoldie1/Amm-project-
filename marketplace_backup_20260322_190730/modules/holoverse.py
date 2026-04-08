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
        input, textarea {{ width:100%; max-width:720px; padding:10px; margin:8px 0; border-radius:8px; border:1px solid #334155; }}
        .card {{ background:#1e293b; padding:16px; border-radius:12px; margin:14px 0; }}
        .hero {{ background:linear-gradient(135deg,#06b6d4,#7c3aed,#22c55e); padding:24px; border-radius:16px; margin:16px 0; }}
        .grid {{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }}
        .tile {{ padding:18px; border-radius:12px; font-weight:bold; }}
        canvas {{ width:100%; max-width:820px; border-radius:12px; border:1px solid #334155; background:#111827; }}
        ul {{ line-height:1.8; }}
      </style>
    </head>
    <body>{body}</body>
    </html>
    """

def register(app):
    from flask import request, redirect

    @app.route("/holoverse-center")
    def holoverse_center():
        body = """
        <h1>Holoverse Center</h1>
        <p>Holographic immersive presentation layer for the platform.</p>
        <a href="/command-center">Command Center</a>
        <a href="/creator-center">Creator Center</a>
        <a href="/oasis-center">OASIS Center</a>
        <a href="/holoverse-worlds">Holoverse Worlds</a>
        <a href="/holoverse-rooms">Holoverse Rooms</a>
        <a href="/holoverse-events">Holoverse Events</a>
        <a href="/holoverse-ads">Holoverse Ads</a>
        <a href="/holoverse-showcases">Holoverse Showcases</a>
        <a href="/holoverse-viewer">Holoverse Viewer</a>
        <div class="hero">
          <h2>What Holoverse Does</h2>
          <p>It turns city, property, creator, OASIS, and event systems into a visual holographic layer.</p>
        </div>
        <div class="grid">
          <div class="tile" style="background:#2563eb;">Holographic Worlds</div>
          <div class="tile" style="background:#16a34a;">Creator Stages</div>
          <div class="tile" style="background:#7c3aed;">Immersive Events</div>
          <div class="tile" style="background:#f59e0b;">Product Showcases</div>
          <div class="tile" style="background:#0f766e;">Holo Ads</div>
          <div class="tile" style="background:#dc2626;">Premium Spaces</div>
        </div>
        """
        return _page("Holoverse Center", body)

    @app.route("/holoverse-worlds", methods=["GET","POST"])
    def holoverse_worlds():
        rows = _read("data/holoverse/worlds.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "world_name": request.form.get("world_name", "").strip() or "Untitled Holo World",
                "world_type": request.form.get("world_type", "").strip() or "city_holo_world",
                "created_at": str(datetime.datetime.now())
            })
            _write("data/holoverse/worlds.json", rows)
            return redirect("/holoverse-worlds")

        items = "".join(f"<li>{x.get('world_name')} | {x.get('world_type')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Holoverse Worlds</h1>
        <a href="/holoverse-center">Holoverse Center</a>
        <div class="card">
          <form method="post">
            <input name="world_name" placeholder="Holo world name">
            <input name="world_type" placeholder="city_holo_world / creator_holo_world / event_holo_world / property_holo_world">
            <button type="submit">Save Holo World</button>
          </form>
        </div>
        <div class="card"><p>Total holo worlds: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Holoverse Worlds", body)

    @app.route("/holoverse-rooms", methods=["GET","POST"])
    def holoverse_rooms():
        rows = _read("data/holoverse/rooms.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "room_name": request.form.get("room_name", "").strip() or "Untitled Holo Room",
                "room_type": request.form.get("room_type", "").strip() or "creator_stage",
                "created_at": str(datetime.datetime.now())
            })
            _write("data/holoverse/rooms.json", rows)
            return redirect("/holoverse-rooms")

        items = "".join(f"<li>{x.get('room_name')} | {x.get('room_type')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Holoverse Rooms</h1>
        <a href="/holoverse-center">Holoverse Center</a>
        <div class="card">
          <form method="post">
            <input name="room_name" placeholder="Holo room name">
            <input name="room_type" placeholder="creator_stage / holo_suite / event_room / showroom / ad_room">
            <button type="submit">Save Holo Room</button>
          </form>
        </div>
        <div class="card"><p>Total holo rooms: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Holoverse Rooms", body)

    @app.route("/holoverse-events", methods=["GET","POST"])
    def holoverse_events():
        rows = _read("data/holoverse/events.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "event_name": request.form.get("event_name", "").strip() or "Untitled Holo Event",
                "event_type": request.form.get("event_type", "").strip() or "concert",
                "created_at": str(datetime.datetime.now())
            })
            _write("data/holoverse/events.json", rows)
            return redirect("/holoverse-events")

        items = "".join(f"<li>{x.get('event_name')} | {x.get('event_type')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Holoverse Events</h1>
        <a href="/holoverse-center">Holoverse Center</a>
        <div class="card">
          <form method="post">
            <input name="event_name" placeholder="Holo event name">
            <input name="event_type" placeholder="concert / showcase / launch / class / vip_event">
            <button type="submit">Save Holo Event</button>
          </form>
        </div>
        <div class="card"><p>Total holo events: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Holoverse Events", body)

    @app.route("/holoverse-ads", methods=["GET","POST"])
    def holoverse_ads():
        rows = _read("data/holoverse/ads.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "ad_name": request.form.get("ad_name", "").strip() or "Untitled Holo Ad",
                "ad_type": request.form.get("ad_type", "").strip() or "brand_wall",
                "created_at": str(datetime.datetime.now())
            })
            _write("data/holoverse/ads.json", rows)
            return redirect("/holoverse-ads")

        items = "".join(f"<li>{x.get('ad_name')} | {x.get('ad_type')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Holoverse Ads</h1>
        <a href="/holoverse-center">Holoverse Center</a>
        <div class="card">
          <form method="post">
            <input name="ad_name" placeholder="Holo ad name">
            <input name="ad_type" placeholder="brand_wall / floating_ad / stage_banner / premium_slot">
            <button type="submit">Save Holo Ad</button>
          </form>
        </div>
        <div class="card"><p>Total holo ads: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Holoverse Ads", body)

    @app.route("/holoverse-showcases", methods=["GET","POST"])
    def holoverse_showcases():
        rows = _read("data/holoverse/showcases.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "showcase_name": request.form.get("showcase_name", "").strip() or "Untitled Showcase",
                "showcase_type": request.form.get("showcase_type", "").strip() or "product_showcase",
                "created_at": str(datetime.datetime.now())
            })
            _write("data/holoverse/showcases.json", rows)
            return redirect("/holoverse-showcases")

        items = "".join(f"<li>{x.get('showcase_name')} | {x.get('showcase_type')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Holoverse Showcases</h1>
        <a href="/holoverse-center">Holoverse Center</a>
        <div class="card">
          <form method="post">
            <input name="showcase_name" placeholder="Showcase name">
            <input name="showcase_type" placeholder="product_showcase / property_showcase / creator_showcase / vip_showcase">
            <button type="submit">Save Showcase</button>
          </form>
        </div>
        <div class="card"><p>Total showcases: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Holoverse Showcases", body)

    @app.route("/holoverse-viewer")
    def holoverse_viewer():
        body = """
        <h1>Holoverse Viewer</h1>
        <a href="/holoverse-center">Holoverse Center</a>
        <div class="card">
          <canvas id="holo" width="820" height="340"></canvas>
          <script>
            const c = document.getElementById('holo');
            const x = c.getContext('2d');
            const g = x.createLinearGradient(0,0,c.width,c.height);
            g.addColorStop(0,'#06b6d4');
            g.addColorStop(0.5,'#7c3aed');
            g.addColorStop(1,'#22c55e');
            x.fillStyle = g;
            x.fillRect(0,0,c.width,c.height);

            x.fillStyle = 'rgba(255,255,255,0.95)';
            x.font = '28px Arial';
            x.fillText('Holoverse Viewer Scaffold', 24, 42);

            x.strokeStyle = 'rgba(255,255,255,0.65)';
            x.lineWidth = 2;
            x.strokeRect(60,90,160,180);
            x.strokeRect(290,120,190,150);
            x.strokeRect(550,80,200,200);

            x.fillStyle = 'rgba(255,255,255,0.85)';
            x.font = '18px Arial';
            x.fillText('Holo Stage', 95, 120);
            x.fillText('Showcase Zone', 320, 150);
            x.fillText('Premium Holo Room', 575, 110);
          </script>
        </div>
        <div class="card">
          <p>This viewer is the holographic visual shell for future XR and immersive rendering.</p>
        </div>
        """
        return _page("Holoverse Viewer", body)
