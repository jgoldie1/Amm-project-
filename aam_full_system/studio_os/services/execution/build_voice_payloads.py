import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
voice_plan = json.loads((base / "outputs" / "voice_plan.json").read_text())

payloads = []
payload_dir = base / "provider_payloads"
payload_dir.mkdir(parents=True, exist_ok=True)

for i, voice in enumerate(voice_plan["voices"], start=1):
    payload = {
        "provider_type": "voice",
        "voice_id": i,
        "character": voice["character"],
        "style": voice["style"],
        "project": "anyone_can_be_a_star_episode",
        "status": "ready_for_manual_or_api_submission"
    }
    p = payload_dir / f"voice_{voice['character'].lower().replace(' ','_')}.json"
    p.write_text(json.dumps(payload, indent=2))
    payloads.append(str(p))

(base / "outputs" / "voice_payload_files.json").write_text(json.dumps({"files": payloads}, indent=2))
print("voice payloads generated")
