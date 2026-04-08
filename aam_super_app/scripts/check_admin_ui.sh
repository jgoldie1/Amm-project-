#!/usr/bin/env bash
set -e
cd "$HOME/aam_super_app"

echo "== syntax check =="
node -c gateway/index.js

echo "== restart =="
bash scripts/restart.sh
bash scripts/wait_for_health.sh

echo "== admin html exists =="
test -f public/admin/index.html && echo "public/admin/index.html ok"

echo "== admin route =="
curl -s http://127.0.0.1:4000/admin | head -n 5

echo
echo "== done =="
