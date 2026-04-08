from flask import Flask, jsonify, request, render_template_string
from flask_cors import CORS
from sqlalchemy import create_engine, text
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

engine = create_engine("sqlite:///aame_dev.db", future=True)

with engine.begin() as conn:
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS boot_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT NOT NULL
        )
    """))
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS campaigns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            goal INTEGER,
            raised INTEGER,
            status TEXT
        )
    """))
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS donations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            donor TEXT,
            amount INTEGER,
            campaign TEXT,
            status TEXT,
            created_at TEXT
        )
    """))
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS preorders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            product TEXT,
            deposit INTEGER,
            created_at TEXT
        )
    """))
    conn.execute(text("INSERT INTO boot_log (message) VALUES ('AAME stabilized boot')"))

    if conn.execute(text("SELECT COUNT(*) FROM campaigns")).scalar_one() == 0:
        conn.execute(text("""
            INSERT INTO campaigns (name, goal, raised, status) VALUES
            ('Silver Hawk Prototype', 500000, 25250, 'active'),
            ('AAME Energy Hub Columbus', 250000, 10000, 'active'),
            ('SkyDrop Fleet Expansion', 100000, 5000, 'planning')
        """))

STYLE = """
<style>
body { margin:0; font-family:Arial,sans-serif; background:radial-gradient(circle at top,#101b44,#060a16 55%,#02040a); color:#fff; }
.wrap { max-width:1100px; margin:0 auto; padding:24px; }
.hero { padding:72px 24px; border-bottom:1px solid rgba(120,170,255,.2);
background: radial-gradient(circle at 20% 20%, rgba(0,255,255,.14), transparent 20%),
radial-gradient(circle at 80% 10%, rgba(0,140,255,.18), transparent 18%),
linear-gradient(180deg, rgba(20,30,60,.92), rgba(6,10,22,.96)); }
h1,h2,h3 { margin:0 0 12px 0; }
p { line-height:1.5; color:#d8e2ff; }
.glow { text-shadow:0 0 10px rgba(60,180,255,.55), 0 0 22px rgba(60,180,255,.25); }
.grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:16px; margin-top:22px; }
.card { background:rgba(18,28,58,.88); border:1px solid rgba(93,140,255,.25); border-radius:18px; padding:18px; box-shadow:0 10px 28px rgba(0,0,0,.35); }
.btn { display:inline-block; padding:12px 16px; border-radius:12px; text-decoration:none; color:#fff; background:linear-gradient(90deg,#0ca7ff,#4f7cff); margin-right:10px; font-weight:bold; }
.small { color:#9fb3e8; font-size:14px; }
input { width:100%; padding:12px; border-radius:10px; border:1px solid #35508a; background:#0c1632; color:#fff; margin:8px 0 12px 0; }
button { padding:12px 16px; border:none; border-radius:12px; background:linear-gradient(90deg,#0ca7ff,#4f7cff); color:#fff; font-weight:bold; cursor:pointer; }
.progress { width:100%; height:14px; background:#0c1632; border-radius:999px; overflow:hidden; margin:10px 0; border:1px solid #2b4273; }
.bar { height:100%; background:linear-gradient(90deg,#00d2ff,#4f7cff); }
a { color:#9fd1ff; }
</style>
"""

@app.route("/")
def home():
    return render_template_string(f"""
    <!doctype html><html><head><meta charset="utf-8"><title>AAME Fundraising</title>{STYLE}</head>
    <body>
      <section class="hero">
        <div class="wrap">
          <h1 class="glow">AAME Holographic Fundraising</h1>
          <p>Fund production for Silver Hawk, charging hubs, drones, and the AAM-HSE ecosystem.</p>
          <a class="btn" href="/fund">Fundraising Center</a>
          <a class="btn" href="/preorder">Preorders</a>
          <a class="btn" href="/admin">Admin</a>
        </div>
      </section>
    </body></html>
    """)

