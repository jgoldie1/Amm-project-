import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
rendered = json.loads((base / "outputs" / "rendered_clips.json").read_text())["files"]

final_dir = base / "assets" / "final"
final_dir.mkdir(parents=True, exist_ok=True)

summary = {
    "project": "anyone_can_be_a_star_episode",
    "clips_ready": len(rendered),
    "status": "ready_for_real_video_voice_music_export",
    "next_step": "connect real providers and export final episode"
}

(final_dir / "anyone_can_be_a_star_final_stub.json").write_text(json.dumps(summary, indent=2))
(final_dir / "anyone_can_be_a_star_final.mp4.txt").write_text(
    "FINAL STAR EPISODE PLACEHOLDER\n"
    "This will become the real exported episode for Anyone Can Be a Star.\n"
)
print("star final stub generated")
