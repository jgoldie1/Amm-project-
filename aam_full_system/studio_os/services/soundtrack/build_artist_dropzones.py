from pathlib import Path
import json

base = Path("studio_os/projects/anyone_can_be_a_star_episode")
assets = base / "assets"

readmes = {
    assets / "vocal_sessions" / "README.txt":
        "Put raw vocal takes here: lead_vocal.wav, hook.wav, background_vocals.wav",
    assets / "song_drafts" / "README.txt":
        "Put songwriter/demo drafts here: theme_song_demo.wav, hook_demo.wav",
    assets / "approved_soundtrack" / "README.txt":
        "Put approved soundtrack files here: opening_theme.wav, transformation_theme.wav, broadcast_theme.wav",
    assets / "mix_masters" / "README.txt":
        "Put final mixed/mastered soundtrack files here: soundtrack_master.wav, soundtrack_master.mp3"
}

for path, text in readmes.items():
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text)

summary = {
    "status": "artist_music_dropzones_ready",
    "next_step": "add real vocals, song drafts, approved soundtrack, and final masters"
}

(base / "outputs" / "artist_music_dropzones.json").write_text(json.dumps(summary, indent=2))
print("artist music dropzones generated")
