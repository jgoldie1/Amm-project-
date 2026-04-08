#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== FIRST REAL RENDER PREP ==="

PROJECT="studio_os/projects/anyone_can_be_a_star_episode"
ASSETS="$PROJECT/assets"
OUT="$PROJECT/outputs"

mkdir -p "$ASSETS"/{real_clips,real_audio,real_music,final,publish}
mkdir -p "$PROJECT"/provider_logs
mkdir -p snapshots/final

echo
echo "[1] VERIFY PROJECT"
test -f "$OUT/render_manifest.json" && echo "render_manifest: OK" || { echo "render_manifest: MISSING"; exit 1; }
test -f "$OUT/voice_plan.json" && echo "voice_plan: OK" || { echo "voice_plan: MISSING"; exit 1; }
test -f "$OUT/music_plan.json" && echo "music_plan: OK" || { echo "music_plan: MISSING"; exit 1; }
test -f "$OUT/provider_runbook.json" && echo "provider_runbook: OK" || { echo "provider_runbook: MISSING"; exit 1; }
test -f "$OUT/ffmpeg_commands.json" && echo "ffmpeg_commands: OK" || { echo "ffmpeg_commands: MISSING"; exit 1; }

echo
echo "[2] BUILD REAL MEDIA DROPZONES"
cat > "$ASSETS/real_clips/README.txt" <<'EOF'
Put real generated video clips here.
Expected naming:
clip_001.mp4
clip_002.mp4
clip_003.mp4
clip_004.mp4
EOF

cat > "$ASSETS/real_audio/README.txt" <<'EOF'
Put real generated voice/audio here.
Suggested naming:
narration.wav
jarvis.wav
star_creator.wav
EOF

cat > "$ASSETS/real_music/README.txt" <<'EOF'
Put real generated music here.
Suggested naming:
arrival_theme.wav
transformation_theme.wav
broadcast_theme.wav
music_master.wav
EOF

echo
echo "[3] GENERATE MEDIA COLLECTION SCRIPT"
cat > "$PROJECT/provider_logs/collect_real_media.py" <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
out = base / "outputs"

clips_dir = base / "assets" / "real_clips"
audio_dir = base / "assets" / "real_audio"
music_dir = base / "assets" / "real_music"

clips = sorted([str(p) for p in clips_dir.glob("*.mp4")])
audio = sorted([str(p) for p in audio_dir.glob("*.wav")]) + sorted([str(p) for p in audio_dir.glob("*.mp3")])
music = sorted([str(p) for p in music_dir.glob("*.wav")]) + sorted([str(p) for p in music_dir.glob("*.mp3")])

summary = {
    "real_clips_found": clips,
    "real_audio_found": audio,
    "real_music_found": music,
    "ready_for_ffmpeg": len(clips) > 0 and len(audio) > 0 and len(music) > 0
}

(out / "real_media_inventory.json").write_text(json.dumps(summary, indent=2))
print("real media inventory generated")
PY

python "$PROJECT/provider_logs/collect_real_media.py"

echo
echo "[4] BUILD FFMPEG INPUT FILES"
python - <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
out = base / "outputs"
assets = base / "assets"

inv = json.loads((out / "real_media_inventory.json").read_text())

clips_list = assets / "final" / "clips_list.txt"
clips_list.parent.mkdir(parents=True, exist_ok=True)

with clips_list.open("w") as f:
    for clip in inv["real_clips_found"]:
        f.write(f"file '{Path(clip).resolve()}'\n")

ffmpeg_ready = {
    "clips_list": str(clips_list),
    "rough_cut": str((assets / "final" / "rough_cut.mp4").resolve()),
    "final_master": str((assets / "final" / "final_master.mp4").resolve()),
    "subbed_master": str((assets / "final" / "final_master_subbed.mp4").resolve()),
    "ready_for_ffmpeg": inv["ready_for_ffmpeg"]
}

(out / "ffmpeg_ready.json").write_text(json.dumps(ffmpeg_ready, indent=2))
print("ffmpeg ready file generated")
PY

echo
echo "[5] BUILD RENDER EXECUTION SCRIPT"
cat > "$PROJECT/provider_logs/run_ffmpeg_when_ready.sh" <<'EOF'
#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

