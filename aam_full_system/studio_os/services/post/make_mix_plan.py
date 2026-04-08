import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")

mix_plan = {
    "dialogue_target": "-6 dB peak",
    "music_target": "-18 to -14 dB under dialogue",
    "sfx_target": "-12 to -8 dB peak depending on moment",
    "chain": [
        "dialogue cleanup",
        "noise reduction",
        "eq",
        "compression",
        "de-essing",
        "music ducking under speech",
        "limiter on final bus"
    ],
    "notes": [
        "Dialogue must always be intelligible",
        "Music should support emotion, not bury speech",
        "Final output should feel broadcast-ready"
    ]
}

(base / "outputs" / "mix_plan.json").write_text(json.dumps(mix_plan, indent=2))
print("mix plan generated")
