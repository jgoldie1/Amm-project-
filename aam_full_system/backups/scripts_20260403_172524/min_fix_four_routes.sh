#!/data/data/com.termux/files/usr/bin/bash
set -e
cd ~/aam_full_system

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_min_fix_four_${STAMP}.js"
cp db/aam.db "backups/aam_min_fix_four_${STAMP}.db"

python3 <<'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helpers = r"""
function renderMetaverseControlPage(req, user = null, message = '') {
  return htmlPage('Metaverse Control', `<main id="main-content"><h1>Metaverse Control</h1><p>${message || 'Metaverse page is live.'}</p></main>`, user);
}
function renderStudioLabPage(req, user = null, message = '') {
  return htmlPage('Studio Lab', `<main id="main-content"><h1>Studio Lab</h1><p>${message || 'Studio Lab page is live.'}</p></main>`, user);
}
function renderDispatchActionsPage(req, user = null, message = '') {
  return htmlPage('Dispatch Actions', `<main id="main-content"><h1>Dispatch Actions</h1><p>${message || 'Dispatch Actions page is live.'}</p></main>`, user);
}
function renderEpisodeMoviePipelinePage(req, user = null, message = '') {
  return htmlPage('Episode + Movie Pipeline', `<main id="main-content"><h1>Episode + Movie Pipeline</h1><p>${message || 'Episode + Movie Pipeline page is live.'}</p></main>`, user);
}
"""

if "function renderMetaverseControlPage" not in text:
    text = text.replace("const server = http.createServer(async (req, res) => {", helpers + "\nconst server = http.createServer(async (req, res) => {", 1)

routes = r"""
    if (req.method === 'GET' && pathname === '/metaverse-control') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderMetaverseControlPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
    if (req.method === 'GET' && pathname === '/studio-lab') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderStudioLabPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
    if (req.method === 'GET' && pathname === '/dispatch-actions') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderDispatchActionsPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
    if (req.method === 'GET' && pathname === '/episode-movie-pipeline') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderEpisodeMoviePipelinePage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

if "pathname === '/metaverse-control'" not in text:
    for anchor in [
        "    if (req.method === 'GET' && pathname === '/release-readiness') {",
        "    if (req.method === 'GET' && pathname === '/quantum-speed') {",
        "    if (req.method === 'GET' && pathname === '/multiservice-dispatch') {",
    ]:
        if anchor in text:
            text = text.replace(anchor, routes + "\n" + anchor, 1)
            break

for nav in [
    '<a href="/release-readiness">Readiness</a>',
    '<a href="/quantum-speed">Quantum Speed</a>',
    '<a href="/multiservice-dispatch">Dispatch Expansion</a>',
]:
    if nav in text:
        add = []
        for tag in [
            '<a href="/metaverse-control">Metaverse</a>',
            '<a href="/studio-lab">Studio Lab</a>',
            '<a href="/dispatch-actions">Dispatch Actions</a>',
            '<a href="/episode-movie-pipeline">Episode Pipeline</a>',
        ]:
            if tag not in text:
                add.append(tag)
        if add:
            text = text.replace(nav, nav + "\n          " + "\n          ".join(add), 1)
        break

p.write_text(text)
print("[OK] minimal four routes patched")
PYEOF

bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 4
bash scripts/status.sh || true

curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

for route in \
  /metaverse-control \
  /studio-lab \
  /dispatch-actions \
  /episode-movie-pipeline
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

python3 <<PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore").lower()
    if "cannot get" in txt or "not found" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in txt or "syntaxerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "min_fix_four_routes_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] minimal four-route scan complete: {len(issues)} issues")
PYEOF

cat > "reports/min_fix_four_routes_${STAMP}.txt" <<REPORT
MIN FIX FOUR ROUTES REPORT
Timestamp: ${STAMP}

Fixed:
- /metaverse-control
- /studio-lab
- /dispatch-actions
- /episode-movie-pipeline

Purpose:
- restore the missing 4 pages with simple live versions
- stabilize runtime
- prepare for deeper page content later
REPORT

echo "MIN FIX FOUR ROUTES COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/min_fix_four_routes_scan_latest.json"
echo "  cat reports/min_fix_four_routes_${STAMP}.txt"
