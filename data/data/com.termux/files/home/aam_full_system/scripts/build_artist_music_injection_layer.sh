#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== BUILD ARTIST MUSIC INJECTION LAYER ==="

PROJECT="studio_os/projects/anyone_can_be_a_star_episode"
mkdir -p "$PROJECT/assets"/{vocal_sessions,song_drafts,approved_soundtrack,mix_masters}
mkdir -p studio_os/services/{artist_music,soundtrack}

cat > studio_os/services/artist_music/build_artist_music_plan.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")

plan = {
    "artist": "Aniyah",
    "roles": [
        "lead vocal",
        "singing coach guidance",
        "studio performance direction"
    ],
    "deliverables": [
        "theme_song",
        "hook",
        "background_vocals",
        "soundtrack_stems",
        "final_vocal_master"
    ],
    "quality_target": "release-ready professional soundtrack",
    "note": "Use only original, licensed, or permission-cleared music and vocals."
}

(base / "outputs" / "artist_music_plan.json").write_text(json.dumps(plan, indent=2))
print("artist music plan generated")
PY

cat > studio_os/services/soundtrack/build_soundtrack_injection_plan.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")

plan = {
    "injection_points": [
        {"cue": "opening_theme", "placement": "intro sequence", "target": "background + vocal hook"},
        {"cue": "transformation_theme", "placement": "star transformation", "target": "full soundtrack lift"},
        {"cue": "broadcast_theme", "placement": "ending reveal", "target": "anthem finish"}
    ],
    "audio_flow": [
        "record vocals",
        "export stems",
        "mix with score",
        "master soundtrack",
        "inject into final render"
    ]
}

(base / "outputs" / "soundtrack_injection_plan.json").write_text(json.dumps(plan, indent=2))
print("soundtrack injection plan generated")
PY

cat > studio_os/services/soundtrack/build_artist_dropzones.py <<'PY'
from pathlib import Path
import json

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
assets = base / "assets"

readmes = {
    assets / "vocal_sessions" / "README.txt":
        "Put raw vocal takes here: lead_vocal.wav, hook.wav, background_vocals.wav",
    assets / "song_drafts" / "README.txt":
        "Put songwriter/demo drafts here: theme_song_demo.wav, hook_demo.wav",
    assets / "approved_soundtrack" / "README.txt":
        "Put approved soundtrack files here: opening_theme.wav, transformation_theme.wav, broadcast_theme.wav",
    assets / "mix_masters" / "README.txt":
        "Put final mixed/mastered soundtrack files here: soundtrack_master.wav, soundtrack_master.mp3"
}

for path, text in readmes.items():
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text)

summary = {
    "status": "artist_music_dropzones_ready",
    "next_step": "add real vocals, song drafts, approved soundtrack, and final masters"
}

(base / "outputs" / "artist_music_dropzones.json").write_text(json.dumps(summary, indent=2))
print("artist music dropzones generated")
PY

cat > studio_os/services/soundtrack/build_injection_runner_stub.py <<'PY'
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
runner = base / "provider_logs" / "inject_soundtrack_when_ready.sh"
runner.parent.mkdir(parents=True, exist_ok=True)

runner.write_text("""#!/usr/bin/env bash
set -e
cd "$HOME/aam_full_system"

PROJECT="studio_os/projects/anyone_can_be_a_star_episode"
FINAL="$PROJECT/assets/final/final_master.mp4"
MUSIC="$PROJECT/assets/mix_masters/soundtrack_master.wav"

if [ ! -f "$FINAL" ]; then
  echo "Final master video not ready yet."
  exit 0
fi

if [ ! -f "$MUSIC" ]; then
  echo "Soundtrack master not ready yet."
  exit 0
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
