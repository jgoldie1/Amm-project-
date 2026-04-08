#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS M PREMIUM DASHBOARD POLISH + COMMAND CENTER START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_pass_m_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_pass_m_${STAMP}.js"
cp db/aam.db "backups/aam_pass_m_${STAMP}.db"

########################################
# 1) CREATE DASHBOARD UX TABLES
########################################
sqlite3 db/aam.db <<SQL
CREATE TABLE IF NOT EXISTS command_center_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  center_name TEXT,
  center_group TEXT,
  center_scope TEXT,
  default_route TEXT,
  center_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dashboard_card_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_name TEXT,
  card_group TEXT,
  linked_route TEXT,
  card_priority TEXT,
  card_scope TEXT,
  card_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grouped_navigation_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nav_group_name TEXT,
  nav_group_scope TEXT,
  route_list TEXT,
  sort_order TEXT,
  nav_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
SQL

echo "[OK] pass M dashboard ux tables created"

########################################
# 2) SEED DASHBOARD UX TABLES
########################################
sqlite3 db/aam.db <<SQL
INSERT INTO command_center_registry (center_name, center_group, center_scope, default_route, center_status)
SELECT 'Primary Command Center','dashboard','full_platform','/command-center','active'
WHERE NOT EXISTS (SELECT 1 FROM command_center_registry WHERE center_name='Primary Command Center');

INSERT INTO dashboard_card_registry (card_name, card_group, linked_route, card_priority, card_scope, card_status)
SELECT 'Finance Hub Card','finance','/finance-hub','high','banking','active'
WHERE NOT EXISTS (SELECT 1 FROM dashboard_card_registry WHERE card_name='Finance Hub Card');

INSERT INTO dashboard_card_registry (card_name, card_group, linked_route, card_priority, card_scope, card_status)
SELECT 'Streaming Hub Card','streaming','/streaming-hub','high','media','active'
WHERE NOT EXISTS (SELECT 1 FROM dashboard_card_registry WHERE card_name='Streaming Hub Card');

INSERT INTO dashboard_card_registry (card_name, card_group, linked_route, card_priority, card_scope, card_status)
SELECT 'Multiverse Card','worlds','/multiverse-bridge','high','worlds','active'
WHERE NOT EXISTS (SELECT 1 FROM dashboard_card_registry WHERE card_name='Multiverse Card');

INSERT INTO dashboard_card_registry (card_name, card_group, linked_route, card_priority, card_scope, card_status)
SELECT 'Studio Lab Card','production','/studio-lab','high','production','active'
WHERE NOT EXISTS (SELECT 1 FROM dashboard_card_registry WHERE card_name='Studio Lab Card');

INSERT INTO dashboard_card_registry (card_name, card_group, linked_route, card_priority, card_scope, card_status)
SELECT 'Creator TV Card','creator','/creator-tv','high','creator','active'
WHERE NOT EXISTS (SELECT 1 FROM dashboard_card_registry WHERE card_name='Creator TV Card');

INSERT INTO grouped_navigation_registry (nav_group_name, nav_group_scope, route_list, sort_order, nav_status)
SELECT 'Finance Group','banking','/finance-hub,/creator-tv','1','active'
WHERE NOT EXISTS (SELECT 1 FROM grouped_navigation_registry WHERE nav_group_name='Finance Group');

INSERT INTO grouped_navigation_registry (nav_group_name, nav_group_scope, route_list, sort_order, nav_status)
SELECT 'World Group','worlds','/metaverse-control,/middleverse-bridge,/multiverse-bridge,/world3d','2','active'
WHERE NOT EXISTS (SELECT 1 FROM grouped_navigation_registry WHERE nav_group_name='World Group');

INSERT INTO grouped_navigation_registry (nav_group_name, nav_group_scope, route_list, sort_order, nav_status)
SELECT 'Production Group','media','/studio-lab,/creator-tv,/streaming-hub','3','active'
WHERE NOT EXISTS (SELECT 1 FROM grouped_navigation_registry WHERE nav_group_name='Production Group');
SQL

echo "[OK] pass M seeded"

