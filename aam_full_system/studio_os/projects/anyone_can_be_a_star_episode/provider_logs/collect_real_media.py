import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
out = base / "outputs"

clips_dir = base / "assets" / "real_clips"
audio_dir = base / "assets" / "real_audio"
music_dir = base / "assets" / "real_music"

clips = sorted([str(p) for p in clips_dir.glob("*.mp4")])
audio = sorted([str(p) for p in audio_dir.glob("*.wav")]) + sorted([str(p) for p in audio_dir.glob("*.mp3")])
music = sorted([str(p) for p in music_dir.glob("*.wav")]) + sorted([str(p) for p in music_dir.glob("*.mp3")])

summary = {
    "real_clips_found": clips,
    "real_audio_found": audio,
    "real_music_found": music,
    "ready_for_ffmpeg": len(clips) > 0 and len(audio) > 0 and len(music) > 0
}

(out / "real_media_inventory.json").write_text(json.dumps(summary, indent=2))
print("real media inventory generated")
