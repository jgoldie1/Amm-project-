import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
render_manifest = json.loads((base / "outputs" / "render_manifest.json").read_text())
voice_plan = json.loads((base / "outputs" / "voice_plan.json").read_text())
music_plan = json.loads((base / "outputs" / "music_plan.json").read_text())

requests = {
    "video_requests": render_manifest["clips"],
    "voice_requests": voice_plan["voices"],
    "music_requests": music_plan["tracks"],
    "status": "provider_requests_prepared"
}

(base / "outputs" / "provider_requests.json").write_text(json.dumps(requests, indent=2))
print("provider requests generated")
