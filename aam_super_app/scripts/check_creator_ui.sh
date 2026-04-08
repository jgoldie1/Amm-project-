#!/usr/bin/env bash
set -e
cd "$HOME/aam_super_app"

echo "== syntax check =="
node -c gateway/index.js

echo "== restart =="
bash scripts/restart.sh
bash scripts/wait_for_health.sh

echo "== creator html exists =="
test -f public/creator/index.html && echo "public/creator/index.html ok"

echo "== creator route =="
curl -s http://127.0.0.1:4000/creator | head -n 5
echo
echo "== done =="
