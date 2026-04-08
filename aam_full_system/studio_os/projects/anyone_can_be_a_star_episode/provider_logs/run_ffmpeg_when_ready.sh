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
