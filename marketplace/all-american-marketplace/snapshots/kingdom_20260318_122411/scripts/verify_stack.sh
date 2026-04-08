#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/.."

echo "=== STATUS ==="
bash scripts/status.sh
echo "=== SMOKE TEST ==="
bash scripts/smoke_test.sh
echo "=== LOG TAILS ==="
bash scripts/show_logs.sh
