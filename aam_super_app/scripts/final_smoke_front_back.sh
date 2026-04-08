#!/usr/bin/env bash
set -e
cd "$HOME/aam_super_app"

echo "== home =="
curl -s http://127.0.0.1:4000/ | head -n 5
echo

echo "== creator =="
curl -s http://127.0.0.1:4000/creator | head -n 5
echo

echo "== admin =="
curl -s http://127.0.0.1:4000/admin | head -n 5
echo

echo "== intelligence =="
bash scripts/smoke_test_intelligence.sh

echo "== done =="
