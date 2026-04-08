from flask import Blueprint, jsonify
import sqlite3

api_bp = Blueprint("api", __name__)
DB_PATH = "data/aame.db"

def query_all(sql, params=()):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@api_bp.route("/summary")
def summary():
    products = query_all("select id, name, category, price from products order by id desc limit 6")
    streams = query_all("select id, title, status, genre from streams order by id desc limit 6")
    services = query_all("select id, name, type, price from services order by id desc limit 6")
    return jsonify({
        "ok": True,
        "products": products,
        "streams": streams,
        "services": services
    })

@api_bp.route("/products")
def products():
    return jsonify({"ok": True, "items": query_all("select * from products order by id desc")})

@api_bp.route("/streams")
def streams():
    return jsonify({"ok": True, "items": query_all("select * from streams order by id desc")})

@api_bp.route("/services")
def services():
    return jsonify({"ok": True, "items": query_all("select * from services order by id desc")})
