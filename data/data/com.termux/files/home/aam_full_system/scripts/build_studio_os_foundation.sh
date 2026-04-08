#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== BUILD STUDIO OS FOUNDATION ==="

mkdir -p studio_os/{config,projects,logs,schemas}
mkdir -p studio_os/services/{router,memory,translator,qa,episodes}
mkdir -p studio_os/projects/demo_episode/{inputs,outputs,state}

cat > studio_os/config/models.json <<'EOF'
{
  "models": {
    "openai": {
      "role": "orchestrator",
      "enabled": false,
      "notes": "tool use, planning, structured control"
    },
    "gemini": {
      "role": "long_context",
      "enabled": false,
      "notes": "context-heavy planning and caching"
    },
    "grok": {
      "role": "live_tools",
      "enabled": false,
      "notes": "real-time and tool-heavy tasks"
    },
    "deepseek": {
      "role": "reasoning_fallback",
      "enabled": false,
      "notes": "comparison, fallback, alternate drafts"
    }
  }
}
EOF

cat > studio_os/schemas/episode_request.json <<'EOF'
{
  "title": "Episode 1: Enter the Marketplace",
  "theme": "futuristic creator economy",
  "length_minutes": 3,
  "rating": "PG",
  "style": "cinematic holographic sci-fi",
  "characters": ["Creator", "Jarvis"],
  "locations": ["Marketplace Gate", "Life World Portal"],
  "goal": "introduce the world and drive users into the platform"
}
EOF

cat > studio_os/projects/demo_episode/inputs/request.json <<'EOF'
{
  "title": "Episode 1: Enter the Marketplace",
  "theme": "futuristic creator economy",
  "length_minutes": 3,
  "rating": "PG",
  "style": "cinematic holographic sci-fi",
  "characters": ["Creator", "Jarvis"],
  "locations": ["Marketplace Gate", "Life World Portal"],
  "goal": "introduce the world and drive users into the platform"
}
EOF

cat > studio_os/services/episodes/create_episode.py <<'PY'
import json
from pathlib import Path

base = Path("studio_os/projects/demo_episode")
req = json.loads((base / "inputs" / "request.json").read_text())

outline = {
    "title": req["title"],
    "theme": req["theme"],
    "goal": req["goal"],
    "acts": [
        {"name": "Hook", "summary": "A creator sees the holographic gateway open."},
        {"name": "Discovery", "summary": "Jarvis explains the marketplace and Life World."},
        {"name": "Call To Action", "summary": "The creator enters the system and invites others."}
    ]
}

shotlist = {
    "title": req["title"],
    "shots": [
        {"scene": 1, "shot": 1, "type": "wide", "desc": "Glowing city-scale marketplace gate opens."},
        {"scene": 1, "shot": 2, "type": "medium", "desc": "Creator reacts to floating UI and portal light."},
        {"scene": 2, "shot": 1, "type": "close", "desc": "Jarvis hologram appears and welcomes the creator."},
        {"scene": 3, "shot": 1, "type": "wide", "desc": "Creator steps into Life World portal."}
    ]
}

prompts = {
    "video_prompts": [
        "Cinematic futuristic holographic marketplace gate opening, high contrast, volumetric light, realistic CGI, smooth camera move",
        "AI guide hologram appears beside creator, neon interface, crisp sci-fi production design",
        "Creator enters portal into Life World, epic glow, dramatic cinematic atmosphere"
    ],
    "voice_prompts": [
        "Calm confident AI guide voice welcoming a creator into a futuristic marketplace world"
    ]
}

(base / "outputs").mkdir(parents=True, exist_ok=True)
(base / "outputs" / "outline.json").write_text(json.dumps(outline, indent=2))
(base / "outputs" / "shotlist.json").write_text(json.dumps(shotlist, indent=2))
(base / "outputs" / "prompts.json").write_text(json.dumps(prompts, indent=2))
print("episode foundation generated")
PY

cat > studio_os/services/translator/explain_system.py <<'PY'
import json
from pathlib import Path

cfg = json.loads(Path("studio_os/config/models.json").read_text())
enabled = [k for k,v in cfg["models"].items() if v.get("enabled")]
print("Studio OS status:")
print(f"- enabled_models: {enabled if enabled else 'none yet'}")
print("- purpose: route jobs to the best model and explain outputs in plain English")
print("- current_mode: local foundation only")
PY

python studio_os/services/episodes/create_episode.py
python studio_os/services/translator/explain_system.py

echo
echo "=== VERIFY ==="
find studio_os -maxdepth 4 -type f | sort

echo
echo "=== FREEZE ==="
STAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p snapshots/final
tar -czf snapshots/final/studio_os_${STAMP}.tar.gz studio_os

echo
echo "STUDIO OS FOUNDATION READY"
echo "checkpoint: $STAMP"
