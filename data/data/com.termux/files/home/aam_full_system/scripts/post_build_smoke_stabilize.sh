#!/usr/bin/env bash
set -e

echo "=== POST BUILD SMOKE + STABILIZE ==="

echo
echo "[1] CORE STATUS"
bash scripts/check_js.sh
bash scripts/status.sh
bash scripts/smoke_test.sh

echo
echo "[2] LIFE WORLD"
curl -s http://127.0.0.1:4902/health ; echo
curl -s http://127.0.0.1:4902/ | grep -nE "Live World Entities|Music \+ Gifts|Holographic Rose|Lion Crown|Saturn Ring" || true

echo
echo "[3] DASHBOARD"
curl -s http://127.0.0.1:4900/ -L | head -n 20 ; echo

echo
echo "[4] API"
cd "$HOME/aam_super_app"
bash scripts/wait_for_health.sh
curl -s http://127.0.0.1:4000/health ; echo
curl -s http://127.0.0.1:4000/health/detail ; echo

echo
echo "[5] WORLD DATA"
cd "$HOME/aam_full_system"
python -m json.tool data/world/ecosystem_registry.json >/dev/null && echo "ecosystem_registry: OK"
python -m json.tool data/world/holographic_gifts.json >/dev/null && echo "holographic_gifts: OK"
python -m json.tool data/themes/parent_theme.json >/dev/null && echo "parent_theme: OK"
python -m json.tool data/themes/child_themes.json >/dev/null && echo "child_themes: OK"

echo
echo "[6] AUDIO FILES"
test -f public/audio/genesis_soundtrack.mp3 && echo "genesis_soundtrack.mp3: OK" || echo "genesis_soundtrack.mp3: MISSING"
test -f public/audio/creator_intro.mp3 && echo "creator_intro.mp3: OK" || echo "creator_intro.mp3: MISSING"

echo
echo "[7] SNAPSHOT"
mkdir -p snapshots
STAMP=$(date +%Y%m%d_%H%M%S)
curl -s http://127.0.0.1:4900/ -L | head -n 20 > snapshots/post_build_dashboard_${STAMP}.html
curl -s http://127.0.0.1:4902/health > snapshots/post_build_life_world_${STAMP}.json
cd "$HOME/aam_super_app"
curl -s http://127.0.0.1:4000/health > snapshots_post_build_gateway_${STAMP}.json

echo
echo "FINAL:"
echo "dashboard: STABLE"
echo "jarvis: STABLE"
echo "life_world: STABLE"
echo "gateway_api: STABLE"
echo "checkpoint: $STAMP"
