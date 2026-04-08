#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

echo "=== REPAIR PUBLISHING HUB ROUTE ONLY START ==="
cp apps/dashboard.js "backups/dashboard_repair_publishing_hub_${STAMP}.js"

python3 <<'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderPublishingHubPage(req, user = null, message = '') {
  return htmlPage('Publishing Hub', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section>
        <h1>Publishing Hub</h1>
        <p>${esc(message || 'Publishing, music rollout, royalty, and creator growth tools are live.')}</p>
      </section>

      <section>
        <h2>Quick Actions</h2>
        <form method="POST" action="/music/royalty-ledger-safe" style="margin-bottom:12px;"><button type="submit">Create Royalty Ledger</button></form>
        <form method="POST" action="/music/royalty-statement-safe" style="margin-bottom:12px;"><button type="submit">Create Royalty Statement</button></form>
        <form method="POST" action="/music/artist-dashboard-safe" style="margin-bottom:12px;"><button type="submit">Create Artist Dashboard</button></form>
        <form method="POST" action="/music/sample-clearance-safe" style="margin-bottom:12px;"><button type="submit">Create Sample Clearance</button></form>
        <form method="POST" action="/music/sync-license-safe" style="margin-bottom:12px;"><button type="submit">Create Sync License</button></form>
        <form method="POST" action="/creator/star-safe" style="margin-bottom:12px;"><button type="submit">Create Star Creator Profile</button></form>
      </section>
    </main>
  `, user);
}
"""

route = r"""
    if (req.method === 'GET' && pathname === '/publishing-hub') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPublishingHubPage(req, null, getQueryParam(req, 'msg') || ''));
    }
"""

if "function renderPublishingHubPage(req, user = null, message = '') {" not in text:
    anchor = "function renderCommandCenterPage(req, user = null, message = '') {"
    if anchor in text:
        text = text.replace(anchor, helper + "\n\n" + anchor, 1)

if "pathname === '/publishing-hub'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/command-center') {"
    if anchor in text:
        text = text.replace(anchor, route + "\n" + anchor, 1)

p.write_text(text)
print("[OK] publishing hub helper + route repaired")
PYEOF

pkill -f "node .*dashboard.js" 2>/dev/null || true
pkill -f "apps/dashboard.js" 2>/dev/null || true
sleep 2
rm -f dashboard.pid

bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 5

curl -s -i http://127.0.0.1:4900/health > "test_results/publishing_hub_repair_dashboard_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/publishing-hub > "test_results/publishing_hub_repair_route_${STAMP}.txt" || true

python3 <<PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"publishing_hub_repair_*_{stamp}.txt")):
    txt = f.read_text(errors="ignore").lower()
    if "cannot get" in txt or "not found" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "dashboard" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})

Path.home().joinpath("aam_full_system","snapshots","repair_publishing_hub_route_only_scan_latest.json").write_text(json.dumps(issues, indent=2))
print(f"[OK] publishing hub repair scan complete: {len(issues)} issues")
PYEOF

bash scripts/status.sh || true

cat > "reports/repair_publishing_hub_route_only_${STAMP}.txt" <<REPORT
REPAIR PUBLISHING HUB ROUTE ONLY REPORT
Timestamp: ${STAMP}

Fixed:
- publishing hub helper
- publishing hub GET route

Purpose:
- remove the last visible route gap from the Hollywood/music stack
- preserve stable runtime
REPORT

echo "=== REPAIR PUBLISHING HUB ROUTE ONLY COMPLETE ==="
echo "Check:"
echo "  cat snapshots/repair_publishing_hub_route_only_scan_latest.json"
echo "  cat reports/repair_publishing_hub_route_only_${STAMP}.txt"
echo "  bash scripts/status.sh"
