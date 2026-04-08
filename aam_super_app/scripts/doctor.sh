#!/usr/bin/env bash
set -e
cd "$HOME/aam_super_app"
echo "[1] node version"
node -v
echo "[2] npm version"
npm -v
echo "[3] package check"
test -f package.json && echo "package.json ok"
echo "[4] module check"
node -e "require('express'); require('body-parser'); console.log('modules ok')"
echo "[5] port check"
if command -v ss >/dev/null 2>&1; then
  ss -ltnp | grep :4000 || true
fi
echo "[6] write test"
mkdir -p data logs
echo '{"ok":true}' > data/_write_test.json
cat data/_write_test.json
echo "[7] done"
