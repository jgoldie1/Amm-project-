#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

cd ~/marketplace

APP="$HOME/marketplace/app.py"
DATA_DIR="$HOME/marketplace/data"
BACKUP_DIR="$HOME/marketplace/backups"
STAMP="$(date +%Y%m%d_%H%M%S)"

mkdir -p "$DATA_DIR" "$BACKUP_DIR"
cp "$APP" "$BACKUP_DIR/app_wallet_passport_${STAMP}.py"
echo "Backup saved: $BACKUP_DIR/app_wallet_passport_${STAMP}.py"

for f in aam_wallet_ids.json aam_passports.json creator_wallets.json revenue_events.json payout_runs.json payment_accounts.json sponsor_campaigns.json; do
  [ -f "$DATA_DIR/$f" ] || echo "[]" > "$DATA_DIR/$f"
done

python3 <<'PY'
from pathlib import Path
import re

app_path = Path.home() / "marketplace" / "app.py"
src = app_path.read_text(encoding="utf-8")

marker = "# === GIGA_WALLET_PASSPORT_STABILIZER_20260318 ==="
if marker in src:
    print("Wallet/passport stabilizer already installed.")
    raise SystemExit(0)

block = r'''
# === GIGA_WALLET_PASSPORT_STABILIZER_20260318 ===

def giga_wps_read_20260318(filename):
    try:
        import json
        from pathlib import Path
        fp = Path.home() / "marketplace" / "data" / filename
        if not fp.exists():
            return []
        return json.loads(fp.read_text(encoding="utf-8"))
    except Exception:
        return []

def giga_wps_write_20260318(filename, payload):
    try:
        import json
        from pathlib import Path
        fp = Path.home() / "marketplace" / "data" / filename
        fp.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    except Exception:
        pass

def giga_wps_next_id_20260318(items, prefix):
    return f"{prefix}_{len(items)+1}"

def giga_wps_make_wallet_id_20260318(name, idx):
    clean = "".join(ch for ch in (name or "user").upper() if ch.isalnum())[:10]
    return f"AAMW-{clean}-{1000+idx}"

def giga_wps_make_passport_id_20260318(name, idx):
    clean = "".join(ch for ch in (name or "user").upper() if ch.isalnum())[:10]
    return f"AAMP-{clean}-{5000+idx}"

def giga_wps_split_20260318(amount):
    amount = round(float(amount), 2)
    creator = round(amount * 0.70, 2)
    platform = round(amount * 0.20, 2)
    legacy = round(amount * 0.05, 2)
    ops = round(amount - creator - platform - legacy, 2)
    return {"creator": creator, "platform": platform, "legacy": legacy, "ops": ops}

def giga_wps_get_wallet_20260318(owner_name):
    wallets = giga_wps_read_20260318("creator_wallets.json")
    for w in wallets:
        if w.get("owner_name") == owner_name:
            return w, wallets
    wallet = {
        "id": giga_wps_next_id_20260318(wallets, "wallet"),
        "owner_name": owner_name,
        "wallet_id": giga_wps_make_wallet_id_20260318(owner_name, len(wallets)+1),
        "available_balance": 0.0,
        "pending_balance": 0.0,
        "total_paid_out": 0.0
    }
    wallets.append(wallet)
    return wallet, wallets

@app.route("/identity-control-v1")
def giga_identity_control_v1_20260318():
    wallets = giga_wps_read_20260318("aam_wallet_ids.json")
    passports = giga_wps_read_20260318("aam_passports.json")
    return f"""
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>Identity Control V1</title>
      <style>
        body {{ font-family: Arial, sans-serif; background: linear-gradient(180deg,#020617 0%,#0f172a 100%); color:white; padding:20px; }}
        a, button {{ display:inline-block; margin:6px 8px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border:none; border-radius:10px; }}
        input, select {{ width:100%; max-width:760px; padding:10px; margin:8px 0; border-radius:8px; border:1px solid #334155; background:#0f172a; color:white; }}
        .card {{ background:#1e293b; padding:16px; border-radius:14px; margin:14px 0; border:1px solid #334155; }}
        .grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:14px; }}
      </style>
    </head>
    <body>
      <h1>Identity Control V1</h1>
      <a href="/platform-home">Platform Home</a>
      <a href="/payments-control-v1">Payments Control</a>
      <div class='grid'>
        <div class='card'><h3>AAM Wallet IDs</h3><p>{len(wallets)} records</p><a href='/wallet-id-v1'>Open</a></div>
        <div class='card'><h3>AAM Passports</h3><p>{len(passports)} records</p><a href='/passport-v1'>Open</a></div>
        <div class='card'><h3>Seed Demo Data</h3><p>Install sample payouts + sponsors + revenue</p><a href='/seed-money-demo-v1'>Run Demo Seed</a></div>
      </div>
    </body>
    </html>
    """

@app.route("/wallet-id-v1", methods=["GET","POST"])
def giga_wallet_id_v1_20260318():
    from flask import request, redirect
    if request.method == "POST":
        rows = giga_wps_read_20260318("aam_wallet_ids.json")
        name = request.form.get("owner_name","")
        row = {
            "id": giga_wps_next_id_20260318(rows, "walletid"),
            "owner_name": name,
            "wallet_id": giga_wps_make_wallet_id_20260318(name, len(rows)+1),
            "wallet_role": request.form.get("wallet_role","creator"),
            "status": request.form.get("status","active"),
            "created_at": __import__("datetime").datetime.utcnow().isoformat()
        }
        rows.append(row)
        giga_wps_write_20260318("aam_wallet_ids.json", rows)
        return redirect("/identity-control-v1")
    return """
    <html><body style='font-family:Arial;background:#0f172a;color:white;padding:20px;'>
    <h1>AAM Wallet ID V1</h1>
    <form method='post'>
      <input name='owner_name' placeholder='Owner / creator / heir name'>
      <select name='wallet_role'>
        <option value='creator'>Creator</option>
        <option value='heir'>Heir</option>
        <option value='platform'>Platform</option>
        <option value='sponsor'>Sponsor</option>
      </select><br><br>
      <select name='status'>
        <option value='active'>Active</option>
        <option value='hold'>Hold</option>
      </select><br><br>
      <button type='submit'>Create Wallet ID</button>
    </form></body></html>
    """

@app.route("/passport-v1", methods=["GET","POST"])
def giga_passport_v1_20260318():
    from flask import request, redirect
    if request.method == "POST":
        rows = giga_wps_read_20260318("aam_passports.json")
        name = request.form.get("owner_name","")
        row = {
            "id": giga_wps_next_id_20260318(rows, "passport"),
            "owner_name": name,
            "passport_id": giga_wps_make_passport_id_20260318(name, len(rows)+1),
            "region_scope": request.form.get("region_scope","global"),
            "kyc_status": request.form.get("kyc_status","pending"),
            "creator_lane": request.form.get("creator_lane","general"),
            "created_at": __import__("datetime").datetime.utcnow().isoformat()
        }
        rows.append(row)
        giga_wps_write_20260318("aam_passports.json", rows)
        return redirect("/identity-control-v1")
    return """
    <html><body style='font-family:Arial;background:#0f172a;color:white;padding:20px;'>
    <h1>AAM Passport V1</h1>
    <form method='post'>
      <input name='owner_name' placeholder='Owner / creator / heir name'>
      <input name='region_scope' placeholder='Global / country / state / city'>
      <select name='kyc_status'>
        <option value='pending'>Pending</option>
        <option value='verified'>Verified</option>
      </select><br><br>
      <select name='creator_lane'>
        <option value='general'>General</option>
        <option value='family'>Family</option>
        <option value='faith'>Faith</option>
        <option value='music'>Music</option>
        <option value='film'>Film</option>
      </select><br><br>
      <button type='submit'>Create Passport</button>
    </form></body></html>
    """

@app.route("/seed-money-demo-v1")
def giga_seed_money_demo_v1_20260318():
    payment_accounts = giga_wps_read_20260318("payment_accounts.json")
    revenue_events = giga_wps_read_20260318("revenue_events.json")
    sponsor_campaigns = giga_wps_read_20260318("sponsor_campaigns.json")
    wallets = giga_wps_read_20260318("creator_wallets.json")
    payout_runs = giga_wps_read_20260318("payout_runs.json")
    wallet_ids = giga_wps_read_20260318("aam_wallet_ids.json")
    passports = giga_wps_read_20260318("aam_passports.json")

    demo_people = [
        ("Aniyah", "heir", "faith"),
        ("Isaiah", "heir", "film"),
        ("Jacobie", "heir", "general")
    ]

    for name, role, lane in demo_people:
        if not any(x.get("owner_name")==name for x in wallet_ids):
            wallet_ids.append({
                "id": giga_wps_next_id_20260318(wallet_ids, "walletid"),
                "owner_name": name,
                "wallet_id": giga_wps_make_wallet_id_20260318(name, len(wallet_ids)+1),
                "wallet_role": role,
                "status": "active",
                "created_at": __import__("datetime").datetime.utcnow().isoformat()
            })
        if not any(x.get("owner_name")==name for x in passports):
            passports.append({
                "id": giga_wps_next_id_20260318(passports, "passport"),
                "owner_name": name,
                "passport_id": giga_wps_make_passport_id_20260318(name, len(passports)+1),
                "region_scope": "global",
                "kyc_status": "verified",
                "creator_lane": lane,
                "created_at": __import__("datetime").datetime.utcnow().isoformat()
            })
        if not any(x.get("owner_name")==name for x in payment_accounts):
            payment_accounts.append({
                "id": giga_wps_next_id_20260318(payment_accounts, "payacct"),
                "owner_name": name,
                "provider": "stripe",
                "account_email": f"{name.lower()}@example.com",
                "status": "verified",
                "created_at": __import__("datetime").datetime.utcnow().isoformat()
            })
        wallet, wallets = giga_wps_get_wallet_20260318(name)

    demo_events = [
        ("Aniyah", "subscription", 49.99),
        ("Isaiah", "movie_purchase", 149.00),
        ("Jacobie", "sponsor", 500.00),
        ("Aniyah", "premium_holographic", 99.00)
    ]

    for owner_name, event_type, amount in demo_events:
        splits = giga_wps_split_20260318(amount)
        revenue_events.append({
            "id": giga_wps_next_id_20260318(revenue_events, "revenue"),
            "owner_name": owner_name,
            "event_type": event_type,
            "gross_amount": amount,
            "splits": splits,
            "status": "recorded",
            "created_at": __import__("datetime").datetime.utcnow().isoformat()
        })
        for wallet in wallets:
            if wallet.get("owner_name") == owner_name:
                wallet["pending_balance"] = round(float(wallet.get("pending_balance",0)) + splits["creator"], 2)

    if not sponsor_campaigns:
        sponsor_campaigns.extend([
            {
                "id": "sponsor_1",
                "brand_name": "Kingdom Sponsor One",
                "campaign_type": "product placement",
                "creator_target": "Isaiah",
                "budget": 1500.0,
                "status": "active",
                "created_at": __import__("datetime").datetime.utcnow().isoformat()
            },
            {
                "id": "sponsor_2",
                "brand_name": "Voice Studio Brand",
                "campaign_type": "holographic ad",
                "creator_target": "Aniyah",
                "budget": 2500.0,
                "status": "active",
                "created_at": __import__("datetime").datetime.utcnow().isoformat()
            }
        ])

    payout_runs.append({
        "id": giga_wps_next_id_20260318(payout_runs, "payout"),
        "schedule": "biweekly-demo-seed",
        "processed": [],
        "created_at": __import__("datetime").datetime.utcnow().isoformat()
    })

    giga_wps_write_20260318("aam_wallet_ids.json", wallet_ids)
    giga_wps_write_20260318("aam_passports.json", passports)
    giga_wps_write_20260318("payment_accounts.json", payment_accounts)
    giga_wps_write_20260318("creator_wallets.json", wallets)
    giga_wps_write_20260318("revenue_events.json", revenue_events)
    giga_wps_write_20260318("sponsor_campaigns.json", sponsor_campaigns)
    giga_wps_write_20260318("payout_runs.json", payout_runs)

    return {
        "ok": True,
        "wallet_ids": len(wallet_ids),
        "passports": len(passports),
        "payment_accounts": len(payment_accounts),
        "wallets": len(wallets),
        "revenue_events": len(revenue_events),
        "sponsor_campaigns": len(sponsor_campaigns),
        "payout_runs": len(payout_runs)
    }

# === END_GIGA_WALLET_PASSPORT_STABILIZER_20260318 ===
'''

m = re.search(r'if __name__ == ["\\\']__main__["\\\']:\s*\n(?:[ \t]+.*\n)+', src)
if m:
    insert_pos = m.start()
else:
    m2 = re.search(r'app\.run\s*\([^\n]*\)\s*\n', src)
    insert_pos = m2.start() if m2 else len(src)

new_src = src[:insert_pos].rstrip() + "\n\n" + block + "\n\n" + src[insert_pos:].lstrip()
app_path.write_text(new_src, encoding="utf-8")
print("Wallet/passport stabilizer installed above app.run.")
PY

./recovery/start_giga_locked.sh

echo
echo "Seeding demo identity + money data..."
curl -s http://127.0.0.1:8080/seed-money-demo-v1
echo
echo
echo "Testing identity + payment pages..."
curl -s http://127.0.0.1:8080/identity-control-v1 | head -20
echo
curl -s http://127.0.0.1:8080/wallet-dashboard-v1
echo
curl -s http://127.0.0.1:8080/payments-control-v1 | head -20
echo
