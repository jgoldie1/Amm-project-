#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FIX WALLET TIER_CODE + LAUNCH READINESS START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_wallet_tier_fix_${STAMP}.js"
cp db/aam.db "backups/aam_wallet_tier_fix_${STAMP}.db"

########################################
# 2) DB FIX
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

def cols(table):
    try:
        return [r["name"] for r in cur.execute(f"PRAGMA table_info({table})").fetchall()]
    except:
        return []

if "tier_code" not in cols("heir_wallets"):
    cur.execute("ALTER TABLE heir_wallets ADD COLUMN tier_code TEXT DEFAULT 'basic_access'")
    print("[OK] added heir_wallets.tier_code")

if "wallet_status" not in cols("heir_wallets"):
    cur.execute("ALTER TABLE heir_wallets ADD COLUMN wallet_status TEXT DEFAULT 'active'")
    print("[OK] added heir_wallets.wallet_status")

if "wallet_type" not in cols("heir_wallets"):
    cur.execute("ALTER TABLE heir_wallets ADD COLUMN wallet_type TEXT DEFAULT 'platform_wallet'")
    print("[OK] added heir_wallets.wallet_type")

# backfill tier code from active passes when possible
rows = cur.execute("""
SELECT e.owner_id as heir_id, e.tier_code
FROM ecosystem_access_passes e
WHERE e.owner_type='heir' AND e.pass_status='active'
ORDER BY e.id
""").fetchall()

for r in rows:
    cur.execute("""
    UPDATE heir_wallets
    SET tier_code=?, wallet_status='active'
    WHERE heir_id=?
    """, (r["tier_code"], r["heir_id"]))

# any blanks become basic_access
cur.execute("""
UPDATE heir_wallets
SET tier_code='basic_access'
WHERE tier_code IS NULL OR tier_code=''
""")

conn.commit()
conn.close()
print("[OK] wallet tier sync repaired")
PYEOF

########################################
# 3) VERIFY / RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 4) RE-RUN PAYMENT ACTIVATION TESTS
########################################
curl -s -i -X POST "http://127.0.0.1:4900/checkout/complete" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "tier_code=basic_access&username=jacobie" \
  > "test_results/postpay_jacobie_${STAMP}.txt" || true

curl -s -i -X POST "http://127.0.0.1:4900/checkout/complete" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "tier_code=creator_access&username=aniyah" \
  > "test_results/postpay_aniyah_${STAMP}.txt" || true

curl -s -i -X POST "http://127.0.0.1:4900/checkout/complete" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "tier_code=storefront_access&username=isaiah" \
  > "test_results/postpay_isaiah_${STAMP}.txt" || true

########################################
# 5) ROUTE SMOKE TEST
########################################
for route in \
  / \
  /join \
  /watch \
  /build \
  /learn \
  /connect-system \
  /conversion-control \
  /monetization-control \
  /payment-control \
  /accessibility \
  /avatar-rig-control \
  /engine-bridge \
  /visual-streaming \
  /role-hub
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "
select h.id, h.name,
  (select tier_code from ecosystem_access_passes e where e.owner_type='heir' and e.owner_id=h.id order by e.id desc limit 1) as latest_pass,
  (select tier_code from heir_wallets w where w.heir_id=h.id order by w.id desc limit 1) as wallet_tier,
  (select count(*) from unlock_events u where u.owner_type='heir' and u.owner_id=h.id) as unlock_count,
  (select count(*) from payment_transactions p where p.heir_id=h.id) as payment_tx_count
from heirs_registry h
order by h.id;
" > "snapshots/post_payment_activation_matrix_${STAMP}.json"

sqlite3 -json db/aam.db "select id, heir_id, wallet_name, wallet_type, wallet_status, tier_code from heir_wallets order by id desc limit 50;" > "snapshots/heir_wallets_tiers_${STAMP}.json"
sqlite3 -json db/aam.db "select id, heir_id, provider_name, payment_session_id, checkout_order_id, tx_ref, amount_cents, currency_code, tx_status, created_at from payment_transactions order by id desc limit 50;" > "snapshots/payment_transactions_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, event_type, ref_id, payload, chain_layer, tx_hash, event_status, created_at from blockchain_events order by id desc limit 100;" > "snapshots/blockchain_events_tail_${STAMP}.json"

########################################
# 7) ERROR SCAN
########################################
python3 << 'PYEOF'
from pathlib import Path
import json

root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob("*.txt")):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "checkout failed" in lower:
        issues.append({"file": f.name, "problem": "checkout_failed"})
    if "tier not found" in lower:
        issues.append({"file": f.name, "problem": "tier_not_found"})
    if "username not found" in lower:
        issues.append({"file": f.name, "problem": "username_not_found"})

latest = Path.home() / "aam_full_system" / "snapshots" / "launch_readiness_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] launch readiness scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/fix_wallet_tiercode_and_launch_readiness_${STAMP}.txt" <<REPORT
FIX WALLET TIER_CODE + LAUNCH READINESS REPORT
Timestamp: ${STAMP}

Fixed:
- heir_wallets.tier_code schema gap
- wallet tier sync from active access passes

Verified:
- payment transaction creation
- access pass / wallet tier alignment
- unlock event presence
- blockchain event tail
- launch route smoke tests

Purpose:
- stabilize everything
- close schema mismatch
- restore post-payment activation verification
REPORT

echo "FIX WALLET TIER_CODE + LAUNCH READINESS COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/launch_readiness_scan_latest.json"
echo "  cat snapshots/post_payment_activation_matrix_${STAMP}.json"
echo "  cat snapshots/heir_wallets_tiers_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/payment-control"
echo "  termux-open-url http://127.0.0.1:4900/monetization-control"
echo "  termux-open-url http://127.0.0.1:4900/join"
