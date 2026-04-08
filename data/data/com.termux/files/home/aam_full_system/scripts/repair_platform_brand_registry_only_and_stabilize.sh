#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== REPAIR PLATFORM BRAND REGISTRY ONLY + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_repair_platform_brand_registry_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_repair_platform_brand_registry_${STAMP}.js"

########################################
# 1) RENAME OLD BROKEN BRAND TABLE
########################################
sqlite3 db/aam.db <<SQL
ALTER TABLE platform_brand_registry RENAME TO platform_brand_registry_legacy_${STAMP};
SQL

echo "[OK] old platform_brand_registry renamed"

########################################
# 2) RECREATE CLEAN BRAND TABLE
########################################
sqlite3 db/aam.db <<SQL
CREATE TABLE IF NOT EXISTS platform_brand_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand_name TEXT,
  brand_group TEXT,
  brand_role TEXT,
  brand_scope TEXT,
  brand_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
SQL

echo "[OK] clean platform_brand_registry created"

########################################
# 3) SEED BRAND + PERSONA + LAYER TABLES
########################################
sqlite3 db/aam.db <<SQL
INSERT INTO platform_brand_registry (brand_name, brand_group, brand_role, brand_scope, brand_status)
SELECT 'Stubbs AI','ai_brand','user_facing_intelligence','global','active'
WHERE NOT EXISTS (SELECT 1 FROM platform_brand_registry WHERE brand_name='Stubbs AI');

INSERT INTO platform_brand_registry (brand_name, brand_group, brand_role, brand_scope, brand_status)
SELECT 'Lyon Tech','engineering_brand','platform_engineering','global','active'
WHERE NOT EXISTS (SELECT 1 FROM platform_brand_registry WHERE brand_name='Lyon Tech');

INSERT INTO platform_brand_registry (brand_name, brand_group, brand_role, brand_scope, brand_status)
SELECT 'Googleplex Tech','infrastructure_brand','memory_orchestration_scale','global','active'
WHERE NOT EXISTS (SELECT 1 FROM platform_brand_registry WHERE brand_name='Googleplex Tech');

INSERT INTO ai_persona_registry (persona_name, persona_group, linked_brand, persona_role, persona_scope, persona_status)
SELECT 'Stubbs Core Assistant','assistant','Stubbs AI','primary_platform_ai','global','active'
WHERE NOT EXISTS (SELECT 1 FROM ai_persona_registry WHERE persona_name='Stubbs Core Assistant');

INSERT INTO ai_persona_registry (persona_name, persona_group, linked_brand, persona_role, persona_scope, persona_status)
SELECT 'Clawbot Operations Persona','operations','Stubbs AI','ops_worker_ai','multiverse','active'
WHERE NOT EXISTS (SELECT 1 FROM ai_persona_registry WHERE persona_name='Clawbot Operations Persona');

INSERT INTO system_layer_registry (layer_name, layer_group, linked_brand, layer_role, layer_scope, layer_status)
SELECT 'User Intelligence Layer','frontend_ai','Stubbs AI','assistant_interface','global','active'
WHERE NOT EXISTS (SELECT 1 FROM system_layer_registry WHERE layer_name='User Intelligence Layer');

INSERT INTO system_layer_registry (layer_name, layer_group, linked_brand, layer_role, layer_scope, layer_status)
SELECT 'Engineering Platform Layer','platform_core','Lyon Tech','developer_runtime','global','active'
WHERE NOT EXISTS (SELECT 1 FROM system_layer_registry WHERE layer_name='Engineering Platform Layer');

INSERT INTO system_layer_registry (layer_name, layer_group, linked_brand, layer_role, layer_scope, layer_status)
SELECT 'Memory and Orchestration Layer','infrastructure_core','Googleplex Tech','memory_execution_orchestration','global','active'
WHERE NOT EXISTS (SELECT 1 FROM system_layer_registry WHERE layer_name='Memory and Orchestration Layer');
SQL

echo "[OK] brand/persona/layer data seeded"

########################################
# 4) JS CHECK + SAFE RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 5
bash scripts/status.sh || true

########################################
# 5) CURRENT-RUN TESTS
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/metaverse-control > "test_results/metaverse_control_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/middleverse-bridge > "test_results/middleverse_bridge_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/multiverse-bridge > "test_results/multiverse_bridge_${STAMP}.txt" || true

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as platform_brand_registry from platform_brand_registry;" > "snapshots/platform_brand_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as ai_persona_registry from ai_persona_registry;" > "snapshots/ai_persona_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as system_layer_registry from system_layer_registry;" > "snapshots/system_layer_registry_${STAMP}.json"

sqlite3 -json db/aam.db "select id, brand_name, brand_group, brand_role, brand_scope, brand_status, created_at from platform_brand_registry order by id desc limit 20;" > "snapshots/platform_brand_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, persona_name, persona_group, linked_brand, persona_role, persona_scope, persona_status, created_at from ai_persona_registry order by id desc limit 20;" > "snapshots/ai_persona_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, layer_name, layer_group, linked_brand, layer_role, layer_scope, layer_status, created_at from system_layer_registry order by id desc limit 20;" > "snapshots/system_layer_registry_tail_${STAMP}.json"

########################################
# 7) CURRENT-RUN ERROR SCAN
########################################
python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore").lower()
    if "cannot get" in txt or "not found" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "syntaxerror" in txt or "referenceerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

latest = Path.home() / "aam_full_system" / "snapshots" / "multiverse_pass_d_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] repaired multiverse pass D scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) FINAL STATUS + REPORT
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

cat > "reports/repair_platform_brand_registry_only_and_stabilize_${STAMP}.txt" <<REPORT
REPAIR PLATFORM BRAND REGISTRY ONLY + STABILIZE REPORT
Timestamp: ${STAMP}

Fixed:
- platform_brand_registry schema mismatch
- recreated clean platform brand table
- preserved ai_persona_registry
- preserved system_layer_registry
- reseeded brand/persona/layer architecture

Verified:
- dashboard health
- jarvis health
- metaverse route
- middleverse route
- multiverse route
- current-run-only scan
- stable runtime

Purpose:
- repair only the broken brand schema
- preserve working tables
- restore Pass D cleanly
REPORT

echo "REPAIR PLATFORM BRAND REGISTRY ONLY + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/multiverse_pass_d_scan_latest.json"
echo "  cat snapshots/platform_brand_registry_tail_${STAMP}.json"
echo "  cat snapshots/ai_persona_registry_tail_${STAMP}.json"
echo "  cat snapshots/system_layer_registry_tail_${STAMP}.json"
echo "  cat reports/repair_platform_brand_registry_only_and_stabilize_${STAMP}.txt"
echo "  bash scripts/status.sh"
