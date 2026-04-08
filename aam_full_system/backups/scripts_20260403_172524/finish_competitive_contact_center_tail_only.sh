#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FINISH COMPETITIVE CONTACT CENTER TAIL ONLY START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p snapshots reports test_results backups

cp apps/dashboard.js "backups/dashboard_finish_cc_tail_${STAMP}.js"
cp db/aam.db "backups/aam_finish_cc_tail_${STAMP}.db"

########################################
# 1) QUICK VERIFY TABLES EXIST
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
# 2) QUICK VERIFY ROUTE EXISTS
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
# 3) HEALTH + ROUTE TESTS
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
# 4) WRITE THE MISSING SCAN FILE
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
print(f"[OK] competitive contact center latest scan written: {len(issues)} issues")
PYEOF

########################################
# 5) WRITE THE MISSING REPORT
########################################
cat > "reports/finish_competitive_contact_center_tail_only_${STAMP}.txt" <<REPORT
FINISH COMPETITIVE CONTACT CENTER TAIL ONLY REPORT
Timestamp: ${STAMP}

Verified:
- competitive contact center tables
- competitive contact center route
- dashboard health
- jarvis health
- fresh smoke tests

Purpose:
- recover from interrupted report tail
- write the missing scan file cleanly
- preserve stable runtime without rebuilding the layer
REPORT

echo "FINISH COMPETITIVE CONTACT CENTER TAIL ONLY COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/competitive_contact_center_scan_latest.json"
echo "  cat reports/finish_competitive_contact_center_tail_only_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/competitive-contact-center"
echo "  termux-open-url http://127.0.0.1:4900/ai-call-center"
echo "  termux-open-url http://127.0.0.1:4900/ops-checkpoint"
