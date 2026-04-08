#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== BUILD REAL PROVIDER EXECUTION LAYER ==="

mkdir -p studio_os/services/{execution,env,ffmpeg}
mkdir -p studio_os/projects/anyone_can_be_a_star_episode/{provider_payloads,provider_logs}
mkdir -p studio_os/config

cat > studio_os/config/provider_env.template <<'EOF'
# Fill these in later with your real provider credentials
RUNWAY_API_KEY=
KLING_API_KEY=
WAN_API_KEY=
ELEVENLABS_API_KEY=
XTTS_ENABLED=false
SUNO_API_KEY=
UDIO_API_KEY=
OPENAI_API_KEY=
FFMPEG_BIN=ffmpeg
EOF

cat > studio_os/services/env/check_provider_env.py <<'PY'
import os, json
from pathlib import Path

keys = [
    "RUNWAY_API_KEY",
    "KLING_API_KEY",
    "WAN_API_KEY",
    "ELEVENLABS_API_KEY",
    "SUNO_API_KEY",
    "UDIO_API_KEY",
    "OPENAI_API_KEY",
]

status = {k: bool(os.getenv(k)) for k in keys}
status["FFMPEG_BIN"] = os.getenv("FFMPEG_BIN", "ffmpeg")
status["ready_count"] = sum(1 for v in status.values() if v is True)

out = Path("studio_os/projects/anyone_can_be_a_star_episode/outputs/provider_env_status.json")
out.write_text(json.dumps(status, indent=2))
print("provider env status generated")
PY

cat > studio_os/services/execution/build_video_payloads.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
manifest = json.loads((base / "outputs" / "render_manifest.json").read_text())

payloads = []
payload_dir = base / "provider_payloads"
payload_dir.mkdir(parents=True, exist_ok=True)

for clip in manifest["clips"]:
    payload = {
        "provider_type": "video",
        "clip_id": clip["clip_id"],
        "duration_sec": clip["duration_sec"],
        "prompt": clip["prompt"],
        "project": "anyone_can_be_a_star_episode",
        "status": "ready_for_manual_or_api_submission"
    }
    p = payload_dir / f"video_clip_{clip['clip_id']:03d}.json"
    p.write_text(json.dumps(payload, indent=2))
    payloads.append(str(p))

(base / "outputs" / "video_payload_files.json").write_text(json.dumps({"files": payloads}, indent=2))
print("video payloads generated")
PY

cat > studio_os/services/execution/build_voice_payloads.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
voice_plan = json.loads((base / "outputs" / "voice_plan.json").read_text())

payloads = []
payload_dir = base / "provider_payloads"
payload_dir.mkdir(parents=True, exist_ok=True)

for i, voice in enumerate(voice_plan["voices"], start=1):
    payload = {
        "provider_type": "voice",
        "voice_id": i,
        "character": voice["character"],
        "style": voice["style"],
        "project": "anyone_can_be_a_star_episode",
        "status": "ready_for_manual_or_api_submission"
    }
    p = payload_dir / f"voice_{voice['character'].lower().replace(' ','_')}.json"
    p.write_text(json.dumps(payload, indent=2))
    payloads.append(str(p))

(base / "outputs" / "voice_payload_files.json").write_text(json.dumps({"files": payloads}, indent=2))
print("voice payloads generated")
PY

cat > studio_os/services/execution/build_music_payloads.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
music_plan = json.loads((base / "outputs" / "music_plan.json").read_text())

payloads = []
payload_dir = base / "provider_payloads"
payload_dir.mkdir(parents=True, exist_ok=True)

for i, track in enumerate(music_plan["tracks"], start=1):
    payload = {
        "provider_type": "music",
        "cue": track["cue"],
        "mood": track["mood"],
        "duration_sec": track["duration_sec"],
        "project": "anyone_can_be_a_star_episode",
        "status": "ready_for_manual_or_api_submission"
    }
    p = payload_dir / f"music_{i:03d}_{track['cue']}.json"
    p.write_text(json.dumps(payload, indent=2))
    payloads.append(str(p))

(base / "outputs" / "music_payload_files.json").write_text(json.dumps({"files": payloads}, indent=2))
print("music payloads generated")
PY

cat > studio_os/services/execution/build_translation_payloads.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")

payload = {
    "provider_type": "translation",
    "source_language": "en",
    "target_languages": ["es", "ko", "ja"],
    "deliverables": ["dub_audio", "subtitle_files", "localized_final_exports"],
    "project": "anyone_can_be_a_star_episode",
    "status": "ready_for_manual_or_api_submission"
}

p = base / "provider_payloads" / "translation.json"
p.write_text(json.dumps(payload, indent=2))

(base / "outputs" / "translation_payload_file.json").write_text(json.dumps({"file": str(p)}, indent=2))
print("translation payload generated")
PY

cat > studio_os/services/ffmpeg/build_export_commands.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
clips = json.loads((base / "outputs" / "rendered_clips.json").read_text())["files"]

cmds = {
    "notes": [
        "Replace placeholder .txt files with real media files before running ffmpeg.",
        "These are command templates only."
    ],
    "commands": [
        "ffmpeg -f concat -safe 0 -i clips_list.txt -c copy rough_cut.mp4",
        "ffmpeg -i rough_cut.mp4 -i narration.wav -i music.wav -map 0:v -map 1:a -map 2:a -c:v copy -c:a aac final_master.mp4",
        "ffmpeg -i final_master.mp4 -i episode_en.srt -c copy -c:s mov_text final_master_subbed.mp4"
    ],
    "clip_placeholders_count": len(clips)
}

out = base / "outputs" / "ffmpeg_commands.json"
out.write_text(json.dumps(cmds, indent=2))
print("ffmpeg command templates generated")
PY

cat > studio_os/services/execution/build_runbook.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")

runbook = {
    "step_1": "Fill provider_env.template or export real API keys in shell",
    "step_2": "Replace placeholder clip/audio/music files with real generated media",
    "step_3": "Submit JSON payloads to chosen providers or use them in your own API scripts",
    "step_4": "Render final episode with ffmpeg/editor backend",
    "step_5": "Generate localized versions and subtitles",
    "step_6": "Run QC before publishing"
}

(base / "outputs" / "provider_runbook.json").write_text(json.dumps(runbook, indent=2))
print("provider runbook generated")
PY

python studio_os/services/env/check_provider_env.py
python studio_os/services/execution/build_video_payloads.py
python studio_os/services/execution/build_voice_payloads.py
python studio_os/services/execution/build_music_payloads.py
python studio_os/services/execution/build_translation_payloads.py
python studio_os/services/ffmpeg/build_export_commands.py
python studio_os/services/execution/build_runbook.py

echo
echo "=== VERIFY ==="
find studio_os/projects/anyone_can_be_a_star_episode/provider_payloads -maxdepth 2 -type f | sort
echo
find studio_os/projects/anyone_can_be_a_star_episode/outputs -maxdepth 1 -type f | sort | tail -n 20

echo
echo "=== FREEZE ==="
STAMP=$(date +%Y%m%d_%H%M%S)
tar -czf snapshots/final/real_provider_execution_${STAMP}.tar.gz studio_os

echo
echo "REAL PROVIDER EXECUTION LAYER READY"
echo "checkpoint: $STAMP"
