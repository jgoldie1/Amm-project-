import os
import stripe
from flask import Blueprint, jsonify, request, current_app
from modules.auth_system import login_required

payments_bp = Blueprint("payments_system", __name__)

def init_payments(app):
    stripe.api_key = app.config.get("STRIPE_SECRET_KEY", "")
    app.register_blueprint(payments_bp)

@payments_bp.route("/payments/config")
def payment_config():
    return jsonify({"publishableKey": current_app.config.get("STRIPE_PUBLISHABLE_KEY", "")})

@payments_bp.route("/payments/create-checkout-session", methods=["POST"])
@login_required
def create_checkout_session():
    data = request.get_json(silent=True) or {}
    line_items = data.get("line_items", [])
    if not line_items:
        return jsonify({"error": "No line items provided"}), 400

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=line_items,
            success_url=f"{current_app.config.get('APP_BASE_URL')}/platform-home?payment=success",
            cancel_url=f"{current_app.config.get('APP_BASE_URL')}/platform-home?payment=cancelled",
        )
        return jsonify({"checkout_url": session.url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
