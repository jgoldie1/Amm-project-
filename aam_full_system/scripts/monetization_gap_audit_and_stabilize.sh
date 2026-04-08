#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== MONETIZATION GAP AUDIT + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) HARD BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_monetization_gap_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_monetization_gap_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_monetization_gap_${STAMP}.js"
cp db/aam.db "backups/aam_monetization_gap_${STAMP}.db"

########################################
# 2) CORE HEALTH
########################################
bash scripts/check_js.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 3) ROUTE SMOKE TESTS FOR FRONT DOORS
########################################
for route in \
  / \
  /public-home \
  /member-home \
  /role-hub \
  /watch \
  /join \
  /build \
  /learn \
  /heir-login \
  /heir-finance \
  /storefront-analytics \
  /executive-dashboard \
  /scheduler-command
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 4) CHECKOUT FLOW TESTS
########################################
curl -s -i -X POST "http://127.0.0.1:4900/checkout" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "tier_code=basic_access" \
  > "test_results/checkout_basic_${STAMP}.txt" || true

curl -s -i -X POST "http://127.0.0.1:4900/checkout" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "tier_code=creator_access" \
  > "test_results/checkout_creator_${STAMP}.txt" || true

curl -s -i -X POST "http://127.0.0.1:4900/checkout/complete" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "tier_code=basic_access&username=jacobie" \
  > "test_results/checkout_complete_jacobie_${STAMP}.txt" || true

curl -s -i -X POST "http://127.0.0.1:4900/checkout/complete" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "tier_code=creator_access&username=aniyah" \
  > "test_results/checkout_complete_aniyah_${STAMP}.txt" || true

curl -s -i -X POST "http://127.0.0.1:4900/checkout/complete" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "tier_code=storefront_access&username=isaiah" \
  > "test_results/checkout_complete_isaiah_${STAMP}.txt" || true

########################################
# 5) MONETIZATION SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select id, tier_name, tier_code, price_cents, tier_type, tier_status from membership_tiers order by id;" > "snapshots/membership_tiers_${STAMP}.json"
sqlite3 -json db/aam.db "select id, owner_type, owner_id, tier_code, pass_status, activated_at from ecosystem_access_passes order by id desc limit 50;" > "snapshots/ecosystem_access_passes_${STAMP}.json"
sqlite3 -json db/aam.db "select id, owner_type, owner_id, tier_code, amount_cents, checkout_status, created_at from checkout_orders order by id desc limit 50;" > "snapshots/checkout_orders_${STAMP}.json"
sqlite3 -json db/aam.db "select id, owner_type, owner_id, tier_code, unlock_scope, unlock_status, created_at from unlock_events order by id desc limit 100;" > "snapshots/unlock_events_${STAMP}.json"

########################################
# 6) GAP MATRIX FOR MONETIZATION COVERAGE
########################################
sqlite3 -json db/aam.db "
select
  hr.id,
  hr.name,
  (select count(*) from ecosystem_access_passes eap where eap.owner_type='heir' and eap.owner_id=hr.id) as access_pass_rows,
  (select count(*) from checkout_orders co where co.owner_type='heir' and co.owner_id=hr.id) as checkout_rows,
  (select count(*) from unlock_events ue where ue.owner_type='heir' and ue.owner_id=hr.id) as unlock_rows,
  (select count(*) from heir_storefront_ownership hso where hso.heir_id=hr.id) as ownership_rows,
  (select count(*) from heir_creator_profiles hcp where hcp.heir_id=hr.id) as creator_profile_rows,
  (select count(*) from heir_permissions_matrix hpm where hpm.heir_id=hr.id) as permission_rows
from heirs_registry hr
order by hr.id;
" > "snapshots/monetization_gap_matrix_${STAMP}.json"

########################################
# 7) ERROR SCAN
########################################
python3 << 'PYEOF'
from pathlib import Path
import json

root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*")):
    if f.suffix not in {".txt", ".html", ".json"}:
        continue
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "checkout failed" in lower:
        issues.append({"file": f.name, "problem": "checkout_failed_message"})
    if "tier not found" in lower:
        issues.append({"file": f.name, "problem": "tier_lookup_failure"})

latest = Path.home() / "aam_full_system" / "snapshots" / "monetization_route_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] monetization route scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) CLEAN COMPLETION REPORT
########################################
cat > "reports/monetization_gap_audit_${STAMP}.txt" <<REPORT
MONETIZATION GAP AUDIT + STABILIZE REPORT
Timestamp: ${STAMP}

What was tested:
- dashboard health
- jarvis health
- socket health
- public/member/front-door routes
- /watch /join /build /learn
- checkout selection
- checkout completion
- membership tiers
- access passes
- unlock events
- monetization coverage matrix
- fresh route/error scan

Purpose:
- detect important or detrimental monetization gaps
- verify unlock flow is working
- create rollback confidence before real payment integration
REPORT

echo "MONETIZATION GAP AUDIT + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/monetization_route_scan_latest.json"
echo "  cat snapshots/monetization_gap_matrix_${STAMP}.json"
echo "  cat snapshots/checkout_orders_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/join"
echo "  termux-open-url http://127.0.0.1:4900/watch"
echo "  termux-open-url http://127.0.0.1:4900/role-hub"
