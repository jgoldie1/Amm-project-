#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
export DATABASE_URL="sqlite:///instance/platform.db"
export PLATFORM_BOOT_MODE=normal
pkill -f "python.*app.py" 2>/dev/null || true
nohup python -u app.py > server.log 2>&1 &
sleep 8
echo "=== locked checkpoint smoke test ==="
for route in \
  /platform-home \
  /master-dashboard \
  /auth/login \
  /payments-center \
  /payment-health \
  /boot-status
do
  code="$(curl -I -s "http://127.0.0.1:8080${route}" | head -1 | awk '{print $2}')"
  printf "%-28s %s\n" "$route" "${code:-NO_RESPONSE}"
done
echo
tail -40 server.log
