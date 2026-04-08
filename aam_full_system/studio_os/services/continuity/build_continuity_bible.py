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
