import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")

plan = {
    "injection_points": [
        {"cue": "opening_theme", "placement": "intro sequence", "target": "background + vocal hook"},
        {"cue": "transformation_theme", "placement": "star transformation", "target": "full soundtrack lift"},
        {"cue": "broadcast_theme", "placement": "ending reveal", "target": "anthem finish"}
    ],
    "audio_flow": [
        "record vocals",
        "export stems",
        "mix with score",
        "master soundtrack",
        "inject into final render"
    ]
}

(base / "outputs" / "soundtrack_injection_plan.json").write_text(json.dumps(plan, indent=2))
print("soundtrack injection plan generated")
