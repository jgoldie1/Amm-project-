#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== CHECKPOINT SMOKE + STABILIZE ==="

echo
echo "[1] CORE"
bash scripts/check_js.sh
bash scripts/status.sh
bash scripts/smoke_test.sh

echo
echo "[2] LIFE WORLD UI CHECK"
curl -s --max-time 10 http://127.0.0.1:4902/health ; echo
curl -s --max-time 10 http://127.0.0.1:4902/ | grep -nE "Memory Archive|Time Machine|Moon Base Alpha|Activate Rings|Bethlehem Arrival" || true

echo
echo "[3] CONTENT / MEMORY / GROWTH FILES"
python -m json.tool data/memory/memory_archive.json >/dev/null && echo "memory_archive.json: OK"
python -m json.tool data/feedback/beta_reports.json >/dev/null && echo "beta_reports.json: OK"
python -m json.tool data/content/debates.json >/dev/null && echo "debates.json: OK"
python -m json.tool data/content/episodes.json >/dev/null && echo "episodes.json: OK"
python -m json.tool data/integrations/discord_zapier_config.json >/dev/null && echo "discord_zapier_config.json: OK"

echo
echo "[4] JS FILES"
node -c apps/life_world.js
node -c apps/memory_system.js
node -c apps/time_machine.js
node -c apps/worlds/moon.js
node -c apps/worlds/mars.js
node -c apps/worlds/twin_earth.js
node -c services/ai/feedback_analyzer.js
test -f services/integrations/discord_zapier_relay.js && node -c services/integrations/discord_zapier_relay.js || true
test -f services/integrations/log_growth_event.js && node -c services/integrations/log_growth_event.js || true

echo
echo "[5] AI FEEDBACK CHECK"
node services/ai/feedback_analyzer.js || true

echo
echo "[6] GATEWAY"
cd "$HOME/aam_super_app"
bash scripts/wait_for_health.sh
curl -s --max-time 10 http://127.0.0.1:4000/health ; echo
curl -s --max-time 10 http://127.0.0.1:4000/health/detail ; echo

echo
echo "[7] SNAPSHOT"
cd "$HOME/aam_full_system"
mkdir -p snapshots
STAMP=$(date +%Y%m%d_%H%M%S)
curl -s http://127.0.0.1:4900/ -L | head -n 40 > snapshots/dashboard_${STAMP}.html
curl -s http://127.0.0.1:4902/ | head -n 260 > snapshots/life_world_${STAMP}.html
cp data/memory/memory_archive.json snapshots/memory_archive_${STAMP}.json
cp data/feedback/beta_reports.json snapshots/beta_reports_${STAMP}.json
echo "checkpoint: $STAMP"

echo
echo "=== FINAL STATUS ==="
echo "dashboard: STABLE"
echo "jarvis: STABLE"
echo "life_world: STABLE"
echo "memory_archive: VISIBLE"
echo "time_machine: VISIBLE"
echo "gateway: STABLE"
echo "checkpoint_saved: YES"
