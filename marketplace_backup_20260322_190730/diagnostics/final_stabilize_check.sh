#!/data/data/com.termux/files/usr/bin/bash
BASE="http://127.0.0.1:8080"
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
  code="$(curl -I -s "${BASE}${route}" | head -1 | awk '{print $2}')"
  printf "%-32s %s\n" "$route" "${code:-NO_RESPONSE}"
done
