#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== BUILD ANYONE CAN BE A STAR RENDERING LAYER ==="

mkdir -p studio_os/services/{casting,projects,render_queue}
mkdir -p studio_os/creators/anyone_can_be_a_star
mkdir -p studio_os/projects/anyone_can_be_a_star_episode/{inputs,outputs,assets/{clips,audio,music,final,subtitles,post},state}

cat > studio_os/services/casting/build_star_profile.py <<'PY'
import json
from pathlib import Path

creator_name = "Anyone Can Be a Star"
base = Path("studio_os/projects/anyone_can_be_a_star_episode")

profile = {
    "creator_name": creator_name,
    "show_title": "Anyone Can Be a Star",
    "role": "featured creator",
    "persona": {
        "tone": "inspiring, cinematic, confident",
        "look": "modern creator star with polished futuristic styling",
        "voice": "clear, charismatic, emotionally strong"
    }
}

(base / "outputs" / "star_profile.json").write_text(json.dumps(profile, indent=2))
print("star profile generated")
PY

cat > studio_os/services/projects/build_star_episode_request.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")

request = {
    "title": "Anyone Can Be a Star - Pilot",
    "theme": "creator transformation into a streaming star",
    "length_minutes": 4,
    "rating": "PG",
    "style": "cinematic holographic sci-fi",
    "characters": ["Star Creator", "Jarvis"],
    "locations": ["Creator Stage", "AI TV Portal", "Streaming Wall"],
    "goal": "show how anyone can join, create, and become a star on the platform"
}

(base / "inputs" / "request.json").write_text(json.dumps(request, indent=2))
print("star episode request generated")
PY

cat > studio_os/services/projects/generate_star_episode_plan.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
req = json.loads((base / "inputs" / "request.json").read_text())

outline = {
    "title": req["title"],
    "acts": [
        {"name": "Arrival", "summary": "A new creator enters the AI TV system."},
        {"name": "Transformation", "summary": "The creator is guided into a star identity with cinematic visuals."},
        {"name": "Broadcast", "summary": "The creator appears on the streaming wall and invites others to join."}
    ]
}

shotlist = {
    "title": req["title"],
    "shots": [
        {"scene": 1, "shot": 1, "type": "wide", "desc": "A creator walks onto a futuristic stage surrounded by holographic lights."},
        {"scene": 1, "shot": 2, "type": "medium", "desc": "Jarvis appears and welcomes the creator into AI TV."},
        {"scene": 2, "shot": 1, "type": "close", "desc": "The creator transforms into a polished star persona."},
        {"scene": 3, "shot": 1, "type": "wide", "desc": "The creator is featured on a giant streaming wall as the audience watches."}
    ]
}

render_manifest = {
    "clips": [
        {"clip_id": 1, "prompt": "Futuristic creator stage, holographic lights, cinematic entrance, polished sci-fi visuals", "duration_sec": 8},
        {"clip_id": 2, "prompt": "AI guide appears beside a rising creator star, premium cinematic composition", "duration_sec": 8},
        {"clip_id": 3, "prompt": "Creator transformation sequence, inspiring broadcast-energy visuals", "duration_sec": 10},
        {"clip_id": 4, "prompt": "Streaming wall reveal, creator becomes featured star, epic finale", "duration_sec": 8}
    ]
}

voice_plan = {
    "voices": [
        {"character": "Star Creator", "style": "charismatic, inspiring, human"},
        {"character": "Jarvis", "style": "calm, cinematic, confident"}
    ],
    "narration": [
        "Anyone can enter this platform.",
        "Anyone can create.",
        "Anyone can become a star."
    ]
}

music_plan = {
    "score_style": "cinematic inspirational electronic",
    "tracks": [
        {"cue": "arrival_theme", "mood": "anticipation and wonder", "duration_sec": 20},
        {"cue": "transformation_theme", "mood": "uplifting and powerful", "duration_sec": 25},
        {"cue": "broadcast_theme", "mood": "victorious and expansive", "duration_sec": 20}
    ]
}

(base / "outputs" / "outline.json").write_text(json.dumps(outline, indent=2))
(base / "outputs" / "shotlist.json").write_text(json.dumps(shotlist, indent=2))
(base / "outputs" / "render_manifest.json").write_text(json.dumps(render_manifest, indent=2))
(base / "outputs" / "voice_plan.json").write_text(json.dumps(voice_plan, indent=2))
(base / "outputs" / "music_plan.json").write_text(json.dumps(music_plan, indent=2))
print("star episode plan generated")
PY

cat > studio_os/services/render_queue/build_star_render_queue.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
manifest = json.loads((base / "outputs" / "render_manifest.json").read_text())

queue = {
    "project": "anyone_can_be_a_star_episode",
    "jobs": [
        {
            "job_id": f"render_{clip['clip_id']:03d}",
            "type": "video_render",
            "clip_id": clip["clip_id"],
            "duration_sec": clip["duration_sec"],
            "prompt": clip["prompt"],
            "status": "queued"
        }
        for clip in manifest["clips"]
    ]
}

(base / "outputs" / "render_queue.json").write_text(json.dumps(queue, indent=2))
print("render queue generated")
PY

cat > studio_os/services/render_queue/build_star_render_outputs.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
queue = json.loads((base / "outputs" / "render_queue.json").read_text())

clips_dir = base / "assets" / "clips"
clips_dir.mkdir(parents=True, exist_ok=True)

outputs = []
for job in queue["jobs"]:
    f = clips_dir / f"{job['job_id']}.txt"
    f.write_text(
        f"RENDER PLACEHOLDER\n"
        f"job_id={job['job_id']}\n"
        f"clip_id={job['clip_id']}\n"
        f"prompt={job['prompt']}\n"
        f"status=ready_for_provider_hookup\n"
    )
    outputs.append(str(f))

(base / "outputs" / "rendered_clips.json").write_text(json.dumps({"files": outputs}, indent=2))
print("render output placeholders generated")
PY

cat > studio_os/services/render_queue/build_star_final_stub.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
rendered = json.loads((base / "outputs" / "rendered_clips.json").read_text())["files"]

final_dir = base / "assets" / "final"
final_dir.mkdir(parents=True, exist_ok=True)

summary = {
    "project": "anyone_can_be_a_star_episode",
    "clips_ready": len(rendered),
    "status": "ready_for_real_video_voice_music_export",
    "next_step": "connect real providers and export final episode"
}

(final_dir / "anyone_can_be_a_star_final_stub.json").write_text(json.dumps(summary, indent=2))
(final_dir / "anyone_can_be_a_star_final.mp4.txt").write_text(
    "FINAL STAR EPISODE PLACEHOLDER\n"
    "This will become the real exported episode for Anyone Can Be a Star.\n"
)
print("star final stub generated")
PY

python studio_os/services/casting/build_star_profile.py
python studio_os/services/projects/build_star_episode_request.py
python studio_os/services/projects/generate_star_episode_plan.py
python studio_os/services/render_queue/build_star_render_queue.py
python studio_os/services/render_queue/build_star_render_outputs.py
python studio_os/services/render_queue/build_star_final_stub.py

echo
echo "=== VERIFY ==="
find studio_os/projects/anyone_can_be_a_star_episode -maxdepth 4 -type f | sort

echo
echo "=== FREEZE ==="
STAMP=$(date +%Y%m%d_%H%M%S)
tar -czf snapshots/final/anyone_can_be_a_star_rendering_${STAMP}.tar.gz studio_os

echo
echo "ANYONE CAN BE A STAR RENDERING READY"
echo "checkpoint: $STAMP"
