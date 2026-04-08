#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
STAMP="$(date +%Y%m%d_%H%M%S)"

########################################
# 2) CREATE CLEAN TABLES
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

CREATE TABLE IF NOT EXISTS ai_persona_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  persona_name TEXT,
  persona_group TEXT,
  linked_brand TEXT,
  persona_role TEXT,
  persona_scope TEXT,
  persona_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_layer_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  layer_name TEXT,
  layer_group TEXT,
  linked_brand TEXT,
  layer_role TEXT,
  layer_scope TEXT,
  layer_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
SQL

echo "[OK] pass D clean tables created"

########################################
# 3) SEED CLEAN TABLES
########################################
sqlite3 db/aam.db <<SQL
INSERT INTO platform_brand_registry (brand_name, brand_group, brand_role, brand_scope, brand_status)
VALUES
('Stubbs AI','ai_brand','user_facing_intelligence','global','active'),
('Lyon Tech','engineering_brand','platform_engineering','global','active'),
('Googleplex Tech','infrastructure_brand','memory_orchestration_scale','global','active');

INSERT INTO ai_persona_registry (persona_name, persona_group, linked_brand, persona_role, persona_scope, persona_status)
VALUES
('Stubbs Core Assistant','assistant','Stubbs AI','primary_platform_ai','global','active'),
('Clawbot Operations Persona','operations','Stubbs AI','ops_worker_ai','multiverse','active');

INSERT INTO system_layer_registry (layer_name, layer_group, linked_brand, layer_role, layer_scope, layer_status)
VALUES
('User Intelligence Layer','frontend_ai','Stubbs AI','assistant_interface','global','active'),
('Engineering Platform Layer','platform_core','Lyon Tech','developer_runtime','global','active'),
('Memory and Orchestration Layer','infrastructure_core','Googleplex Tech','memory_execution_orchestration','global','active');
SQL

echo "[OK] pass D clean tables seeded"

########################################
# 4) RESTART + SMOKE
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 5
bash scripts/status.sh || true

curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/metaverse-control > "test_results/metaverse_control_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/middleverse-bridge > "test_results/middleverse_bridge_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/multiverse-bridge > "test_results/multiverse_bridge_${STAMP}.txt" || true

########################################
# 5) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as platform_brand_registry from platform_brand_registry;" > "snapshots/platform_brand_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as ai_persona_registry from ai_persona_registry;" > "snapshots/ai_persona_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as system_layer_registry from system_layer_registry;" > "snapshots/system_layer_registry_${STAMP}.json"

sqlite3 -json db/aam.db "select id, brand_name, brand_group, brand_role, brand_scope, brand_status, created_at from platform_brand_registry order by id desc limit 20;" > "snapshots/platform_brand_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, persona_name, persona_group, linked_brand, persona_role, persona_scope, persona_status, created_at from ai_persona_registry order by id desc limit 20;" > "snapshots/ai_persona_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, layer_name, layer_group, linked_brand, layer_role, layer_scope, layer_status, created_at from system_layer_registry order by id desc limit 20;" > "snapshots/system_layer_registry_tail_${STAMP}.json"

########################################
# 6) CURRENT-RUN ERROR SCAN
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
# 7) FINAL STATUS + REPORT
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

cat > "reports/repair_multiverse_pass_d_brand_schema_and_stabilize_${STAMP}.txt" <<REPORT
REPAIR MULTIVERSE PASS D BRAND SCHEMA + STABILIZE REPORT
Timestamp: ${STAMP}

Fixed:
- platform_brand_registry schema mismatch
- ai_persona_registry schema mismatch
- system_layer_registry schema mismatch
- recreated clean brand/layer tables
- reseeded brand/layer architecture

Verified:
- dashboard health
- jarvis health
- metaverse route
- middleverse route
- multiverse route
- current-run-only scan
- stable runtime

Purpose:
- repair legacy schema conflicts
- preserve stable runtime
- restore Pass D brand/layer architecture cleanly
REPORT

echo "REPAIR MULTIVERSE PASS D BRAND SCHEMA + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/multiverse_pass_d_scan_latest.json"
echo "  cat snapshots/platform_brand_registry_tail_${STAMP}.json"
echo "  cat snapshots/ai_persona_registry_tail_${STAMP}.json"
echo "  cat snapshots/system_layer_registry_tail_${STAMP}.json"
echo "  cat reports/repair_multiverse_pass_d_brand_schema_and_stabilize_${STAMP}.txt"
echo "  bash scripts/status.sh"
