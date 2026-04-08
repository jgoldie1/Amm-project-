from pathlib import Path
import re, json

report_dir = Path("reports")
report_dir.mkdir(exist_ok=True)

py_files = []
for p in [Path("app.py")] + sorted(Path("modules").glob("*.py")) + sorted(Path("backups").glob("app_before_*.py"), reverse=True):
    if p.exists():
        py_files.append(p)

route_re = re.compile(r'@app\.route\("([^"]+)"')
func_re = re.compile(r'^def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(', re.M)

inventory = {
    "python_files_checked": [],
    "routes_by_file": {},
    "functions_by_file": {},
    "data_files": [],
    "config_files": []
}

seen = set()
for p in py_files:
    s = str(p)
    if s in seen:
        continue
    seen.add(s)
    inventory["python_files_checked"].append(s)
    try:
        txt = p.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        txt = ""
    inventory["routes_by_file"][s] = route_re.findall(txt)
    inventory["functions_by_file"][s] = func_re.findall(txt)

for p in sorted(Path("data").rglob("*")):
    if p.is_file():
        inventory["data_files"].append(str(p))

for p in sorted(Path("config").rglob("*")):
    if p.is_file():
        inventory["config_files"].append(str(p))

(report_dir / "project_inventory.json").write_text(json.dumps(inventory, indent=2), encoding="utf-8")
print("reports/project_inventory.json written")
