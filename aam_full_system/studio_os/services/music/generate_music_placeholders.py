import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
music_plan = json.loads((base / "outputs" / "music_plan.json").read_text())

music_dir = base / "assets" / "music"
music_dir.mkdir(parents=True, exist_ok=True)

files = []
for track in music_plan["tracks"]:
    f = music_dir / f"{track['cue']}.txt"
    f.write_text(
        f"CUE={track['cue']}\n"
        f"SCENE={track['scene']}\n"
        f"MOOD={track['mood']}\n"
        f"DURATION_SEC={track['duration_sec']}\n"
    )
    files.append(str(f))

(base / "outputs" / "music_files.json").write_text(json.dumps({"files": files}, indent=2))
print("music placeholders generated")
