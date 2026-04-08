import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
clips = json.loads((base / "outputs" / "rendered_clips.json").read_text())["files"]

cmds = {
    "notes": [
        "Replace placeholder .txt files with real media files before running ffmpeg.",
        "These are command templates only."
    ],
    "commands": [
        "ffmpeg -f concat -safe 0 -i clips_list.txt -c copy rough_cut.mp4",
        "ffmpeg -i rough_cut.mp4 -i narration.wav -i music.wav -map 0:v -map 1:a -map 2:a -c:v copy -c:a aac final_master.mp4",
        "ffmpeg -i final_master.mp4 -i episode_en.srt -c copy -c:s mov_text final_master_subbed.mp4"
    ],
    "clip_placeholders_count": len(clips)
}

out = base / "outputs" / "ffmpeg_commands.json"
out.write_text(json.dumps(cmds, indent=2))
print("ffmpeg command templates generated")
