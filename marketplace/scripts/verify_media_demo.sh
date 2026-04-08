#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
PORT=8080
[ -f config/active_port.txt ] && PORT="$(cat config/active_port.txt)"
BASE="http://127.0.0.1:$PORT"

{
  echo "=== VERIFY MEDIA DEMO ==="
  echo "BASE=$BASE"
  echo
  for u in \
    /media-demo-home \
    /shows-demo \
    /music-demo \
    /music-coaching-home \
    /artist-signing-home \
    /api/media-shows-v1 \
    /api/media-tracks-v1 \
    /api/music-coaching-requests-v1 \
    /api/artist-signing-intake-v1
  do
    printf "%-34s" "$u"
    curl -I -s "$BASE$u" | head -n 1
  done
  echo
  echo "--- LAST LOG ---"
  tail -n 60 logs/app.log 2>/dev/null || true
} | tee "snapshots/verify_media_demo_${PORT}.txt"
