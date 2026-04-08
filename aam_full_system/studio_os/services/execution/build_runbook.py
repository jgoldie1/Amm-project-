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
