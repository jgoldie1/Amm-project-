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
