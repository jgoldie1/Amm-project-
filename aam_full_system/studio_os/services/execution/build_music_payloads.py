import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
music_plan = json.loads((base / "outputs" / "music_plan.json").read_text())

payloads = []
payload_dir = base / "provider_payloads"
payload_dir.mkdir(parents=True, exist_ok=True)

for i, track in enumerate(music_plan["tracks"], start=1):
    payload = {
        "provider_type": "music",
        "cue": track["cue"],
        "mood": track["mood"],
        "duration_sec": track["duration_sec"],
        "project": "anyone_can_be_a_star_episode",
        "status": "ready_for_manual_or_api_submission"
    }
    p = payload_dir / f"music_{i:03d}_{track['cue']}.json"
    p.write_text(json.dumps(payload, indent=2))
    payloads.append(str(p))

(base / "outputs" / "music_payload_files.json").write_text(json.dumps({"files": payloads}, indent=2))
print("music payloads generated")
