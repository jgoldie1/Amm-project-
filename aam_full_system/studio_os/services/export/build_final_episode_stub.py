import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
clips = json.loads((base / "outputs" / "clips.json").read_text())["clips"]
audio = json.loads((base / "outputs" / "audio_files.json").read_text())["files"]
edit_plan = json.loads((base / "outputs" / "edit_plan.json").read_text())

final_dir = base / "assets" / "final"
final_dir.mkdir(parents=True, exist_ok=True)

summary = {
    "status": "render_output_layer_ready",
    "clips_count": len(clips),
    "audio_files_count": len(audio),
    "timeline_items": len(edit_plan["timeline"]),
    "next_step": "replace placeholders with real video, voice, and ffmpeg export"
}

(final_dir / "final_episode_stub.json").write_text(json.dumps(summary, indent=2))
(final_dir / "final_episode.mp4.txt").write_text(
    "FINAL EPISODE PLACEHOLDER\n"
    "This is where the real exported episode file will go.\n"
)
print("final episode stub created")
