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
        ul {{ line-height:1.8; }}
      </style>
    </head>
    <body>{body}</body>
    </html>
    """

def register(app):
    from flask import request, redirect

    @app.route("/holo-commerce-center")
    def holo_commerce_center():
        body = """
        <h1>Holo Commerce Center</h1>
        <p>Revenue layer for Holoverse.</p>
        <a href="/command-center">Command Center</a>
        <a href="/holoverse-center">Holoverse Center</a>
        <a href="/holo-products">Holo Products</a>
        <a href="/premium-events">Premium Events</a>
        <a href="/ticket-center">Ticket Center</a>
        <a href="/holo-ad-sales">Holo Ad Sales</a>
        <a href="/premium-room-bookings">Premium Room Bookings</a>
        <div class="hero">
          <h2>What This Does</h2>
          <p>Turns Holoverse into a commerce, ticketing, booking, and ad-sales engine.</p>
        </div>
        """
        return _page("Holo Commerce Center", body)

    @app.route("/holo-products", methods=["GET","POST"])
    def holo_products():
        rows = _read("data/holo_commerce/products.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "product_name": request.form.get("product_name", "").strip() or "Untitled Product",
                "category": request.form.get("category", "").strip() or "showcase_product",
                "price": request.form.get("price", "").strip() or "0",
                "created_at": str(datetime.datetime.now())
            })
            _write("data/holo_commerce/products.json", rows)
            return redirect("/holo-products")

        items = "".join(f"<li>{x.get('product_name')} | {x.get('category')} | ${x.get('price')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Holo Products</h1>
        <a href="/holo-commerce-center">Holo Commerce Center</a>
        <div class="card">
          <form method="post">
            <input name="product_name" placeholder="Product name">
            <input name="category" placeholder="showcase_product / merch / premium_asset / featured_listing">
            <input name="price" placeholder="Price">
            <button type="submit">Save Product</button>
          </form>
        </div>
        <div class="card"><p>Total products: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Holo Products", body)

    @app.route("/premium-events", methods=["GET","POST"])
    def premium_events():
        rows = _read("data/holo_commerce/events.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "event_name": request.form.get("event_name", "").strip() or "Untitled Event",
                "event_type": request.form.get("event_type", "").strip() or "vip_launch",
                "price": request.form.get("price", "").strip() or "0",
                "created_at": str(datetime.datetime.now())
            })
            _write("data/holo_commerce/events.json", rows)
            return redirect("/premium-events")

        items = "".join(f"<li>{x.get('event_name')} | {x.get('event_type')} | ${x.get('price')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Premium Events</h1>
        <a href="/holo-commerce-center">Holo Commerce Center</a>
        <div class="card">
          <form method="post">
            <input name="event_name" placeholder="Event name">
            <input name="event_type" placeholder="vip_launch / concert / class / backstage / premium_room">
            <input name="price" placeholder="Ticket price">
            <button type="submit">Save Event</button>
          </form>
        </div>
        <div class="card"><p>Total premium events: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Premium Events", body)

    @app.route("/ticket-center", methods=["GET","POST"])
    def ticket_center():
        rows = _read("data/holo_commerce/tickets.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "ticket_name": request.form.get("ticket_name", "").strip() or "Untitled Ticket",
                "access_type": request.form.get("access_type", "").strip() or "vip_access",
                "status": request.form.get("status", "").strip() or "active",
                "created_at": str(datetime.datetime.now())
            })
            _write("data/holo_commerce/tickets.json", rows)
            return redirect("/ticket-center")

        items = "".join(f"<li>{x.get('ticket_name')} | {x.get('access_type')} | {x.get('status')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Ticket Center</h1>
        <a href="/holo-commerce-center">Holo Commerce Center</a>
        <div class="card">
          <form method="post">
            <input name="ticket_name" placeholder="Ticket name">
            <input name="access_type" placeholder="vip_access / backstage / premium_room / creator_event">
            <input name="status" placeholder="active / used / blocked">
            <button type="submit">Save Ticket</button>
          </form>
        </div>
        <div class="card"><p>Total tickets: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Ticket Center", body)

    @app.route("/holo-ad-sales", methods=["GET","POST"])
    def holo_ad_sales():
        rows = _read("data/holo_commerce/ad_slots.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "slot_name": request.form.get("slot_name", "").strip() or "Untitled Slot",
                "slot_type": request.form.get("slot_type", "").strip() or "brand_wall",
                "price": request.form.get("price", "").strip() or "0",
                "created_at": str(datetime.datetime.now())
            })
            _write("data/holo_commerce/ad_slots.json", rows)
            return redirect("/holo-ad-sales")

        items = "".join(f"<li>{x.get('slot_name')} | {x.get('slot_type')} | ${x.get('price')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Holo Ad Sales</h1>
        <a href="/holo-commerce-center">Holo Commerce Center</a>
        <div class="card">
          <form method="post">
            <input name="slot_name" placeholder="Ad slot name">
            <input name="slot_type" placeholder="brand_wall / floating_slot / stage_banner / showcase_slot">
            <input name="price" placeholder="Price">
            <button type="submit">Save Ad Slot</button>
          </form>
        </div>
        <div class="card"><p>Total ad slots: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Holo Ad Sales", body)

    @app.route("/premium-room-bookings", methods=["GET","POST"])
    def premium_room_bookings():
        rows = _read("data/holo_commerce/bookings.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "room_name": request.form.get("room_name", "").strip() or "Untitled Room",
                "booking_type": request.form.get("booking_type", "").strip() or "vip_room",
                "price": request.form.get("price", "").strip() or "0",
                "created_at": str(datetime.datetime.now())
            })
            _write("data/holo_commerce/bookings.json", rows)
            return redirect("/premium-room-bookings")

        items = "".join(f"<li>{x.get('room_name')} | {x.get('booking_type')} | ${x.get('price')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Premium Room Bookings</h1>
        <a href="/holo-commerce-center">Holo Commerce Center</a>
        <div class="card">
          <form method="post">
            <input name="room_name" placeholder="Room name">
            <input name="booking_type" placeholder="vip_room / showcase_room / event_room / creator_suite">
            <input name="price" placeholder="Booking price">
            <button type="submit">Save Booking</button>
          </form>
        </div>
        <div class="card"><p>Total bookings: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Premium Room Bookings", body)
