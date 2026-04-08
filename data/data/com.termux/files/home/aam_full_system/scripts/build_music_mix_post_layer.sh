#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== BUILD MUSIC + MIX + POST LAYER ==="

mkdir -p studio_os/services/{music,post}
mkdir -p studio_os/projects/demo_episode/assets/{music,post}

cat > studio_os/services/music/make_music_plan.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
outline = json.loads((base / "outputs" / "outline.json").read_text())

music_plan = {
    "score_style": "cinematic futuristic hybrid",
    "tracks": [
        {
            "cue": "opening_theme",
            "scene": "Opening",
            "mood": "epic, mysterious, holographic",
            "duration_sec": 20
        },
        {
            "cue": "discovery_bed",
            "scene": "Development",
            "mood": "curious, uplifting, technological",
            "duration_sec": 30
        },
        {
            "cue": "finale_theme",
            "scene": "Resolution",
            "mood": "inspiring, victorious, forward-moving",
            "duration_sec": 20
        }
    ],
    "rights_note": "Only use original, licensed, or permission-cleared music."
}

(base / "outputs" / "music_plan.json").write_text(json.dumps(music_plan, indent=2))
print("music plan generated")
PY

cat > studio_os/services/music/generate_music_placeholders.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
music_plan = json.loads((base / "outputs" / "music_plan.json").read_text())

music_dir = base / "assets" / "music"
music_dir.mkdir(parents=True, exist_ok=True)

files = []
for track in music_plan["tracks"]:
    f = music_dir / f"{track['cue']}.txt"
    f.write_text(
        f"CUE={track['cue']}\n"
        f"SCENE={track['scene']}\n"
        f"MOOD={track['mood']}\n"
        f"DURATION_SEC={track['duration_sec']}\n"
    )
    files.append(str(f))

(base / "outputs" / "music_files.json").write_text(json.dumps({"files": files}, indent=2))
print("music placeholders generated")
PY

cat > studio_os/services/post/make_mix_plan.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")

mix_plan = {
    "dialogue_target": "-6 dB peak",
    "music_target": "-18 to -14 dB under dialogue",
    "sfx_target": "-12 to -8 dB peak depending on moment",
    "chain": [
        "dialogue cleanup",
        "noise reduction",
        "eq",
        "compression",
        "de-essing",
        "music ducking under speech",
        "limiter on final bus"
    ],
    "notes": [
        "Dialogue must always be intelligible",
        "Music should support emotion, not bury speech",
        "Final output should feel broadcast-ready"
    ]
}

(base / "outputs" / "mix_plan.json").write_text(json.dumps(mix_plan, indent=2))
print("mix plan generated")
PY

cat > studio_os/services/post/make_post_plan.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")

post_plan = {
    "steps": [
        "assemble clips in timeline order",
        "place narration and character voices",
        "add music cues",
        "add ambient effects and transitions",
        "balance levels",
        "apply mastering chain",
        "export review cut",
        "export final master"
    ],
    "deliverables": [
        "review_cut.mp4",
        "final_master.mp4",
        "audio_master.txt"
    ]
}

(base / "outputs" / "post_plan.json").write_text(json.dumps(post_plan, indent=2))
print("post plan generated")
PY

cat > studio_os/services/post/build_master_stub.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
music = json.loads((base / "outputs" / "music_files.json").read_text())["files"]
mix_plan = json.loads((base / "outputs" / "mix_plan.json").read_text())
post_plan = json.loads((base / "outputs" / "post_plan.json").read_text())

post_dir = base / "assets" / "post"
post_dir.mkdir(parents=True, exist_ok=True)

(post_dir / "review_cut.mp4.txt").write_text("REVIEW CUT PLACEHOLDER\n")
(post_dir / "final_master.mp4.txt").write_text("FINAL MASTER PLACEHOLDER\n")
(post_dir / "audio_master.txt").write_text(
    "AUDIO MASTER PLACEHOLDER\n"
    f"music_files={len(music)}\n"
    f"mix_chain_steps={len(mix_plan['chain'])}\n"
    f"post_steps={len(post_plan['steps'])}\n"
)

summary = {
    "status": "music_mix_post_ready",
    "music_files": len(music),
    "mix_chain_steps": len(mix_plan["chain"]),
    "post_steps": len(post_plan["steps"]),
    "next_step": "replace placeholders with real music generation, real audio mixing, and real final export"
}

(post_dir / "post_summary.json").write_text(json.dumps(summary, indent=2))
print("master/post stubs created")
PY

python studio_os/services/music/make_music_plan.py
python studio_os/services/music/generate_music_placeholders.py
python studio_os/services/post/make_mix_plan.py
python studio_os/services/post/make_post_plan.py
python studio_os/services/post/build_master_stub.py

echo
echo "=== VERIFY ==="
find studio_os/projects/demo_episode/assets/music -maxdepth 2 -type f | sort
find studio_os/projects/demo_episode/assets/post -maxdepth 2 -type f | sort
find studio_os/projects/demo_episode/outputs -maxdepth 1 -type f | sort

echo
echo "=== FREEZE ==="
STAMP=$(date +%Y%m%d_%H%M%S)
tar -czf snapshots/final/music_mix_post_${STAMP}.tar.gz studio_os

echo
echo "MUSIC + MIX + POST LAYER READY"
echo "checkpoint: $STAMP"
