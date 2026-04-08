#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== CHECK + BRIDGE REAL MEDIA ==="

PROJECT="studio_os/projects/anyone_can_be_a_star_episode"
ASSETS="$PROJECT/assets"

mkdir -p "$ASSETS/real_clips" "$ASSETS/real_audio" "$ASSETS/real_music" "$ASSETS/mix_masters"

echo
echo "[1] CURRENT FILES"
echo "--- real_clips ---"
find "$ASSETS/real_clips" -maxdepth 1 -type f | sort || true
echo
echo "--- real_audio ---"
find "$ASSETS/real_audio" -maxdepth 1 -type f | sort || true
echo
echo "--- real_music ---"
find "$ASSETS/real_music" -maxdepth 1 -type f | sort || true
echo
echo "--- mix_masters ---"
find "$ASSETS/mix_masters" -maxdepth 1 -type f | sort || true

echo
echo "[2] BRIDGE SOUNDTRACK MASTER -> REAL MUSIC"
if [ -f "$ASSETS/mix_masters/soundtrack_master.wav" ] && [ ! -f "$ASSETS/real_music/music_master.wav" ]; then
  cp "$ASSETS/mix_masters/soundtrack_master.wav" "$ASSETS/real_music/music_master.wav"
  echo "copied soundtrack_master.wav -> real_music/music_master.wav"
elif [ -f "$ASSETS/mix_masters/soundtrack_master.mp3" ] && [ ! -f "$ASSETS/real_music/music_master.mp3" ]; then
  cp "$ASSETS/mix_masters/soundtrack_master.mp3" "$ASSETS/real_music/music_master.mp3"
  echo "copied soundtrack_master.mp3 -> real_music/music_master.mp3"
else
  echo "no soundtrack master copied"
fi

echo
echo "[3] READINESS COUNTS"
CLIPS=$(find "$ASSETS/real_clips" -maxdepth 1 -type f \( -name '*.mp4' -o -name '*.mov' \) | wc -l | tr -d ' ')
AUDIO=$(find "$ASSETS/real_audio" -maxdepth 1 -type f \( -name '*.wav' -o -name '*.mp3' \) | wc -l | tr -d ' ')
MUSIC=$(find "$ASSETS/real_music" -maxdepth 1 -type f \( -name '*.wav' -o -name '*.mp3' \) | wc -l | tr -d ' ')

echo "clips=$CLIPS"
echo "audio=$AUDIO"
echo "music=$MUSIC"

echo
echo "[4] STATUS"
if [ "$CLIPS" -gt 0 ] && [ "$AUDIO" -gt 0 ] && [ "$MUSIC" -gt 0 ]; then
  echo "READY_FOR_RENDER=yes"
  echo
  echo "Run this next:"
  echo "bash $PROJECT/provider_logs/run_ffmpeg_when_ready.sh"
else
  echo "READY_FOR_RENDER=no"
  echo
  echo "Still missing:"
  [ "$CLIPS" -eq 0 ] && echo "- add at least one real video clip to $ASSETS/real_clips"
  [ "$AUDIO" -eq 0 ] && echo "- add at least one real voice/audio file to $ASSETS/real_audio"
  [ "$MUSIC" -eq 0 ] && echo "- add at least one real music/master file to $ASSETS/real_music or $ASSETS/mix_masters"
fi

echo
echo "[5] FREEZE"
mkdir -p snapshots/final
STAMP=$(date +%Y%m%d_%H%M%S)
tar -czf "snapshots/final/check_bridge_real_media_${STAMP}.tar.gz" "$PROJECT"

echo "checkpoint: $STAMP"
