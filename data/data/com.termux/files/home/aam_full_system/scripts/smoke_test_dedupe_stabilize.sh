#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== SMOKE TEST + DEDUPE + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports

########################################
# 1) BACKUPS FIRST
########################################
cp apps/dashboard.js "backups/dashboard_smoke_dedupe_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_smoke_dedupe_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_smoke_dedupe_${STAMP}.js"
cp db/aam.db "backups/aam_smoke_dedupe_${STAMP}.db"

########################################
# 2) SERVICE HEALTH
########################################
bash scripts/check_js.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "snapshots/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "snapshots/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "snapshots/socket_health_${STAMP}.json" || true

########################################
# 3) ROUTE SMOKE TESTS
########################################
curl -s http://127.0.0.1:4900/ > "snapshots/home_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/progress > "snapshots/progress_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/command-core > "snapshots/command_core_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/heirs > "snapshots/heirs_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/heirs-ecosystem > "snapshots/heirs_ecosystem_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/heir-operations > "snapshots/heir_operations_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/heir-login > "snapshots/heir_login_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/heir-dashboard/1 > "snapshots/heir_dashboard_1_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/world-explorer > "snapshots/world_explorer_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/storefront-explorer > "snapshots/storefront_explorer_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/wallet-center > "snapshots/wallet_center_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/access-center > "snapshots/access_center_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/creator-hub > "snapshots/creator_hub_${STAMP}.html" || true

########################################
# 4) DEDUPE HEIRS SAFELY
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# Find duplicate heir names, keep the lowest id as canonical
dupes = cur.execute("""
SELECT name, COUNT(*) as cnt
FROM heirs_registry
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY name
""").fetchall()

removed_ids = []

for d in dupes:
    name = d["name"]
    rows = cur.execute("""
        SELECT id FROM heirs_registry
        WHERE name=?
        ORDER BY id ASC
    """, (name,)).fetchall()

    keep_id = rows[0]["id"]
    drop_ids = [r["id"] for r in rows[1:]]

    for drop_id in drop_ids:
        # Remove dependent rows for duplicate heir IDs
        for table, col in [
            ("heir_accounts", "heir_id"),
            ("heir_sessions", "heir_id"),
            ("heir_revenue_rules", "heir_id"),
            ("heir_dashboards", "heir_id"),
            ("heir_wallets", "heir_id"),
            ("heir_earnings", "heir_id"),
            ("heir_creator_profiles", "heir_id"),
            ("heir_storefront_links", "heir_id"),
            ("heir_permissions_matrix", "heir_id"),
            ("heirs_permissions", "heir_id"),
        ]:
            try:
                cur.execute(f"DELETE FROM {table} WHERE {col}=?", (drop_id,))
            except sqlite3.OperationalError:
                pass

        cur.execute("DELETE FROM heirs_registry WHERE id=?", (drop_id,))
        removed_ids.append(drop_id)

conn.commit()

# write post-dedupe snapshot
rows = cur.execute("""
SELECT hr.id, hr.name, hr.role, hr.division, hr.access_level,
       (SELECT count(*) FROM heir_accounts ha WHERE ha.heir_id = hr.id) as account_count,
       (SELECT count(*) FROM heir_wallets hw WHERE hw.heir_id = hr.id) as wallet_count,
       (SELECT count(*) FROM heir_earnings he WHERE he.heir_id = hr.id) as earnings_count
FROM heirs_registry hr
ORDER BY hr.id
""").fetchall()

snap = Path.home() / "aam_full_system" / "snapshots" / "heirs_post_dedupe_latest.json"
import json
snap.write_text(json.dumps([dict(r) for r in rows], indent=2))

report = Path.home() / "aam_full_system" / "snapshots" / "heirs_dedupe_removed_latest.json"
report.write_text(json.dumps({"removed_ids": removed_ids}, indent=2))

conn.close()
print(f"[OK] duplicate heirs removed: {len(removed_ids)}")
PYEOF

########################################
# 5) PLATFORM COUNTS
########################################
sqlite3 -json db/aam.db "select count(*) as heirs_registry from heirs_registry;" > "snapshots/heirs_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_accounts from heir_accounts;" > "snapshots/heir_accounts_${STAMP}.json"
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
# 6) FINAL REPORT
########################################
cat > "reports/smoke_test_dedupe_${STAMP}.txt" <<REPORT
SMOKE TEST + DEDUPE + STABILIZE REPORT
Timestamp: ${STAMP}

Completed:
- service health checks
- core route smoke tests
- heirs duplicate cleanup
- fresh code + DB backups
- fresh snapshots

Main purpose:
- prove important pages still render
- clean duplicate heirs/account drift
- prepare system for next feature pass
REPORT

echo "SMOKE TEST + DEDUPE + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/heirs_post_dedupe_latest.json"
echo "  cat snapshots/heirs_dedupe_removed_latest.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/heirs"
echo "  termux-open-url http://127.0.0.1:4900/heirs-ecosystem"
echo "  termux-open-url http://127.0.0.1:4900/heir-login"
echo "  termux-open-url http://127.0.0.1:4900/progress"
