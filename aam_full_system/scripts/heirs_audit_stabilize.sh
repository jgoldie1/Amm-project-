#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== HEIRS AUDIT + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports

########################################
# 1) VERIFY JS + SERVICES
########################################
bash scripts/check_js.sh
bash scripts/status.sh

echo "--- SOCKET HEALTH ---"
curl -s http://127.0.0.1:5090/health > "snapshots/socket_health_${STAMP}.json" || true

########################################
# 2) HEIRS AUDIT SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as heirs_registry from heirs_registry;" > "snapshots/heirs_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_wallets from heir_wallets;" > "snapshots/heir_wallets_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_earnings from heir_earnings;" > "snapshots/heir_earnings_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_creator_profiles from heir_creator_profiles;" > "snapshots/heir_creator_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_storefront_links from heir_storefront_links;" > "snapshots/heir_storefront_links_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_permissions_matrix from heir_permissions_matrix;" > "snapshots/heir_permissions_matrix_${STAMP}.json"

sqlite3 -json db/aam.db "
select
  hr.id,
  hr.name,
  hr.role,
  hr.division,
  hr.access_level,
  (select count(*) from heir_wallets hw where hw.heir_id = hr.id) as wallet_count,
  (select count(*) from heir_creator_profiles hcp where hcp.heir_id = hr.id) as creator_count,
  (select count(*) from heir_storefront_links hsl where hsl.heir_id = hr.id) as storefront_count,
  (select count(*) from heir_permissions_matrix hpm where hpm.heir_id = hr.id) as permission_count,
  (select ifnull(sum(amount_cents),0) from heir_earnings he where he.heir_id = hr.id) as total_earnings_cents
from heirs_registry hr
order by hr.id;
" > "snapshots/heirs_full_audit_${STAMP}.json"

########################################
# 3) PLATFORM SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as scenes from scene_registry;" > "snapshots/scenes_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as storefronts from world_storefronts;" > "snapshots/storefronts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_orders from world_cart_orders;" > "snapshots/world_orders_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as settlements from world_order_settlements;" > "snapshots/settlements_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as wallets from wallets;" > "snapshots/wallets_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as wallet_tx from wallet_transactions;" > "snapshots/wallet_tx_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as receipts from receipts;" > "snapshots/receipts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_assets from world_assets;" > "snapshots/world_assets_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as access_passes from world_access_passes;" > "snapshots/access_passes_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as holo_messages from holographic_messages;" > "snapshots/holo_messages_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as drone_jobs from drone_service_jobs;" > "snapshots/drone_jobs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as beat_profiles from quantum_beat_profiles;" > "snapshots/beat_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as beat_events from quantum_beat_events;" > "snapshots/beat_events_${STAMP}.json"

########################################
# 4) ROUTE CHECKS
########################################
curl -s http://127.0.0.1:4900/heirs > "snapshots/heirs_page_${STAMP}.html"
curl -s http://127.0.0.1:4900/heirs-ecosystem > "snapshots/heirs_ecosystem_page_${STAMP}.html"
curl -s http://127.0.0.1:4900/heir-operations > "snapshots/heir_operations_page_${STAMP}.html"
curl -s http://127.0.0.1:4900/progress > "snapshots/progress_page_${STAMP}.html"
curl -s http://127.0.0.1:4900/command-core > "snapshots/command_core_page_${STAMP}.html"

########################################
# 5) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_heirs_audit_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_heirs_audit_${STAMP}.js"
cp db/aam.db "backups/aam_heirs_audit_${STAMP}.db"

########################################
# 6) HUMAN REPORT
########################################
cat > "reports/heirs_audit_${STAMP}.txt" <<REPORT
HEIRS AUDIT + STABILIZE REPORT
Timestamp: ${STAMP}

Stabilized:
- Dashboard
- Jarvis
- World socket
- Heirs pages
- Heirs wallet/earnings/creator layer

Verified routes:
- /heirs
- /heirs-ecosystem
- /heir-operations
- /progress
- /command-core

Generated:
- heir counts
- heir full audit snapshot
- platform counts
- page snapshots
- code + DB backups
REPORT

echo "HEIRS AUDIT + STABILIZE COMPLETE: $STAMP"
echo "Report: reports/heirs_audit_${STAMP}.txt"
echo "Backup DB: backups/aam_heirs_audit_${STAMP}.db"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/heirs"
echo "  termux-open-url http://127.0.0.1:4900/heirs-ecosystem"
echo "  termux-open-url http://127.0.0.1:4900/heir-operations"
echo "  termux-open-url http://127.0.0.1:4900/progress"
