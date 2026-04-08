import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
req = json.loads((base / "inputs" / "request.json").read_text())

outline = {
    "title": req["title"],
    "theme": req["theme"],
    "goal": req["goal"],
    "acts": [
        {"name": "Hook", "summary": "A creator sees the holographic gateway open."},
        {"name": "Discovery", "summary": "Jarvis explains the marketplace and Life World."},
        {"name": "Call To Action", "summary": "The creator enters the system and invites others."}
    ]
}

shotlist = {
    "title": req["title"],
    "shots": [
        {"scene": 1, "shot": 1, "type": "wide", "desc": "Glowing city-scale marketplace gate opens."},
        {"scene": 1, "shot": 2, "type": "medium", "desc": "Creator reacts to floating UI and portal light."},
        {"scene": 2, "shot": 1, "type": "close", "desc": "Jarvis hologram appears and welcomes the creator."},
        {"scene": 3, "shot": 1, "type": "wide", "desc": "Creator steps into Life World portal."}
    ]
}

prompts = {
    "video_prompts": [
        "Cinematic futuristic holographic marketplace gate opening, high contrast, volumetric light, realistic CGI, smooth camera move",
        "AI guide hologram appears beside creator, neon interface, crisp sci-fi production design",
        "Creator enters portal into Life World, epic glow, dramatic cinematic atmosphere"
    ],
    "voice_prompts": [
        "Calm confident AI guide voice welcoming a creator into a futuristic marketplace world"
    ]
}

(base / "outputs").mkdir(parents=True, exist_ok=True)
(base / "outputs" / "outline.json").write_text(json.dumps(outline, indent=2))
(base / "outputs" / "shotlist.json").write_text(json.dumps(shotlist, indent=2))
(base / "outputs" / "prompts.json").write_text(json.dumps(prompts, indent=2))
print("episode foundation generated")
