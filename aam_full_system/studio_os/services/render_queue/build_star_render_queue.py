import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
manifest = json.loads((base / "outputs" / "render_manifest.json").read_text())

queue = {
    "project": "anyone_can_be_a_star_episode",
    "jobs": [
        {
            "job_id": f"render_{clip['clip_id']:03d}",
            "type": "video_render",
            "clip_id": clip["clip_id"],
            "duration_sec": clip["duration_sec"],
            "prompt": clip["prompt"],
            "status": "queued"
        }
        for clip in manifest["clips"]
    ]
}

(base / "outputs" / "render_queue.json").write_text(json.dumps(queue, indent=2))
print("render queue generated")
