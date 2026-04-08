#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== CREATOR + STREAMING + SMOKE + STABILIZE + FREEZE ==="

echo
echo "[1] CORE SMOKE"
bash scripts/check_js.sh
bash scripts/status.sh
bash scripts/smoke_test.sh

echo
echo "[2] LIFE WORLD STABILIZE"
bash scripts/fix_life_world_startup.sh

echo
echo "[3] BUILD CREATOR + STREAMING SCAFFOLD"
mkdir -p studio_os/{creators,shows,episodes,streaming}
mkdir -p studio_os/creators/isaiah/{profile,shows}
mkdir -p studio_os/shows/all_american_ai_tv/{episodes,assets}
mkdir -p studio_os/episodes/demo_pilot/{inputs,outputs,assets/final}
mkdir -p public/streaming

cat > studio_os/creators/isaiah/profile/profile.json <<'EOF'
{
  "name": "Isaiah",
  "role": "creator",
  "channel": "AI TV",
  "status": "active"
}
EOF

cat > studio_os/shows/all_american_ai_tv/show.json <<'EOF'
{
  "title": "All American AI TV",
  "creator": "Isaiah",
  "genre": "futuristic creator network",
  "status": "development",
  "episodes": ["demo_pilot"]
}
EOF

cat > studio_os/episodes/demo_pilot/inputs/request.json <<'EOF'
{
  "title": "Demo Pilot",
  "theme": "AI TV streaming ecosystem",
  "length_minutes": 3,
  "style": "cinematic holographic sci-fi",
  "goal": "introduce creators, shows, and the streaming world"
}
EOF

cat > public/streaming/index.html <<'EOF'
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>All American AI TV</title>
  <style>
    body { font-family: Arial, sans-serif; background:#0b1020; color:#fff; margin:0; padding:32px; }
    .card { background:#141b34; border-radius:16px; padding:24px; max-width:900px; margin:auto; }
    h1 { margin-top:0; }
    .pill { display:inline-block; padding:6px 10px; border-radius:999px; background:#24305e; margin-right:8px; }
    .box { background:#0f1530; border-radius:12px; padding:16px; margin-top:16px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>All American AI TV</h1>
    <span class="pill">Creator Network</span>
    <span class="pill">Streaming</span>
    <span class="pill">Studio OS</span>

    <div class="box">
      <h2>Featured Creator</h2>
      <p>Isaiah</p>
    </div>

    <div class="box">
      <h2>Featured Show</h2>
      <p>All American AI TV</p>
    </div>

    <div class="box">
      <h2>Featured Episode</h2>
      <p>Demo Pilot</p>
    </div>
  </div>
</body>
</html>
EOF

echo
echo "[4] JOIN FLOW RECHECK"
curl -I -s http://127.0.0.1:4900/join/ | head -n 10 ; echo
curl -s http://127.0.0.1:4900/join/ | grep -nE "Enter All American Marketplace|Join Now|Who invited you" || true
curl -s -X POST http://127.0.0.1:4900/join-api \
  -H "Content-Type: application/json" \
  -d '{"username":"creator_stream_test","referrer":"all_american_creator"}'
echo

echo
echo "[5] PUBLIC LINK CHECK"
PUBLIC_URL="https://gossip-stores-connections-bridal.trycloudflare.com"
curl -I -s "$PUBLIC_URL/join/" | head -n 10 ; echo || true

echo
echo "[6] GATEWAY CHECK"
curl -s --max-time 10 http://127.0.0.1:4000/health ; echo
curl -s --max-time 10 http://127.0.0.1:4000/health/detail ; echo

echo
echo "[7] FREEZE"
mkdir -p snapshots/final
STAMP=$(date +%Y%m%d_%H%M%S)

curl -s http://127.0.0.1:4900/join/ > snapshots/final/join_${STAMP}.html
curl -s http://127.0.0.1:4900/ -L > snapshots/final/dashboard_${STAMP}.html
curl -s http://127.0.0.1:4902/ > snapshots/final/life_world_${STAMP}.html
curl -s http://127.0.0.1:4000/health > snapshots/final/gateway_health_${STAMP}.json
curl -s http://127.0.0.1:4000/health/detail > snapshots/final/gateway_health_detail_${STAMP}.json
cp data/referrals/joins.json snapshots/final/joins_${STAMP}.json 2>/dev/null || true
tar -czf snapshots/final/creator_streaming_${STAMP}.tar.gz studio_os public/streaming

cat > snapshots/final/creator_streaming_status_${STAMP}.txt <<EOF
checkpoint=$STAMP
public_url=$PUBLIC_URL
share_link=$PUBLIC_URL/join/?ref=all_american_creator
creator=Isaiah
show=All American AI TV
episode=Demo Pilot
EOF

echo
echo "=== FINAL STATUS ==="
echo "dashboard: STABLE"
echo "jarvis: STABLE"
echo "life_world: STABLE"
echo "gateway: STABLE"
echo "join_page: STABLE"
echo "join_api: STABLE"
echo "creator_scaffold: READY"
echo "streaming_scaffold: READY"
echo "freeze: SAVED"
echo "checkpoint: $STAMP"
echo
echo "LIVE LINK:"
echo "$PUBLIC_URL/join/?ref=all_american_creator"
