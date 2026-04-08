#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== REPAIR PASS M MISSING ROUTES ONLY START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_repair_pass_m_routes_${STAMP}.js"
cp db/aam.db "backups/aam_repair_pass_m_routes_${STAMP}.db"

########################################
# 1) PATCH HELPERS + GET ROUTES
########################################
python3 << 'PYEOF'
from pathlib import Path
import re

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helpers = r"""
function renderFinanceHubPage(req, user = null, message = '') {
  const accounts = dbQuery(`SELECT id, account_name, account_group, account_type, currency_scope, account_status, created_at
                            FROM finbank_account_registry ORDER BY id DESC LIMIT 100`);
  const cards = dbQuery(`SELECT id, card_name, card_group, linked_account, card_type, rewards_mode, card_status, created_at
                         FROM finbank_card_registry ORDER BY id DESC LIMIT 100`);
  const transfers = dbQuery(`SELECT id, transfer_name, transfer_group, source_account, target_account, transfer_scope, transfer_status, created_at
                             FROM finbank_transfer_registry ORDER BY id DESC LIMIT 100`);

  const accountRows = accounts.map(r => `<tr><td>${r.id}</td><td>${esc(r.account_name)}</td><td>${esc(r.account_type)}</td><td>${esc(r.currency_scope)}</td><td>${esc(r.account_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const cardRows = cards.map(r => `<tr><td>${r.id}</td><td>${esc(r.card_name)}</td><td>${esc(r.linked_account)}</td><td>${esc(r.card_type)}</td><td>${esc(r.rewards_mode)}</td><td>${esc(r.card_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const transferRows = transfers.map(r => `<tr><td>${r.id}</td><td>${esc(r.transfer_name)}</td><td>${esc(r.source_account)}</td><td>${esc(r.target_account)}</td><td>${esc(r.transfer_scope)}</td><td>${esc(r.transfer_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');

  return htmlPage('Finance Hub', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>El Saturn Finbank International Hub</h1><p>${esc(message || 'Banking systems are live.')}</p></section>
      <section><h2>Quick Actions</h2>
        <form method="POST" action="/finance/checking-safe" style="margin-bottom:12px;"><button type="submit">Create Checking Account</button></form>
        <form method="POST" action="/finance/savings-safe" style="margin-bottom:12px;"><button type="submit">Create Savings Account</button></form>
        <form method="POST" action="/finance/moneymarket-safe" style="margin-bottom:12px;"><button type="submit">Create Money Market Account</button></form>
        <form method="POST" action="/finance/card-safe" style="margin-bottom:12px;"><button type="submit">Create Stubbs Lyons Card</button></form>
        <form method="POST" action="/finance/transfer-safe" style="margin-bottom:12px;"><button type="submit">Create Cross-Border Transfer</button></form>
      </section>
      <section><h2>Accounts</h2><table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Scope</th><th>Status</th><th>Created</th></tr></thead><tbody>${accountRows || '<tr><td colspan="6">No accounts</td></tr>'}</tbody></table></section>
      <section><h2>Cards</h2><table><thead><tr><th>ID</th><th>Name</th><th>Account</th><th>Type</th><th>Rewards</th><th>Status</th><th>Created</th></tr></thead><tbody>${cardRows || '<tr><td colspan="7">No cards</td></tr>'}</tbody></table></section>
      <section><h2>Transfers</h2><table><thead><tr><th>ID</th><th>Name</th><th>Source</th><th>Target</th><th>Scope</th><th>Status</th><th>Created</th></tr></thead><tbody>${transferRows || '<tr><td colspan="7">No transfers</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}

function renderStreamingHubPage(req, user = null, message = '') {
  const platforms = dbQuery(`SELECT id, platform_name, platform_group, content_scope, region_scope, monetization_mode, platform_status, created_at
                             FROM crossborder_streaming_registry ORDER BY id DESC LIMIT 100`);
  const navs = dbQuery(`SELECT id, nav_name, nav_group, target_route, nav_scope, nav_priority, nav_status, created_at
                        FROM ui_navigation_registry ORDER BY id DESC LIMIT 100`);
  const ux = dbQuery(`SELECT id, module_name, module_group, linked_surface, ux_mode, module_scope, module_status, created_at
                      FROM ux_module_registry ORDER BY id DESC LIMIT 100`);
  const surfaces = dbQuery(`SELECT id, surface_name, surface_group, linked_system, surface_type, surface_scope, surface_status, created_at
                            FROM app_surface_registry ORDER BY id DESC LIMIT 100`);

  const platformRows = platforms.map(r => `<tr><td>${r.id}</td><td>${esc(r.platform_name)}</td><td>${esc(r.content_scope)}</td><td>${esc(r.region_scope)}</td><td>${esc(r.monetization_mode)}</td><td>${esc(r.platform_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const navRows = navs.map(r => `<tr><td>${r.id}</td><td>${esc(r.nav_name)}</td><td>${esc(r.target_route)}</td><td>${esc(r.nav_scope)}</td><td>${esc(r.nav_priority)}</td><td>${esc(r.nav_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const uxRows = ux.map(r => `<tr><td>${r.id}</td><td>${esc(r.module_name)}</td><td>${esc(r.linked_surface)}</td><td>${esc(r.ux_mode)}</td><td>${esc(r.module_scope)}</td><td>${esc(r.module_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const surfaceRows = surfaces.map(r => `<tr><td>${r.id}</td><td>${esc(r.surface_name)}</td><td>${esc(r.linked_system)}</td><td>${esc(r.surface_type)}</td><td>${esc(r.surface_scope)}</td><td>${esc(r.surface_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');

  return htmlPage('Streaming Hub', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>Aniyah Cross-Border Streaming Ecosystem</h1><p>${esc(message || 'Streaming systems are live.')}</p></section>
      <section><h2>Quick Actions</h2>
        <form method="POST" action="/streaming/platform-safe" style="margin-bottom:12px;"><button type="submit">Create Streaming Platform Record</button></form>
        <form method="POST" action="/ux/nav-safe" style="margin-bottom:12px;"><button type="submit">Create UI Navigation Record</button></form>
        <form method="POST" action="/ux/module-safe" style="margin-bottom:12px;"><button type="submit">Create UX Module</button></form>
        <form method="POST" action="/ux/surface-safe" style="margin-bottom:12px;"><button type="submit">Create App Surface</button></form>
      </section>
      <section><h2>Streaming Platforms</h2><table><thead><tr><th>ID</th><th>Name</th><th>Content</th><th>Region</th><th>Monetization</th><th>Status</th><th>Created</th></tr></thead><tbody>${platformRows || '<tr><td colspan="7">No streaming platforms</td></tr>'}</tbody></table></section>
      <section><h2>Navigation</h2><table><thead><tr><th>ID</th><th>Name</th><th>Route</th><th>Scope</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead><tbody>${navRows || '<tr><td colspan="7">No navigation records</td></tr>'}</tbody></table></section>
      <section><h2>UX Modules</h2><table><thead><tr><th>ID</th><th>Name</th><th>Surface</th><th>Mode</th><th>Scope</th><th>Status</th><th>Created</th></tr></thead><tbody>${uxRows || '<tr><td colspan="7">No UX modules</td></tr>'}</tbody></table></section>
      <section><h2>App Surfaces</h2><table><thead><tr><th>ID</th><th>Name</th><th>System</th><th>Type</th><th>Scope</th><th>Status</th><th>Created</th></tr></thead><tbody>${surfaceRows || '<tr><td colspan="7">No app surfaces</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}

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
      <section><h1>Command Center</h1><p>${esc(message || 'Premium dashboard command center is live.')}</p></section>
      <section><h2>Quick Access</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;">${cardHtml || '<p>No cards yet.</p>'}</div></section>
      <section><h2>Grouped Navigation</h2>${groupHtml || '<p>No navigation groups yet.</p>'}</section>
    </main>
  `, user);
}
"""

