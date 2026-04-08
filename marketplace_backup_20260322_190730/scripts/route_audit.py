import json
import urllib.request

routes = [
    "/",
    "/health",
    "/safe-ok",
    "/build-status",
    "/command-center",
    "/progress",
    "/city-minimap",
    "/district-dashboard",
    "/traffic-transport-board",
    "/living-city-center",
    "/property-center",
    "/property-operations-center",
    "/safety-center",
    "/oasis-center",
    "/verse-center",
    "/project-inventory",
    "/rebuild-map",
    "/route-audit",
]

ok = []
failed = []

for route in routes:
    url = f"http://127.0.0.1:8080{route}"
    try:
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req, timeout=5) as r:
            code = r.status
        if 200 <= code < 400:
            ok.append(route)
        else:
            failed.append(f"{route} -> {code}")
    except Exception as e:
        failed.append(f"{route} -> {e.__class__.__name__}")

report = {"total": len(routes), "ok": ok, "failed": failed}
with open("reports/route_audit.json", "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2)

print(json.dumps(report, indent=2))
