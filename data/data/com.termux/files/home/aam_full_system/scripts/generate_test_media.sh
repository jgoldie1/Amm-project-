#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

PROJECT="studio_os/projects/anyone_can_be_a_star_episode"
ASSETS="$PROJECT/assets"

mkdir -p "$ASSETS/real_clips" "$ASSETS/real_audio" "$ASSETS/real_music"

echo "=== GENERATING TEST MEDIA ==="

ffmpeg -y -f lavfi -i color=c=black:s=1280x720:d=5 \
  -vf "drawtext=text='TEST CLIP':fontcolor=white:fontsize=40:x=(w-text_w)/2:y=(h-text_h)/2" \
  $ASSETS/real_clips/test_clip.mp4

ffmpeg -y -f lavfi -i sine=frequency=440:duration=5 \
  $ASSETS/real_audio/test_voice.wav

ffmpeg -y -f lavfi -i sine=frequency=220:duration=5 \
  $ASSETS/real_music/test_music.wav

echo "TEST MEDIA READY"
