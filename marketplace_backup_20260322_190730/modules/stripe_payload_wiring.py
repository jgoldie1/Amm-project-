import json
import uuid
import datetime
from flask import current_app, jsonify

def _read(path, fallback):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return fallback

def _write(path, rows):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=2)

def _log_payload(kind, line_items, status):
    rows = _read("data/payments/checkout_payloads.json", [])
    rows.append({
        "id": str(uuid.uuid4()),
        "kind": kind,
        "line_items": line_items,
        "status": status,
        "created_at": str(datetime.datetime.now())
    })
    _write("data/payments/checkout_payloads.json", rows)

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
        .card {{
          background:#1e293b;
          padding:16px;
          border-radius:14px;
          margin:14px 0;
        }}
        pre {{
          white-space: pre-wrap;
          word-wrap: break-word;
        }}
      </style>
    </head>
    <body>{body}</body>
    </html>
    """

def _stripe_ready():
    key = current_app.config.get("STRIPE_SECRET_KEY", "")
    return bool(key and key != "replace-me")

def _product_payload():
    return [{
        "price_data": {
            "currency": "usd",
            "product_data": {"name": "Holo Product"},
            "unit_amount": 2500
        },
        "quantity": 1
    }]

def _event_payload():
    return [{
        "price_data": {
            "currency": "usd",
            "product_data": {"name": "Premium Event Ticket"},
            "unit_amount": 7500
        },
        "quantity": 1
    }]

def _room_payload():
    return [{
        "price_data": {
            "currency": "usd",
            "product_data": {"name": "Premium Room Booking"},
            "unit_amount": 15000
        },
        "quantity": 1
    }]

def register(app):
    @app.route("/checkout-payloads")
    def checkout_payloads():
        rows = _read("data/payments/checkout_payloads.json", [])
        items = "".join(
            f"<li>{x.get('kind')} | {x.get('status')} | {x.get('created_at')}</li>"
            for x in rows[-40:]
        )
        body = f"""
        <h1>Checkout Payloads</h1>
        <a href="/payments-center">Payments Center</a>
        <a href="/payment-health">Payment Health</a>
        <div class="card"><ul>{items}</ul></div>
        """
        return _page("Checkout Payloads", body)

    @app.route("/checkout-preview/holo-product")
    def checkout_preview_product():
        line_items = _product_payload()
        status = "stripe_ready" if _stripe_ready() else "stripe_not_configured"
        _log_payload("holo-product", line_items, status)
        body = f"""
        <h1>Holo Product Checkout Preview</h1>
        <a href="/payments-center">Payments Center</a>
        <a href="/buy-holo-product-live">Live Handoff</a>
        <div class="card">
          <p><strong>Status:</strong> {status}</p>
          <pre>{json.dumps(line_items, indent=2)}</pre>
        </div>
        """
        return _page("Holo Product Checkout Preview", body)

    @app.route("/checkout-preview/premium-event")
    def checkout_preview_event():
        line_items = _event_payload()
        status = "stripe_ready" if _stripe_ready() else "stripe_not_configured"
        _log_payload("premium-event", line_items, status)
        body = f"""
        <h1>Premium Event Checkout Preview</h1>
        <a href="/payments-center">Payments Center</a>
        <a href="/buy-premium-event-live">Live Handoff</a>
        <div class="card">
          <p><strong>Status:</strong> {status}</p>
          <pre>{json.dumps(line_items, indent=2)}</pre>
        </div>
        """
        return _page("Premium Event Checkout Preview", body)

    @app.route("/checkout-preview/room-booking")
    def checkout_preview_room():
        line_items = _room_payload()
        status = "stripe_ready" if _stripe_ready() else "stripe_not_configured"
        _log_payload("room-booking", line_items, status)
        body = f"""
        <h1>Room Booking Checkout Preview</h1>
        <a href="/payments-center">Payments Center</a>
        <a href="/book-room-live">Live Handoff</a>
        <div class="card">
          <p><strong>Status:</strong> {status}</p>
          <pre>{json.dumps(line_items, indent=2)}</pre>
        </div>
        """
        return _page("Room Booking Checkout Preview", body)

    @app.route("/checkout-api-preview/holo-product")
    def checkout_api_preview_product():
        line_items = _product_payload()
        status = "stripe_ready" if _stripe_ready() else "stripe_not_configured"
        _log_payload("holo-product", line_items, status)
        return jsonify({"kind": "holo-product", "status": status, "line_items": line_items})

    @app.route("/checkout-api-preview/premium-event")
    def checkout_api_preview_event():
        line_items = _event_payload()
        status = "stripe_ready" if _stripe_ready() else "stripe_not_configured"
        _log_payload("premium-event", line_items, status)
        return jsonify({"kind": "premium-event", "status": status, "line_items": line_items})

    @app.route("/checkout-api-preview/room-booking")
    def checkout_api_preview_room():
        line_items = _room_payload()
        status = "stripe_ready" if _stripe_ready() else "stripe_not_configured"
        _log_payload("room-booking", line_items, status)
        return jsonify({"kind": "room-booking", "status": status, "line_items": line_items})
