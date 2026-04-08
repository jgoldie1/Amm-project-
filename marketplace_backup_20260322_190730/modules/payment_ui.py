import json
import uuid
import datetime
from flask import request, redirect

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
        body {{
          font-family: Arial, sans-serif;
          background: linear-gradient(180deg, #0f172a, #111827);
          color: white;
          margin: 0;
          padding: 24px;
        }}
        a, button {{
          display:inline-block;
          margin:6px 8px 6px 0;
          padding:10px 14px;
          background:#2563eb;
          color:white;
          text-decoration:none;
          border:none;
          border-radius:10px;
        }}
        input, textarea {{
          width:100%;
          max-width:760px;
          padding:10px;
          margin:8px 0;
          border-radius:8px;
          border:1px solid #334155;
        }}
        .card {{
          background:#1e293b;
          padding:16px;
          border-radius:14px;
          margin:14px 0;
        }}
        .hero {{
          background:linear-gradient(135deg,#1d4ed8,#7c3aed,#0f766e);
          padding:24px;
          border-radius:16px;
          margin:16px 0;
        }}
        ul {{ line-height:1.8; }}
      </style>
    </head>
    <body>{body}</body>
    </html>
    """

def _now():
    return str(datetime.datetime.now())

def register(app):
    @app.route("/payments-center")
    def payments_center():
        body = """
        <h1>Payments Center</h1>
        <p>UI layer for paid products, events, bookings, and checkout records.</p>
        <a href="/master-dashboard">Master Dashboard</a>
        <a href="/holo-products-store">Holo Products Store</a>
        <a href="/premium-events-store">Premium Events Store</a>
        <a href="/room-booking-store">Room Booking Store</a>
        <a href="/checkout-records">Checkout Records</a>
        <a href="/payment-health">Payment Health</a>
        <a href="/checkout-payloads">Checkout Payloads</a>
        <div class="hero">
          <h2>What This Does</h2>
          <p>Adds visible buy/book/pay flows to the live platform shell.</p>
        </div>
        """
        return _page("Payments Center", body)

    @app.route("/holo-products-store", methods=["GET","POST"])
    def holo_products_store():
        rows = _read("data/payments/orders.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "kind": "product",
                "item_name": (request.form.get("item_name") or "Untitled Product").strip() or "Untitled Product",
                "price": (request.form.get("price") or "0").strip() or "0",
                "buyer": (request.form.get("buyer") or "guest").strip() or "guest",
                "created_at": _now()
            })
            _write("data/payments/orders.json", rows)
            return redirect("/holo-products-store")
        items = "".join(f"<li>{x.get('item_name')} | ${x.get('price')} | {x.get('buyer')}</li>" for x in rows[-30:])
        body = f"""
        <h1>Holo Products Store</h1>
        <a href="/payments-center">Payments Center</a>
        <div class="card">
          <h3>Live Buy Button Shell</h3>
          <a href="/payments/demo-buy/holo-product">Buy Demo Holo Product</a>
          <a href="/buy-holo-product-live">Live Checkout Handoff</a>
          <a href="/checkout-preview/holo-product">Checkout Preview</a>
        </div>
        <div class="card">
          <form method="post">
            <input name="item_name" placeholder="Product name">
            <input name="price" placeholder="Price">
            <input name="buyer" placeholder="Buyer name">
            <button type="submit">Save Product Order</button>
          </form>
        </div>
        <div class="card"><ul>{items}</ul></div>
        """
        return _page("Holo Products Store", body)

    @app.route("/premium-events-store", methods=["GET","POST"])
    def premium_events_store():
        rows = _read("data/payments/orders.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "kind": "event",
                "item_name": (request.form.get("item_name") or "Untitled Event").strip() or "Untitled Event",
                "price": (request.form.get("price") or "0").strip() or "0",
                "buyer": (request.form.get("buyer") or "guest").strip() or "guest",
                "created_at": _now()
            })
            _write("data/payments/orders.json", rows)
            return redirect("/premium-events-store")
        items = "".join(f"<li>{x.get('item_name')} | ${x.get('price')} | {x.get('buyer')}</li>" for x in rows if x.get("kind") == "event")
        body = f"""
        <h1>Premium Events Store</h1>
        <a href="/payments-center">Payments Center</a>
        <div class="card">
          <h3>Live Ticket Button Shell</h3>
          <a href="/payments/demo-buy/premium-event">Buy Demo Event Ticket</a>
          <a href="/buy-premium-event-live">Live Checkout Handoff</a>
          <a href="/checkout-preview/premium-event">Checkout Preview</a>
        </div>
        <div class="card">
          <form method="post">
            <input name="item_name" placeholder="Event name">
            <input name="price" placeholder="Ticket price">
            <input name="buyer" placeholder="Buyer name">
            <button type="submit">Save Event Order</button>
          </form>
        </div>
        <div class="card"><ul>{items}</ul></div>
        """
        return _page("Premium Events Store", body)

    @app.route("/room-booking-store", methods=["GET","POST"])
    def room_booking_store():
        rows = _read("data/payments/bookings.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "room_name": (request.form.get("room_name") or "Untitled Room").strip() or "Untitled Room",
                "price": (request.form.get("price") or "0").strip() or "0",
                "booker": (request.form.get("booker") or "guest").strip() or "guest",
                "created_at": _now()
            })
            _write("data/payments/bookings.json", rows)
            return redirect("/room-booking-store")
        items = "".join(f"<li>{x.get('room_name')} | ${x.get('price')} | {x.get('booker')}</li>" for x in rows[-30:])
        body = f"""
        <h1>Room Booking Store</h1>
        <a href="/payments-center">Payments Center</a>
        <div class="card">
          <h3>Live Booking Button Shell</h3>
          <a href="/payments/demo-buy/room-booking">Book Demo Premium Room</a>
          <a href="/book-room-live">Live Checkout Handoff</a>
          <a href="/checkout-preview/room-booking">Checkout Preview</a>
        </div>
        <div class="card">
          <form method="post">
            <input name="room_name" placeholder="Room name">
            <input name="price" placeholder="Booking price">
            <input name="booker" placeholder="Booker name">
            <button type="submit">Save Booking</button>
          </form>
        </div>
        <div class="card"><ul>{items}</ul></div>
        """
        return _page("Room Booking Store", body)

    @app.route("/payments/demo-buy/<kind>")
    def payments_demo_buy(kind):
        rows = _read("data/payments/checkouts.json", [])
        rows.append({
            "id": str(uuid.uuid4()),
            "kind": kind,
            "status": "demo_checkout_created",
            "created_at": _now()
        })
        _write("data/payments/checkouts.json", rows)
        body = f"""
        <h1>Demo Checkout Created</h1>
        <a href="/payments-center">Payments Center</a>
        <div class="card">
          <p>Checkout shell created for: <strong>{kind}</strong></p>
          <p>This is the safe UI layer before wiring full live checkout redirect into every page.</p>
        </div>
        """
        return _page("Demo Checkout", body)

    @app.route("/checkout-records")
    def checkout_records():
        rows = _read("data/payments/checkouts.json", [])
        items = "".join(f"<li>{x.get('kind')} | {x.get('status')} | {x.get('created_at')}</li>" for x in rows[-40:])
        body = f"""
        <h1>Checkout Records</h1>
        <a href="/payments-center">Payments Center</a>
        <div class="card"><ul>{items}</ul></div>
        """
        return _page("Checkout Records", body)
