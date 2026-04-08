import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
prompts = json.loads((base / "outputs" / "prompts.json").read_text())

manifest = {
    "clips": [
        {"clip_id": i + 1, "prompt": p, "duration_sec": 8}
        for i, p in enumerate(prompts["video_prompts"])
    ]
}

(base / "outputs" / "render_manifest.json").write_text(json.dumps(manifest, indent=2))
print("render manifest generated")
