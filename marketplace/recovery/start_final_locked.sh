#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1

export DATABASE_URL="sqlite:///instance/platform.db"
export SECRET_KEY="dev-secret-key-change-me"

pkill -f "python.*app.py" 2>/dev/null || true
sleep 2

nohup python -u app.py > server.log 2>&1 &
sleep 8

echo "=== FINAL LOCKED START ==="
for route in \
  /app-home-2 \
  /social-hub \
  /games-pro-v2 \
  /for-you \
  /tv-network \
  /growth-center \
  /safety-center \
  /time-machine-2 \
  /open-world \
  /account-center-v2 \
  /creator-monetization-v2 \
  /gap-report-v2 \
  /progress-center-v2 \
  /mission-history-v2
do
  code="$(curl -I -s "http://127.0.0.1:8080${route}" | head -1 | awk '{print $2}')"
  printf "%-32s %s\n" "$route" "${code:-NO_RESPONSE}"
done

echo
tail -60 server.log
