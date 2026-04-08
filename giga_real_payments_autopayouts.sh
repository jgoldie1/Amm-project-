#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

cd ~/marketplace

APP="$HOME/marketplace/app.py"
DATA_DIR="$HOME/marketplace/data"
BACKUP_DIR="$HOME/marketplace/backups"
STAMP="$(date +%Y%m%d_%H%M%S)"

mkdir -p "$DATA_DIR" "$BACKUP_DIR"
cp "$APP" "$BACKUP_DIR/app_real_payments_${STAMP}.py"
echo "Backup saved: $BACKUP_DIR/app_real_payments_${STAMP}.py"

for f in payment_accounts.json creator_wallets.json revenue_events.json payout_runs.json sponsor_campaigns.json platform_settings.json; do
  [ -f "$DATA_DIR/$f" ] || echo "[]" > "$DATA_DIR/$f"
done

python3 <<'PY'
from pathlib import Path
import re

app_path = Path.home() / "marketplace" / "app.py"
src = app_path.read_text(encoding="utf-8")

marker = "# === GIGA_REAL_PAYMENTS_AUTOPAYOUTS_20260318 ==="
if marker in src:
    print("Real payments + auto payouts already installed.")
    raise SystemExit(0)

block = r'''
# === GIGA_REAL_PAYMENTS_AUTOPAYOUTS_20260318 ===

def giga_pay_read_20260318(filename):
    try:
        import json
        from pathlib import Path
        fp = Path.home() / "marketplace" / "data" / filename
        if not fp.exists():
            return []
        return json.loads(fp.read_text(encoding="utf-8"))
    except Exception:
        return []

def giga_pay_write_20260318(filename, payload):
    try:
        import json
        from pathlib import Path
        fp = Path.home() / "marketplace" / "data" / filename
        fp.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    except Exception:
        pass

def giga_pay_next_id_20260318(items, prefix):
    return f"{prefix}_{len(items)+1}"

def giga_pay_get_wallet_20260318(owner_name):
    wallets = giga_pay_read_20260318("creator_wallets.json")
    for w in wallets:
        if w.get("owner_name") == owner_name:
            return w, wallets
    wallet = {
        "id": giga_pay_next_id_20260318(wallets, "wallet"),
        "owner_name": owner_name,
        "available_balance": 0.0,
        "pending_balance": 0.0,
        "total_paid_out": 0.0
    }
    wallets.append(wallet)
    return wallet, wallets

def giga_pay_split_20260318(amount):
    amount = float(amount)
    creator = round(amount * 0.70, 2)
    platform = round(amount * 0.20, 2)
    legacy = round(amount * 0.05, 2)
    ops = round(amount - creator - platform - legacy, 2)
    return {
        "creator": creator,
        "platform": platform,
        "legacy": legacy,
        "ops": ops
    }

@app.route("/payments-control-v1")
def giga_payments_control_v1_20260318():
    accounts = giga_pay_read_20260318("payment_accounts.json")
    wallets = giga_pay_read_20260318("creator_wallets.json")
    events = giga_pay_read_20260318("revenue_events.json")
    payouts = giga_pay_read_20260318("payout_runs.json")
    sponsors = giga_pay_read_20260318("sponsor_campaigns.json")
    return f"""
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>Payments Control V1</title>
      <style>
        body {{ font-family: Arial, sans-serif; background: linear-gradient(180deg,#020617 0%,#0f172a 100%); color:white; padding:20px; }}
        a, button {{ display:inline-block; margin:6px 8px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border:none; border-radius:10px; }}
        input, select {{ width:100%; max-width:760px; padding:10px; margin:8px 0; border-radius:8px; border:1px solid #334155; background:#0f172a; color:white; }}
        .card {{ background:#1e293b; padding:16px; border-radius:14px; margin:14px 0; border:1px solid #334155; }}
        .grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:14px; }}
      </style>
    </head>
    <body>
      <h1>Payments Control V1</h1>
      <a href="/platform-home">Platform Home</a>
      <a href="/creator-studio">Creator Studio</a>
      <a href="/studio-control-v1">Studio Control</a>
      <div class='grid'>
        <div class='card'><h3>Payment Accounts</h3><p>{len(accounts)} connected records</p><a href='/payment-accounts-v1'>Open</a></div>
        <div class='card'><h3>Wallets</h3><p>{len(wallets)} creator wallets</p><a href='/wallet-dashboard-v1'>Open</a></div>
        <div class='card'><h3>Revenue Events</h3><p>{len(events)} monetization events</p><a href='/revenue-events-v1'>Open</a></div>
        <div class='card'><h3>Auto Payout Runs</h3><p>{len(payouts)} payout runs</p><a href='/auto-payouts-v1'>Open</a></div>
        <div class='card'><h3>Sponsor Campaigns</h3><p>{len(sponsors)} sponsor records</p><a href='/sponsor-campaigns-v1'>Open</a></div>
        <div class='card'><h3>Founder Gift</h3><p>Aniyah founder portal + birthday lane</p><a href='/aniyah-founder-gift-v1'>Open</a></div>
      </div>
    </body>
    </html>
    """

@app.route("/payment-accounts-v1", methods=["GET","POST"])
def giga_payment_accounts_v1_20260318():
    from flask import request, redirect
    if request.method == "POST":
        rows = giga_pay_read_20260318("payment_accounts.json")
        row = {
            "id": giga_pay_next_id_20260318(rows, "payacct"),
            "owner_name": request.form.get("owner_name",""),
            "provider": request.form.get("provider","stripe"),
            "account_email": request.form.get("account_email",""),
            "status": request.form.get("status","pending"),
            "created_at": __import__("datetime").datetime.utcnow().isoformat()
        }
        rows.append(row)
        giga_pay_write_20260318("payment_accounts.json", rows)
        return redirect("/payments-control-v1")
    return """
    <html><body style='font-family:Arial;background:#0f172a;color:white;padding:20px;'>
    <h1>Payment Accounts V1</h1>
    <form method='post'>
      <input name='owner_name' placeholder='Owner / creator name'>
      <select name='provider'>
        <option value='stripe'>Stripe</option>
        <option value='paypal'>PayPal</option>
        <option value='bank'>Bank</option>
      </select><br><br>
      <input name='account_email' placeholder='Email / payout contact'>
      <select name='status'>
        <option value='pending'>Pending</option>
        <option value='verified'>Verified</option>
      </select><br><br>
      <button type='submit'>Save Payment Account</button>
    </form></body></html>
    """

@app.route("/revenue-events-v1", methods=["GET","POST"])
def giga_revenue_events_v1_20260318():
    from flask import request, redirect
    if request.method == "POST":
        rows = giga_pay_read_20260318("revenue_events.json")
        owner_name = request.form.get("owner_name","unknown")
        amount = float(request.form.get("gross_amount","0") or 0)
        event_type = request.form.get("event_type","view_sale")
        splits = giga_pay_split_20260318(amount)

        row = {
            "id": giga_pay_next_id_20260318(rows, "revenue"),
            "owner_name": owner_name,
            "event_type": event_type,
            "gross_amount": amount,
            "splits": splits,
            "status": "recorded",
            "created_at": __import__("datetime").datetime.utcnow().isoformat()
        }
        rows.append(row)
        giga_pay_write_20260318("revenue_events.json", rows)

        wallet, wallets = giga_pay_get_wallet_20260318(owner_name)
        wallet["pending_balance"] = round(float(wallet.get("pending_balance",0)) + splits["creator"], 2)
        giga_pay_write_20260318("creator_wallets.json", wallets)

        return redirect("/payments-control-v1")

    rows = giga_pay_read_20260318("revenue_events.json")
    return f"""
    <html><body style='font-family:Arial;background:#0f172a;color:white;padding:20px;'>
    <h1>Revenue Events V1</h1>
    <form method='post'>
      <input name='owner_name' placeholder='Creator / owner name'>
      <select name='event_type'>
        <option value='subscription'>Subscription</option>
        <option value='movie_purchase'>Movie Purchase</option>
        <option value='sponsor'>Sponsor</option>
        <option value='product_placement'>Product Placement</option>
        <option value='premium_holographic'>Holographic Upgrade</option>
      </select><br><br>
      <input name='gross_amount' placeholder='Gross amount'>
      <button type='submit'>Record Revenue Event</button>
    </form>
    <pre>{rows[-10:]}</pre>
    </body></html>
    """

@app.route("/wallet-dashboard-v1")
def giga_wallet_dashboard_v1_20260318():
    wallets = giga_pay_read_20260318("creator_wallets.json")
    total_pending = round(sum(float(w.get("pending_balance",0)) for w in wallets), 2)
    total_available = round(sum(float(w.get("available_balance",0)) for w in wallets), 2)
    return {
        "wallets": wallets,
        "total_pending": total_pending,
        "total_available": total_available
    }

@app.route("/auto-payouts-v1", methods=["GET","POST"])
def giga_auto_payouts_v1_20260318():
    from flask import redirect
    if __import__("flask").request.method == "POST":
        wallets = giga_pay_read_20260318("creator_wallets.json")
        runs = giga_pay_read_20260318("payout_runs.json")

        run = {
            "id": giga_pay_next_id_20260318(runs, "payout"),
            "schedule": "biweekly",
            "processed": [],
            "created_at": __import__("datetime").datetime.utcnow().isoformat()
        }

        for wallet in wallets:
            pending = float(wallet.get("pending_balance",0))
            if pending >= 25:
                wallet["available_balance"] = round(float(wallet.get("available_balance",0)) + pending, 2)
                wallet["pending_balance"] = 0.0
                wallet["total_paid_out"] = round(float(wallet.get("total_paid_out",0)) + pending, 2)
                run["processed"].append({
                    "owner_name": wallet.get("owner_name"),
                    "amount": pending,
                    "status": "ready_for_provider"
                })

        giga_pay_write_20260318("creator_wallets.json", wallets)
        runs.append(run)
        giga_pay_write_20260318("payout_runs.json", runs)
        return redirect("/payments-control-v1")

    runs = giga_pay_read_20260318("payout_runs.json")
    return f"""
    <html><body style='font-family:Arial;background:#0f172a;color:white;padding:20px;'>
    <h1>Auto Payouts V1</h1>
    <p>Bi-weekly payout target with $25 minimum threshold.</p>
    <form method='post'>
      <button type='submit'>Run Auto Payout Sweep</button>
    </form>
    <pre>{runs[-5:]}</pre>
    </body></html>
    """

@app.route("/sponsor-campaigns-v1", methods=["GET","POST"])
def giga_sponsor_campaigns_v1_20260318():
    from flask import request, redirect
    if request.method == "POST":
        rows = giga_pay_read_20260318("sponsor_campaigns.json")
        row = {
            "id": giga_pay_next_id_20260318(rows, "sponsor"),
            "brand_name": request.form.get("brand_name",""),
            "campaign_type": request.form.get("campaign_type","sponsor_card"),
            "creator_target": request.form.get("creator_target",""),
            "budget": float(request.form.get("budget","0") or 0),
            "status": request.form.get("status","active"),
            "created_at": __import__("datetime").datetime.utcnow().isoformat()
        }
        rows.append(row)
        giga_pay_write_20260318("sponsor_campaigns.json", rows)
        return redirect("/payments-control-v1")
    return """
    <html><body style='font-family:Arial;background:#0f172a;color:white;padding:20px;'>
    <h1>Sponsor Campaigns V1</h1>
    <form method='post'>
      <input name='brand_name' placeholder='Brand name'>
      <input name='campaign_type' placeholder='Sponsor card / product placement / holographic ad'>
      <input name='creator_target' placeholder='Target creator / show'>
      <input name='budget' placeholder='Budget'>
      <select name='status'>
        <option value='active'>Active</option>
        <option value='hold'>Hold</option>
      </select><br><br>
      <button type='submit'>Save Sponsor Campaign</button>
    </form></body></html>
    """

@app.route("/aniyah-founder-gift-v1")
def giga_aniyah_founder_gift_v1_20260318():
    return """
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>Aniyah Founder Gift V1</title>
      <style>
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg,#111827,#1e3a8a,#4c1d95); color:white; padding:24px; }
        .card { background: rgba(15,23,42,.65); border:1px solid #334155; padding:18px; border-radius:16px; margin:14px 0; }
        a { display:inline-block; margin:6px 8px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:10px; }
      </style>
    </head>
    <body>
      <h1>Aniyah Founder Edition</h1>
      <div class='card'>
        <h3>Birthday Founder Gift</h3>
        <p>You now have a live founder lane inside the kingdom platform.</p>
        <p>Suggested focus: Voice Studio, Cross-Border, Singing Coach, Global Dubbing.</p>
      </div>
      <div class='card'>
        <h3>Live Components</h3>
        <p>Creator Studio</p>
        <p>Governance + Protection</p>
        <p>Translation Rights</p>
        <p>Payments Control</p>
        <p>Founder Branding Page</p>
      </div>
      <a href='/creator-studio'>Creator Studio</a>
      <a href='/studio-control-v1'>Studio Control</a>
      <a href='/payments-control-v1'>Payments Control</a>
    </body>
    </html>
    """

# === END_GIGA_REAL_PAYMENTS_AUTOPAYOUTS_20260318 ===
'''

m = re.search(r'if __name__ == ["\\\']__main__["\\\']:\s*\n(?:[ \t]+.*\n)+', src)
if m:
    insert_pos = m.start()
else:
    m2 = re.search(r'app\.run\s*\([^\n]*\)\s*\n', src)
    insert_pos = m2.start() if m2 else len(src)

new_src = src[:insert_pos].rstrip() + "\n\n" + block + "\n\n" + src[insert_pos:].lstrip()
app_path.write_text(new_src, encoding="utf-8")
print("Real payments + auto payouts installed above app.run.")
PY

./recovery/start_giga_locked.sh

echo
echo "Testing payments system..."
curl -s http://127.0.0.1:8080/payments-control-v1 | head -20
echo
curl -s http://127.0.0.1:8080/wallet-dashboard-v1
echo
curl -s http://127.0.0.1:8080/aniyah-founder-gift-v1 | head -20
echo
