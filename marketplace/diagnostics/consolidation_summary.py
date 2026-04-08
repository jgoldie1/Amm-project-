from pathlib import Path
import json

inv_path = Path("reports/platform_inventory.json")
smoke_path = Path("reports/route_smoke_report.txt")
server_log = Path("server.log")

inventory = {}
if inv_path.exists():
    inventory = json.loads(inv_path.read_text(encoding="utf-8"))

smoke_lines = smoke_path.read_text(encoding="utf-8", errors="ignore").splitlines() if smoke_path.exists() else []
codes = {"200": [], "302": [], "404": [], "500": [], "NO_RESPONSE": []}

for line in smoke_lines:
    if line.startswith("/") and " " in line:
        route, code = line.rsplit(None, 1)
        codes.setdefault(code, []).append(route)

summary = {
    "active_module_count": len(inventory.get("active_modules", [])),
    "disabled_module_count": len(inventory.get("disabled_modules", [])),
    "routes_in_app_py_count": len(inventory.get("routes_in_app_py", [])),
    "http_200_routes": codes.get("200", []),
    "http_302_routes": codes.get("302", []),
    "http_404_routes": codes.get("404", []),
    "http_500_routes": codes.get("500", []),
    "http_no_response_routes": codes.get("NO_RESPONSE", []),
    "server_log_exists": server_log.exists(),
}

out = Path("reports/consolidation_summary.json")
out.write_text(json.dumps(summary, indent=2), encoding="utf-8")
print(f"Wrote {out}")
print(json.dumps(summary, indent=2))