@app.route("/fund")
def fund():
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT id, name, goal, raised, status FROM campaigns ORDER BY id DESC")).mappings().all()
    cards = []
    for r in rows:
        pct = round((r["raised"] / r["goal"]) * 100, 1) if r["goal"] else 0
        cards.append(f"""
        <div class="card">
          <h2>{r['name']}</h2>
          <p>Status: {r['status']}</p>
          <p>Raised: ${r['raised']:,} / ${r['goal']:,}</p>
          <div class="progress"><div class="bar" style="width:{min(pct,100)}%"></div></div>
          <p>{pct}% funded</p>
          <a class="btn" href="/donate?campaign={r['name']}">Donate</a>
        </div>
        """)
    return render_template_string(f"""
    <!doctype html><html><head><meta charset="utf-8"><title>Fundraising Center</title>{STYLE}</head>
    <body><div class="wrap"><h1 class="glow">Fundraising Center</h1><div class="grid">{''.join(cards)}</div></div></body></html>
    """)

@app.route("/donate")
def donate():
    campaign = request.args.get("campaign", "Silver Hawk Prototype")
    return render_template_string(f"""
    <!doctype html><html><head><meta charset="utf-8"><title>Donate</title>{STYLE}</head>
    <body><div class="wrap">
      <h1 class="glow">Donate to {campaign}</h1>
      <div class="card">
        <form id="donateForm">
          <input id="donor" placeholder="Your name">
          <input id="amount" type="number" placeholder="Amount">
          <input id="campaign" value="{campaign}">
          <button type="submit">Submit Donation</button>
        </form>
        <p id="msg" class="small"></p>
      </div>
      <script>
      document.getElementById('donateForm').addEventListener('submit', async function(e) {{
        e.preventDefault();
        const payload = {{
          donor: document.getElementById('donor').value || 'Anonymous',
          amount: parseInt(document.getElementById('amount').value || '0'),
          campaign: document.getElementById('campaign').value,
          status: 'received'
        }};
        const res = await fetch('/api/donate', {{
          method: 'POST',
          headers: {{'Content-Type':'application/json'}},
          body: JSON.stringify(payload)
        }});
        const data = await res.json();
        document.getElementById('msg').textContent = data.message || 'Donation recorded';
      }});
      </script>
    </div></body></html>
    """)

@app.route("/preorder")
def preorder():
    return render_template_string(f"""
    <!doctype html><html><head><meta charset="utf-8"><title>Preorders</title>{STYLE}</head>
    <body><div class="wrap">
      <h1 class="glow">Production Preorders</h1>
      <div class="card">
        <form id="preorderForm">
          <input id="name" placeholder="Your name">
          <input id="email" placeholder="Your email">
          <input id="product" value="Silver Hawk Reservation">
          <input id="deposit" type="number" value="100">
          <button type="submit">Record Preorder</button>
        </form>
        <p id="msg" class="small"></p>
      </div>
      <script>
      document.getElementById('preorderForm').addEventListener('submit', async function(e) {{
        e.preventDefault();
        const payload = {{
          name: document.getElementById('name').value || 'Unknown',
          email: document.getElementById('email').value || 'unknown@example.com',
          product: document.getElementById('product').value,
          deposit: parseInt(document.getElementById('deposit').value || '0')
        }};
        const res = await fetch('/api/preorder', {{
          method: 'POST',
          headers: {{'Content-Type':'application/json'}},
          body: JSON.stringify(payload)
        }});
        const data = await res.json();
        document.getElementById('msg').textContent = data.message || 'Preorder recorded';
      }});
      </script>
    </div></body></html>
    """)

