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
