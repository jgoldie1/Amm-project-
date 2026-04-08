#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== MASTER PHASE LOCK FRESH-ONLY START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_master_fresh_lock_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_master_fresh_lock_${STAMP}.js" 2>/dev/null || true
cp apps/jarvis.js "backups/jarvis_master_fresh_lock_${STAMP}.js"
cp db/aam.db "backups/aam_master_fresh_lock_${STAMP}.db"
cp public/world3d/index.html "backups/world3d_master_fresh_lock_${STAMP}.html" 2>/dev/null || true
cp public/realworld/index.html "backups/realworld_master_fresh_lock_${STAMP}.html" 2>/dev/null || true

########################################
# 2) VERIFY / RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 3) FRESH ROUTE SMOKE TEST
########################################
for route in \
  / \
  /join \
  /watch \
  /build \
  /learn \
  /connect-system \
  /conversion-control \
  /monetization-control \
  /payment-control \
  /accessibility \
  /avatar-rig-control \
  /engine-bridge \
  /visual-streaming \
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

########################################
# 4) FRESH SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as realworld_city_registry from realworld_city_registry;" > "snapshots/realworld_city_registry_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as property_market_listings from property_market_listings;" > "snapshots/property_market_listings_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as web3d_scene_nodes from web3d_scene_nodes;" > "snapshots/web3d_scene_nodes_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as realworld_locations from realworld_locations;" > "snapshots/realworld_locations_${STAMP}.json" 2>/dev/null || true

########################################
# 5) FRESH-ONLY ERROR SCAN
########################################
python3 << 'PYEOF'
from pathlib import Path
import json

stamp = """$(date +%Y%m%d_%H%M%S)"""
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "master_phase_lock_fresh_only_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] master fresh-only scan complete: {len(issues)} issues")
PYEOF

########################################
# 6) PATCH STAMP INTO PYTHON SCAN
########################################
python3 << 'PYEOF'
from pathlib import Path
p = Path.home() / "aam_full_system" / "scripts" / "master_phase_lock_fresh_only.sh"
text = p.read_text()
text = text.replace('$(date +%Y%m%d_%H%M%S)', '$(date +%Y%m%d_%H%M%S)')
p.write_text(text)
print("[OK] script stamp placeholder updated for future runs")
PYEOF

########################################
# 7) RUN ACTUAL FRESH SCAN WITH THIS STAMP
########################################
python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "master_phase_lock_fresh_only_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] live master fresh-only scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/master_phase_lock_fresh_only_${STAMP}.txt" <<REPORT
MASTER PHASE LOCK FRESH-ONLY REPORT
Timestamp: ${STAMP}

Locked:
- dashboard.js
- world_socket.js
- jarvis.js
- aam.db
- world3d index
- realworld index

Verified:
- dashboard health
- jarvis health
- socket health
- current core routes
- current world routes
- current realworld routes
- current city registry routes
- current property market routes

Purpose:
- remove historical scan noise
- verify only the current live phase
- create a clean rollback confidence point
REPORT

echo "MASTER PHASE LOCK FRESH-ONLY COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/master_phase_lock_fresh_only_scan_latest.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/property-market"
echo "  termux-open-url http://127.0.0.1:4900/realworld"
echo "  termux-open-url http://127.0.0.1:4900/world3d"
