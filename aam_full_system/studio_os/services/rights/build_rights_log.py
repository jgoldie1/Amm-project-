import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")

rights = {
    "status": "tracking_enabled",
    "policy": [
        "Use original, licensed, or permission-cleared music only",
        "Track provider used for each generated asset",
        "Log creator ownership and export rights"
    ],
    "assets": []
}

(base / "outputs" / "rights_log.json").write_text(json.dumps(rights, indent=2))
print("rights log generated")
