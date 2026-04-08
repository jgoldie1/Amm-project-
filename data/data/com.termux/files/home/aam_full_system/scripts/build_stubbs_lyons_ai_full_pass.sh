#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system || exit 1

echo "=== STUBBS AI + LYONS TECH AI FULL PASS ==="

mkdir -p backups data/modules data/integrations

cp apps/dashboard.js backups/dashboard_before_stubbs_lyons_ai_$(date +%Y%m%d_%H%M%S).js
cp apps/jarvis.js backups/jarvis_before_stubbs_lyons_ai_$(date +%Y%m%d_%H%M%S).js

cat > data/modules/stubbs_ai.json << 'JSON'
{
  "name": "Stubbs AI",
  "status": "active_build",
  "category": "platform_intelligence",
  "purpose": "Primary platform intelligence layer for orchestration, creator logic, command-center decisions, and ecosystem expansion.",
  "features": [
    "platform reasoning",
    "creator economy orchestration",
    "dashboard intelligence",
    "task routing",
    "module awareness",
    "release readiness support"
  ],
  "connects_to": [
    "system_config_registry",
    "modules_index",
    "jarvis",
    "dashboard",
    "creator_payouts",
    "nft_launchpad",
    "life_world"
  ]
}
JSON

cat > data/modules/lyons_tech_ai.json << 'JSON'
{
  "name": "Lyons Tech AI",
  "status": "active_build",
  "category": "technical_intelligence",
  "purpose": "Technical intelligence layer for backend logic, platform hardening, automation support, and engineering workflows.",
  "features": [
    "backend intelligence",
    "automation logic",
    "platform hardening",
    "debug flow support",
    "technical orchestration",
    "service reliability support"
  ],
  "connects_to": [
    "system_config_registry",
    "modules_index",
    "jarvis",
    "dashboard",
    "life_world",
    "audio_session_registry",
    "creator_platform"
  ]
}
JSON

python << 'PYEOF'
import json
import sqlite3
from pathlib import Path

root = Path.home() / "aam_full_system"
db = root / "db" / "aam.db"

conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS system_config_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_name TEXT,
  config_value TEXT,
  config_group TEXT,
  config_status TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

flags = [
    ("feature_stubbs_ai", "enabled", "features", "active"),
    ("feature_lyons_tech_ai", "enabled", "features", "active"),
    ("feature_frontend_intelligence", "enabled", "features", "active"),
    ("feature_backend_intelligence", "enabled", "features", "active")
]

for row in flags:
    cur.execute("SELECT COUNT(*) FROM system_config_registry WHERE config_name=?", (row[0],))
    if cur.fetchone()[0] == 0:
        cur.execute("""
        INSERT INTO system_config_registry (config_name, config_value, config_group, config_status)
        VALUES (?, ?, ?, ?)
        """, row)

conn.commit()
conn.close()

idx = root / "data" / "modules" / "modules_index.json"
data = json.loads(idx.read_text())

wanted = [
    {"name": "Stubbs AI", "file": "stubbs_ai.json", "status": "active_build", "category": "platform_intelligence"},
    {"name": "Lyons Tech AI", "file": "lyons_tech_ai.json", "status": "active_build", "category": "technical_intelligence"}
]

for item in wanted:
    if not any(x.get("name") == item["name"] for x in data):
        data.append(item)

idx.write_text(json.dumps(data, indent=2))
print("Stubbs AI + Lyons Tech AI module records added.")
PYEOF

python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

if '<a href="/ai-control">AI Control</a>' not in text:
    text = text.replace(
        '<a href="/nft-launchpad">NFT Launchpad</a>\n      <a href="/creator-payouts">Creator Payouts</a>',
        '<a href="/nft-launchpad">NFT Launchpad</a>\n      <a href="/creator-payouts">Creator Payouts</a>\n      <a href="/ai-control">AI Control</a>',
        1
    )

if "function renderAiControlPage(user = null)" not in text:
    insert_before = "function renderDashboard() {"
    block = r'''
function renderAiControlPage(user = null) {
  const aiFlags = dbQuery(`
    SELECT id, config_name, config_value, config_status, created_at
    FROM system_config_registry
    WHERE lower(config_name) like '%ai%'
       or lower(config_name) like '%holo%'
       or lower(config_name) like '%codex%'
       or lower(config_name) like '%copilot%'
       or lower(config_name) like '%wix%'
       or lower(config_name) like '%omnisea%'
       or lower(config_name) like '%nft%'
    ORDER BY id DESC
    LIMIT 100
  `);

  const rows = aiFlags.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.config_name || ''}</td>
      <td>${r.config_value || ''}</td>
      <td>${r.config_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('AI Control', `
    <div class="section">
      <div class="card">
        <h2>AI Control Center</h2>
        <p>Front-end and back-end intelligence layer for Stubbs AI, Lyons Tech AI, Jarvis, creator systems, and platform services.</p>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Stubbs AI</h3>
          <p>Platform intelligence, creator orchestration, release awareness, and ecosystem guidance.</p>
        </div>
        <div class="card">
          <h3>Lyons Tech AI</h3>
          <p>Technical intelligence, backend stabilization, automation logic, and engineering workflow support.</p>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Active AI / Platform Flags</h3>
        <table>
          <thead><tr><th>ID</th><th>Config</th><th>Value</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `, user);
}
'''
    text = text.replace(insert_before, block + "\n" + insert_before, 1)

