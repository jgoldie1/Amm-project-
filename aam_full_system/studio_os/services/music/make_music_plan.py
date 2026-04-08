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
