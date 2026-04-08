#!/usr/bin/env bash
set -e
cd "$HOME/aam_super_app"
echo "== process =="
ps aux | grep "node gateway/index.js" | grep -v grep || true
echo
echo "== health =="
curl -s http://127.0.0.1:4000/health || true
echo
echo "== data files =="
ls -lah data || true
echo
echo "== logs =="
ls -lah logs || true