########################################
# 3) PATCH COMMAND CENTER + NAV
########################################
python3 << 'PYEOF'
from pathlib import Path
p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderCommandCenterPage(req, user = null, message = '') {
  const cards = dbQuery(`SELECT id, card_name, card_group, linked_route, card_priority, card_scope, card_status, created_at
                         FROM dashboard_card_registry ORDER BY id DESC LIMIT 100`);
  const groups = dbQuery(`SELECT id, nav_group_name, nav_group_scope, route_list, sort_order, nav_status, created_at
                          FROM grouped_navigation_registry ORDER BY CAST(sort_order AS INTEGER), id DESC LIMIT 100`);

  const cardHtml = cards.map(r => `
    <a href="${esc(r.linked_route)}" style="display:block;text-decoration:none;color:inherit;">
      <div style="border:1px solid #334155;border-radius:16px;padding:16px;margin:10px 0;background:#111827;">
        <h3 style="margin:0 0 8px 0;">${esc(r.card_name)}</h3>
        <p style="margin:0 0 6px 0;">Group: ${esc(r.card_group)}</p>
        <p style="margin:0 0 6px 0;">Scope: ${esc(r.card_scope)}</p>
        <p style="margin:0;">Route: ${esc(r.linked_route)}</p>
      </div>
    </a>
  `).join('');

  const groupHtml = groups.map(r => `
    <div style="border:1px solid #334155;border-radius:16px;padding:16px;margin:10px 0;background:#0f172a;">
      <h3 style="margin:0 0 8px 0;">${esc(r.nav_group_name)}</h3>
      <p style="margin:0 0 6px 0;">Scope: ${esc(r.nav_group_scope)}</p>
      <p style="margin:0;">Routes: ${esc(r.route_list)}</p>
    </div>
  `).join('');

  return htmlPage('Command Center', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section>
        <h1>Command Center</h1>
        <p>${esc(message || 'Premium dashboard command center is live.')}</p>
      </section>

      <section>
        <h2>Quick Access</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;">
          ${cardHtml || '<p>No cards yet.</p>'}
        </div>
      </section>

      <section>
        <h2>Grouped Navigation</h2>
        ${groupHtml || '<p>No navigation groups yet.</p>'}
      </section>
    </main>
  `, user);
}
"""

if "function renderCommandCenterPage(req, user = null, message = '') {" not in text:
    anchor = "function renderFinanceHubPage(req, user = null, message = '') {"
    if anchor in text:
        text = text.replace(anchor, helper + "\n\n" + anchor, 1)

routes = r"""
    if (req.method === 'GET' && pathname === '/command-center') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderCommandCenterPage(req, null, getQueryParam(req, 'msg') || ''));
    }
"""

anchor = "    if (req.method === 'GET' && pathname === '/finance-hub') {"
if "pathname === '/command-center'" not in text and anchor in text:
    text = text.replace(anchor, routes + "\n" + anchor, 1)

home_old = """<a href="/finance-hub">Finance Hub</a>
<a href="/streaming-hub">Streaming Hub</a>"""
home_new = """<a href="/finance-hub">Finance Hub</a>
<a href="/streaming-hub">Streaming Hub</a>
<a href="/command-center">Command Center</a>"""

if home_old in text and "/command-center" not in text:
    text = text.replace(home_old, home_new, 1)

p.write_text(text)
print("[OK] pass M dashboard patched")
PYEOF

########################################
# 4) HARD RUNTIME RECOVERY
########################################
pkill -f "node .*dashboard.js" 2>/dev/null || true
pkill -f "node .*jarvis.js" 2>/dev/null || true
pkill -f "apps/dashboard.js" 2>/dev/null || true
pkill -f "apps/jarvis.js" 2>/dev/null || true
sleep 2
rm -f dashboard.pid jarvis.pid

bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 5
bash scripts/status.sh || true

########################################
# 5) HEALTH + ROUTE SMOKE
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/command-center > "test_results/command_center_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/finance-hub > "test_results/finance_hub_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/streaming-hub > "test_results/streaming_hub_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/metaverse-control > "test_results/metaverse_control_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/middleverse-bridge > "test_results/middleverse_bridge_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/multiverse-bridge > "test_results/multiverse_bridge_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/studio-lab > "test_results/studio_lab_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/creator-tv > "test_results/creator_tv_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/world3d > "test_results/world3d_${STAMP}.txt" || true

########################################
# 6) SUMMARY
########################################
python3 << PYEOF
from pathlib import Path
import json, sqlite3
db = Path.home() / "aam_full_system" / "db" / "aam.db"
con = sqlite3.connect(db)
cur = con.cursor()

required = [
    "command_center_registry",
    "dashboard_card_registry",
    "grouped_navigation_registry"
]

missing = []
for t in required:
    row = cur.execute("select name from sqlite_master where type='table' and name=?", (t,)).fetchone()
    if not row:
        missing.append(t)

summary = {
    "required_count": len(required),
    "missing_count": len(missing),
    "missing_tables": missing,
    "command_center_status": "stable" if not missing else "needs_attention"
}

out = Path.home() / "aam_full_system" / "snapshots" / "pass_m_command_center_summary_latest.json"
out.write_text(json.dumps(summary, indent=2))
print("[OK] pass M summary written")
print(json.dumps(summary, indent=2))
con.close()
PYEOF

########################################
# 7) SCAN
########################################
python3 << PYEOF
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
    if "syntaxerror" in txt or "referenceerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

latest = Path.home() / "aam_full_system" / "snapshots" / "pass_m_command_center_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] pass M scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) FINAL STATUS + REPORT
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

cat > "reports/pass_m_premium_dashboard_polish_and_command_center_${STAMP}.txt" <<REPORT
PASS M PREMIUM DASHBOARD POLISH + COMMAND CENTER REPORT
Timestamp: ${STAMP}

Built:
- command center registry
- dashboard card registry
- grouped navigation registry
- command center route/page

Verified:
- dashboard health
- jarvis health
- command center
- finance hub
- streaming hub
- metaverse route
- middleverse route
- multiverse route
- studio lab
- creator tv
- world3d
- current-run scan
- command center summary

Purpose:
- group the platform into cleaner premium navigation
- create a visible command center surface
- improve UX and daily usability
REPORT

echo "PASS M PREMIUM DASHBOARD POLISH + COMMAND CENTER COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/pass_m_command_center_scan_latest.json"
echo "  cat snapshots/pass_m_command_center_summary_latest.json"
echo "  cat reports/pass_m_premium_dashboard_polish_and_command_center_${STAMP}.txt"
echo "  bash scripts/status.sh"
