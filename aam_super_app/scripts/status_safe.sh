#!/usr/bin/env bash
set -e
cd "$HOME/aam_super_app"

echo "== process =="
ps aux | grep "node gateway/index.js" | grep -v grep || true
echo

echo "== health =="
curl -s http://127.0.0.1:4000/health || true
echo
curl -s http://127.0.0.1:4000/health/detail || true
echo

echo "== metrics =="
curl -s http://127.0.0.1:4000/metrics -H "x-admin-token: CHANGE_ME_ADMIN_123" || true
echo

echo "== key data files =="
ls -lah data/users.json data/wallets.json data/reports.json data/transactions.json 2>/dev/null || true
echo

echo "== recent log =="
tail -n 60 logs/gateway.log 2>/dev/null || true
