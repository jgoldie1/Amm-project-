#!/data/data/com.termux/files/usr/bin/bash
set -u

cd ~/marketplace || exit 1
STAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p logs snapshots config backups

echo "=== STOP OLD APP ==="
pkill -f "python.*app.py" 2>/dev/null || true
sleep 2

echo
echo "=== COMPILE CURRENT APP ==="
if python -m py_compile app.py; then
  echo "CURRENT_APP_COMPILE_OK"
else
  echo "CURRENT_APP_COMPILE_FAILED"
  echo
  echo "=== FIND NEWEST BACKUP ==="
  LATEST_BACKUP="$(find backups -maxdepth 1 -type f \( -name 'app_before_*' -o -name 'app_working_seen_*' -o -name 'app_manual_backup_*' \) | sort | tail -n 1)"
  echo "LATEST_BACKUP=$LATEST_BACKUP"
  if [ -z "$LATEST_BACKUP" ]; then
    echo "No backup found. Cannot recover automatically."
    exit 1
  fi
  cp "$LATEST_BACKUP" app.py
  echo "Restored backup: $LATEST_BACKUP"
  python -m py_compile app.py || exit 1
fi

PORT=8080
if ss -tulpen 2>/dev/null | grep -q ':8080 '; then
  PORT=8081
fi
if ss -tulpen 2>/dev/null | grep -q ':8081 '; then
  PORT=8082
fi

echo
echo "=== START APP ON PORT $PORT ==="
nohup env PYTHONUNBUFFERED=1 flask --app app run --host 0.0.0.0 --port "$PORT" > logs/app.log 2>&1 &
sleep 5

if ! ss -tulpen 2>/dev/null | grep -q ":$PORT "; then
  echo "APP_FAILED_TO_BIND_PORT_$PORT"
  tail -n 80 logs/app.log 2>/dev/null || true
  exit 1
fi

echo "$PORT" > config/active_port.txt
BASE="http://127.0.0.1:$PORT"

echo
echo "=== VERIFY CORE ROUTES ==="
for u in \
  / \
  /app-home \
  /control-tower \
  /holoverse-center \
  /all-american-marketplace-university \
  /all-american-marketplace-wallet \
  /music-app \
  /streaming-app \
  /vocal-coach-studio-recorder \
  /aniyah-cross-border-payment \
  /media-studio \
  /finbank-international \
  /flagship-ai-suite
do
  printf "%-45s" "$u"
  curl -I -s "$BASE$u" | head -n 1
done

echo
echo "=== VERIFY BRAND IMAGES ==="
for u in \
  /static/img/stubbs_crest.svg \
  /static/img/holographic_lion_saturn.svg \
  /static/img/american_flag_holo.svg
do
  printf "%-45s" "$u"
  curl -I -s "$BASE$u" | head -n 1
done

echo
echo "=== VERIFY KEY APIS ==="
for u in \
  /api/university-courses \
  /api/wallet-summary \
  /api/music-tracks \
  /api/stream-channels \
  /api/search?q=music
do
  printf "%-45s" "$u"
  curl -I -s "$BASE$u" | head -n 1
done

{
  echo "=== STABILIZE REPORT $STAMP ==="
  echo "BASE=$BASE"
  echo "PORT=$PORT"
  echo
  echo "--- LAST LOG LINES ---"
  tail -n 80 logs/app.log 2>/dev/null || true
} > "snapshots/stabilize_report_$STAMP.txt"

echo
echo "APP_LIVE_AT=$BASE"
echo "REPORT=snapshots/stabilize_report_$STAMP.txt"
