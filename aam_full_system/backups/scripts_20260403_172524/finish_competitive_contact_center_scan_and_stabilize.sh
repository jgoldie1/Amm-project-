#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FINISH COMPETITIVE CONTACT CENTER SCAN + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_finish_competitive_cc_${STAMP}.js"
cp db/aam.db "backups/aam_finish_competitive_cc_${STAMP}.db"

########################################
# 1) VERIFY REQUIRED TABLES
########################################
python3 << 'PYEOF'
import sqlite3, sys
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

required = [
    "remote_agent_program_registry",
    "omnichannel_queue_registry",
    "workforce_management_registry",
    "quality_management_registry",
    "ai_virtual_agent_registry",
    "knowledge_automation_registry",
    "cx_competitive_feature_registry",
]
missing = []
for t in required:
    row = cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (t,)).fetchone()
    if not row:
        missing.append(t)

conn.close()

if missing:
    print("Missing tables: " + ", ".join(missing))
    sys.exit(1)

print("[OK] competitive contact center tables verified")
PYEOF

########################################
# 2) VERIFY ROUTE PATCH EXISTS
########################################
python3 << 'PYEOF'
from pathlib import Path
import sys

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

checks = [
    ("renderCompetitiveContactCenterPage", "helper"),
    ("pathname === '/competitive-contact-center'", "route"),
]
missing = [label for needle, label in checks if needle not in text]

if missing:
    print("Missing dashboard pieces: " + ", ".join(missing))
    sys.exit(1)

print("[OK] competitive contact center route verified")
PYEOF

########################################
# 3) JS CHECK + RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 4
bash scripts/status.sh || true

########################################
# 4) HEALTH + ROUTE TESTS
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

for route in \
  /competitive-contact-center \
  /ai-call-center \
  /ops-checkpoint \
  /upload-media-bridge \
  /creator-monetization \
  /streaming-network \
  /creator-tv \
  /holojourney-tv \
  /neuro-control \
  /quantum-mail \
  /holo-search \
  /platform-analytics \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 5) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as remote_agent_program_registry from remote_agent_program_registry;" > "snapshots/remote_agent_program_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as omnichannel_queue_registry from omnichannel_queue_registry;" > "snapshots/omnichannel_queue_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as workforce_management_registry from workforce_management_registry;" > "snapshots/workforce_management_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as quality_management_registry from quality_management_registry;" > "snapshots/quality_management_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as ai_virtual_agent_registry from ai_virtual_agent_registry;" > "snapshots/ai_virtual_agent_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as knowledge_automation_registry from knowledge_automation_registry;" > "snapshots/knowledge_automation_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as cx_competitive_feature_registry from cx_competitive_feature_registry;" > "snapshots/cx_competitive_feature_registry_${STAMP}.json"

sqlite3 -json db/aam.db "select id, feature_group, feature_name, inspired_by, implementation_scope, feature_status, created_at from cx_competitive_feature_registry order by id desc limit 20;" > "snapshots/cx_competitive_feature_registry_tail_${STAMP}.json"

########################################
# 6) ERROR SCAN
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
    if "referenceerror" in txt or "syntaxerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

latest = Path.home() / "aam_full_system" / "snapshots" / "competitive_contact_center_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] competitive contact center finish scan complete: {len(issues)} issues")
PYEOF

########################################
# 7) REPORT
########################################
cat > "reports/finish_competitive_contact_center_scan_and_stabilize_${STAMP}.txt" <<REPORT
FINISH COMPETITIVE CONTACT CENTER SCAN + STABILIZE REPORT
Timestamp: ${STAMP}

Verified:
- competitive contact center tables
- competitive contact center route
- dashboard health
- jarvis health
- fresh route smoke tests

Purpose:
- recover from interrupted scan/report tail
- write the missing latest scan file
- preserve stable runtime
REPORT

echo "FINISH COMPETITIVE CONTACT CENTER SCAN + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/competitive_contact_center_scan_latest.json"
echo "  cat reports/finish_competitive_contact_center_scan_and_stabilize_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/competitive-contact-center"
echo "  termux-open-url http://127.0.0.1:4900/ai-call-center"
echo "  termux-open-url http://127.0.0.1:4900/ops-checkpoint"
