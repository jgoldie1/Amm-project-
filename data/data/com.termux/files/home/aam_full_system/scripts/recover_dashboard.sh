#!/data/data/com.termux/files/usr/bin/bash
set -e
cd ~/aam_full_system

LATEST="$(ls -1t backups/dashboard_working_*.js 2>/dev/null | head -n 1)"
if [ -z "$LATEST" ]; then
  echo "No dashboard backup found."
  exit 1
fi

cp "$LATEST" apps/dashboard.js
echo "Recovered dashboard from: $LATEST"
bash scripts/safe_restart.sh
