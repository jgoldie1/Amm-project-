import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
voice_plan = json.loads((base / "outputs" / "voice_plan.json").read_text())

audio_dir = base / "assets" / "audio"
audio_dir.mkdir(parents=True, exist_ok=True)

files = []

narration_file = audio_dir / "narration.txt"
narration_file.write_text("\n".join(voice_plan.get("narration", [])))
files.append(str(narration_file))

for voice in voice_plan.get("voices", []):
    vf = audio_dir / f"{voice['character'].lower()}_voice.txt"
    vf.write_text(f"character={voice['character']}\nstyle={voice['style']}\n")
    files.append(str(vf))

(base / "outputs" / "audio_files.json").write_text(json.dumps({"files": files}, indent=2))
print("audio placeholders generated")
