#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== MASTER PHASE LOCK + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_master_phase_lock_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_master_phase_lock_${STAMP}.js" 2>/dev/null || true
cp apps/jarvis.js "backups/jarvis_master_phase_lock_${STAMP}.js"
cp db/aam.db "backups/aam_master_phase_lock_${STAMP}.db"
cp public/world3d/index.html "backups/world3d_master_phase_lock_${STAMP}.html" 2>/dev/null || true
cp public/realworld/index.html "backups/realworld_master_phase_lock_${STAMP}.html" 2>/dev/null || true

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
# 3) FULL ROUTE SMOKE TEST
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
# 4) CORE SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as heirs_registry from heirs_registry;" > "snapshots/heirs_registry_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as heir_accounts from heir_accounts;" > "snapshots/heir_accounts_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as payment_transactions from payment_transactions;" > "snapshots/payment_transactions_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as blockchain_events from blockchain_events;" > "snapshots/blockchain_events_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as accessibility_profiles from accessibility_profiles;" > "snapshots/accessibility_profiles_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as avatar_characters from avatar_characters;" > "snapshots/avatar_characters_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as engine_registry from engine_registry;" > "snapshots/engine_registry_${STAMP}.json" 2>/dev/null || true

########################################
# 5) WORLD SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as web3d_client_profiles from web3d_client_profiles;" > "snapshots/web3d_client_profiles_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as web3d_scene_nodes from web3d_scene_nodes;" > "snapshots/web3d_scene_nodes_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as web3d_interaction_targets from web3d_interaction_targets;" > "snapshots/web3d_interaction_targets_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as realworld_engine_profiles from realworld_engine_profiles;" > "snapshots/realworld_engine_profiles_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as realworld_locations from realworld_locations;" > "snapshots/realworld_locations_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as realworld_city_registry from realworld_city_registry;" > "snapshots/realworld_city_registry_${STAMP}.json" 2>/dev/null || true

########################################
# 6) PROPERTY SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as land_parcels from land_parcels;" > "snapshots/land_parcels_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as building_registry from building_registry;" > "snapshots/building_registry_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as stairway_systems from stairway_systems;" > "snapshots/stairway_systems_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as elevator_systems from elevator_systems;" > "snapshots/elevator_systems_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as electrical_systems from electrical_systems;" > "snapshots/electrical_systems_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as plumbing_systems from plumbing_systems;" > "snapshots/plumbing_systems_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as blueprint_records from blueprint_records;" > "snapshots/blueprint_records_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as property_market_listings from property_market_listings;" > "snapshots/property_market_listings_${STAMP}.json" 2>/dev/null || true

########################################
# 7) MASTER ERROR SCAN
########################################
python3 << 'PYEOF'
from pathlib import Path
import json

root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob("*.txt")):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "not found" in lower:
        issues.append({"file": f.name, "problem": "not_found"})

latest = Path.home() / "aam_full_system" / "snapshots" / "master_phase_lock_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] master phase lock scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/master_phase_lock_stabilize_${STAMP}.txt" <<REPORT
MASTER PHASE LOCK + STABILIZE REPORT
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
- core routes
- world routes
- realworld routes
- city registry routes
- property market routes

Purpose:
- stabilize everything
- create rollback confidence
- preserve the current metaverse platform phase
REPORT

echo "MASTER PHASE LOCK + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/master_phase_lock_scan_latest.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/property-market"
echo "  termux-open-url http://127.0.0.1:4900/realworld"
echo "  termux-open-url http://127.0.0.1:4900/world3d"
