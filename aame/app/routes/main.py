from flask import Blueprint, render_template, jsonify, Response

main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def home():
    return render_template("home.html")

@main_bp.route("/marketplace")
def marketplace():
    return render_template("marketplace.html")

@main_bp.route("/stream")
def stream():
    return render_template("stream.html")

@main_bp.route("/wallet")
def wallet():
    return render_template("wallet.html")

@main_bp.route("/booking")
def booking():
    return render_template("booking.html")

@main_bp.route("/admin")
def admin():
    return render_template("admin.html")

@main_bp.route("/health")
def health():
    return jsonify({"ok": True, "app": "aame", "status": "healthy"})

@main_bp.route("/favicon.ico")
def favicon():
    return Response(status=204)
