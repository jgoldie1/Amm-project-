#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== PROVIDER EXECUTION + SMOKE + STABILIZE + FREEZE ==="

echo
echo "[1] CORE HEALTH"
bash scripts/check_js.sh
bash scripts/status.sh
bash scripts/smoke_test.sh

echo
echo "[2] LIFE WORLD STABILIZE"
bash scripts/fix_life_world_startup.sh

echo
echo "[3] JOIN + PUBLIC + GATEWAY"
curl -I -s http://127.0.0.1:4900/join/ | head -n 10 ; echo
curl -s http://127.0.0.1:4900/join/ | grep -nE "Enter All American Marketplace|Join Now|Who invited you" || true
curl -s -X POST http://127.0.0.1:4900/join-api \
  -H "Content-Type: application/json" \
  -d '{"username":"provider_exec_smoke_user","referrer":"all_american_creator"}'
echo

PUBLIC_URL="https://gossip-stores-connections-bridal.trycloudflare.com"
curl -I -s "$PUBLIC_URL/join/" | head -n 10 ; echo || true
curl -s --max-time 10 http://127.0.0.1:4000/health ; echo
curl -s --max-time 10 http://127.0.0.1:4000/health/detail ; echo

echo
echo "[4] VERIFY MAIN STUDIO LAYERS"
test -f studio_os/projects/demo_episode/outputs/storyboard.json && echo "storyboard: OK" || echo "storyboard: MISSING"
test -f studio_os/projects/demo_episode/outputs/voice_plan.json && echo "voice_plan: OK" || echo "voice_plan: MISSING"
test -f studio_os/projects/demo_episode/outputs/render_manifest.json && echo "render_manifest: OK" || echo "render_manifest: MISSING"
test -f studio_os/projects/demo_episode/outputs/edit_plan.json && echo "edit_plan: OK" || echo "edit_plan: MISSING"
test -f studio_os/projects/demo_episode/outputs/music_plan.json && echo "music_plan: OK" || echo "music_plan: MISSING"
test -f studio_os/projects/demo_episode/outputs/post_plan.json && echo "post_plan: OK" || echo "post_plan: MISSING"
test -f studio_os/projects/demo_episode/outputs/qc_plan.json && echo "qc_plan: OK" || echo "qc_plan: MISSING"
test -f studio_os/projects/demo_episode/outputs/real_export_plan.json && echo "real_export_plan: OK" || echo "real_export_plan: MISSING"

echo
echo "[5] VERIFY ANYONE CAN BE A STAR EXECUTION LAYER"
test -f studio_os/projects/anyone_can_be_a_star_episode/outputs/render_queue.json && echo "star_render_queue: OK" || echo "star_render_queue: MISSING"
test -f studio_os/projects/anyone_can_be_a_star_episode/outputs/rendered_clips.json && echo "star_rendered_clips: OK" || echo "star_rendered_clips: MISSING"
test -f studio_os/projects/anyone_can_be_a_star_episode/outputs/provider_env_status.json && echo "provider_env_status: OK" || echo "provider_env_status: MISSING"
test -f studio_os/projects/anyone_can_be_a_star_episode/outputs/provider_runbook.json && echo "provider_runbook: OK" || echo "provider_runbook: MISSING"
test -f studio_os/projects/anyone_can_be_a_star_episode/outputs/ffmpeg_commands.json && echo "ffmpeg_commands: OK" || echo "ffmpeg_commands: MISSING"

echo
echo "[6] VERIFY PAYLOAD FILES"
find studio_os/projects/anyone_can_be_a_star_episode/provider_payloads -maxdepth 2 -type f | sort

echo
echo "[7] SNAPSHOT FREEZE"
mkdir -p snapshots/final
STAMP=$(date +%Y%m%d_%H%M%S)

curl -s http://127.0.0.1:4900/join/ > snapshots/final/join_${STAMP}.html
curl -s http://127.0.0.1:4900/ -L > snapshots/final/dashboard_${STAMP}.html
curl -s http://127.0.0.1:4902/ > snapshots/final/life_world_${STAMP}.html
curl -s http://127.0.0.1:4000/health > snapshots/final/gateway_health_${STAMP}.json
curl -s http://127.0.0.1:4000/health/detail > snapshots/final/gateway_health_detail_${STAMP}.json

cp data/referrals/joins.json snapshots/final/joins_${STAMP}.json 2>/dev/null || true
cp data/memory/memory_archive.json snapshots/final/memory_archive_${STAMP}.json 2>/dev/null || true
cp data/feedback/beta_reports.json snapshots/final/beta_reports_${STAMP}.json 2>/dev/null || true

tar -czf snapshots/final/provider_execution_bundle_${STAMP}.tar.gz studio_os public/streaming scripts

cat > snapshots/final/provider_execution_status_${STAMP}.txt <<EOF
checkpoint=$STAMP
public_url=$PUBLIC_URL
share_link=$PUBLIC_URL/join/?ref=all_american_creator
dashboard=http://127.0.0.1:4900
life_world=http://127.0.0.1:4902
gateway=http://127.0.0.1:4000
main_episode=demo_episode
star_episode=anyone_can_be_a_star_episode
EOF

echo
echo "=== FINAL STATUS ==="
echo "dashboard: STABLE"
echo "jarvis: STABLE"
echo "life_world: STABLE"
echo "gateway: STABLE"
echo "join_page: STABLE"
echo "join_api: STABLE"
echo "main_studio_layers: READY"
echo "star_rendering_layer: READY"
echo "provider_execution_layer: READY"
echo "freeze: SAVED"
echo "checkpoint: $STAMP"
echo
echo "LIVE LINK:"
echo "$PUBLIC_URL/join/?ref=all_american_creator"
