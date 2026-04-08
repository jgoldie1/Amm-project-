#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== BUILD RENDER OUTPUT LAYER ==="

mkdir -p studio_os/services/{render,audio,export}
mkdir -p studio_os/projects/demo_episode/assets/{clips,audio,final}

cat > studio_os/services/render/generate_clip_placeholders.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
manifest = json.loads((base / "outputs" / "render_manifest.json").read_text())

clips_dir = base / "assets" / "clips"
clips_dir.mkdir(parents=True, exist_ok=True)

clips = []
for clip in manifest["clips"]:
    clip_file = clips_dir / f"clip_{clip['clip_id']:03d}.txt"
    clip_file.write_text(
        f"PLACEHOLDER_CLIP\n"
        f"clip_id={clip['clip_id']}\n"
        f"duration_sec={clip['duration_sec']}\n"
        f"prompt={clip['prompt']}\n"
    )
    clips.append({
        "clip_id": clip["clip_id"],
        "file": str(clip_file),
        "duration_sec": clip["duration_sec"]
    })

(base / "outputs" / "clips.json").write_text(json.dumps({"clips": clips}, indent=2))
print("clip placeholders generated")
PY

cat > studio_os/services/audio/generate_audio_placeholders.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
voice_plan = json.loads((base / "outputs" / "voice_plan.json").read_text())

audio_dir = base / "assets" / "audio"
audio_dir.mkdir(parents=True, exist_ok=True)

files = []

narration_file = audio_dir / "narration.txt"
narration_file.write_text("\n".join(voice_plan.get("narration", [])))
files.append(str(narration_file))

for voice in voice_plan.get("voices", []):
    vf = audio_dir / f"{voice['character'].lower()}_voice.txt"
    vf.write_text(f"character={voice['character']}\nstyle={voice['style']}\n")
    files.append(str(vf))

(base / "outputs" / "audio_files.json").write_text(json.dumps({"files": files}, indent=2))
print("audio placeholders generated")
PY

cat > studio_os/services/export/build_final_episode_stub.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
clips = json.loads((base / "outputs" / "clips.json").read_text())["clips"]
audio = json.loads((base / "outputs" / "audio_files.json").read_text())["files"]
edit_plan = json.loads((base / "outputs" / "edit_plan.json").read_text())

final_dir = base / "assets" / "final"
final_dir.mkdir(parents=True, exist_ok=True)

summary = {
    "status": "render_output_layer_ready",
    "clips_count": len(clips),
    "audio_files_count": len(audio),
    "timeline_items": len(edit_plan["timeline"]),
    "next_step": "replace placeholders with real video, voice, and ffmpeg export"
}

(final_dir / "final_episode_stub.json").write_text(json.dumps(summary, indent=2))
(final_dir / "final_episode.mp4.txt").write_text(
    "FINAL EPISODE PLACEHOLDER\n"
    "This is where the real exported episode file will go.\n"
)
print("final episode stub created")
PY

python studio_os/services/render/generate_clip_placeholders.py
python studio_os/services/audio/generate_audio_placeholders.py
python studio_os/services/export/build_final_episode_stub.py

echo
echo "=== VERIFY ==="
find studio_os/projects/demo_episode/assets -maxdepth 3 -type f | sort
find studio_os/projects/demo_episode/outputs -maxdepth 1 -type f | sort

echo
echo "=== FREEZE ==="
STAMP=$(date +%Y%m%d_%H%M%S)
tar -czf snapshots/final/render_output_layer_${STAMP}.tar.gz studio_os

echo
echo "RENDER OUTPUT LAYER READY"
echo "checkpoint: $STAMP"
