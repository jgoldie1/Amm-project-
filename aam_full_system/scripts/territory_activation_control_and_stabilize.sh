#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== TERRITORY ACTIVATION CONTROL + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_territory_activation_${STAMP}.js"
cp db/aam.db "backups/aam_territory_activation_${STAMP}.db"

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
CREATE TABLE IF NOT EXISTS territory_activation_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  territory_name TEXT NOT NULL,
  territory_type TEXT,
  previous_phase TEXT,
  new_phase TEXT,
  previous_status TEXT,
  new_status TEXT,
  activation_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS rollout_control_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_name TEXT NOT NULL,
  rollout_mode TEXT DEFAULT 'controlled',
  territory_scope TEXT DEFAULT 'global',
  monetization_mode TEXT DEFAULT 'creator+property+premium',
  profile_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

count = cur.execute("SELECT count(*) FROM rollout_control_profiles").fetchone()[0]
if count == 0:
    cur.execute("""
    INSERT INTO rollout_control_profiles
    (profile_name, rollout_mode, territory_scope, monetization_mode, profile_status)
    VALUES
    ('Global Staged Rollout', 'controlled', 'global', 'creator+property+premium', 'active')
    """)

conn.commit()
conn.close()
print("[OK] territory activation tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderTerritoryActivationPage(req, user = null, message = '') {
  const territories = dbQuery(`
    SELECT id, territory_name, territory_type, region, launch_phase, monetization_focus, priority_level, activation_status, created_at
    FROM territory_registry
    ORDER BY territory_type, region, territory_name
    LIMIT 500
  `);

  const activationLog = dbQuery(`
    SELECT id, territory_name, territory_type, previous_phase, new_phase, previous_status, new_status, activation_notes, created_at
    FROM territory_activation_log
    ORDER BY id DESC
    LIMIT 200
  `);

  const profiles = dbQuery(`
    SELECT id, profile_name, rollout_mode, territory_scope, monetization_mode, profile_status, created_at
    FROM rollout_control_profiles
    ORDER BY id DESC
    LIMIT 50
  `);

  const territoryOptions = territories.map(t => `<option value="${t.id}">${t.territory_name} (${t.territory_type})</option>`).join('');
  const territoryRows = territories.map(r => `<tr><td>${r.id}</td><td>${r.territory_name}</td><td>${r.territory_type}</td><td>${r.region || ''}</td><td>${r.launch_phase}</td><td>${r.monetization_focus || ''}</td><td>${r.priority_level}</td><td>${r.activation_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const logRows = activationLog.map(r => `<tr><td>${r.id}</td><td>${r.territory_name}</td><td>${r.territory_type || ''}</td><td>${r.previous_phase || ''}</td><td>${r.new_phase || ''}</td><td>${r.previous_status || ''}</td><td>${r.new_status || ''}</td><td>${r.activation_notes || ''}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const profileRows = profiles.map(r => `<tr><td>${r.id}</td><td>${r.profile_name}</td><td>${r.rollout_mode}</td><td>${r.territory_scope}</td><td>${r.monetization_mode}</td><td>${r.profile_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Territory Activation Control', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="territory-activation-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Time Machine Rollout Control</div>
            <h1 id="territory-activation-title">Territory Activation Control</h1>
            <p>Move territories through future, launch, live, and archived phases while keeping a full activation history.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/territory-activation" class="hero-primary-btn">Territory Activation</a>
              <a href="/international-expansion" class="hero-secondary-btn">International</a>
              <a href="/world-selector" class="hero-secondary-btn">World Selector</a>
              <a href="/realworld" class="hero-secondary-btn">Realworld</a>
            </div>
          </div>
        </section>

        <section>
          <form method="POST" action="/territory-activation/update">
            <label>Territory</label>
            <select name="territory_id" aria-label="Territory">${territoryOptions}</select>

            <label>New Phase</label>
            <select name="new_phase" aria-label="New Phase">
              <option value="future">future</option>
              <option value="launch">launch</option>
              <option value="live">live</option>
              <option value="archived">archived</option>
            </select>

            <label>New Status</label>
            <select name="new_status" aria-label="New Status">
              <option value="inactive">inactive</option>
              <option value="launch_ready">launch_ready</option>
              <option value="active">active</option>
              <option value="archived">archived</option>
            </select>

            <label>Notes</label>
            <input name="activation_notes" value="territory rollout update" aria-label="Activation Notes" />

            <button type="submit">Update Territory</button>
          </form>
        </section>

        <section><table aria-label="Rollout Control Profiles"><thead><tr><th>ID</th><th>Name</th><th>Mode</th><th>Scope</th><th>Monetization</th><th>Status</th><th>Created</th></tr></thead><tbody>${profileRows || '<tr><td colspan="7">No rollout profiles yet.</td></tr>'}</tbody></table></section>

        <section><table aria-label="Territories"><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Region</th><th>Phase</th><th>Monetization</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead><tbody>${territoryRows || '<tr><td colspan="9">No territories yet.</td></tr>'}</tbody></table></section>

        <section><table aria-label="Territory Activation Log"><thead><tr><th>ID</th><th>Territory</th><th>Type</th><th>Prev Phase</th><th>New Phase</th><th>Prev Status</th><th>New Status</th><th>Notes</th><th>Created</th></tr></thead><tbody>${logRows || '<tr><td colspan="9">No activation events yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}
"""

if "function renderTerritoryActivationPage(req, user = null, message = '')" not in text:
    text = text.replace("const server = http.createServer(async (req, res) => {", helper + "\nconst server = http.createServer(async (req, res) => {", 1)

if '<a href="/territory-activation">Territory Control</a>' not in text and '<a href="/international-expansion">International</a>' in text:
    text = text.replace(
        '<a href="/international-expansion">International</a>',
        '<a href="/international-expansion">International</a>\n          <a href="/territory-activation">Territory Control</a>',
        1
    )

get_route = """
    if (req.method === 'GET' && pathname === '/territory-activation') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderTerritoryActivationPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

post_route = """
    if (req.method === 'POST' && pathname === '/territory-activation/update') {
      const body = await parseBody(req);
      const territoryId = Number(body.territory_id || 0);
      const newPhase = String(body.new_phase || 'future').trim();
      const newStatus = String(body.new_status || 'inactive').trim();
      const notes = String(body.activation_notes || '').trim();

      const rows = dbQuery(`
        SELECT id, territory_name, territory_type, launch_phase, activation_status
        FROM territory_registry
        WHERE id=${territoryId}
        LIMIT 1
      `);

      if (!rows.length) {
        return redirect(res, '/territory-activation?msg=Territory%20not%20found');
      }

      const t = rows[0];

      dbRun(`INSERT INTO territory_activation_log
             (territory_name, territory_type, previous_phase, new_phase, previous_status, new_status, activation_notes)
             VALUES ('${q(t.territory_name)}', '${q(t.territory_type || '')}', '${q(t.launch_phase || '')}', '${q(newPhase)}', '${q(t.activation_status || '')}', '${q(newStatus)}', '${q(notes)}')`);

      dbRun(`UPDATE territory_registry
             SET launch_phase='${q(newPhase)}', activation_status='${q(newStatus)}'
             WHERE id=${territoryId}`);

      dbRun(`INSERT INTO timeline_registry
             (entity_type, entity_name, phase, event_description)
             VALUES ('territory', '${q(t.territory_name)}', '${q(newPhase)}', '${q(notes or "territory rollout update")}')`);

      return redirect(res, '/territory-activation?msg=Territory%20updated');
    }
"""

if "pathname === '/territory-activation'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/international-expansion') {"
    if anchor in text:
        text = text.replace(anchor, get_route + "\n" + anchor, 1)

if "pathname === '/territory-activation/update'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/territory-activation') {"
    if anchor in text:
        text = text.replace(anchor, post_route + "\n\n" + anchor, 1)

p.write_text(text)
print("[OK] territory activation routes ready")
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
curl -s -i -X POST "http://127.0.0.1:4900/territory-activation/update" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "territory_id=1&new_phase=launch&new_status=launch_ready&activation_notes=Georgia launch preparation" \
  > "test_results/territory_activation_update_${STAMP}.txt" || true

for route in \
  / \
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
sqlite3 -json db/aam.db "select count(*) as territory_activation_log from territory_activation_log;" > "snapshots/territory_activation_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as rollout_control_profiles from rollout_control_profiles;" > "snapshots/rollout_control_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select id, territory_name, territory_type, region, launch_phase, monetization_focus, priority_level, activation_status, created_at from territory_registry order by id desc limit 50;" > "snapshots/territory_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, territory_name, territory_type, previous_phase, new_phase, previous_status, new_status, activation_notes, created_at from territory_activation_log order by id desc limit 50;" > "snapshots/territory_activation_log_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, entity_type, entity_name, phase, event_description, created_at from timeline_registry order by id desc limit 50;" > "snapshots/timeline_registry_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "territory_activation_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] territory activation scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/territory_activation_control_and_stabilize_${STAMP}.txt" <<REPORT
TERRITORY ACTIVATION CONTROL + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- territory_activation_log
- rollout_control_profiles
- territory-activation route
- territory activation update action

Purpose:
- control future, launch, live, and archived territory phases
- connect the time-machine layer to real rollout actions
- stabilize territory expansion management
REPORT

echo "TERRITORY ACTIVATION CONTROL + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/territory_activation_scan_latest.json"
echo "  cat snapshots/territory_activation_log_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/territory-activation"
echo "  termux-open-url http://127.0.0.1:4900/international-expansion"
echo "  termux-open-url http://127.0.0.1:4900/world-selector"
