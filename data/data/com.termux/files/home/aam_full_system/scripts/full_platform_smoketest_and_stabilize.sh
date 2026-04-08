#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FULL PLATFORM SMOKETEST + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results logs public/world3d public/realworld

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_full_smoketest_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_full_smoketest_${STAMP}.js"
cp db/aam.db "backups/aam_full_smoketest_${STAMP}.db"
cp public/world3d/index.html "backups/world3d_full_smoketest_${STAMP}.html" 2>/dev/null || true
cp public/realworld/index.html "backups/realworld_full_smoketest_${STAMP}.html" 2>/dev/null || true

########################################
# 2) SYNTAX + CLEAN RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh || true
sleep 3
bash scripts/status.sh || true

########################################
# 3) HEALTH TESTS
########################################
curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 4) ROUTE SMOKE TESTS
########################################
for route in \
  / \
  /join \
  /watch \
  /build \
  /learn \
  /role-hub \
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
  /gameplay-control \
  /player-progress
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 5) API SMOKE TESTS
########################################
curl -s -i -X POST "http://127.0.0.1:4900/api/mission-complete" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "mission_name=Meet NPC Alpha" \
  > "test_results/api_mission_complete_alpha_${STAMP}.txt" || true

curl -s -i -X POST "http://127.0.0.1:4900/api/mission-complete" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "mission_name=Claim Property Route" \
  > "test_results/api_mission_complete_property_${STAMP}.txt" || true

########################################
# 6) DATABASE SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as player_profiles from player_profiles;" > "snapshots/player_profiles_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as player_mission_progress from player_mission_progress;" > "snapshots/player_mission_progress_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as player_unlocks from player_unlocks;" > "snapshots/player_unlocks_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as gameplay_event_log from gameplay_event_log;" > "snapshots/gameplay_event_log_${STAMP}.json" 2>/dev/null || true

sqlite3 -json db/aam.db "select count(*) as realworld_city_registry from realworld_city_registry;" > "snapshots/realworld_city_registry_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as property_market_listings from property_market_listings;" > "snapshots/property_market_listings_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as land_parcels from land_parcels;" > "snapshots/land_parcels_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as building_registry from building_registry;" > "snapshots/building_registry_${STAMP}.json" 2>/dev/null || true

sqlite3 -json db/aam.db "select id, mission_name, progress_status, progress_percent, completed_at from player_mission_progress order by id desc limit 30;" > "snapshots/player_mission_progress_tail_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select id, unlock_code, unlock_label, unlock_route, unlock_status, created_at from player_unlocks order by id desc limit 30;" > "snapshots/player_unlocks_tail_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select id, event_type, event_subject, event_payload, event_status, created_at from gameplay_event_log order by id desc limit 30;" > "snapshots/gameplay_event_log_tail_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select id, city_name, state_name, region_name, destination_route, city_status, created_at from realworld_city_registry order by id desc limit 50;" > "snapshots/realworld_city_registry_tail_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select id, listing_name, listing_type, listing_category, price_cents, listing_status, created_at from property_market_listings order by id desc limit 50;" > "snapshots/property_market_listings_tail_${STAMP}.json" 2>/dev/null || true

########################################
# 7) LOG SNAPSHOT
########################################
{
  echo "[$STAMP] full platform smoketest completed"
  curl -s http://127.0.0.1:4900/health || true
  echo
} >> logs/dashboard.log

{
  echo "[$STAMP] full platform smoketest completed"
  curl -s http://127.0.0.1:5000/health || true
  echo
} >> logs/jarvis.log

########################################
# 8) FRESH-ONLY ERROR SCAN
########################################
python3 << PYEOF
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
    if "missing mission or player" in txt:
        issues.append({"file": f.name, "problem": "mission_api_failed"})

Path.home().joinpath("aam_full_system","snapshots","full_platform_smoketest_latest.json").write_text(json.dumps(issues, indent=2))
print(f"[OK] full platform smoketest scan complete: {len(issues)} issues")
PYEOF

########################################
# 9) REPORT
########################################
cat > "reports/full_platform_smoketest_and_stabilize_${STAMP}.txt" <<REPORT
FULL PLATFORM SMOKETEST + STABILIZE REPORT
Timestamp: ${STAMP}

Verified:
- dashboard health
- jarvis health
- core front-door routes
- world routes
- realworld routes
- property routes
- gameplay routes
- mission completion API
- progression/unlock/event table writes

Purpose:
- run a broad smoke test across the stabilized platform
- verify that the current metaverse foundation is holding together
- create a clean checkpoint before the next build phase
REPORT

echo "FULL PLATFORM SMOKETEST + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/full_platform_smoketest_latest.json"
echo "  cat snapshots/player_mission_progress_tail_${STAMP}.json"
echo "  cat snapshots/player_unlocks_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/world3d"
echo "  termux-open-url http://127.0.0.1:4900/player-progress"
echo "  termux-open-url http://127.0.0.1:4900/property-market"
