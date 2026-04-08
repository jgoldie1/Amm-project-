import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")

qc = {
    "checks": [
        "face consistency",
        "voice consistency",
        "music under dialogue",
        "subtitle presence",
        "shot order integrity",
        "final export exists"
    ],
    "pass_threshold": 0.85,
    "regenerate_if_failed": [
        "broken shot",
        "bad audio balance",
        "missing subtitle",
        "continuity drift"
    ]
}

(base / "outputs" / "qc_plan.json").write_text(json.dumps(qc, indent=2))
print("qc plan generated")
