#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== BUILD NEXT PRODUCTION LAYER ==="

mkdir -p studio_os/services/{storyboard,audio,render,editor}
mkdir -p studio_os/projects/demo_episode/assets/{storyboards,clips,audio,final}

cat > studio_os/services/storyboard/make_storyboard.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
shotlist = json.loads((base / "outputs" / "shotlist.json").read_text())

frames = []
for shot in shotlist["shots"]:
    frames.append({
        "scene": shot["scene"],
        "shot": shot["shot"],
        "image_prompt": f"Storyboard frame: {shot['desc']}, cinematic sci-fi, high contrast, holographic world"
    })

(base / "outputs" / "storyboard.json").write_text(json.dumps({"frames": frames}, indent=2))
print("storyboard generated")
PY

cat > studio_os/services/audio/make_voice_plan.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
outline = json.loads((base / "outputs" / "outline.json").read_text())

voice_plan = {
    "voices": [
        {"character": "Jarvis", "style": "calm, confident, cinematic"},
        {"character": "Creator", "style": "curious, human, ambitious"}
    ],
    "narration": [act["summary"] for act in outline["acts"]]
}

(base / "outputs" / "voice_plan.json").write_text(json.dumps(voice_plan, indent=2))
print("voice plan generated")
PY

cat > studio_os/services/render/make_render_manifest.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
prompts = json.loads((base / "outputs" / "prompts.json").read_text())

manifest = {
    "clips": [
        {"clip_id": i + 1, "prompt": p, "duration_sec": 8}
        for i, p in enumerate(prompts["video_prompts"])
    ]
}

(base / "outputs" / "render_manifest.json").write_text(json.dumps(manifest, indent=2))
print("render manifest generated")
PY

cat > studio_os/services/editor/make_edit_plan.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
manifest = json.loads((base / "outputs" / "render_manifest.json").read_text())

timeline = []
t = 0
for clip in manifest["clips"]:
    timeline.append({
        "clip_id": clip["clip_id"],
        "start_sec": t,
        "duration_sec": clip["duration_sec"],
        "transition": "cut"
    })
    t += clip["duration_sec"]

(base / "outputs" / "edit_plan.json").write_text(json.dumps({"timeline": timeline}, indent=2))
print("edit plan generated")
PY

python studio_os/services/storyboard/make_storyboard.py
python studio_os/services/audio/make_voice_plan.py
python studio_os/services/render/make_render_manifest.py
python studio_os/services/editor/make_edit_plan.py

echo
echo "=== VERIFY ==="
find studio_os/projects/demo_episode/outputs -maxdepth 1 -type f | sort

echo
echo "=== FREEZE ==="
STAMP=$(date +%Y%m%d_%H%M%S)
tar -czf snapshots/final/production_layer_${STAMP}.tar.gz studio_os

echo
echo "PRODUCTION LAYER READY"
echo "checkpoint: $STAMP"
