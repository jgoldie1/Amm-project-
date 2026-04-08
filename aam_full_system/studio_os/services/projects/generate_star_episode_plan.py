import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
req = json.loads((base / "inputs" / "request.json").read_text())

outline = {
    "title": req["title"],
    "acts": [
        {"name": "Arrival", "summary": "A new creator enters the AI TV system."},
        {"name": "Transformation", "summary": "The creator is guided into a star identity with cinematic visuals."},
        {"name": "Broadcast", "summary": "The creator appears on the streaming wall and invites others to join."}
    ]
}

shotlist = {
    "title": req["title"],
    "shots": [
        {"scene": 1, "shot": 1, "type": "wide", "desc": "A creator walks onto a futuristic stage surrounded by holographic lights."},
        {"scene": 1, "shot": 2, "type": "medium", "desc": "Jarvis appears and welcomes the creator into AI TV."},
        {"scene": 2, "shot": 1, "type": "close", "desc": "The creator transforms into a polished star persona."},
        {"scene": 3, "shot": 1, "type": "wide", "desc": "The creator is featured on a giant streaming wall as the audience watches."}
    ]
}

render_manifest = {
    "clips": [
        {"clip_id": 1, "prompt": "Futuristic creator stage, holographic lights, cinematic entrance, polished sci-fi visuals", "duration_sec": 8},
        {"clip_id": 2, "prompt": "AI guide appears beside a rising creator star, premium cinematic composition", "duration_sec": 8},
        {"clip_id": 3, "prompt": "Creator transformation sequence, inspiring broadcast-energy visuals", "duration_sec": 10},
        {"clip_id": 4, "prompt": "Streaming wall reveal, creator becomes featured star, epic finale", "duration_sec": 8}
    ]
}

voice_plan = {
    "voices": [
        {"character": "Star Creator", "style": "charismatic, inspiring, human"},
        {"character": "Jarvis", "style": "calm, cinematic, confident"}
    ],
    "narration": [
        "Anyone can enter this platform.",
        "Anyone can create.",
        "Anyone can become a star."
    ]
}

music_plan = {
    "score_style": "cinematic inspirational electronic",
    "tracks": [
        {"cue": "arrival_theme", "mood": "anticipation and wonder", "duration_sec": 20},
        {"cue": "transformation_theme", "mood": "uplifting and powerful", "duration_sec": 25},
        {"cue": "broadcast_theme", "mood": "victorious and expansive", "duration_sec": 20}
    ]
}

(base / "outputs" / "outline.json").write_text(json.dumps(outline, indent=2))
(base / "outputs" / "shotlist.json").write_text(json.dumps(shotlist, indent=2))
(base / "outputs" / "render_manifest.json").write_text(json.dumps(render_manifest, indent=2))
(base / "outputs" / "voice_plan.json").write_text(json.dumps(voice_plan, indent=2))
(base / "outputs" / "music_plan.json").write_text(json.dumps(music_plan, indent=2))
print("star episode plan generated")
