#!/usr/bin/env bash
set -e
cd "$HOME/aam_super_app"

echo "== syntax check =="
node -c gateway/index.js
node -c services/identity/index.js
node -c services/wallet/index.js
node -c services/music/index.js
node -c services/moderation/index.js
node -c services/ads/index.js
node -c services/ai/index.js

echo "== smoke test file tail =="
tail -n 20 scripts/smoke_test_full.sh

echo "== done =="
