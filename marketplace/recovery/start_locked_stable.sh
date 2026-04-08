#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1

export DATABASE_URL="sqlite:///instance/platform.db"
export SECRET_KEY="dev-secret-key-change-me"

pkill -f "python.*app.py" 2>/dev/null || true
sleep 2

nohup python -u app.py > server.log 2>&1 &
sleep 8

echo "=== LOCKED STABLE START ==="
for route in \
  /app-home \
  /creator-directory \
  /creator-dashboard-live \
  /creators-db \
  /products-db \
  /contents-db \
  /creator-links-safe \
  /stability-hub \
  /upload-center \
  /media-library \
  /time-machine \
  /memory-vault \
  /quantum-analysis
do
  code="$(curl -I -s "http://127.0.0.1:8080${route}" | head -1 | awk '{print $2}')"
  printf "%-28s %s\n" "$route" "${code:-NO_RESPONSE}"
done

echo
tail -60 server.log