@app.route("/admin")
def admin():
    with engine.connect() as conn:
        donations = conn.execute(text("SELECT donor, amount, campaign, status, created_at FROM donations ORDER BY id DESC LIMIT 20")).mappings().all()
        preorders = conn.execute(text("SELECT name, email, product, deposit, created_at FROM preorders ORDER BY id DESC LIMIT 20")).mappings().all()
    donation_rows = "".join([f"<tr><td>{r['donor']}</td><td>${r['amount']}</td><td>{r['campaign']}</td><td>{r['status']}</td><td>{r['created_at']}</td></tr>" for r in donations])
    preorder_rows = "".join([f"<tr><td>{r['name']}</td><td>{r['email']}</td><td>{r['product']}</td><td>${r['deposit']}</td><td>{r['created_at']}</td></tr>" for r in preorders])
    return render_template_string(f"""
    <!doctype html><html><head><meta charset="utf-8"><title>Admin</title>{STYLE}</head>
    <body><div class="wrap">
      <h1 class="glow">Fundraising Admin</h1>
      <div class="card"><h2>Recent Donations</h2><table>{donation_rows}</table></div>
      <div class="card" style="margin-top:16px;"><h2>Recent Preorders</h2><table>{preorder_rows}</table></div>
    </div></body></html>
    """)

@app.route("/api/donate", methods=["POST"])
def api_donate():
    data = request.get_json(silent=True) or {}
    donor = data.get("donor", "Anonymous")
    amount = int(data.get("amount", 0))
    campaign = data.get("campaign", "General Fund")
    status = data.get("status", "received")
    with engine.begin() as conn:
        conn.execute(
            text("INSERT INTO donations (donor, amount, campaign, status, created_at) VALUES (:d,:a,:c,:s,:t)"),
            {"d": donor, "a": amount, "c": campaign, "s": status, "t": datetime.utcnow().isoformat()}
        )
        conn.execute(
            text("UPDATE campaigns SET raised = raised + :amt WHERE name = :name"),
            {"amt": amount, "name": campaign}
        )
    return jsonify({"ok": True, "message": "Donation recorded successfully"})

@app.route("/api/preorder", methods=["POST"])
def api_preorder():
    data = request.get_json(silent=True) or {}
    with engine.begin() as conn:
        conn.execute(
            text("INSERT INTO preorders (name, email, product, deposit, created_at) VALUES (:n,:e,:p,:d,:t)"),
            {
                "n": data.get("name", "Unknown"),
                "e": data.get("email", "unknown@example.com"),
                "p": data.get("product", "Reservation"),
                "d": int(data.get("deposit", 0)),
                "t": datetime.utcnow().isoformat()
            }
        )
    return jsonify({"ok": True, "message": "Preorder recorded successfully"})

@app.route("/pay-links")
def pay_links():
    return jsonify({
        "ok": True,
        "payments": {
            "stripe": "https://buy.stripe.com/test_link",
            "cashapp": "$YourCashtag",
            "paypal": "https://paypal.me/YourName"
        }
    })

@app.route("/fundraising/summary")
def fundraising_summary():
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT id, name, goal, raised, status FROM campaigns ORDER BY id DESC")).mappings().all()
        total_goal = conn.execute(text("SELECT COALESCE(SUM(goal),0) FROM campaigns")).scalar_one()
        total_raised = conn.execute(text("SELECT COALESCE(SUM(raised),0) FROM campaigns")).scalar_one()
    return jsonify({"ok": True, "summary": {"total_goal": total_goal, "total_raised": total_raised, "campaigns": [dict(r) for r in rows]}})

@app.route("/status/all")
def status_all():
    with engine.connect() as conn:
        campaigns_count = conn.execute(text("SELECT COUNT(*) FROM campaigns")).scalar_one()
        donations_count = conn.execute(text("SELECT COUNT(*) FROM donations")).scalar_one()
        preorders_count = conn.execute(text("SELECT COUNT(*) FROM preorders")).scalar_one()
    return jsonify({"ok": True, "status": {"campaigns": campaigns_count, "donations": donations_count, "preorders": preorders_count}})

@app.route("/healthz")
def healthz():
    with engine.connect() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM boot_log")).scalar_one()
    return jsonify({"ok": True, "db": "sqlite", "boot_log_rows": count})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050)
