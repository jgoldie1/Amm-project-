#!/usr/bin/env bash
set -e
cd "$HOME/aam_super_app"

echo "== syntax check =="
node -c shared/db.js
node -c services/auth/index.js
node -c gateway/index.js || true

echo "== db file check =="
ls -lah data || true

echo "== done =="
