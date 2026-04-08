#!/usr/bin/env bash
set -e
cd "$HOME/aam_super_app"

echo "== backup =="
bash scripts/backup_all.sh || true

echo "== syntax =="
node -c shared/auth.js
node -c shared/audit.js
node -c services/intelligence/index.js
node -c gateway/index.js

echo "== restart =="
bash scripts/restart.sh
bash scripts/wait_for_health.sh

echo "== health =="
curl -s http://127.0.0.1:4000/health ; echo
curl -s http://127.0.0.1:4000/health/detail ; echo

echo "== routes =="
curl -s http://127.0.0.1:4000/ | head -n 3
echo
curl -s http://127.0.0.1:4000/creator | head -n 3
echo
curl -s http://127.0.0.1:4000/admin | head -n 3
echo

echo "== intelligence smoke =="
bash scripts/smoke_test_intelligence.sh

echo "== security smoke v2 =="
bash scripts/smoke_test_security_v2.sh

echo "== metrics =="
curl -s http://127.0.0.1:4000/metrics -H "x-admin-token: AAM_ADMIN_2026_PRIVATE_LONG_RANDOM_VALUE" ; echo

echo "== audit tail =="
curl -s http://127.0.0.1:4000/admin/audit-tail -H "x-admin-token: AAM_ADMIN_2026_PRIVATE_LONG_RANDOM_VALUE" ; echo

echo "== done =="
