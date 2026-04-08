import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
manifest = json.loads((base / "outputs" / "render_manifest.json").read_text())

timeline = []
t = 0
for clip in manifest["clips"]:
    timeline.append({
        "clip_id": clip["clip_id"],
        "start_sec": t,
        "duration_sec": clip["duration_sec"],
        "transition": "cut"
    })
    t += clip["duration_sec"]

(base / "outputs" / "edit_plan.json").write_text(json.dumps({"timeline": timeline}, indent=2))
print("edit plan generated")
