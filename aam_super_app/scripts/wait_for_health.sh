#!/usr/bin/env bash
set -e
BASE="${1:-http://127.0.0.1:4000}"
TRIES="${2:-20}"

i=1
while [ "$i" -le "$TRIES" ]; do
  if curl -s "$BASE/health" >/dev/null 2>&1; then
    echo "Health check passed on try $i"
    exit 0
  fi
  sleep 1
  i=$((i+1))
done

echo "Health check failed after $TRIES tries"
exit 1
