#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system

mkdir -p snapshots

STAMP=$(date +%Y%m%d_%H%M%S)

cp apps/dashboard.js "snapshots/dashboard_${STAMP}.js"
cp apps/life_world.js "snapshots/life_world_${STAMP}.js"
cp db/aam.db "snapshots/aam_${STAMP}.db"

echo "Snapshot created:"
ls -1 snapshots | tail -n 5

echo
echo "=== FINAL STATUS ==="
bash scripts/status.sh
bash scripts/smoke_test.sh
curl -s http://127.0.0.1:4902/health || echo "life world down"