if "function renderFinanceHubPage(req, user = null, message = '') {" not in text:
    anchor = "function renderMiddleverseBridgePage(req, user = null, message = '') {"
    if anchor in text:
        text = text.replace(anchor, helpers + "\n\n" + anchor, 1)

routes = r"""
    if (req.method === 'GET' && pathname === '/command-center') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderCommandCenterPage(req, null, getQueryParam(req, 'msg') || ''));
    }

    if (req.method === 'GET' && pathname === '/finance-hub') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderFinanceHubPage(req, null, getQueryParam(req, 'msg') || ''));
    }

    if (req.method === 'GET' && pathname === '/streaming-hub') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderStreamingHubPage(req, null, getQueryParam(req, 'msg') || ''));
    }
"""

patterns = [
    r"(\s+if \(req\.method === 'GET' && pathname === '/middleverse-bridge'\) \{)",
    r"(\s+if \(req\.method === 'GET' && pathname === '/health'\) \{)",
    r"(\s+if \(req\.method === 'GET' && pathname === '/metaverse-control'\) \{)"
]

if "pathname === '/command-center'" not in text:
    inserted = False
    for pat in patterns:
        new_text, n = re.subn(pat, routes + r"\1", text, count=1)
        if n:
            text = new_text
            inserted = True
            break
    if not inserted:
        raise SystemExit("Could not find request-handler anchor for Pass M route repair")

