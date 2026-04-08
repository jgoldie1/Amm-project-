import json
from pathlib import Path

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
queue = json.loads((base / "outputs" / "render_queue.json").read_text())

clips_dir = base / "assets" / "clips"
clips_dir.mkdir(parents=True, exist_ok=True)

outputs = []
for job in queue["jobs"]:
    f = clips_dir / f"{job['job_id']}.txt"
    f.write_text(
        f"RENDER PLACEHOLDER\n"
        f"job_id={job['job_id']}\n"
        f"clip_id={job['clip_id']}\n"
        f"prompt={job['prompt']}\n"
        f"status=ready_for_provider_hookup\n"
    )
    outputs.append(str(f))

(base / "outputs" / "rendered_clips.json").write_text(json.dumps({"files": outputs}, indent=2))
print("render output placeholders generated")
