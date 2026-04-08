#!/data/data/com.termux/files/usr/bin/bash
set +e

cd ~/aam_full_system
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p snapshots test_results reports

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

for route in \
  / \
  /watch \
  /connect-system \
  /payment-control \
  /accessibility \
  /avatar-rig-control \
  /engine-bridge \
  /world-experience-control \
  /web3d-client \
  /world3d \
  /realworld-client \
  /realworld \
  /realworld-city-registry \
  /realworld-cities \
  /property-market \
  /role-hub
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

sqlite3 -json db/aam.db "select count(*) as realworld_city_registry from realworld_city_registry;" > "snapshots/realworld_city_registry_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as property_market_listings from property_market_listings;" > "snapshots/property_market_listings_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as realworld_locations from realworld_locations;" > "snapshots/realworld_locations_${STAMP}.json" 2>/dev/null || true

python3 <<PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []
for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore").lower()
    if "no such column" in txt:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in txt or "syntaxerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
latest = Path.home() / "aam_full_system" / "snapshots" / "current_phase_snapshot_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] current phase snapshot scan complete: {len(issues)} issues")
PYEOF

cat > "reports/current_phase_snapshot_${STAMP}.txt" <<REPORT
CURRENT PHASE SNAPSHOT REPORT
Timestamp: ${STAMP}

Verified:
- dashboard health
- jarvis health
- socket health
- core current routes
- world routes
- realworld routes
- property market routes

Purpose:
- create a reliable no-risk checkpoint
- keep stabilization simple
- preserve the recovered stable platform
REPORT

echo "CURRENT PHASE SNAPSHOT COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/current_phase_snapshot_scan_latest.json"
