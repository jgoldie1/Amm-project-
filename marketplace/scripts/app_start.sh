#!/data/data/com.termux/files/usr/bin/bash
set -u

cd ~/marketplace || exit 1
mkdir -p logs config

echo "=== STOP OLD APP PROCESSES ==="
pkill -f "flask --app app run" 2>/dev/null || true
pkill -f "python.*app.py" 2>/dev/null || true
pkill -f "python -u app.py" 2>/dev/null || true
sleep 3

echo
echo "=== COMPILE CHECK ==="
python -m py_compile app.py || exit 1
echo "COMPILE_OK"

PORT=8080
echo "$PORT" > config/active_port.txt

echo
echo "=== START APP ON PORT $PORT ==="
nohup env PYTHONUNBUFFERED=1 flask --app app run --host 0.0.0.0 --port "$PORT" > logs/app.log 2>&1 &
sleep 6

BASE="http://127.0.0.1:$PORT"

if curl -I -s "$BASE/app-home" | head -n 1 | grep -q "200\|302"; then
  echo "APP_LIVE_AT=$BASE"
else
  echo "APP_START_CHECK_FAILED"
  echo
  echo "=== LAST LOG ==="
  tail -n 80 logs/app.log 2>/dev/null || true
  exit 1
fi

echo
echo "=== ROUTE CHECKS ==="
for u in \
  /app-home \
  /heirs-app \
  /full-app-showcase \
  /holoverse-lobby-v2 \
  /holo-commerce-home
do
  printf "%-28s" "$u"
  curl -I -s "$BASE$u" | head -n 1
done
