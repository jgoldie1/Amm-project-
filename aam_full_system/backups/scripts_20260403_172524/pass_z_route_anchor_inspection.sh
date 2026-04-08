#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS Z ROUTE ANCHOR INSPECTION START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p snapshots reports test_results backups

cp apps/dashboard.js "backups/dashboard_pass_z_${STAMP}.js"

python3 <<'PYEOF'
from pathlib import Path
import re, json

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

patterns = [
    r"pathname === '/command-center'",
    r"pathname === '/homepage-showcase'",
    r"pathname === '/account-center'",
    r"pathname === '/archive-memory'",
    r"pathname === '/intelligence-hub'",
    r"pathname === '/navigation-workflow-hub'",
    r"pathname === '/help/navigation-safe'",
    r"pathname === '/help/kingdom-safe'",
    r"pathname === '/help/marketplace-safe'",
    r"res\.writeHead\(404",
    r"function renderCommandCenterPage",
    r"function renderHomepageShowcase",
    r"function renderHomepageShowcasePage",
    r"function renderNavigationWorkflowHubPage"
]

results = {}
for pat in patterns:
    matches = list(re.finditer(pat, text))
    if not matches:
        results[pat] = {"count": 0, "snippets": []}
        continue

    snippets = []
    for m in matches[:3]:
        start = max(0, m.start() - 220)
        end = min(len(text), m.end() + 420)
        snippets.append(text[start:end])

    results[pat] = {
        "count": len(matches),
        "snippets": snippets
    }

out = Path.home() / "aam_full_system" / "snapshots" / "pass_z_route_anchor_inspection_latest.json"
out.write_text(json.dumps(results, indent=2))
print("[OK] wrote", out)
PYEOF

echo "=== PASS Z COMPLETE ==="
echo "Check:"
echo "  cat snapshots/pass_z_route_anchor_inspection_latest.json"
