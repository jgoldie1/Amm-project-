import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")

tracker = {
    "currency": "USD",
    "episode_budget_cap": 100,
    "line_items": [
        {"category": "video_generation", "estimated": 0},
        {"category": "voice_generation", "estimated": 0},
        {"category": "music_generation", "estimated": 0},
        {"category": "translation", "estimated": 0},
        {"category": "final_export", "estimated": 0}
    ],
    "total_estimated": 0
}

(base / "outputs" / "cost_tracker.json").write_text(json.dumps(tracker, indent=2))
print("cost tracker generated")
