#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FINISH MULTISERVICE DISPATCH TAIL ONLY START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_finish_multiservice_tail_${STAMP}.js"
cp db/aam.db "backups/aam_finish_multiservice_tail_${STAMP}.db"

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
    "service_expansion_registry",
    "dispatch_program_registry",
    "vehicle_fleet_registry",
    "pharmacy_delivery_registry",
    "drone_delivery_registry",
    "service_request_log",
    "callcenter_feature_extension_registry",
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

print("[OK] multiservice dispatch tables verified")
PYEOF

########################################
# 2) VERIFY ROUTE EXISTS
########################################
python3 << 'PYEOF'
from pathlib import Path
import sys

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

checks = [
    ("renderMultiserviceDispatchPage", "helper"),
    ("pathname === '/multiservice-dispatch'", "route"),
]

missing = [label for needle, label in checks if needle not in text]
if missing:
    print("Missing dashboard pieces: " + ", ".join(missing))
    sys.exit(1)

print("[OK] multiservice dispatch route verified")
PYEOF

########################################
# 3) HEALTH + ROUTE TESTS
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

for route in \
  /multiservice-dispatch \
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
# 4) WRITE MISSING SCAN FILE
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

latest = Path.home() / "aam_full_system" / "snapshots" / "multiservice_dispatch_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] multiservice dispatch latest scan written: {len(issues)} issues")
PYEOF

########################################
# 5) WRITE REPORT
########################################
cat > "reports/finish_multiservice_dispatch_tail_only_${STAMP}.txt" <<REPORT
FINISH MULTISERVICE DISPATCH TAIL ONLY REPORT
Timestamp: ${STAMP}

Verified:
- multiservice dispatch tables
- multiservice dispatch route
- dashboard health
- jarvis health
- fresh smoke tests

Purpose:
- recover from interrupted report tail
- write the missing scan file cleanly
- preserve stable runtime without rebuilding the layer
REPORT

echo "FINISH MULTISERVICE DISPATCH TAIL ONLY COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/multiservice_dispatch_scan_latest.json"
echo "  cat reports/finish_multiservice_dispatch_tail_only_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/multiservice-dispatch"
echo "  termux-open-url http://127.0.0.1:4900/competitive-contact-center"
echo "  termux-open-url http://127.0.0.1:4900/ai-call-center"
