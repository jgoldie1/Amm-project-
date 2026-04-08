from pathlib import Path
import re
import json

def read(p):
    try:
        return Path(p).read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return ""

app_text = read("app.py")
routes_in_app = sorted(set(re.findall(r'@app\.route\("([^"]+)"', app_text)))

modules = sorted([p.name for p in Path("modules").glob("*.py")]) if Path("modules").exists() else []
disabled = sorted([p.name for p in Path("modules_disabled").glob("*.py")]) if Path("modules_disabled").exists() else []

module_routes = {}
for mod in modules:
    txt = read(Path("modules") / mod)
    found = sorted(set(re.findall(r'@app\.route\("([^"]+)"', txt)))
    if found:
        module_routes[mod] = found

report = {
    "routes_in_app_py": routes_in_app,
    "active_modules": modules,
    "disabled_modules": disabled,
    "module_routes": module_routes,
}

out = Path("reports") / "platform_inventory.json"
out.write_text(json.dumps(report, indent=2), encoding="utf-8")
print(f"Wrote {out}")
print(f"Routes in app.py: {len(routes_in_app)}")
print(f"Active modules: {len(modules)}")
print(f"Disabled modules: {len(disabled)}")
