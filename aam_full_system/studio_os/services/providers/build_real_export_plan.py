import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")

plan = {
    "inputs": {
        "clips": "assets/clips/",
        "audio": "assets/audio/",
        "music": "assets/music/",
        "subtitles": "assets/subtitles/"
    },
    "outputs": {
        "review_cut": "assets/post/review_cut.mp4",
        "final_master": "assets/post/final_master.mp4",
        "localized_versions": [
            "assets/post/final_master_es.mp4",
            "assets/post/final_master_ko.mp4",
            "assets/post/final_master_ja.mp4"
        ]
    },
    "engine": "ffmpeg_or_editor_backend"
}

(base / "outputs" / "real_export_plan.json").write_text(json.dumps(plan, indent=2))
print("real export plan generated")
