#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/.."

bash scripts/stop_all.sh || true
sleep 2
bash scripts/start_all.sh
bash scripts/health_wait.sh
bash scripts/status.sh
