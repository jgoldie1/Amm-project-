from pathlib import Path
import json
import re
from datetime import datetime

app_text = Path("app.py").read_text(encoding="utf-8", errors="ignore")
routes = sorted(set(re.findall(r'@app\.route\("([^"]+)"', app_text)))

report = {
    "checkpoint_time": datetime.now().isoformat(),
    "app_py_route_count": len(routes),
    "app_py_routes": routes,
    "key_pages_expected": [
        "/", "/platform-home", "/master-dashboard", "/route-map", "/platform-verify",
        "/profile-safe", "/profile-db-center", "/db-role-preferences", "/db-favorites",
        "/clickable-map", "/payments-center", "/payment-health",
        "/jarvis", "/jarvis-plus", "/jarvis-access", "/jarvis-history",
        "/jarvis-favorites", "/jarvis-home"
    ],
    "backups_present": sorted([p.name for p in Path("backups").glob("app_*.py")])[-10:],
}

out = Path("reports/final_checkpoint.json")
out.write_text(json.dumps(report, indent=2), encoding="utf-8")
print(f"Wrote {out}")
print(json.dumps(report, indent=2))
