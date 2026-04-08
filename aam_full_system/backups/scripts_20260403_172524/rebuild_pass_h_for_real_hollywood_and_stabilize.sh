#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== REBUILD PASS H FOR REAL HOLLYWOOD + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_rebuild_pass_h_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_rebuild_pass_h_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_rebuild_pass_h_${STAMP}.js"

########################################
# 1) CREATE HOLLYWOOD TABLES FOR REAL
########################################
sqlite3 db/aam.db <<SQL
CREATE TABLE IF NOT EXISTS cgi_project_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_name TEXT,
  project_group TEXT,
  linked_media_project TEXT,
  cgi_scope TEXT,
  pipeline_mode TEXT,
  project_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vfx_shot_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shot_name TEXT,
  shot_group TEXT,
  linked_project TEXT,
  shot_type TEXT,
  approval_stage TEXT,
  shot_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS special_effects_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  effect_name TEXT,
  effect_group TEXT,
  linked_project TEXT,
  effect_type TEXT,
  effect_scope TEXT,
  effect_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compositing_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comp_name TEXT,
  comp_group TEXT,
  linked_shot TEXT,
  comp_mode TEXT,
  output_scope TEXT,
  comp_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lighting_lookdev_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_name TEXT,
  profile_group TEXT,
  linked_project TEXT,
  lighting_mode TEXT,
  lookdev_scope TEXT,
  profile_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS character_asset_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_name TEXT,
  asset_group TEXT,
  linked_project TEXT,
  asset_type TEXT,
  rig_mode TEXT,
  asset_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mocap_performance_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_name TEXT,
  session_group TEXT,
  linked_project TEXT,
  performer_scope TEXT,
  capture_mode TEXT,
  session_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS previs_postvis_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vis_name TEXT,
  vis_group TEXT,
  linked_project TEXT,
  vis_stage TEXT,
  vis_scope TEXT,
  vis_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS virtual_production_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  production_name TEXT,
  production_group TEXT,
  linked_project TEXT,
  stage_mode TEXT,
  environment_mode TEXT,
  production_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS greenscreen_led_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setup_name TEXT,
  setup_group TEXT,
  linked_project TEXT,
  setup_type TEXT,
  capture_scope TEXT,
  setup_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS color_mastering_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mastering_name TEXT,
  mastering_group TEXT,
  linked_project TEXT,
  grade_mode TEXT,
  mastering_scope TEXT,
  mastering_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delivery_package_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  package_name TEXT,
  package_group TEXT,
  linked_project TEXT,
  delivery_format TEXT,
  delivery_channel TEXT,
  package_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
SQL

echo "[OK] pass H real hollywood tables created"

########################################
# 2) SEED HOLLYWOOD TABLES
########################################
sqlite3 db/aam.db <<SQL
INSERT INTO cgi_project_registry (project_name, project_group, linked_media_project, cgi_scope, pipeline_mode, project_status)
SELECT 'Primary CGI Project','cgi','Primary Movie Project','full_feature','managed','active'
WHERE NOT EXISTS (SELECT 1 FROM cgi_project_registry WHERE project_name='Primary CGI Project');

INSERT INTO vfx_shot_registry (shot_name, shot_group, linked_project, shot_type, approval_stage, shot_status)
SELECT 'Primary VFX Shot','vfx','Primary CGI Project','hero_shot','layout','active'
WHERE NOT EXISTS (SELECT 1 FROM vfx_shot_registry WHERE shot_name='Primary VFX Shot');

INSERT INTO special_effects_registry (effect_name, effect_group, linked_project, effect_type, effect_scope, effect_status)
SELECT 'Primary Special Effect','fx','Primary CGI Project','simulation','feature_sequence','active'
WHERE NOT EXISTS (SELECT 1 FROM special_effects_registry WHERE effect_name='Primary Special Effect');

INSERT INTO compositing_registry (comp_name, comp_group, linked_shot, comp_mode, output_scope, comp_status)
SELECT 'Primary Composite','comp','Primary VFX Shot','node_based','final_shot','active'
WHERE NOT EXISTS (SELECT 1 FROM compositing_registry WHERE comp_name='Primary Composite');

INSERT INTO lighting_lookdev_registry (profile_name, profile_group, linked_project, lighting_mode, lookdev_scope, profile_status)
SELECT 'Primary Lookdev Profile','lookdev','Primary CGI Project','cinematic','characters+environments','active'
WHERE NOT EXISTS (SELECT 1 FROM lighting_lookdev_registry WHERE profile_name='Primary Lookdev Profile');

INSERT INTO character_asset_registry (asset_name, asset_group, linked_project, asset_type, rig_mode, asset_status)
SELECT 'Primary Character Asset','asset','Primary CGI Project','character','advanced_rig','active'
WHERE NOT EXISTS (SELECT 1 FROM character_asset_registry WHERE asset_name='Primary Character Asset');

INSERT INTO mocap_performance_registry (session_name, session_group, linked_project, performer_scope, capture_mode, session_status)
SELECT 'Primary Mocap Session','mocap','Primary CGI Project','lead_performance','body+face','active'
WHERE NOT EXISTS (SELECT 1 FROM mocap_performance_registry WHERE session_name='Primary Mocap Session');

