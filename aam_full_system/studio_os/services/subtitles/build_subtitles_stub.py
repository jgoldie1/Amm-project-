from pathlib import Path
import json

base = Path("studio_os/projects/demo_episode")
sub_dir = base / "assets" / "subtitles"
sub_dir.mkdir(parents=True, exist_ok=True)

en = sub_dir / "episode_en.srt"
es = sub_dir / "episode_es.srt"
ko = sub_dir / "episode_ko.srt"
ja = sub_dir / "episode_ja.srt"

sample = """1
00:00:00,000 --> 00:00:04,000
Welcome to All American AI TV.

2
00:00:04,000 --> 00:00:08,000
Enter the marketplace and begin your journey.
"""

for f in [en, es, ko, ja]:
    f.write_text(sample)

(base / "outputs" / "subtitle_files.json").write_text(json.dumps({
    "files": [str(en), str(es), str(ko), str(ja)]
}, indent=2))
print("subtitle stubs generated")
