import os, json
from pathlib import Path

keys = [
    "RUNWAY_API_KEY",
    "KLING_API_KEY",
    "WAN_API_KEY",
    "ELEVENLABS_API_KEY",
    "SUNO_API_KEY",
    "UDIO_API_KEY",
    "OPENAI_API_KEY",
]

status = {k: bool(os.getenv(k)) for k in keys}
status["FFMPEG_BIN"] = os.getenv("FFMPEG_BIN", "ffmpeg")
status["ready_count"] = sum(1 for v in status.values() if v is True)

out = Path("studio_os/projects/anyone_can_be_a_star_episode/outputs/provider_env_status.json")
out.write_text(json.dumps(status, indent=2))
print("provider env status generated")