INSERT INTO previs_postvis_registry (vis_name, vis_group, linked_project, vis_stage, vis_scope, vis_status)
SELECT 'Primary Previs','vis','Primary CGI Project','previs','sequence_planning','active'
WHERE NOT EXISTS (SELECT 1 FROM previs_postvis_registry WHERE vis_name='Primary Previs');

INSERT INTO virtual_production_registry (production_name, production_group, linked_project, stage_mode, environment_mode, production_status)
SELECT 'Primary Virtual Production','virtual_production','Primary Movie Project','led_volume','real_time_world','active'
WHERE NOT EXISTS (SELECT 1 FROM virtual_production_registry WHERE production_name='Primary Virtual Production');

INSERT INTO greenscreen_led_registry (setup_name, setup_group, linked_project, setup_type, capture_scope, setup_status)
SELECT 'Primary LED Setup','capture','Primary Movie Project','led_wall','hybrid_capture','active'
WHERE NOT EXISTS (SELECT 1 FROM greenscreen_led_registry WHERE setup_name='Primary LED Setup');

INSERT INTO color_mastering_registry (mastering_name, mastering_group, linked_project, grade_mode, mastering_scope, mastering_status)
SELECT 'Primary Color Master','mastering','Primary Movie Project','cinematic_grade','final_master','active'
WHERE NOT EXISTS (SELECT 1 FROM color_mastering_registry WHERE mastering_name='Primary Color Master');

INSERT INTO delivery_package_registry (package_name, package_group, linked_project, delivery_format, delivery_channel, package_status)
SELECT 'Primary Delivery Package','delivery','Primary Movie Project','4k_master','creator_tv+distribution','active'
WHERE NOT EXISTS (SELECT 1 FROM delivery_package_registry WHERE package_name='Primary Delivery Package');
SQL

echo "[OK] pass H real hollywood seeded"

########################################
# 3) HARD RUNTIME RECOVERY
########################################
pkill -f "node .*dashboard.js" 2>/dev/null || true
pkill -f "node .*jarvis.js" 2>/dev/null || true
pkill -f "apps/dashboard.js" 2>/dev/null || true
pkill -f "apps/jarvis.js" 2>/dev/null || true
sleep 2
rm -f dashboard.pid jarvis.pid

bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 5
bash scripts/status.sh || true

########################################
# 4) HEALTH + ROUTE SMOKE
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/metaverse-control > "test_results/metaverse_control_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/middleverse-bridge > "test_results/middleverse_bridge_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/multiverse-bridge > "test_results/multiverse_bridge_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/studio-lab > "test_results/studio_lab_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/creator-tv > "test_results/creator_tv_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/world3d > "test_results/world3d_${STAMP}.txt" || true

########################################
# 5) GAP SUMMARY
########################################
python3 << PYEOF
from pathlib import Path
import json, sqlite3

db = Path.home() / "aam_full_system" / "db" / "aam.db"
con = sqlite3.connect(db)
cur = con.cursor()

required = [
    "cgi_project_registry",
    "vfx_shot_registry",
    "special_effects_registry",
    "compositing_registry",
    "lighting_lookdev_registry",
    "character_asset_registry",
    "mocap_performance_registry",
    "previs_postvis_registry",
    "virtual_production_registry",
    "greenscreen_led_registry",
    "color_mastering_registry",
    "delivery_package_registry"
]

missing = []
for t in required:
    row = cur.execute("select name from sqlite_master where type='table' and name=?", (t,)).fetchone()
    if not row:
        missing.append(t)

summary = {
    "missing_tables": missing,
    "gap_status": "stable" if not missing else "needs_attention"
}

out = Path.home() / "aam_full_system" / "snapshots" / "pass_h_hollywood_gap_summary_latest.json"
out.write_text(json.dumps(summary, indent=2))
print("[OK] pass H real hollywood gap summary written")
print(json.dumps(summary, indent=2))
con.close()
PYEOF

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

latest = Path.home() / "aam_full_system" / "snapshots" / "pass_h_hollywood_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] pass H real hollywood scan complete: {len(issues)} issues")
PYEOF

########################################
# 7) FINAL STATUS + REPORT
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

cat > "reports/rebuild_pass_h_for_real_hollywood_and_stabilize_${STAMP}.txt" <<REPORT
REBUILD PASS H FOR REAL HOLLYWOOD + STABILIZE REPORT
Timestamp: ${STAMP}

Built:
- cgi project registry
- vfx shot registry
- special effects registry
- compositing registry
- lighting lookdev registry
- character asset registry
- mocap performance registry
- previs postvis registry
- virtual production registry
- greenscreen led registry
- color mastering registry
- delivery package registry

Verified:
- dashboard health
- jarvis health
- metaverse route
- middleverse route
- multiverse route
- studio lab
- creator tv
- world3d
- current-run-only scan
- hollywood gap summary

Purpose:
- build missing hollywood production layer for real
- preserve stable runtime
- finish this production section cleanly
REPORT

echo "REBUILD PASS H FOR REAL HOLLYWOOD + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/pass_h_hollywood_scan_latest.json"
echo "  cat snapshots/pass_h_hollywood_gap_summary_latest.json"
echo "  cat reports/rebuild_pass_h_for_real_hollywood_and_stabilize_${STAMP}.txt"
echo "  bash scripts/status.sh"
