import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")

payload = {
    "provider_type": "translation",
    "source_language": "en",
    "target_languages": ["es", "ko", "ja"],
    "deliverables": ["dub_audio", "subtitle_files", "localized_final_exports"],
    "project": "anyone_can_be_a_star_episode",
    "status": "ready_for_manual_or_api_submission"
}

p = base / "provider_payloads" / "translation.json"
p.write_text(json.dumps(payload, indent=2))

(base / "outputs" / "translation_payload_file.json").write_text(json.dumps({"file": str(p)}, indent=2))
print("translation payload generated")
