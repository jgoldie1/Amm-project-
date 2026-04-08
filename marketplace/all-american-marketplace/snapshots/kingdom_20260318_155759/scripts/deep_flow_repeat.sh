#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/.."

COUNT="${1:-2}"
i=1
while [ "$i" -le "$COUNT" ]; do
  echo "========== RUN $i =========="
  bash ./deep_test_and_stabilize.sh
  echo
  i=$((i+1))
done
