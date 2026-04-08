#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
PORT=8080
[ -f config/active_port.txt ] && PORT="$(cat config/active_port.txt)"
BASE="http://127.0.0.1:$PORT"

{
  echo "=== VERIFY 5PM LOCK ==="
  echo "BASE=$BASE"
  echo
  for u in \
    /app-home \
    /family-launch-home \
    /heirs-app \
    /media-demo-home \
    /creator-tools-home \
    /holoverse-lobby-v2 \
    /holo-commerce-home
  do
    printf "%-30s" "$u"
    curl -I -s "$BASE$u" | head -n 1
  done
  echo
  echo "--- LAST LOG ---"
  tail -n 60 logs/app.log 2>/dev/null || true
} | tee "snapshots/verify_5pm_lock_${PORT}.txt"
