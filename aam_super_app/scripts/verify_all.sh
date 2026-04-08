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

echo "== wait for app =="
bash scripts/wait_for_health.sh

echo "== security smoke =="
bash scripts/smoke_test_security.sh

echo "== full smoke =="
bash scripts/smoke_test_full_v3.sh

echo "== status =="
bash scripts/status_safe.sh

echo "== snapshot =="
bash scripts/log_snapshot.sh

echo "== complete =="
