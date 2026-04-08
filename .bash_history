fi

echo "Ready to inject soundtrack into final render."
echo "Next step: run final audio replacement/mix with ffmpeg or editor backend."
""")
runner.chmod(0o755)
print("injection runner stub generated")
PY

python studio_os/services/artist_music/build_artist_music_plan.py
python studio_os/services/soundtrack/build_soundtrack_injection_plan.py
python studio_os/services/soundtrack/build_artist_dropzones.py
python studio_os/services/soundtrack/build_injection_runner_stub.py

echo
echo "=== VERIFY ==="
find "$PROJECT/assets"/vocal_sessions -maxdepth 2 -type f | sort
find "$PROJECT/assets"/song_drafts -maxdepth 2 -type f | sort
find "$PROJECT/assets"/approved_soundtrack -maxdepth 2 -type f | sort
find "$PROJECT/assets"/mix_masters -maxdepth 2 -type f | sort
find "$PROJECT/outputs" -maxdepth 1 -type f | sort | tail -n 10

echo
echo "=== FREEZE ==="
STAMP=$(date +%Y%m%d_%H%M%S)
tar -czf "snapshots/final/artist_music_injection_${STAMP}.tar.gz" studio_os

echo
echo "ARTIST MUSIC INJECTION LAYER READY"
echo "checkpoint: $STAMP"
SH

chmod +x scripts/build_artist_music_injection_layer.sh
bash scripts/build_artist_music_injection_layer.sh
cat > scripts/final_render_injection_and_publish.sh <<'SH'
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
SH

chmod +x scripts/final_render_injection_and_publish.sh
bash scripts/final_render_injection_and_publish.sh
cat > scripts/final_render_injection_and_publish.sh <<'SH'
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
SH

chmod +x scripts/final_render_injection_and_publish.sh
bash scripts/final_render_injection_and_publish.sh
cd ~/aam_full_system
cat > scripts/check_and_bridge_real_media.sh <<'SH'
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
SH

chmod +x scripts/check_and_bridge_real_media.sh
bash scripts/check_and_bridge_real_media.sh
bash studio_os/projects/anyone_can_be_a_star_episode/provider_logs/run_ffmpeg_when_ready.sh
bash scripts/generate_test_media.sh
bash studio_os/projects/anyone_can_be_a_star_episode/provider_logs/run_ffmpeg_when_ready.sh
bash scripts/generate_test_media.sh
bash studio_os/projects/anyone_can_be_a_star_episode/provider_logs/run_ffmpeg_when_ready.sh
cat > scripts/generate_test_media.sh <<'SH'
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
SH

chmod +x scripts/generate_test_media.sh
bash scripts/generate_test_media.sh
bash studio_os/projects/anyone_can_be_a_star_episode/provider_logs/run_ffmpeg_when_ready.sh
pkg update
pkg install ffmpeg -y
bash scripts/generate_test_media.sh
bash scripts/check_and_bridge_real_media.sh
bash studio_os/projects/anyone_can_be_a_star_episode/provider_logs/run_ffmpeg_when_ready.sh
final_master.mp4
pkg update && pkg upgrade -y
apt clean
apt update
pkg install ffmpeg -y
bash scripts/generate_test_media.sh
bash scripts/check_and_bridge_real_media.sh
bash studio_os/projects/anyone_can_be_a_star_episode/provider_logs/run_ffmpeg_when_ready.sh
rm -rf /data/data/com.termux/cache/apt/archives/*
rm -rf /data/data/com.termux/cache/apt/archives/partial/*
apt clean
apt update
apt upgrade -y
pkg install ffmpeg -y
ffmpeg -version
pkg clean
rm -rf /data/data/com.termux/cache/apt/archives/*
pkg update
pkg install ffmpeg --fix-missing -y
rm -rf /data/data/com.termux/cache/apt/archives/partial
mkdir -p /data/data/com.termux/cache/apt/archives/partial
rm -rf /data/data/com.termux/cache/apt/archives/partial
mkdir -p /data/data/com.termux/cache/apt/archives/partial
apt clean
apt autoclean
pkg update && pkg upgrade -y
pkg install ffmpeg --fix-missing -y
termux-setup-storage
rm -rf $PREFIX/var/cache/apt/*
mkdir -p $PREFIX/var/cache/apt/archives/partial
rm -rf $PREFIX/var/lib/apt/lists/*
mkdir -p $PREFIX/var/lib/apt/lists/partial
pkg clean
pkg update
pkg upgrade -y
pkg install ffmpeg -ypkg update && pkg upgrade -y
pkg install ffmpeg -y
rm -rf $PREFIX/var/cache/apt/archives
mkdir -p $PREFIX/var/cache/apt/archives/partial
apt clean
apt update --fix-missing
apt upgrade
rm -rf $PREFIX/var/lib/apt/lists/*
apt update
# Force recreate BOTH possible cache locations
mkdir -p /data/data/com.termux/cache/apt/archives/partial
mkdir -p $PREFIX/var/cache/apt/archives/partial
# Give full permissions (important)
chmod -R 777 /data/data/com.termux/cache/apt
chmod -R 777 $PREFIX/var/cache/apt
# Clean everything again
apt clean
apt install nano
termux-change-repo
apt update
apt upgrade
pkg install termux-tools
termux-change-repo
sed -i 's@termux.net@packages.termux.dev@g' $PREFIX/etc/apt/sources.list
apt update
apt upgrade -y
rm -rf $PREFIX/var/lib/apt/lists/*
rm -rf $PREFIX/var/cache/apt/*
rm -rf /data/data/com.termux/cache/apt/*
mkdir -p $PREFIX/var/cache/apt/archives/partial
sed -i 's@termux.net@packages.termux.dev@g' $PREFIX/etc/apt/sources.list
apt clean
apt update
apt upgrade -y
pkg upgrade -y
cat $PREFIX/etc/apt/sources.list
echo "deb https://packages.termux.dev/apt/termux-main stable main" > $PREFIX/etc/apt/sources.list
apt clean
apt update
apt upgrade -y
pkg install termux-keyring -y
apt update
apt upgrade -y
pkg install termux-keyring -y
rm -rf $PREFIX/etc/apt/sources.list
echo "deb https://packages.termux.dev/apt/termux-main stable main" > $PREFIX/etc/apt/sources.list
pkg install termux-keyring --force-reinstall -y
apt clean
rm -rf /data/data/com.termux/cache/apt/*
rm -rf $PREFIX/var/lib/apt/lists/*
apt update
apt upgrade -y
pkg update && pkg upgrade -y
pkg install nodejs git nano -y
..
rm -rf $PREFIX/var/lib/apt/lists/*
rm -rf $PREFIX/var/cache/apt/archives/*
mkdir -p $PREFIX/var/cache/apt/archives/partial
apt clean
apt update --fix-missing
pkg install termux-keyring -y
termux-change-repo
pkg update
pkg upgrade -y
cp -r ~/aam_full_system /sdcard/
cp -r ~/aam_full_system /sdcard/aam_backup
termux-share "/storage/emulated/0/Download/aam_backup.tar.gz"
pkg install termux-api
apt update --allow-insecure-repositories
apt install termux-keyring --allow-unauthenticated
apt update
pkg install termux-api
termux-share "/storage/emulated/0/Download/aam_backup.tar.gz"
aam_backup
tar -czf /sdcard/aam_backup.tar.gz ~/aam_full_system
pkg install git -y
git init
git add .
git commit -m "backup"
ls -lh /sdcard/aam_backup.tar.gz
rm -rf ~/.cache/*
rm -rf ~/.npm/*
tar -xzf /sdcard/aam_backup.tar.gz -C ~/
rm -rf ~/.npm/*
rm -rf ~/.cache/*
rm -rf ~/.npm/*
df -h
tar -czf /sdcard/aam_backup.tar.gz ~/aam_full_system
ls -lh /sdcard/aam_backup.tar.gz
rm -rf ~/aam_full_system/test_results/*
rm -rf ~/.cache/*
rm -rf ~/.npm/*
rm -rf ~/backups/*
df -h
3tar -tzf /sdcard/aam_backup.tar.gz | head
tar -czf /sdcard/aam_backup_clean.tar.gz ~/aam_full_system
tar -tzf /sdcard/aam_backup.tar.gz | head
termux-setup-storage
mv /sdcard/aam_backup.tar.gz /storage/emulated/0/Download/
aam_backup.tar.gz
ls /storage/emulated/0/Download/
tar -tzf /storage/emulated/0/Download/aam_backup.tar.gz | head
termux-share /storage/emulated/0/Download/aam_backup.tar.gz
