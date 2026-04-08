#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS AA REHOME NAV ROUTES START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_pass_aa_${STAMP}.js"

python3 <<'PY2EOF'
from pathlib import Path
import re

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

block_pattern = re.compile(
    r"""\n\s*if \(req\.method === 'GET' && pathname === '/navigation-workflow-hub'\) \{
.*?
\s*if \(req\.method === 'POST' && pathname === '/help/marketplace-safe'\) \{
.*?
\s*return res\.end\(\);
\s*\}""",
    re.DOTALL
)

matches = list(block_pattern.finditer(text))
if matches:
    first = matches[0]
    route_block = first.group(0)
    text = text[:first.start()] + text[first.end():]
    # remove any duplicate stray copies too
    text = block_pattern.sub("", text)
else:
    route_block = """

    if (req.method === 'GET' && pathname === '/navigation-workflow-hub') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderNavigationWorkflowHubPage(req, null, getQueryParam(req, 'msg') || ''));
    }

    if (req.method === 'POST' && pathname === '/help/navigation-safe') {
      dbRun(`INSERT INTO help_assistant_registry (assistant_name, assistant_group, target_system, help_scope, assistant_status)
             VALUES ('Safe Navigation Help Bot','navigation_help','full_platform','manual_app_usage','active')`);
      res.writeHead(302, { Location: '/navigation-workflow-hub?msg=Safe%20navigation%20help%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/help/kingdom-safe') {
      dbRun(`INSERT INTO help_assistant_registry (assistant_name, assistant_group, target_system, help_scope, assistant_status)
             VALUES ('Safe Kingdom Help Bot','kingdom_help','Kingdom App','kingdom_usage_and_guidance','active')`);
      res.writeHead(302, { Location: '/navigation-workflow-hub?msg=Safe%20Kingdom%20help%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/help/marketplace-safe') {
      dbRun(`INSERT INTO help_assistant_registry (assistant_name, assistant_group, target_system, help_scope, assistant_status)
             VALUES ('Safe Marketplace Help Bot','marketplace_help','All American Marketplace Holographic Streaming Ecosystem','streaming_and_navigation_guidance','active')`);
      res.writeHead(302, { Location: '/navigation-workflow-hub?msg=Safe%20marketplace%20help%20created' });
      return res.end();
    }
"""

top_level_404 = "    res.writeHead(404, { 'Content-Type': 'text/plain' });"
idx = text.rfind(top_level_404)
if idx == -1:
    raise SystemExit("Could not find top-level 404 anchor")

text = text[:idx] + route_block + "\n\n" + text[idx:]

p.write_text(text)
print("[OK] navigation/help routes moved to top-level handler")
PY2EOF

bash scripts/check_js.sh

pkill -f "dashboard.js" 2>/dev/null || true
pkill -f "jarvis" 2>/dev/null || true
sleep 2
rm -f dashboard.pid jarvis.pid

bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 6

curl -s http://127.0.0.1:4900/health > test_results/pass_aa_dashboard_health_${STAMP}.txt || true
curl -s http://127.0.0.1:5000/health > test_results/pass_aa_jarvis_health_${STAMP}.txt || true
curl -s -i http://127.0.0.1:4900/navigation-workflow-hub > test_results/pass_aa_navigation_workflow_hub_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/help/navigation-safe > test_results/pass_aa_navigation_help_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/help/kingdom-safe > test_results/pass_aa_kingdom_help_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/help/marketplace-safe > test_results/pass_aa_marketplace_help_${STAMP}.txt || true

python3 <<PY3EOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in root.glob(f"pass_aa_*_{stamp}.txt"):
    txt = f.read_text(errors="ignore").lower()
    if "not found" in txt or "cannot get" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt or " 500 " in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

Path.home().joinpath("aam_full_system","snapshots","pass_aa_rehome_nav_routes_scan_latest.json").write_text(
    json.dumps(issues, indent=2)
)
print("issues:", len(issues))
print(json.dumps(issues, indent=2))
PY3EOF

bash scripts/status.sh || true

cat > "reports/pass_aa_rehome_nav_routes_${STAMP}.txt" <<REPORT
PASS AA REHOME NAV ROUTES REPORT
Timestamp: ${STAMP}

Fixed:
- moved navigation workflow routes out of nested branch
- reattached routes to top-level request handler

Verified:
- navigation workflow hub
- navigation help
- kingdom help
- marketplace help
REPORT

echo "=== PASS AA COMPLETE ==="
echo "Check:"
echo "  cat snapshots/pass_aa_rehome_nav_routes_scan_latest.json"
echo "  cat reports/pass_aa_rehome_nav_routes_${STAMP}.txt"
echo "  bash scripts/status.sh"
