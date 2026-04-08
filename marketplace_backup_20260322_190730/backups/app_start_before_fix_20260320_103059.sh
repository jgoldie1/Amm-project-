#!/data/data/com.termux/files/usr/bin/bash
set -u

cd ~/marketplace || exit 1
mkdir -p logs config snapshots

echo "=== STOP OLD APP PROCESSES ==="
pkill -f "flask --app app run" 2>/dev/null || true
pkill -f "python.*app.py" 2>/dev/null || true
pkill -f "python -u app.py" 2>/dev/null || true
sleep 3

echo
echo "=== COMPILE CHECK ==="
python -m py_compile app.py || exit 1
echo "COMPILE_OK"

pick_port() {
  for p in 8080 8081 8082 8083 8090; do
    if ! ss -tulpen 2>/dev/null | grep -q ":$p "; then
      echo "$p"
      return 0
    fi
  done
  return 1
}

PORT="$(pick_port)"
if [ -z "${PORT:-}" ]; then
  echo "NO_FREE_PORT_FOUND"
  exit 1
fi

echo
echo "=== START APP ON PORT $PORT ==="
nohup env PYTHONUNBUFFERED=1 flask --app app run --host 0.0.0.0 --port "$PORT" > logs/app.log 2>&1 &
sleep 6

if ! ss -tulpen 2>/dev/null | grep -q ":$PORT "; then
  echo "FAILED_TO_BIND_PORT_$PORT"
  echo
  echo "=== WHO IS USING PORTS ==="
  ss -tulpen 2>/dev/null | grep -E ':8080 |:8081 |:8082 |:8083 |:8090 ' || true
  echo
  echo "=== LAST LOG ==="
  tail -n 80 logs/app.log 2>/dev/null || true
  exit 1
fi

echo "$PORT" > config/active_port.txt
BASE="http://127.0.0.1:$PORT"

echo
echo "=== ROUTE CHECKS ==="
for u in \
  /app-home \
  /operations-center-v2 \
  /stabilize-hub-v3 \
  /session-login-v3 \
  /finance-operations-center-v3 \
  /files-operations-center-v3 \
  /workflows-center-v3
do
  printf "%-40s" "$u"
  curl -I -s "$BASE$u" | head -n 1
done

echo
echo "APP_LIVE_AT=$BASE"
