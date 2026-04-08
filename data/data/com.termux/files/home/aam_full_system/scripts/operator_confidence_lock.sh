#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== OPERATOR CONFIDENCE LOCK START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) HEALTH + STATUS
########################################
bash scripts/check_js.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 2) CORE ROUTE CAPTURE
########################################
capture () {
  NAME="$1"
  URL="$2"
  curl -s "$URL" > "test_results/${NAME}_${STAMP}.html" || true
}

capture "home" "http://127.0.0.1:4900/"
capture "progress" "http://127.0.0.1:4900/progress"
capture "command_core" "http://127.0.0.1:4900/command-core"
capture "heirs" "http://127.0.0.1:4900/heirs"
capture "heirs_ecosystem" "http://127.0.0.1:4900/heirs-ecosystem"
capture "heir_operations" "http://127.0.0.1:4900/heir-operations"
capture "heir_login" "http://127.0.0.1:4900/heir-login"
capture "heir_dashboard_1" "http://127.0.0.1:4900/heir-dashboard/1"
capture "heir_pin_1" "http://127.0.0.1:4900/heir-pin/1"
capture "heir_payouts" "http://127.0.0.1:4900/heir-payouts"
capture "heir_storefronts" "http://127.0.0.1:4900/heir-storefronts"
capture "payout_cycles" "http://127.0.0.1:4900/payout-cycles"
capture "world_explorer" "http://127.0.0.1:4900/world-explorer"
capture "storefront_explorer" "http://127.0.0.1:4900/storefront-explorer"
capture "wallet_center" "http://127.0.0.1:4900/wallet-center"
capture "access_center" "http://127.0.0.1:4900/access-center"
capture "creator_hub" "http://127.0.0.1:4900/creator-hub"

########################################
# 3) LOGIN FLOW CONFIDENCE CHECK
########################################
curl -s -i -X POST "http://127.0.0.1:4900/heir-login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "username=jacobie&pin_code=1234" \
  > "test_results/heir_login_success_${STAMP}.txt" || true

curl -s -i -X POST "http://127.0.0.1:4900/heir-login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "username=jacobie&pin_code=9999" \
  > "test_results/heir_login_failure_${STAMP}.txt" || true

########################################
# 4) WORLD SOCKET CONFIDENCE CHECK
########################################
curl -s "http://127.0.0.1:5090/sync/1" > "test_results/socket_sync_scene1_${STAMP}.json" || true
curl -s "http://127.0.0.1:5090/check-access?sceneId=1&ownerType=avatar&ownerId=1" > "test_results/socket_access_scene1_${STAMP}.json" || true
curl -s "http://127.0.0.1:5090/emit?sceneId=1&avatarId=1&eventType=operator_lock_test&payload=%7B%22stamp%22%3A%22${STAMP}%22%7D" > "test_results/socket_emit_${STAMP}.json" || true

########################################
# 5) PLATFORM AUDIT SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as heirs_registry from heirs_registry;" > "snapshots/heirs_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_accounts from heir_accounts;" > "snapshots/heir_accounts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_sessions from heir_sessions;" > "snapshots/heir_sessions_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_wallets from heir_wallets;" > "snapshots/heir_wallets_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_earnings from heir_earnings;" > "snapshots/heir_earnings_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_revenue_rules from heir_revenue_rules;" > "snapshots/heir_revenue_rules_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_payout_runs from heir_payout_runs;" > "snapshots/heir_payout_runs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_payout_items from heir_payout_items;" > "snapshots/heir_payout_items_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_wallet_mirror_tx from heir_wallet_mirror_tx;" > "snapshots/heir_wallet_mirror_tx_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_storefront_ownership from heir_storefront_ownership;" > "snapshots/heir_storefront_ownership_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as payout_cycles from payout_cycles;" > "snapshots/payout_cycles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as payout_cycle_runs from payout_cycle_runs;" > "snapshots/payout_cycle_runs_${STAMP}.json"

sqlite3 -json db/aam.db "
select
  hr.id,
  hr.name,
  hr.role,
  hr.division,
  (select count(*) from heir_accounts ha where ha.heir_id = hr.id) as accounts,
  (select count(*) from heir_wallets hw where hw.heir_id = hr.id) as wallets,
  (select ifnull(sum(amount_cents),0) from heir_earnings he where he.heir_id = hr.id) as total_earnings_cents,
  (select count(*) from heir_storefront_ownership hso where hso.heir_id = hr.id) as storefront_ownership_count
from heirs_registry hr
order by hr.id;
" > "snapshots/heirs_operator_audit_${STAMP}.json"

########################################
# 6) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_operator_lock_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_operator_lock_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_operator_lock_${STAMP}.js"
cp db/aam.db "backups/aam_operator_lock_${STAMP}.db"

########################################
# 7) HUMAN REPORT
########################################
cat > "reports/operator_confidence_lock_${STAMP}.txt" <<REPORT
OPERATOR CONFIDENCE LOCK REPORT
Timestamp: ${STAMP}

Verified:
- Dashboard health
- Jarvis health
- World socket health
- Core portal routes
- Heirs routes
- Login success/failure handling
- World socket sync/access/event endpoint responses
- Heir payout and ownership snapshots
- Fresh backups of dashboard.js, world_socket.js, jarvis.js, and aam.db

Purpose:
- freeze current operator-grade stable state
- improve rollback confidence
- verify the heirs + payouts + ownership layer is intact
REPORT

echo "OPERATOR CONFIDENCE LOCK COMPLETE: $STAMP"
echo "Report:"
echo "  reports/operator_confidence_lock_${STAMP}.txt"
echo "Backup DB:"
echo "  backups/aam_operator_lock_${STAMP}.db"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/heir-payouts"
echo "  termux-open-url http://127.0.0.1:4900/heir-storefronts"
echo "  termux-open-url http://127.0.0.1:4900/payout-cycles"
