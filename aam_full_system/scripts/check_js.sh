#!/data/data/com.termux/files/usr/bin/bash
set -e
cd ~/aam_full_system

echo "=== JS SYNTAX CHECK ==="
node --check apps/dashboard.js
node --check apps/jarvis.js
echo "JavaScript syntax OK"