PROJECT="studio_os/projects/anyone_can_be_a_star_episode"
ASSETS="$PROJECT/assets"
OUT="$PROJECT/outputs"

python "$PROJECT/provider_logs/collect_real_media.py" >/dev/null
python - <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
out = base / "outputs"
assets = base / "assets"
inv = json.loads((out / "real_media_inventory.json").read_text())

clips_list = assets / "final" / "clips_list.txt"
with clips_list.open("w") as f:
    for clip in inv["real_clips_found"]:
        f.write(f"file '{Path(clip).resolve()}'\n")
PY

READY=$(python - <<'PY'
import json
from pathlib import Path
p = Path("studio_os/projects/anyone_can_be_a_star_episode/outputs/real_media_inventory.json")
j = json.loads(p.read_text())
print("yes" if j["ready_for_ffmpeg"] else "no")
PY
)

if [ "$READY" != "yes" ]; then
  echo "Real media not ready yet."
  echo "Add at least one real clip, one audio file, and one music file."
  exit 0
fi

NARRATION=$(find "$ASSETS/real_audio" -maxdepth 1 \( -name 'narration.wav' -o -name 'narration.mp3' \) | head -n 1)
MUSIC=$(find "$ASSETS/real_music" -maxdepth 1 \( -name 'music_master.wav' -o -name 'music_master.mp3' -o -name '*.wav' -o -name '*.mp3' \) | head -n 1)

ffmpeg -f concat -safe 0 -i "$ASSETS/final/clips_list.txt" -c copy "$ASSETS/final/rough_cut.mp4"

if [ -n "$NARRATION" ] && [ -n "$MUSIC" ]; then
  ffmpeg -y -i "$ASSETS/final/rough_cut.mp4" -i "$NARRATION" -i "$MUSIC" \
    -map 0:v -map 1:a -map 2:a \
    -c:v copy -c:a aac \
    "$ASSETS/final/final_master.mp4"
else
  cp "$ASSETS/final/rough_cut.mp4" "$ASSETS/final/final_master.mp4"
fi

SUB="$HOME/aam_full_system/studio_os/projects/demo_episode/assets/subtitles/episode_en.srt"
if [ -f "$SUB" ]; then
  ffmpeg -y -i "$ASSETS/final/final_master.mp4" -i "$SUB" -c copy -c:s mov_text \
    "$ASSETS/final/final_master_subbed.mp4" || true
fi

echo "Render complete:"
ls -lh "$ASSETS/final" || true
EOF

chmod +x "$PROJECT/provider_logs/run_ffmpeg_when_ready.sh"

echo
echo "[6] BUILD PUBLISH HANDOFF"
python - <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
publish_dir = base / "assets" / "publish"
publish_dir.mkdir(parents=True, exist_ok=True)

handoff = {
    "project": "anyone_can_be_a_star_episode",
    "title": "Anyone Can Be a Star - Pilot",
    "publish_targets": [
        "public/streaming",
        "creator profile shelf",
        "featured episode slot"
    ],
    "expected_files": [
        "assets/final/final_master.mp4",
        "assets/final/final_master_subbed.mp4"
    ],
    "status": "ready_for_real_media_drop_and_render"
}

(publish_dir / "publish_handoff.json").write_text(json.dumps(handoff, indent=2))
print("publish handoff generated")
PY

echo
echo "[7] VERIFY"
find "$PROJECT/assets" -maxdepth 3 -type f | sort
echo
find "$PROJECT/outputs" -maxdepth 1 -type f | sort | tail -n 20

echo
echo "[8] FREEZE"
STAMP=$(date +%Y%m%d_%H%M%S)
tar -czf "snapshots/final/first_real_render_prep_${STAMP}.tar.gz" studio_os

echo
echo "FIRST REAL RENDER PREP READY"
echo "checkpoint: $STAMP"
echo
echo "NEXT:"
echo "1) drop real .mp4 clips into $ASSETS/real_clips"
echo "2) drop narration/voice into $ASSETS/real_audio"
echo "3) drop music into $ASSETS/real_music"
echo "4) run: bash $PROJECT/provider_logs/run_ffmpeg_when_ready.sh"
