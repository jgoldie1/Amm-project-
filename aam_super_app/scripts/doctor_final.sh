#!/usr/bin/env bash
set -e
cd "$HOME/aam_super_app"

echo "== syntax =="
node -c shared/auth.js
node -c services/auth/index.js
node -c services/identity/index.js
node -c services/wallet/index.js
node -c services/music/index.js
node -c services/moderation/index.js
node -c services/ads/index.js
node -c services/ai/index.js
node -c gateway/index.js

echo "== restart =="
bash scripts/restart.sh
bash scripts/wait_for_health.sh

echo "== health =="
curl -s http://127.0.0.1:4000/health ; echo
curl -s http://127.0.0.1:4000/health/detail ; echo

echo "== metrics =="
curl -s http://127.0.0.1:4000/metrics -H "x-admin-token: CHANGE_ME_ADMIN_123" ; echo

echo "== security =="
bash scripts/smoke_test_security.sh

echo "== done =="
