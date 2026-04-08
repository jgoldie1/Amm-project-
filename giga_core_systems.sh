#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

cd ~/marketplace

APP="$HOME/marketplace/app.py"
DATA="$HOME/marketplace/data"
BACKUP="$HOME/marketplace/backups"
STAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$DATA" "$BACKUP"
cp "$APP" "$BACKUP/app_core_${STAMP}.py"
echo "Backup saved: $BACKUP/app_core_${STAMP}.py"

# create data files
for f in payouts.json ownership.json analytics.json moderation.json recommendations.json; do
  [ -f "$DATA/$f" ] || echo "[]" > "$DATA/$f"
done

python3 <<'PY'
from pathlib import Path
import json, re, random, datetime

app_path = Path.home() / "marketplace/app.py"
src = app_path.read_text()

marker = "# === GIGA_CORE_SYSTEMS_20260318 ==="
if marker in src:
    print("Core systems already installed")
    exit()

block = r'''
# === GIGA_CORE_SYSTEMS_20260318 ===

def giga_read(name):
    import json
    from pathlib import Path
    p = Path.home() / "marketplace/data" / name
    return json.loads(p.read_text())

def giga_write(name, data):
    import json
    from pathlib import Path
    p = Path.home() / "marketplace/data" / name
    p.write_text(json.dumps(data, indent=2))

def gid(data, prefix):
    return f"{prefix}_{len(data)+1}"

# =========================
# 💰 PAYOUT ENGINE
# =========================
@app.route("/payout-dashboard")
def payout_dashboard():
    payouts = giga_read("payouts.json")
    total = sum(p.get("amount",0) for p in payouts)
    return f"<h1>Payouts</h1><p>Total Paid: ${total}</p><pre>{payouts}</pre>"

@app.route("/payout-add", methods=["POST"])
def payout_add():
    from flask import request
    payouts = giga_read("payouts.json")
    amount = float(request.form.get("amount",0))
    creator = request.form.get("creator","unknown")
    payouts.append({
        "id": gid(payouts,"pay"),
        "creator": creator,
        "amount": amount,
        "date": str(datetime.datetime.utcnow())
    })
    giga_write("payouts.json", payouts)
    return {"ok": True}

# =========================
# 🧾 OWNERSHIP LEDGER
# =========================
@app.route("/ownership-add", methods=["POST"])
def ownership_add():
    from flask import request
    data = giga_read("ownership.json")
    data.append({
        "id": gid(data,"own"),
        "content_id": request.form.get("content_id"),
        "owner": request.form.get("owner"),
        "split": request.form.get("split","100%"),
        "timestamp": str(datetime.datetime.utcnow())
    })
    giga_write("ownership.json", data)
    return {"ok": True}

@app.route("/ownership-view")
def ownership_view():
    return {"data": giga_read("ownership.json")}

# =========================
# 📊 ANALYTICS ENGINE
# =========================
@app.route("/track-view")
def track_view():
    from flask import request
    data = giga_read("analytics.json")
    data.append({
        "id": gid(data,"view"),
        "content_id": request.args.get("content_id"),
        "watch_time": random.randint(10,300),
        "timestamp": str(datetime.datetime.utcnow())
    })
    giga_write("analytics.json", data)
    return {"ok": True}

@app.route("/analytics-dashboard")
def analytics_dashboard():
    data = giga_read("analytics.json")
    return {"views": len(data), "data": data[:20]}

# =========================
# 🛡 MODERATION SYSTEM
# =========================
@app.route("/moderation-flag", methods=["POST"])
def moderation_flag():
    from flask import request
    data = giga_read("moderation.json")
    data.append({
        "id": gid(data,"mod"),
        "content_id": request.form.get("content_id"),
        "reason": request.form.get("reason"),
        "status": "pending",
        "timestamp": str(datetime.datetime.utcnow())
    })
    giga_write("moderation.json", data)
    return {"ok": True}

@app.route("/moderation-dashboard")
def moderation_dashboard():
    return {"flags": giga_read("moderation.json")}

# =========================
# 🎯 RECOMMENDATION ENGINE
# =========================
@app.route("/recommendations")
def recommendations():
    data = giga_read("analytics.json")
    scores = {}

    for d in data:
        cid = d.get("content_id")
        scores[cid] = scores.get(cid,0) + d.get("watch_time",0)

    ranked = sorted(scores.items(), key=lambda x: -x[1])
    return {"recommended": ranked[:10]}

# === END_GIGA_CORE_SYSTEMS ===
'''

m = re.search(r'if __name__ == ["\\\']__main__["\\\']:', src)
insert = m.start() if m else len(src)

new_src = src[:insert] + block + src[insert:]
app_path.write_text(new_src)

print("Core systems installed successfully")
PY

./recovery/start_giga_locked.sh

echo "Testing..."
curl -s http://127.0.0.1:8080/payout-dashboard
echo
curl -s http://127.0.0.1:8080/analytics-dashboard
echo
curl -s http://127.0.0.1:8080/recommendations
echo

