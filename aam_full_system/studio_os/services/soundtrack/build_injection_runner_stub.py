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
