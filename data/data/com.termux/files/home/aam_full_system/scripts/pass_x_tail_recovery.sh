#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS X TAIL RECOVERY + SMOKE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p snapshots reports test_results backups

cp db/aam.db "backups/aam_pass_x_tail_${STAMP}.db"

########################################
# 1) VERIFY TABLES EXIST
########################################
python3 <<PY2EOF
from pathlib import Path
import sqlite3, json

db = Path.home() / "aam_full_system" / "db" / "aam.db"
con = sqlite3.connect(db)
cur = con.cursor()

required = [
    "navigation_surface_registry",
    "swipe_navigation_registry",
    "workflow_path_registry",
    "help_assistant_registry",
    "user_guidance_registry"
]

missing = []
for t in required:
    row = cur.execute(
        "select name from sqlite_master where type='table' and name=?",
        (t,)
    ).fetchone()
    if not row:
        missing.append(t)

summary = {
    "required_count": len(required),
    "missing_count": len(missing),
    "missing_tables": missing,
    "pass_x_tail_status": "stable" if not missing else "needs_attention"
}

Path.home().joinpath(
    "aam_full_system","snapshots","pass_x_navigation_workflow_summary_latest.json"
).write_text(json.dumps(summary, indent=2))

print(json.dumps(summary, indent=2))
con.close()
PY2EOF

########################################
# 2) CLEAN RESTART
########################################
pkill -f "dashboard.js" 2>/dev/null || true
pkill -f "jarvis" 2>/dev/null || true
sleep 2
rm -f dashboard.pid jarvis.pid

bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 6

########################################
# 3) TARGETED SMOKE
########################################
curl -s http://127.0.0.1:4900/health > test_results/pass_x_tail_dashboard_health_${STAMP}.txt || true
curl -s http://127.0.0.1:5000/health > test_results/pass_x_tail_jarvis_health_${STAMP}.txt || true
curl -s -i http://127.0.0.1:4900/navigation-workflow-hub > test_results/pass_x_tail_navigation_workflow_hub_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/help/navigation-safe > test_results/pass_x_tail_navigation_help_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/help/kingdom-safe > test_results/pass_x_tail_kingdom_help_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/help/marketplace-safe > test_results/pass_x_tail_marketplace_help_${STAMP}.txt || true

########################################
# 4) SCAN
########################################
python3 <<PY3EOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in root.glob(f"pass_x_tail_*_{stamp}.txt"):
    txt = f.read_text(errors="ignore").lower()
    if "not found" in txt or "cannot get" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt or " 500 " in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

Path.home().joinpath(
    "aam_full_system","snapshots","pass_x_navigation_workflow_scan_latest.json"
).write_text(json.dumps(issues, indent=2))

print("issues:", len(issues))
print(json.dumps(issues, indent=2))
PY3EOF

########################################
# 5) STATUS + REPORT
########################################
bash scripts/status.sh || true

cat > "reports/pass_x_tail_recovery_${STAMP}.txt" <<REPORT
PASS X TAIL RECOVERY REPORT
Timestamp: ${STAMP}

Recovered:
- navigation workflow table verification
- navigation workflow hub smoke
- navigation help bot smoke
- kingdom help bot smoke
- marketplace help bot smoke

Purpose:
- finish interrupted Pass X safely
- preserve stable runtime
- avoid rerunning the giant build
REPORT

echo "=== PASS X TAIL RECOVERY COMPLETE ==="
echo "Check:"
echo "  cat snapshots/pass_x_navigation_workflow_summary_latest.json"
echo "  cat snapshots/pass_x_navigation_workflow_scan_latest.json"
echo "  cat reports/pass_x_tail_recovery_${STAMP}.txt"
echo "  bash scripts/status.sh"
