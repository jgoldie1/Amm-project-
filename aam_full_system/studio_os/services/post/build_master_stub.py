import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
music = json.loads((base / "outputs" / "music_files.json").read_text())["files"]
mix_plan = json.loads((base / "outputs" / "mix_plan.json").read_text())
post_plan = json.loads((base / "outputs" / "post_plan.json").read_text())

post_dir = base / "assets" / "post"
post_dir.mkdir(parents=True, exist_ok=True)

(post_dir / "review_cut.mp4.txt").write_text("REVIEW CUT PLACEHOLDER\n")
(post_dir / "final_master.mp4.txt").write_text("FINAL MASTER PLACEHOLDER\n")
(post_dir / "audio_master.txt").write_text(
    "AUDIO MASTER PLACEHOLDER\n"
    f"music_files={len(music)}\n"
    f"mix_chain_steps={len(mix_plan['chain'])}\n"
    f"post_steps={len(post_plan['steps'])}\n"
)

summary = {
    "status": "music_mix_post_ready",
    "music_files": len(music),
    "mix_chain_steps": len(mix_plan["chain"]),
    "post_steps": len(post_plan["steps"]),
    "next_step": "replace placeholders with real music generation, real audio mixing, and real final export"
}

(post_dir / "post_summary.json").write_text(json.dumps(summary, indent=2))
print("master/post stubs created")