route_anchor = "    if (req.method === 'GET' && pathname === '/university') {"
if route_anchor in text and "pathname === '/ai-control'" not in text:
    route_block = r"""    if ((req.method === 'GET' || req.method === 'HEAD') && pathname === '/ai-control') {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderAiControlPage(authUser));
    }

"""
    text = text.replace(route_anchor, route_block + route_anchor, 1)

if "Stubbs AI" not in text[text.find("Holo Command Center"):text.find("Holo Command Center")+1600]:
    text = text.replace(
        '<div class="card"><h3>Codex / Copilot</h3><p class="ok">ENABLED</p></div>',
        '<div class="card"><h3>Codex / Copilot</h3><p class="ok">ENABLED</p></div>\n'
        '      <div class="card"><h3>Stubbs AI</h3><p class="ok">ENABLED</p></div>\n'
        '      <div class="card"><h3>Lyons Tech AI</h3><p class="ok">ENABLED</p></div>',
        1
    )

p.write_text(text)
print("Dashboard AI control patch applied.")
PYEOF

python << 'PYEOF'
from pathlib import Path
p = Path.home() / "aam_full_system" / "apps" / "jarvis.js"
text = p.read_text()

if "stubbs_ai_status" not in text:
    text = text.replace(
        "      if (action === 'log_event') {",
        """      if (action === 'stubbs_ai_status') {
        return sendJSON(res, {
          ok: true,
          action: 'stubbs_ai_status',
          result: 'platform intelligence enabled'
        });
      }

      if (action === 'lyons_tech_ai_status') {
        return sendJSON(res, {
          ok: true,
          action: 'lyons_tech_ai_status',
          result: 'technical intelligence enabled'
        });
      }

      if (action === 'log_event') {""",
        1
    )

    text = text.replace(
        '<a href="/action?action=launch_life_world">Launch Life World</a>',
        '<a href="/action?action=launch_life_world">Launch Life World</a>\n'
        '      <a href="/action?action=stubbs_ai_status">Stubbs AI</a>\n'
        '      <a href="/action?action=lyons_tech_ai_status">Lyons Tech AI</a>',
        1
    )

p.write_text(text)
print("Jarvis Stubbs/Lyons actions patched.")
PYEOF

echo
echo "=== VALIDATE MODULE FILES ==="
python -m json.tool data/modules/stubbs_ai.json >/dev/null && echo "stubbs_ai.json OK"
python -m json.tool data/modules/lyons_tech_ai.json >/dev/null && echo "lyons_tech_ai.json OK"
python -m json.tool data/modules/modules_index.json >/dev/null && echo "modules_index.json OK"

echo
echo "=== RESTART / STABILIZE ==="
bash scripts/safe_restart.sh || exit 1
bash scripts/check_js.sh || exit 1
bash scripts/status.sh || exit 1
bash scripts/smoke_test.sh || exit 1

echo
echo "=== SERVICE HEALTH ==="
curl -s http://127.0.0.1:4902/health || echo "life world down"
echo
curl -s http://127.0.0.1:5000/health || echo "jarvis down"
echo

echo
echo "=== JARVIS AI ACTION CHECK ==="
curl -s "http://127.0.0.1:5000/action?action=stubbs_ai_status"
echo
curl -s "http://127.0.0.1:5000/action?action=lyons_tech_ai_status"
echo

echo
echo "=== ROUTE VERIFY ==="
grep -n "renderAiControlPage" apps/dashboard.js || true
grep -n "pathname === '/ai-control'" apps/dashboard.js || true
grep -n "Stubbs AI" apps/dashboard.js | head
grep -n "Lyons Tech AI" apps/dashboard.js | head
grep -n "stubbs_ai_status" apps/jarvis.js || true
grep -n "lyons_tech_ai_status" apps/jarvis.js || true

echo
echo "=== FEATURE FLAGS ==="
sqlite3 -json db/aam.db "
select id, config_name, config_value, config_status
from system_config_registry
where lower(config_name) like '%stubbs%'
   or lower(config_name) like '%lyons%'
   or lower(config_name) like '%frontend_intelligence%'
   or lower(config_name) like '%backend_intelligence%'
order by id;
"

echo
echo "FULL PASS COMPLETE"
