#!/data/data/com.termux/files/usr/bin/bash
BASE="http://127.0.0.1:8080"

for route in \
  /app-home-2 \
  /omni-cinema \
  /holofon-world \
  /royal-locs-franchise \
  /flagship-tree \
  /tv-network-v2 \
  /live-channel-engine \
  /social-hub \
  /games-pro-v2 \
  /for-you \
  /growth-center \
  /safety-center \
  /time-machine-2 \
  /open-world \
  /account-center-v2 \
  /creator-monetization-v2 \
  /progress-center-v2 \
  /mission-history-v2 \
  /holo-engine-v2 \
  /holo-camera-v2 \
  /lag-buster-v2 \
  /holo-scene-v2
do
  code="$(curl -I -s "${BASE}${route}" | head -1 | awk '{print $2}')"
  printf "%-32s %s\n" "$route" "${code:-NO_RESPONSE}"
done
