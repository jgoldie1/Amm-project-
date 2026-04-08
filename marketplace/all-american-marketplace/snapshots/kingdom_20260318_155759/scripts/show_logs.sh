#!/data/data/com.termux/files/usr/bin/bash
set +e
cd "$(dirname "$0")/.."

for f in logs/*.log; do
  [ -e "$f" ] || continue
  echo "===== $f ====="
  tail -n 60 "$f"
  echo
done
