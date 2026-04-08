#!/usr/bin/env bash
set -e
cd "$HOME/aam_super_app"

echo "== syntax =="
node -c services/music/index.js
node -c gateway/index.js

echo "== restart =="
bash scripts/restart.sh
bash scripts/wait_for_health.sh

echo "== creator route =="
curl -s http://127.0.0.1:4000/creator | head -n 5
echo

echo "== creator smoke =="
bash scripts/smoke_test_creator_portal.sh

echo "== done =="
