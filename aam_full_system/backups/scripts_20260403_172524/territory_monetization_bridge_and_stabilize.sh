#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== TERRITORY MONETIZATION BRIDGE + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_territory_bridge_${STAMP}.js"
cp db/aam.db "backups/aam_territory_bridge_${STAMP}.db"

########################################
# 2) DATABASE SUPPORT
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS territory_monetization_bridge (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  territory_name TEXT NOT NULL,
  territory_type TEXT,
  creator_market_enabled TEXT DEFAULT 'no',
  property_market_enabled TEXT DEFAULT 'no',
  premium_world_enabled TEXT DEFAULT 'no',
  monetization_status TEXT DEFAULT 'planned',
  rollout_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS territory_activation_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  territory_name TEXT NOT NULL,
  territory_type TEXT,
  current_phase TEXT,
  activation_status TEXT,
  monetization_status TEXT,
  summary_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

existing = cur.execute("SELECT count(*) FROM territory_monetization_bridge").fetchone()[0]
if existing == 0:
    seeds = [
        ("Georgia", "state", "yes", "yes", "yes", "launch_ready", "Strong Southeast rollout candidate"),
        ("Texas", "state", "yes", "yes", "yes", "launch_ready", "Large property + action + creator opportunity"),
        ("California", "state", "yes", "yes", "yes", "launch_ready", "Creator + premium world hub"),
        ("Nigeria", "country", "yes", "no", "yes", "launch_ready", "Mobile creator expansion focus"),
        ("Japan", "country", "yes", "yes", "yes", "launch_ready", "Premium world launch focus"),
        ("Canada", "country", "yes", "yes", "no", "growth", "Property and creator growth"),
        ("India", "country", "yes", "no", "yes", "growth", "Large creator economy potential"),
    ]
    cur.executemany("""
        INSERT INTO territory_monetization_bridge
        (territory_name, territory_type, creator_market_enabled, property_market_enabled, premium_world_enabled, monetization_status, rollout_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, seeds)

# refresh summaries from territory_registry where available
rows = cur.execute("""
SELECT territory_name, territory_type, launch_phase, activation_status
FROM territory_registry
ORDER BY id
""").fetchall()

for territory_name, territory_type, launch_phase, activation_status in rows:
    bridge = cur.execute("""
    SELECT monetization_status, rollout_notes
    FROM territory_monetization_bridge
    WHERE territory_name=? AND territory_type=?
    ORDER BY id DESC LIMIT 1
    """, (territory_name, territory_type)).fetchone()

    monetization_status = bridge[0] if bridge else "planned"
    notes = bridge[1] if bridge else "awaiting monetization plan"

    cur.execute("""
    INSERT INTO territory_activation_summary
    (territory_name, territory_type, current_phase, activation_status, monetization_status, summary_notes)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (territory_name, territory_type, launch_phase, activation_status, monetization_status, notes))

conn.commit()
conn.close()
print("[OK] territory monetization bridge ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderTerritoryBridgePage(req, user = null, message = '') {
  const bridgeRowsData = dbQuery(`
    SELECT id, territory_name, territory_type, creator_market_enabled, property_market_enabled, premium_world_enabled, monetization_status, rollout_notes, created_at
    FROM territory_monetization_bridge
    ORDER BY id DESC
    LIMIT 300
  `);

  const summaryRowsData = dbQuery(`
    SELECT id, territory_name, territory_type, current_phase, activation_status, monetization_status, summary_notes, created_at
    FROM territory_activation_summary
    ORDER BY id DESC
    LIMIT 300
  `);

  const bridgeRows = bridgeRowsData.map(r => `<tr><td>${r.id}</td><td>${r.territory_name}</td><td>${r.territory_type || ''}</td><td>${r.creator_market_enabled}</td><td>${r.property_market_enabled}</td><td>${r.premium_world_enabled}</td><td>${r.monetization_status}</td><td>${r.rollout_notes || ''}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const summaryRows = summaryRowsData.map(r => `<tr><td>${r.id}</td><td>${r.territory_name}</td><td>${r.territory_type || ''}</td><td>${r.current_phase || ''}</td><td>${r.activation_status || ''}</td><td>${r.monetization_status || ''}</td><td>${r.summary_notes || ''}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Territory Monetization Bridge', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="territory-bridge-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Territory Rollout + Monetization Bridge</div>
            <h1 id="territory-bridge-title">Territory Monetization Bridge</h1>
            <p>See which territories are ready for creator marketplace, property market, and premium world activation, and how rollout phase connects to revenue planning.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/territory-bridge" class="hero-primary-btn">Territory Bridge</a>
              <a href="/territory-activation" class="hero-secondary-btn">Territory Activation</a>
              <a href="/international-expansion" class="hero-secondary-btn">International</a>
              <a href="/world-selector" class="hero-secondary-btn">World Selector</a>
            </div>
          </div>
        </section>

        <section><table aria-label="Territory Monetization Bridge"><thead><tr><th>ID</th><th>Territory</th><th>Type</th><th>Creator</th><th>Property</th><th>Premium</th><th>Status</th><th>Notes</th><th>Created</th></tr></thead><tbody>${bridgeRows || '<tr><td colspan="9">No territory bridge rows yet.</td></tr>'}</tbody></table></section>

        <section><table aria-label="Territory Activation Summary"><thead><tr><th>ID</th><th>Territory</th><th>Type</th><th>Phase</th><th>Activation</th><th>Monetization</th><th>Notes</th><th>Created</th></tr></thead><tbody>${summaryRows || '<tr><td colspan="8">No activation summaries yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}
"""

if "function renderTerritoryBridgePage(req, user = null, message = '')" not in text:
    text = text.replace("const server = http.createServer(async (req, res) => {", helper + "\nconst server = http.createServer(async (req, res) => {", 1)

if '<a href="/territory-bridge">Territory Bridge</a>' not in text and '<a href="/territory-activation">Territory Control</a>' in text:
    text = text.replace(
        '<a href="/territory-activation">Territory Control</a>',
        '<a href="/territory-activation">Territory Control</a>\n          <a href="/territory-bridge">Territory Bridge</a>',
        1
    )

get_route = """
    if (req.method === 'GET' && pathname === '/territory-bridge') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderTerritoryBridgePage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

if "pathname === '/territory-bridge'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/territory-activation') {"
    if anchor in text:
        text = text.replace(anchor, get_route + "\n" + anchor, 1)

p.write_text(text)
print("[OK] territory monetization bridge routes ready")
PYEOF

########################################
# 4) RESTART / VERIFY
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true

########################################
# 5) SMOKE TEST
########################################
for route in \
  / \
  /territory-bridge \
  /territory-activation \
  /international-expansion \
  /world-selector \
  /realworld \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as territory_monetization_bridge from territory_monetization_bridge;" > "snapshots/territory_monetization_bridge_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as territory_activation_summary from territory_activation_summary;" > "snapshots/territory_activation_summary_${STAMP}.json"
sqlite3 -json db/aam.db "select id, territory_name, territory_type, creator_market_enabled, property_market_enabled, premium_world_enabled, monetization_status, rollout_notes, created_at from territory_monetization_bridge order by id desc limit 50;" > "snapshots/territory_monetization_bridge_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, territory_name, territory_type, current_phase, activation_status, monetization_status, summary_notes, created_at from territory_activation_summary order by id desc limit 50;" > "snapshots/territory_activation_summary_tail_${STAMP}.json"

########################################
# 7) FRESH-ONLY ERROR SCAN
########################################
python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such table" in lower:
        issues.append({"file": f.name, "problem": "missing_table"})
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "territory_bridge_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] territory bridge scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/territory_monetization_bridge_and_stabilize_${STAMP}.txt" <<REPORT
TERRITORY MONETIZATION BRIDGE + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- territory_monetization_bridge
- territory_activation_summary
- territory-bridge route

Purpose:
- connect territory rollout to monetization readiness
- show where creator/property/premium worlds are enabled
- stabilize the territory intelligence layer
REPORT

echo "TERRITORY MONETIZATION BRIDGE + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/territory_bridge_scan_latest.json"
echo "  cat snapshots/territory_monetization_bridge_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/territory-bridge"
echo "  termux-open-url http://127.0.0.1:4900/territory-activation"
echo "  termux-open-url http://127.0.0.1:4900/world-selector"
