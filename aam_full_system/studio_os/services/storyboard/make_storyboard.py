import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
shotlist = json.loads((base / "outputs" / "shotlist.json").read_text())

frames = []
for shot in shotlist["shots"]:
    frames.append({
        "scene": shot["scene"],
        "shot": shot["shot"],
        "image_prompt": f"Storyboard frame: {shot['desc']}, cinematic sci-fi, high contrast, holographic world"
    })

(base / "outputs" / "storyboard.json").write_text(json.dumps({"frames": frames}, indent=2))
print("storyboard generated")
