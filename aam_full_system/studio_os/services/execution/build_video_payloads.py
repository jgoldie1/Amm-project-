import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
manifest = json.loads((base / "outputs" / "render_manifest.json").read_text())

payloads = []
payload_dir = base / "provider_payloads"
payload_dir.mkdir(parents=True, exist_ok=True)

for clip in manifest["clips"]:
    payload = {
        "provider_type": "video",
        "clip_id": clip["clip_id"],
        "duration_sec": clip["duration_sec"],
        "prompt": clip["prompt"],
        "project": "anyone_can_be_a_star_episode",
        "status": "ready_for_manual_or_api_submission"
    }
    p = payload_dir / f"video_clip_{clip['clip_id']:03d}.json"
    p.write_text(json.dumps(payload, indent=2))
    payloads.append(str(p))

(base / "outputs" / "video_payload_files.json").write_text(json.dumps({"files": payloads}, indent=2))
print("video payloads generated")
