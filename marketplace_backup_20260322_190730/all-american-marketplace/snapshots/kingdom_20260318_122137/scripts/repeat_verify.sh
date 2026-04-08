#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/.."

COUNT="${1:-3}"
i=1
while [ "$i" -le "$COUNT" ]; do
  echo "========== VERIFY RUN $i =========="
  bash scripts/status.sh
  sleep 2
  i=$((i+1))
done
