import json
import datetime
from flask import request, redirect, current_app

def _read(path, fallback):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return fallback

def _write(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

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
        code {{
          background:#0b1220;
          padding:2px 6px;
          border-radius:6px;
        }}
      </style>
    </head>
    <body>{body}</body>
    </html>
    """

def _set_health(configured, status):
    data = {
        "stripe_configured": configured,
        "last_checkout_attempt": str(datetime.datetime.now()),
        "last_status": status,
    }
    _write("data/payments/payment_health.json", data)

def register(app):
    @app.route("/payment-health")
    def payment_health():
        data = _read("data/payments/payment_health.json", {
            "stripe_configured": False,
            "last_checkout_attempt": None,
            "last_status": "unknown"
        })
        body = f"""
        <h1>Payment Health</h1>
        <a href="/payments-center">Payments Center</a>
        <div class="card">
          <p><strong>Stripe configured:</strong> {data.get("stripe_configured")}</p>
          <p><strong>Last checkout attempt:</strong> {data.get("last_checkout_attempt")}</p>
          <p><strong>Last status:</strong> {data.get("last_status")}</p>
        </div>
        """
        return _page("Payment Health", body)

    @app.route("/checkout-launch/<kind>")
    def checkout_launch(kind):
        stripe_key = current_app.config.get("STRIPE_SECRET_KEY", "")
        configured = bool(stripe_key and stripe_key != "replace-me")

        if not configured:
            _set_health(False, f"stripe_not_configured_for_{kind}")
            body = f"""
            <h1>Checkout Not Configured</h1>
            <a href="/payments-center">Payments Center</a>
            <div class="card">
              <p>Stripe live checkout is not configured yet for <strong>{kind}</strong>.</p>
              <p>The payment UI shell is working, but live keys still need to be added to your environment.</p>
            </div>
            """
            return _page("Checkout Not Configured", body)

        _set_health(True, f"checkout_ready_for_{kind}")

        # This is the UI handoff shell. Actual line items can be expanded later.
        body = f"""
        <h1>Checkout Launch</h1>
        <a href="/payments-center">Payments Center</a>
        <div class="card">
          <p>Stripe is configured for <strong>{kind}</strong>.</p>
          <p>Next step is posting real line items from the product/event/booking pages into:</p>
          <p><code>/payments/create-checkout-session</code></p>
        </div>
        """
        return _page("Checkout Launch", body)

    @app.route("/buy-holo-product-live")
    def buy_holo_product_live():
        return redirect("/checkout-launch/holo-product")

    @app.route("/buy-premium-event-live")
    def buy_premium_event_live():
        return redirect("/checkout-launch/premium-event")

    @app.route("/book-room-live")
    def book_room_live():
        return redirect("/checkout-launch/room-booking")
