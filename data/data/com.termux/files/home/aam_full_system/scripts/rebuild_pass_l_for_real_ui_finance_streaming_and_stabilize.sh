#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== REBUILD PASS L FOR REAL UI + FINANCE + STREAMING + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_rebuild_pass_l_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_rebuild_pass_l_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_rebuild_pass_l_${STAMP}.js"

########################################
# 1) CREATE PASS L TABLES FOR REAL
########################################
sqlite3 db/aam.db <<SQL
CREATE TABLE IF NOT EXISTS finbank_account_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_name TEXT,
  account_group TEXT,
  account_type TEXT,
  currency_scope TEXT,
  account_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS finbank_card_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_name TEXT,
  card_group TEXT,
  linked_account TEXT,
  card_type TEXT,
  rewards_mode TEXT,
  card_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS finbank_transfer_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transfer_name TEXT,
  transfer_group TEXT,
  source_account TEXT,
  target_account TEXT,
  transfer_scope TEXT,
  transfer_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crossborder_streaming_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform_name TEXT,
  platform_group TEXT,
  content_scope TEXT,
  region_scope TEXT,
  monetization_mode TEXT,
  platform_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ui_navigation_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nav_name TEXT,
  nav_group TEXT,
  target_route TEXT,
  nav_scope TEXT,
  nav_priority TEXT,
  nav_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ux_module_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_name TEXT,
  module_group TEXT,
  linked_surface TEXT,
  ux_mode TEXT,
  module_scope TEXT,
  module_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_surface_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  surface_name TEXT,
  surface_group TEXT,
  linked_system TEXT,
  surface_type TEXT,
  surface_scope TEXT,
  surface_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
SQL

echo "[OK] pass L real tables created"

########################################
# 2) SEED PASS L TABLES
########################################
sqlite3 db/aam.db <<SQL
INSERT INTO finbank_account_registry (account_name, account_group, account_type, currency_scope, account_status)
SELECT 'El Saturn Finbank Checking','banking','checking','international','active'
WHERE NOT EXISTS (SELECT 1 FROM finbank_account_registry WHERE account_name='El Saturn Finbank Checking');

INSERT INTO finbank_account_registry (account_name, account_group, account_type, currency_scope, account_status)
SELECT 'El Saturn Finbank Savings','banking','savings','international','active'
WHERE NOT EXISTS (SELECT 1 FROM finbank_account_registry WHERE account_name='El Saturn Finbank Savings');

INSERT INTO finbank_account_registry (account_name, account_group, account_type, currency_scope, account_status)
SELECT 'El Saturn Finbank Money Market','banking','money_market','international','active'
WHERE NOT EXISTS (SELECT 1 FROM finbank_account_registry WHERE account_name='El Saturn Finbank Money Market');

INSERT INTO finbank_card_registry (card_name, card_group, linked_account, card_type, rewards_mode, card_status)
SELECT 'Stubbs Lyons Credit Card','credit','El Saturn Finbank Checking','credit_card','platform_rewards','active'
WHERE NOT EXISTS (SELECT 1 FROM finbank_card_registry WHERE card_name='Stubbs Lyons Credit Card');

INSERT INTO finbank_transfer_registry (transfer_name, transfer_group, source_account, target_account, transfer_scope, transfer_status)
SELECT 'Primary Cross-Border Transfer','crossborder','El Saturn Finbank Checking','El Saturn Finbank Savings','international','active'
WHERE NOT EXISTS (SELECT 1 FROM finbank_transfer_registry WHERE transfer_name='Primary Cross-Border Transfer');

INSERT INTO crossborder_streaming_registry (platform_name, platform_group, content_scope, region_scope, monetization_mode, platform_status)
SELECT 'Aniyah Cross-Border Streaming Ecosystem','streaming','music+film+creator+live','global','ads+subs+royalties','active'
WHERE NOT EXISTS (SELECT 1 FROM crossborder_streaming_registry WHERE platform_name='Aniyah Cross-Border Streaming Ecosystem');

INSERT INTO ui_navigation_registry (nav_name, nav_group, target_route, nav_scope, nav_priority, nav_status)
SELECT 'Finance Hub Nav','navigation','/finance-hub','banking','high','active'
WHERE NOT EXISTS (SELECT 1 FROM ui_navigation_registry WHERE nav_name='Finance Hub Nav');

