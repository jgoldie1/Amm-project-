#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== FINAL STABILITY LOCK START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports

########################################
# 1) HEALTH CHECKS
########################################
bash scripts/check_js.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "snapshots/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "snapshots/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "snapshots/socket_health_${STAMP}.json" || true

########################################
# 2) CRITICAL PAGE SNAPSHOTS
########################################
curl -s http://127.0.0.1:4900/ > "snapshots/home_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/command-core > "snapshots/command_core_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/progress > "snapshots/progress_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/heirs > "snapshots/heirs_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/heirs-ecosystem > "snapshots/heirs_ecosystem_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/heir-operations > "snapshots/heir_operations_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/world-explorer > "snapshots/world_explorer_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/storefront-explorer > "snapshots/storefront_explorer_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/wallet-center > "snapshots/wallet_center_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/access-center > "snapshots/access_center_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/creator-hub > "snapshots/creator_hub_${STAMP}.html" || true

########################################
# 3) DATA SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as heirs_registry from heirs_registry;" > "snapshots/heirs_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_wallets from heir_wallets;" > "snapshots/heir_wallets_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_earnings from heir_earnings;" > "snapshots/heir_earnings_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_creator_profiles from heir_creator_profiles;" > "snapshots/heir_creator_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_storefront_links from heir_storefront_links;" > "snapshots/heir_storefront_links_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_permissions_matrix from heir_permissions_matrix;" > "snapshots/heir_permissions_matrix_${STAMP}.json"

sqlite3 -json db/aam.db "select count(*) as scenes from scene_registry;" > "snapshots/scenes_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as storefronts from world_storefronts;" > "snapshots/storefronts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_orders from world_cart_orders;" > "snapshots/world_orders_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as settlements from world_order_settlements;" > "snapshots/settlements_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as wallets from wallets;" > "snapshots/wallets_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as wallet_tx from wallet_transactions;" > "snapshots/wallet_tx_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as receipts from receipts;" > "snapshots/receipts_${STAMP}.json"

########################################
# 4) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_stability_lock_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_stability_lock_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_stability_lock_${STAMP}.js"
cp db/aam.db "backups/aam_stability_lock_${STAMP}.db"

########################################
# 5) REPORT
########################################
cat > "reports/stability_lock_${STAMP}.txt" <<REPORT
FINAL STABILITY LOCK REPORT
Timestamp: ${STAMP}

Services checked:
- Dashboard 4900
- Jarvis 5000
- World Socket 5090

Routes snapshotted:
- /
- /command-core
- /progress
- /heirs
- /heirs-ecosystem
- /heir-operations
- /world-explorer
- /storefront-explorer
- /wallet-center
- /access-center
- /creator-hub

Backups created:
- dashboard.js
- world_socket.js
- jarvis.js
- aam.db

Purpose:
- freeze current stable state
- make rollback easy
- verify core heirs + portal system is intact
REPORT

echo "FINAL STABILITY LOCK COMPLETE: $STAMP"
echo "Report: reports/stability_lock_${STAMP}.txt"
echo "Backup DB: backups/aam_stability_lock_${STAMP}.db"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/"
echo "  termux-open-url http://127.0.0.1:4900/progress"
echo "  termux-open-url http://127.0.0.1:4900/heirs-ecosystem"
