#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
PORT=8080
[ -f config/active_port.txt ] && PORT="$(cat config/active_port.txt)"
BASE="http://127.0.0.1:$PORT"

echo "ACTIVE_PORT=$PORT"
echo
ss -tulpen 2>/dev/null | grep ":$PORT " || echo "APP_NOT_LISTENING"
echo
for u in \
  /app-home \
  /stabilize-hub-v3 \
  /session-login-v3
do
  printf "%-30s" "$u"
  curl -I -s "$BASE$u" | head -n 1
done
echo
tail -n 40 logs/app.log 2>/dev/null || true
