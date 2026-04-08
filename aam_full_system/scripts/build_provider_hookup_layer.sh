#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== BUILD PROVIDER HOOKUP LAYER ==="

mkdir -p studio_os/{providers,rights,qc,costs,continuity,subtitles}
mkdir -p studio_os/services/{providers,translation,subtitles,qc,costs,rights,continuity}
mkdir -p studio_os/projects/demo_episode/assets/{subtitles,logs}
mkdir -p studio_os/projects/demo_episode/outputs

cat > studio_os/providers/providers.json <<'EOF'
{
  "video": {
    "primary": "runway",
    "backup": "kling",
    "asia_alt": "wan",
    "enabled": false
  },
  "voice": {
    "primary": "elevenlabs",
    "backup": "xtts",
    "enabled": false
  },
  "music": {
    "primary": "suno",
    "backup": "udio",
    "enabled": false
  },
  "translation": {
    "primary": "gpt_translation",
    "backup": "whisper_plus_xtts",
    "enabled": false
  }
}
EOF

cat > studio_os/services/continuity/build_continuity_bible.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")

bible = {
    "characters": {
        "Creator": {
            "look": "ambitious modern creator, clean futuristic styling",
            "voice": "human, warm, determined",
            "wardrobe": "sleek dark jacket with subtle neon trim"
        },
        "Jarvis": {
            "look": "holographic AI guide, blue-white glow",
            "voice": "calm, confident, cinematic",
            "wardrobe": "n/a holographic entity"
        }
    },
    "world": {
        "style": "cinematic holographic sci-fi",
        "lighting": "high contrast, volumetric glow, polished reflections",
        "camera_language": "wide establishers, medium reaction shots, confident push-ins"
    },
    "rules": [
        "Keep Jarvis visually consistent across all scenes",
        "Maintain same color palette across episode",
        "Do not change wardrobe without an in-story reason",
        "Use cinematic pacing, not random cuts"
    ]
}

(base / "outputs" / "continuity_bible.json").write_text(json.dumps(bible, indent=2))
print("continuity bible generated")
PY

cat > studio_os/services/rights/build_rights_log.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")

rights = {
    "status": "tracking_enabled",
    "policy": [
        "Use original, licensed, or permission-cleared music only",
        "Track provider used for each generated asset",
        "Log creator ownership and export rights"
    ],
    "assets": []
}

(base / "outputs" / "rights_log.json").write_text(json.dumps(rights, indent=2))
print("rights log generated")
PY

cat > studio_os/services/costs/build_cost_tracker.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")

tracker = {
    "currency": "USD",
    "episode_budget_cap": 100,
    "line_items": [
        {"category": "video_generation", "estimated": 0},
        {"category": "voice_generation", "estimated": 0},
        {"category": "music_generation", "estimated": 0},
        {"category": "translation", "estimated": 0},
        {"category": "final_export", "estimated": 0}
    ],
    "total_estimated": 0
}

(base / "outputs" / "cost_tracker.json").write_text(json.dumps(tracker, indent=2))
print("cost tracker generated")
PY

cat > studio_os/services/translation/build_translation_plan.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
voice_plan = json.loads((base / "outputs" / "voice_plan.json").read_text())

plan = {
    "source_language": "en",
    "targets": ["es", "ko", "ja"],
    "pipeline": [
        "speech_to_text",
        "translate_text",
        "text_to_speech",
        "subtitle_export"
    ],
    "voices": voice_plan.get("voices", [])
}

(base / "outputs" / "translation_plan.json").write_text(json.dumps(plan, indent=2))
print("translation plan generated")
PY

cat > studio_os/services/subtitles/build_subtitles_stub.py <<'PY'
from pathlib import Path
import json

base = Path("studio_os/projects/demo_episode")
sub_dir = base / "assets" / "subtitles"
sub_dir.mkdir(parents=True, exist_ok=True)

en = sub_dir / "episode_en.srt"
es = sub_dir / "episode_es.srt"
ko = sub_dir / "episode_ko.srt"
ja = sub_dir / "episode_ja.srt"

sample = """1
00:00:00,000 --> 00:00:04,000
Welcome to All American AI TV.

2
00:00:04,000 --> 00:00:08,000
Enter the marketplace and begin your journey.
"""

for f in [en, es, ko, ja]:
    f.write_text(sample)

(base / "outputs" / "subtitle_files.json").write_text(json.dumps({
    "files": [str(en), str(es), str(ko), str(ja)]
}, indent=2))
print("subtitle stubs generated")
PY

cat > studio_os/services/qc/build_qc_plan.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")

qc = {
    "checks": [
        "face consistency",
        "voice consistency",
        "music under dialogue",
        "subtitle presence",
        "shot order integrity",
        "final export exists"
    ],
    "pass_threshold": 0.85,
    "regenerate_if_failed": [
        "broken shot",
        "bad audio balance",
        "missing subtitle",
        "continuity drift"
    ]
}

(base / "outputs" / "qc_plan.json").write_text(json.dumps(qc, indent=2))
print("qc plan generated")
PY

cat > studio_os/services/providers/build_provider_requests.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
render_manifest = json.loads((base / "outputs" / "render_manifest.json").read_text())
voice_plan = json.loads((base / "outputs" / "voice_plan.json").read_text())
music_plan = json.loads((base / "outputs" / "music_plan.json").read_text())

requests = {
    "video_requests": render_manifest["clips"],
    "voice_requests": voice_plan["voices"],
    "music_requests": music_plan["tracks"],
    "status": "provider_requests_prepared"
}

(base / "outputs" / "provider_requests.json").write_text(json.dumps(requests, indent=2))
print("provider requests generated")
PY

cat > studio_os/services/providers/build_real_export_plan.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")

plan = {
    "inputs": {
        "clips": "assets/clips/",
        "audio": "assets/audio/",
        "music": "assets/music/",
        "subtitles": "assets/subtitles/"
    },
    "outputs": {
        "review_cut": "assets/post/review_cut.mp4",
        "final_master": "assets/post/final_master.mp4",
        "localized_versions": [
            "assets/post/final_master_es.mp4",
            "assets/post/final_master_ko.mp4",
            "assets/post/final_master_ja.mp4"
        ]
    },
    "engine": "ffmpeg_or_editor_backend"
}

(base / "outputs" / "real_export_plan.json").write_text(json.dumps(plan, indent=2))
print("real export plan generated")
PY

python studio_os/services/continuity/build_continuity_bible.py
python studio_os/services/rights/build_rights_log.py
python studio_os/services/costs/build_cost_tracker.py
python studio_os/services/translation/build_translation_plan.py
python studio_os/services/subtitles/build_subtitles_stub.py
python studio_os/services/qc/build_qc_plan.py
python studio_os/services/providers/build_provider_requests.py
python studio_os/services/providers/build_real_export_plan.py

echo
echo "=== VERIFY ==="
find studio_os/projects/demo_episode/outputs -maxdepth 1 -type f | sort
echo
find studio_os/projects/demo_episode/assets/subtitles -maxdepth 2 -type f | sort

echo
echo "=== FREEZE ==="
STAMP=$(date +%Y%m%d_%H%M%S)
tar -czf snapshots/final/provider_hookup_layer_${STAMP}.tar.gz studio_os

echo
echo "PROVIDER HOOKUP LAYER READY"
echo "checkpoint: $STAMP"