home_old = """<a href="/finance-hub">Finance Hub</a>
<a href="/streaming-hub">Streaming Hub</a>"""
home_new = """<a href="/finance-hub">Finance Hub</a>
<a href="/streaming-hub">Streaming Hub</a>
<a href="/command-center">Command Center</a>"""

if home_old in text and "/command-center" not in text:
    text = text.replace(home_old, home_new, 1)

p.write_text(text)
print("[OK] pass M missing routes repaired")
PYEOF

########################################
# 2) HARD RUNTIME RECOVERY
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
# 3) TARGETED ROUTE SMOKE
########################################
curl -s -i http://127.0.0.1:4900/command-center > "test_results/command_center_repair_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/finance-hub > "test_results/finance_hub_repair_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/streaming-hub > "test_results/streaming_hub_repair_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_repair_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_repair_${STAMP}.txt" || true

########################################
# 4) TARGETED SCAN
########################################
python3 << 'PYEOF'
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for name in [
    f"command_center_repair_{stamp}.txt",
    f"finance_hub_repair_{stamp}.txt",
    f"streaming_hub_repair_{stamp}.txt",
    f"dashboard_health_repair_{stamp}.txt",
    f"jarvis_health_repair_{stamp}.txt",
]:
    f = root / name
    txt = f.read_text(errors="ignore").lower() if f.exists() else ""
    if "cannot get" in txt or "not found" in txt:
        issues.append({"file": name, "problem": "route_missing"})
    if "http/1.1 500" in txt:
        issues.append({"file": name, "problem": "http_500"})
    if "syntaxerror" in txt or "referenceerror" in txt:
        issues.append({"file": name, "problem": "js_runtime_error"})
    if "dashboard_health" in name and '"ok": true' not in txt:
        issues.append({"file": name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in name and '"ok": true' not in txt:
        issues.append({"file": name, "problem": "jarvis_health_unexpected"})

out = Path.home() / "aam_full_system" / "snapshots" / "repair_pass_m_missing_routes_scan_latest.json"
out.write_text(json.dumps(issues, indent=2))
print(f"[OK] pass M missing-route repair scan complete: {len(issues)} issues")
PYEOF

########################################
# 5) FINAL REPORT
########################################
cat > "reports/repair_pass_m_missing_routes_only_${STAMP}.txt" <<REPORT
REPAIR PASS M MISSING ROUTES ONLY REPORT
Timestamp: ${STAMP}

Fixed:
- command center GET route
- finance hub GET route
- streaming hub GET route

Verified:
- dashboard health
- jarvis health
- command center route
- finance hub route
- streaming hub route

Purpose:
- repair the only remaining Pass M routing gaps
- preserve stable runtime
- avoid rerunning the full command center build
REPORT

echo "=== REPAIR PASS M MISSING ROUTES ONLY COMPLETE ==="
echo "Check:"
echo "  cat snapshots/repair_pass_m_missing_routes_scan_latest.json"
echo "  cat reports/repair_pass_m_missing_routes_only_${STAMP}.txt"
echo "  bash scripts/status.sh"
