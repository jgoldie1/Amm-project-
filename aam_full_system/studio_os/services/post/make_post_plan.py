import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")

post_plan = {
    "steps": [
        "assemble clips in timeline order",
        "place narration and character voices",
        "add music cues",
        "add ambient effects and transitions",
        "balance levels",
        "apply mastering chain",
        "export review cut",
        "export final master"
    ],
    "deliverables": [
        "review_cut.mp4",
        "final_master.mp4",
        "audio_master.txt"
    ]
}

(base / "outputs" / "post_plan.json").write_text(json.dumps(post_plan, indent=2))
print("post plan generated")
