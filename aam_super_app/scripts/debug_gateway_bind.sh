#!/usr/bin/env bash
set -e

cd "$HOME/aam_super_app"

echo "=== SHOW GATEWAY FILE ==="
sed -n '1,220p' gateway/index.js

echo
echo "=== PACKAGE JSON ==="
cat package.json

echo
echo "=== RUN GATEWAY IN FOREGROUND ==="
node gateway/index.js
