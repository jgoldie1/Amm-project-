#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
mkdir -p snapshots
STAMP=$(date +%Y%m%d_%H%M%S)

if [ -f config/active_port.txt ]; then
  PORT="$(cat config/active_port.txt)"
else
  PORT="8080"
fi

BASE="http://127.0.0.1:$PORT"

{
  echo "=== VERIFY APP $STAMP ==="
  echo "BASE=$BASE"
  echo
  echo "--- PAGES ---"
  for u in \
    / \
    /app-home \
    /control-tower \
    /holoverse-center \
    /flagship-showcase \
    /brand-gallery \
    /search-ui \
    /search-ultra \
    /creator-market \
    /all-american-marketplace-university \
    /all-american-marketplace-wallet \
    /music-app \
    /streaming-app \
    /vocal-coach-studio-recorder \
    /aniyah-cross-border-payment \
    /finbank-international \
    /media-studio \
    /flagship-ai-suite \
    /system-readiness
  do
    printf "%-40s" "$u"
    curl -I -s "$BASE$u" | head -n 1
  done
  echo
  echo "--- IMAGES ---"
  for u in \
    /static/img/stubbs_crest.svg \
    /static/img/holographic_lion_saturn.svg \
    /static/img/american_flag_holo.svg
  do
    printf "%-40s" "$u"
    curl -I -s "$BASE$u" | head -n 1
  done
  echo
  echo "--- APIS ---"
  for u in \
    /api/system-readiness \
    /api/university-courses \
    /api/wallet-summary \
    /api/music-tracks \
    /api/stream-channels \
    /api/search?q=music
  do
    printf "%-40s" "$u"
    curl -I -s "$BASE$u" | head -n 1
  done
  echo
  echo "--- SAMPLE JSON ---"
  curl -s "$BASE/api/system-readiness"
  echo
  echo
  echo "--- LAST LOG ---"
  tail -n 60 logs/app.log 2>/dev/null || true
} | tee "snapshots/verify_app_$STAMP.txt"

echo "REPORT=snapshots/verify_app_$STAMP.txt"
