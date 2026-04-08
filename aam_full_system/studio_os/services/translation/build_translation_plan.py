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
