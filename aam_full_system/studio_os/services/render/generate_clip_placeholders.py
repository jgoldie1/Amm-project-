import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
manifest = json.loads((base / "outputs" / "render_manifest.json").read_text())

clips_dir = base / "assets" / "clips"
clips_dir.mkdir(parents=True, exist_ok=True)

clips = []
for clip in manifest["clips"]:
    clip_file = clips_dir / f"clip_{clip['clip_id']:03d}.txt"
    clip_file.write_text(
        f"PLACEHOLDER_CLIP\n"
        f"clip_id={clip['clip_id']}\n"
        f"duration_sec={clip['duration_sec']}\n"
        f"prompt={clip['prompt']}\n"
    )
    clips.append({
        "clip_id": clip["clip_id"],
        "file": str(clip_file),
        "duration_sec": clip["duration_sec"]
    })

(base / "outputs" / "clips.json").write_text(json.dumps({"clips": clips}, indent=2))
print("clip placeholders generated")
