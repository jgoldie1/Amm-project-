#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"
mkdir -p snapshots/final

STAMP=$(date +%Y%m%d_%H%M%S)

echo "=== FINAL FREEZE CHECKPOINT ==="

bash scripts/check_js.sh
bash scripts/status.sh
bash scripts/smoke_test.sh

curl -s http://127.0.0.1:4900/ -L > snapshots/final/dashboard_${STAMP}.html
curl -s http://127.0.0.1:4902/ > snapshots/final/life_world_${STAMP}.html
cp data/memory/memory_archive.json snapshots/final/memory_archive_${STAMP}.json
cp data/feedback/beta_reports.json snapshots/final/beta_reports_${STAMP}.json

cd "$HOME/aam_super_app"
curl -s http://127.0.0.1:4000/health > snapshots_gateway_health_${STAMP}.json
curl -s http://127.0.0.1:4000/health/detail > snapshots_gateway_health_detail_${STAMP}.json

echo
echo "FINAL FREEZE COMPLETE"
echo "checkpoint: $STAMP"
