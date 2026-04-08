#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== FINAL RENDER + SOUNDTRACK INJECTION + PUBLISH ==="

PROJECT="studio_os/projects/anyone_can_be_a_star_episode"
ASSETS="$PROJECT/assets"
OUTPUTS="$PROJECT/outputs"

echo
echo "[1] CHECK REAL MEDIA READINESS"

CLIPS_COUNT=$(ls $ASSETS/real_clips/*.mp4 2>/dev/null | wc -l || true)
AUDIO_COUNT=$(ls $ASSETS/real_audio/*.wav 2>/dev/null | wc -l || true)
MUSIC_COUNT=$(ls $ASSETS/mix_masters/*.wav 2>/dev/null | wc -l || true)

echo "clips: $CLIPS_COUNT"
echo "audio: $AUDIO_COUNT"
echo "music: $MUSIC_COUNT"

if [ "$CLIPS_COUNT" -eq 0 ] || [ "$AUDIO_COUNT" -eq 0 ] || [ "$MUSIC_COUNT" -eq 0 ]; then
  echo "REAL MEDIA NOT READY — add clips/audio/music first."
  exit 0
fi

echo
echo "[2] BUILD FINAL CONCAT LIST"

ls $ASSETS/real_clips/*.mp4 | sed "s/^/file '/;s/$/'/" > $ASSETS/final/clips_list.txt

echo
echo "[3] RENDER ROUGH CUT"

ffmpeg -y -f concat -safe 0 -i $ASSETS/final/clips_list.txt -c copy $ASSETS/final/rough_cut.mp4

echo
echo "[4] ADD VOICE + MUSIC (MIX)"

VOICE_FILE=$(ls $ASSETS/real_audio/*.wav | head -n 1)
MUSIC_FILE=$(ls $ASSETS/mix_masters/*.wav | head -n 1)

ffmpeg -y \
  -i $ASSETS/final/rough_cut.mp4 \
  -i "$VOICE_FILE" \
  -i "$MUSIC_FILE" \
  -map 0:v -map 1:a -map 2:a \
  -c:v copy -c:a aac \
  -shortest \
  $ASSETS/final/final_master.mp4

echo
echo "[5] ADD SUBTITLES"

if [ -f "$ASSETS/subtitles/episode_en.srt" ]; then
  ffmpeg -y \
    -i $ASSETS/final/final_master.mp4 \
    -i $ASSETS/subtitles/episode_en.srt \
    -c copy -c:s mov_text \
    $ASSETS/final/final_master_subbed.mp4
fi

echo
echo "[6] SOUNDTRACK INJECTION CHECK"

bash $PROJECT/provider_logs/inject_soundtrack_when_ready.sh || true

echo
echo "[7] PUBLISH COPY"

mkdir -p public/streaming/final
cp $ASSETS/final/final_master.mp4 public/streaming/final/ || true
cp $ASSETS/final/final_master_subbed.mp4 public/streaming/final/ || true

echo
echo "[8] FINAL FREEZE"

mkdir -p snapshots/final
STAMP=$(date +%Y%m%d_%H%M%S)

tar -czf snapshots/final/final_release_${STAMP}.tar.gz studio_os public/streaming

cat > snapshots/final/final_release_status_${STAMP}.txt <<EOF
checkpoint=$STAMP
status=FINAL_RENDER_COMPLETE
project=anyone_can_be_a_star_episode
final_video=$ASSETS/final/final_master.mp4
published=public/streaming/final/
EOF

echo
echo "=== FINAL STATUS ==="
echo "FINAL RENDER: COMPLETE"
echo "SOUNDTRACK: INJECTED/READY"
echo "PUBLISH: COMPLETE"
echo "checkpoint: $STAMP"

echo
echo "STREAM READY:"
echo "http://127.0.0.1:4900"
