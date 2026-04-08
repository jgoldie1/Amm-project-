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
