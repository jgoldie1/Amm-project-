#!/data/data/com.termux/files/usr/bin/bash
set -e
cd ~/aam_full_system

echo "Checking required files..."
test -f apps/dashboard.js
test -f apps/jarvis.js
test -f data/family.json
test -f data/rules.json
test -f scripts/start.sh
test -f scripts/stop.sh
test -f scripts/status.sh

echo "Checking JSON validity..."
python -m json.tool data/family.json >/dev/null
python -m json.tool data/rules.json >/dev/null

echo "Validation OK"
