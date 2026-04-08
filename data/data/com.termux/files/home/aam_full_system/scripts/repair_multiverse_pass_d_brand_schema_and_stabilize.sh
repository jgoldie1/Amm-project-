#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== REPAIR MULTIVERSE PASS D BRAND SCHEMA + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_repair_multiverse_pass_d_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_repair_multiverse_pass_d_${STAMP}.js"

########################################
# 1) RENAME CONFLICTING TABLES IF PRESENT
########################################
sqlite3 db/aam.db <<SQL
ALTER TABLE platform_brand_registry RENAME TO platform_brand_registry_legacy_${STAMP};
ALTER TABLE ai_persona_registry RENAME TO ai_persona_registry_legacy_${STAMP};
ALTER TABLE system_layer_registry RENAME TO system_layer_registry_legacy_${STAMP};
SQL
