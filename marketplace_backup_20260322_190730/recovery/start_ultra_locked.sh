#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1

export DATABASE_URL="sqlite:///instance/platform.db"
export SECRET_KEY="dev-secret-key-change-me"

pkill -f "python.*app.py" 2>/dev/null || true
sleep 2

nohup python -u app.py > server.log 2>&1 &
sleep 8

echo "=== ULTRA LOCKED START ==="
for route in \
  /app-home-2 \
  /dynamic-feed-v3 \
  /world-map-v4 \
  /omni-cinema-v4 \
  /flagship-tree-v2 \
  /his-hers-brand \
  /holofon-world \
  /royal-locs-franchise \
  /holo-engine-v2 \
  /progress-center-v2
do
  code="$(curl -I -s "http://127.0.0.1:8080${route}" | head -1 | awk '{print $2}')"
  printf "%-32s %s\n" "$route" "${code:-NO_RESPONSE}"
done

echo
tail -50 server.log
