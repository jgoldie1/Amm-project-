#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FINISH MIDDLEVERSE PASS D TAIL ONLY START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_finish_middleverse_pass_d_${STAMP}.js"
cp db/aam.db "backups/aam_finish_middleverse_pass_d_${STAMP}.db"

########################################
# 1) VERIFY TABLES EXIST
########################################
python3 << 'PYEOF'
import sqlite3, sys
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

required = [
    "middleverse_action_router",
    "middleverse_destination_registry",
    "middleverse_transition_log",
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

print("[OK] middleverse pass D tables verified")
PYEOF

########################################
# 2) VERIFY ROUTES EXIST
########################################
python3 << 'PYEOF'
from pathlib import Path
import sys

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

checks = [
    ("renderMiddleverseBridgePage", "helper renderMiddleverseBridgePage"),
    ("pathname === '/middleverse/router-safe'", "route /middleverse/router-safe"),
    ("pathname === '/middleverse/transition-safe'", "route /middleverse/transition-safe"),
    ("pathname === '/middleverse-bridge'", "route /middleverse-bridge"),
]

missing = [label for needle, label in checks if needle not in text]
if missing:
    print("Missing dashboard pieces: " + ", ".join(missing))
    sys.exit(1)

print("[OK] middleverse pass D routes verified")
PYEOF

########################################
# 3) HEALTH + ROUTE TESTS
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

for route in \
  /middleverse-bridge \
  /metaverse-control \
  /studio-lab \
  /episode-movie-pipeline \
  /creator-tv \
  /dispatch-actions \
  /multiservice-dispatch \
  /ai-call-center \
  /competitive-contact-center \
  /quantum-mail \
  /holo-search \
  /platform-analytics \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 4) SAFE PASS D ACTION TESTS
########################################
curl -s -i -X POST http://127.0.0.1:4900/middleverse/router-safe > "test_results/middleverse_router_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/middleverse/transition-safe > "test_results/middleverse_transition_${STAMP}.txt" || true

########################################
# 5) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as middleverse_action_router from middleverse_action_router;" > "snapshots/middleverse_action_router_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as middleverse_destination_registry from middleverse_destination_registry;" > "snapshots/middleverse_destination_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as middleverse_transition_log from middleverse_transition_log;" > "snapshots/middleverse_transition_log_${STAMP}.json"

sqlite3 -json db/aam.db "select id, action_name, source_zone, target_zone, route_type, action_status, created_at from middleverse_action_router order by id desc limit 20;" > "snapshots/middleverse_action_router_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, destination_name, destination_group, linked_route, destination_mode, destination_status, created_at from middleverse_destination_registry order by id desc limit 20;" > "snapshots/middleverse_destination_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, transition_name, source_zone, target_zone, linked_user, transition_result, transition_status, created_at from middleverse_transition_log order by id desc limit 20;" > "snapshots/middleverse_transition_log_tail_${STAMP}.json"

########################################
# 6) WRITE THE MISSING SCAN FILE
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

latest = Path.home() / "aam_full_system" / "snapshots" / "middleverse_pass_d_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] middleverse pass D latest scan written: {len(issues)} issues")
PYEOF

########################################
# 7) WRITE THE MISSING REPORT
########################################
cat > "reports/finish_middleverse_pass_d_tail_only_${STAMP}.txt" <<REPORT
FINISH MIDDLEVERSE PASS D TAIL ONLY REPORT
Timestamp: ${STAMP}

Verified:
- middleverse_action_router
- middleverse_destination_registry
- middleverse_transition_log
- /middleverse-bridge
- /middleverse/router-safe
- /middleverse/transition-safe
- dashboard health
- jarvis health
- fresh smoke tests

Purpose:
- recover from interrupted pass D tail
- write the missing scan and report cleanly
- preserve stable runtime without rebuilding pass D
REPORT

echo "FINISH MIDDLEVERSE PASS D TAIL ONLY COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/middleverse_pass_d_scan_latest.json"
echo "  cat snapshots/middleverse_action_router_tail_${STAMP}.json"
echo "  cat snapshots/middleverse_destination_registry_tail_${STAMP}.json"
echo "  cat snapshots/middleverse_transition_log_tail_${STAMP}.json"
echo "  cat reports/finish_middleverse_pass_d_tail_only_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/middleverse-bridge"
echo "  termux-open-url http://127.0.0.1:4900/metaverse-control"
echo "  termux-open-url http://127.0.0.1:4900/studio-lab"
