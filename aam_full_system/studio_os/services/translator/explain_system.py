import json
from pathlib import Path

cfg = json.loads(Path("studio_os/config/models.json").read_text())
enabled = [k for k,v in cfg["models"].items() if v.get("enabled")]
print("Studio OS status:")
print(f"- enabled_models: {enabled if enabled else 'none yet'}")
print("- purpose: route jobs to the best model and explain outputs in plain English")
print("- current_mode: local foundation only")
