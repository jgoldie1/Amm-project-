import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")

request = {
    "title": "Anyone Can Be a Star - Pilot",
    "theme": "creator transformation into a streaming star",
    "length_minutes": 4,
    "rating": "PG",
    "style": "cinematic holographic sci-fi",
    "characters": ["Star Creator", "Jarvis"],
    "locations": ["Creator Stage", "AI TV Portal", "Streaming Wall"],
    "goal": "show how anyone can join, create, and become a star on the platform"
}

(base / "inputs" / "request.json").write_text(json.dumps(request, indent=2))
print("star episode request generated")
