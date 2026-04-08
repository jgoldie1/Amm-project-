#!/data/data/com.termux/files/usr/bin/bash
BASE="http://127.0.0.1:8080"

for route in \
  /app-home-2 \
  /social-hub \
  /games-pro-v2 \
  /for-you \
  /tv-network \
  /tv-network-v2 \
  /growth-center \
  /safety-center \
  /time-machine-2 \
  /open-world \
  /account-center-v2 \
  /creator-monetization-v2 \
  /gap-report-v2 \
  /progress-center-v2 \
  /mission-history-v2 \
  /omni-cinema \
  /omni-cinema-v2 \
  /omni-cinema-v3 \
  /omni-cinema-v4 \
  /holofon-world \
  /royal-locs-franchise \
  /his-hers-brand \
  /flagship-tree \
  /flagship-tree-v2 \
  /dynamic-feed-v2 \
  /dynamic-feed-v3 \
  /world-map-v2 \
  /world-map-v3 \
  /world-map-v4 \
  /live-channel-engine \
  /channel-directory-v2 \
  /channel-bundles-v2 \
  /channel-subscriptions-v2 \
  /show-monetization-v2 \
  /holo-engine-v2 \
  /holo-camera-v2 \
  /lag-buster-v2 \
  /holo-scene-v2
do
  code="$(curl -I -s "${BASE}${route}" | head -1 | awk '{print $2}')"
  printf "%-36s %s\n" "$route" "${code:-NO_RESPONSE}"
done