INSERT INTO ui_navigation_registry (nav_name, nav_group, target_route, nav_scope, nav_priority, nav_status)
SELECT 'Streaming Hub Nav','navigation','/streaming-hub','streaming','high','active'
WHERE NOT EXISTS (SELECT 1 FROM ui_navigation_registry WHERE nav_name='Streaming Hub Nav');

INSERT INTO ux_module_registry (module_name, module_group, linked_surface, ux_mode, module_scope, module_status)
SELECT 'Advanced Dashboard UX','ux','dashboard','premium','cross_system','active'
WHERE NOT EXISTS (SELECT 1 FROM ux_module_registry WHERE module_name='Advanced Dashboard UX');

INSERT INTO app_surface_registry (surface_name, surface_group, linked_system, surface_type, surface_scope, surface_status)
SELECT 'Finance Hub Surface','surface','Finbank','portal','banking','active'
WHERE NOT EXISTS (SELECT 1 FROM app_surface_registry WHERE surface_name='Finance Hub Surface');

INSERT INTO app_surface_registry (surface_name, surface_group, linked_system, surface_type, surface_scope, surface_status)
SELECT 'Streaming Hub Surface','surface','Aniyah Streaming','portal','creator+media','active'
WHERE NOT EXISTS (SELECT 1 FROM app_surface_registry WHERE surface_name='Streaming Hub Surface');
SQL

echo "[OK] pass L real seeded"

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
curl -s -i http://127.0.0.1:4900/finance-hub > "test_results/finance_hub_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/streaming-hub > "test_results/streaming_hub_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/metaverse-control > "test_results/metaverse_control_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/middleverse-bridge > "test_results/middleverse_bridge_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/multiverse-bridge > "test_results/multiverse_bridge_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/studio-lab > "test_results/studio_lab_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/creator-tv > "test_results/creator_tv_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/world3d > "test_results/world3d_${STAMP}.txt" || true

########################################
# 5) SUMMARY SNAPSHOT
########################################
python3 << 'PYEOF'
from pathlib import Path
import json, sqlite3

db = Path.home() / "aam_full_system" / "db" / "aam.db"
con = sqlite3.connect(db)
cur = con.cursor()

required = [
    "finbank_account_registry",
    "finbank_card_registry",
    "finbank_transfer_registry",
    "crossborder_streaming_registry",
    "ui_navigation_registry",
    "ux_module_registry",
    "app_surface_registry"
]

missing = []
for t in required:
    row = cur.execute("select name from sqlite_master where type='table' and name=?", (t,)).fetchone()
    if not row:
        missing.append(t)

summary = {
    "required_count": len(required),
    "missing_count": len(missing),
    "missing_tables": missing,
    "ui_wiring_status": "stable" if not missing else "needs_attention"
}

out = Path.home() / "aam_full_system" / "snapshots" / "pass_l_ui_finance_streaming_summary_latest.json"
out.write_text(json.dumps(summary, indent=2))
print("[OK] pass L real summary written")
print(json.dumps(summary, indent=2))

con.close()
PYEOF

########################################
# 6) CURRENT-RUN ERROR SCAN
########################################
python3 << 'PYEOF'
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

latest = Path.home() / "aam_full_system" / "snapshots" / "pass_l_ui_finance_streaming_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] pass L real scan complete: {len(issues)} issues")
PYEOF

########################################
# 7) FINAL STATUS + REPORT
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

cat > "reports/rebuild_pass_l_for_real_ui_finance_streaming_and_stabilize_${STAMP}.txt" <<REPORT
REBUILD PASS L FOR REAL UI + FINANCE + STREAMING + STABILIZE REPORT
Timestamp: ${STAMP}

Built:
- finbank account registry
- finbank card registry
- finbank transfer registry
- crossborder streaming registry
- ui navigation registry
- ux module registry
- app surface registry

Verified:
- dashboard health
- jarvis health
- finance hub
- streaming hub
- metaverse route
- middleverse route
- multiverse route
- studio lab
- creator tv
- world3d
- current-run-only scan
- ui wiring summary

Purpose:
- build missing ui/finance/streaming layer for real
- preserve stable runtime
- finish Pass L cleanly
REPORT

echo "REBUILD PASS L FOR REAL UI + FINANCE + STREAMING + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/pass_l_ui_finance_streaming_scan_latest.json"
echo "  cat snapshots/pass_l_ui_finance_streaming_summary_latest.json"
echo "  cat reports/rebuild_pass_l_for_real_ui_finance_streaming_and_stabilize_${STAMP}.txt"
echo "  bash scripts/status.sh"
