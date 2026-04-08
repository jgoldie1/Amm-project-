#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
mkdir -p logs snapshots
PORT="${1:-8080}"

pkill -f "python.*app.py" 2>/dev/null || true
sleep 2

if ss -tulpen 2>/dev/null | grep -q ":$PORT "; then
  echo "Port $PORT already in use. Trying next port..."
  PORT=$((PORT+1))
fi

nohup env PYTHONUNBUFFERED=1 python -u app.py > logs/app.log 2>&1 &
sleep 5

if ss -tulpen 2>/dev/null | grep -q ':8080 '; then
  echo "Marketplace started on http://127.0.0.1:8080"
  exit 0
fi

if ! ss -tulpen 2>/dev/null | grep -q ':8080 '; then
  echo "Default start did not bind cleanly on 8080."
  pkill -f "python.*app.py" 2>/dev/null || true
  nohup env PYTHONUNBUFFERED=1 flask --app app run --host 0.0.0.0 --port "$PORT" > logs/app.log 2>&1 &
  sleep 5
fi

if ss -tulpen 2>/dev/null | grep -q ":$PORT "; then
  echo "Marketplace started on http://127.0.0.1:$PORT"
else
  echo "Marketplace failed to start"
  tail -n 80 logs/app.log 2>/dev/null || true
  exit 1
fi
