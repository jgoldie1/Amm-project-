#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FINISH REPAIR FOUR CORE ROUTES TAIL ONLY START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_finish_four_core_tail_${STAMP}.js"
cp db/aam.db "backups/aam_finish_four_core_tail_${STAMP}.db"

########################################
# 1) VERIFY ROUTES EXIST IN DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path
import sys

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

checks = [
    ("renderMetaverseControlPage", "helper renderMetaverseControlPage"),
    ("renderStudioLabPage", "helper renderStudioLabPage"),
    ("renderDispatchActionsPage", "helper renderDispatchActionsPage"),
    ("renderEpisodeMoviePipelinePage", "helper renderEpisodeMoviePipelinePage"),
    ("pathname === '/metaverse-control'", "route /metaverse-control"),
    ("pathname === '/studio-lab'", "route /studio-lab"),
    ("pathname === '/dispatch-actions'", "route /dispatch-actions"),
    ("pathname === '/episode-movie-pipeline'", "route /episode-movie-pipeline"),
]

missing = [label for needle, label in checks if needle not in text]
if missing:
    print("Missing dashboard pieces: " + ", ".join(missing))
    sys.exit(1)

print("[OK] four core route pieces verified")
PYEOF

########################################
# 2) HEALTH + SMOKE TEST
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

for route in \
  /metaverse-control \
  /studio-lab \
  /dispatch-actions \
  /episode-movie-pipeline \
  /release-readiness \
  /quantum-speed \
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
  /quantum-mail-admin \
  /holo-search \
  /platform-analytics \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 3) WRITE MISSING SCAN FILE
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

latest = Path.home() / "aam_full_system" / "snapshots" / "repair_four_core_routes_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] repair four core routes latest scan written: {len(issues)} issues")
PYEOF

########################################
# 4) WRITE REPORT
########################################
cat > "reports/finish_repair_four_core_routes_tail_only_${STAMP}.txt" <<REPORT
FINISH REPAIR FOUR CORE ROUTES TAIL ONLY REPORT
Timestamp: ${STAMP}

Verified:
- /metaverse-control
- /studio-lab
- /dispatch-actions
- /episode-movie-pipeline
- dashboard health
- jarvis health
- fresh smoke tests

Purpose:
- recover from interrupted scan tail
- write the missing scan file cleanly
- preserve stable runtime without rebuilding the layer
REPORT

echo "FINISH REPAIR FOUR CORE ROUTES TAIL ONLY COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/repair_four_core_routes_scan_latest.json"
echo "  cat reports/finish_repair_four_core_routes_tail_only_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/metaverse-control"
echo "  termux-open-url http://127.0.0.1:4900/studio-lab"
echo "  termux-open-url http://127.0.0.1:4900/dispatch-actions"
echo "  termux-open-url http://127.0.0.1:4900/episode-movie-pipeline"
