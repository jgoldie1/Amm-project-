#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== GAMEPLAY LIVE ACTIONS + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_gameplay_live_actions_${STAMP}.js"
cp db/aam.db "backups/aam_gameplay_live_actions_${STAMP}.db"

########################################
# 2) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function renderGameplayActionsPage(req, user = null, message = '') {
  const missions = dbQuery(`
    SELECT id, mission_name, mission_type, reward_type, reward_value, mission_status, created_at
    FROM world_mission_profiles
    ORDER BY id DESC
    LIMIT 100
  `);

  const cities = dbQuery(`
    SELECT id, city_name, state_name, region_name, destination_route, city_status, created_at
    FROM realworld_city_registry
    ORDER BY region_name, state_name, city_name
    LIMIT 200
  `);

  const properties = dbQuery(`
    SELECT b.id, b.building_name, p.parcel_name, b.building_status
    FROM building_registry b
    LEFT JOIN land_parcels p ON p.id = b.parcel_id
    ORDER BY b.id DESC
    LIMIT 200
  `);

  const recentActions = dbQuery(`
    SELECT id, event_type, event_subject, event_payload, event_status, created_at
    FROM world_interaction_events
    ORDER BY id DESC
    LIMIT 100
  `);

  const missionOptions = missions.map(m => `<option value="${m.id}">${m.mission_name}</option>`).join('');
  const cityOptions = cities.map(c => `<option value="${c.city_name}">${c.city_name}, ${c.state_name || ''}</option>`).join('');
  const propertyOptions = properties.map(p => `<option value="${p.building_name}">${p.building_name} (${p.parcel_name || 'No Parcel'})</option>`).join('');
  const actionRows = recentActions.map(r => `<tr><td>${r.id}</td><td>${r.event_type}</td><td>${r.event_subject || ''}</td><td>${r.event_payload || ''}</td><td>${r.event_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Gameplay Live Actions', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="live-actions-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Interactive Gameplay Actions</div>
            <h1 id="live-actions-title">Gameplay Live Actions</h1>
            <p>Use live action forms to accept missions, complete missions, claim rewards, claim property, save sessions, and earn city badges.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/gameplay-live-actions" class="hero-primary-btn">Gameplay Live Actions</a>
              <a href="/gameplay-assets" class="hero-secondary-btn">Assets</a>
              <a href="/gameplay-progression" class="hero-secondary-btn">Progression</a>
              <a href="/world3d" class="hero-secondary-btn">Open World</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Mission Actions', `
          <form method="POST" action="/gameplay-actions/mission-complete">
            <label>Player Name</label>
            <input name="player_name" value="Jacobie" aria-label="Player Name" />
            <label>Mission</label>
            <select name="mission_id" aria-label="Mission">${missionOptions}</select>
            <button type="submit">Complete Mission</button>
          </form>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Reward Claim', `
          <form method="POST" action="/gameplay-actions/reward-claim">
            <label>Player Name</label>
            <input name="player_name" value="Jacobie" aria-label="Player Name" />
            <label>Reward Type</label>
            <input name="reward_type" value="access" aria-label="Reward Type" />
            <label>Reward Value</label>
            <input name="reward_value" value="world_unlock" aria-label="Reward Value" />
            <button type="submit">Claim Reward</button>
          </form>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Property Claim', `
          <form method="POST" action="/gameplay-actions/property-claim">
            <label>Player Name</label>
            <input name="player_name" value="Jacobie" aria-label="Player Name" />
            <label>Building</label>
            <select name="building_name" aria-label="Building">${propertyOptions}</select>
            <button type="submit">Claim Property</button>
          </form>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('City Badge', `
          <form method="POST" action="/gameplay-actions/city-badge">
            <label>Player Name</label>
            <input name="player_name" value="Jacobie" aria-label="Player Name" />
            <label>City</label>
            <select name="city_name" aria-label="City">${cityOptions}</select>
            <button type="submit">Earn City Badge</button>
          </form>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Save Session', `
          <form method="POST" action="/gameplay-actions/save-session">
            <label>Player Name</label>
            <input name="player_name" value="Jacobie" aria-label="Player Name" />
            <label>Zone</label>
            <input name="current_zone" value="Marketplace District" aria-label="Current Zone" />
            <label>City</label>
            <input name="current_city" value="Chicago" aria-label="Current City" />
            <label>Property</label>
            <input name="current_property" value="Chicago Tower One" aria-label="Current Property" />
            <label>Mission Focus</label>
            <input name="mission_focus" value="Claim Property Route" aria-label="Mission Focus" />
            <button type="submit">Save Session</button>
          </form>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Recent Gameplay Events', `
          <table aria-label="Recent Gameplay Events">
            <thead><tr><th>ID</th><th>Type</th><th>Subject</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${actionRows || '<tr><td colspan="6">No recent events yet.</td></tr>'}</tbody>
          </table>
        `) : ''}
      </main>
    </div>
  `, user);
}
"""

server_marker = "const server = http.createServer(async (req, res) => {"
if "function renderGameplayActionsPage(req, user = null, message = '')" not in text:
    text = text.replace(server_marker, helper + "\n" + server_marker, 1)

if '<a href="/gameplay-live-actions">Live Actions</a>' not in text and '<a href="/gameplay-assets">Assets</a>' in text:
    text = text.replace(
        '<a href="/gameplay-assets">Assets</a>',
        '<a href="/gameplay-assets">Assets</a>\n          <a href="/gameplay-live-actions">Live Actions</a>',
        1
    )

route_get = """
    if (req.method === 'GET' && pathname === '/gameplay-live-actions') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderGameplayActionsPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

if "pathname === '/gameplay-live-actions'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/gameplay-assets') {"
    if anchor in text:
        text = text.replace(anchor, route_get + "\n" + anchor, 1)

post_block = """
    if (req.method === 'POST' && pathname === '/gameplay-actions/mission-complete') {
      const body = await parseBody(req);
      const playerName = String(body.player_name || '').trim() || 'Guest Explorer';
      const missionId = Number(body.mission_id || 0);
      const row = dbQuery(`SELECT mission_name, mission_type, reward_type, reward_value FROM world_mission_profiles WHERE id=${missionId} LIMIT 1`);
      if (row.length) {
        const m = row[0];
        dbRun(`INSERT INTO mission_completion_log (player_name, mission_name, mission_type, completion_status, reward_type, reward_value)
               VALUES ('${q(playerName)}', '${q(m.mission_name)}', '${q(m.mission_type || '')}', 'completed', '${q(m.reward_type || '')}', '${q(m.reward_value || '')}')`);
        dbRun(`INSERT INTO world_interaction_events (event_type, event_subject, event_payload, event_status)
               VALUES ('mission_complete', '${q(playerName)}', '${q(m.mission_name)}', 'processed')`);
        dbRun(`UPDATE player_progress_profiles SET xp_points = COALESCE(xp_points,0) + 25 WHERE player_name='${q(playerName)}'`);
      }
      return redirect(res, '/gameplay-live-actions?msg=Mission%20completed');
    }

    if (req.method === 'POST' && pathname === '/gameplay-actions/reward-claim') {
      const body = await parseBody(req);
      const playerName = String(body.player_name || '').trim() || 'Guest Explorer';
      const rewardType = String(body.reward_type || '').trim() || 'access';
      const rewardValue = String(body.reward_value || '').trim() || 'world_unlock';
      dbRun(`INSERT INTO reward_claim_log (player_name, reward_type, reward_value, claim_status)
             VALUES ('${q(playerName)}', '${q(rewardType)}', '${q(rewardValue)}', 'claimed')`);
      dbRun(`INSERT INTO world_interaction_events (event_type, event_subject, event_payload, event_status)
             VALUES ('reward_claim', '${q(playerName)}', '${q(rewardValue)}', 'processed')`);
      return redirect(res, '/gameplay-live-actions?msg=Reward%20claimed');
    }

    if (req.method === 'POST' && pathname === '/gameplay-actions/property-claim') {
      const body = await parseBody(req);
      const playerName = String(body.player_name || '').trim() || 'Guest Explorer';
      const buildingName = String(body.building_name || '').trim();
      const row = dbQuery(`SELECT p.parcel_name
                           FROM building_registry b
                           LEFT JOIN land_parcels p ON p.id = b.parcel_id
                           WHERE b.building_name='${q(buildingName)}'
                           LIMIT 1`);
      const parcelName = row.length ? String(row[0].parcel_name || '') : '';
      dbRun(`INSERT INTO player_property_claims (player_name, parcel_name, building_name, claim_type, claim_status)
             VALUES ('${q(playerName)}', '${q(parcelName)}', '${q(buildingName)}', 'reserved', 'active')`);
      dbRun(`INSERT INTO world_interaction_events (event_type, event_subject, event_payload, event_status)
             VALUES ('property_claim', '${q(playerName)}', '${q(buildingName)}', 'processed')`);
      return redirect(res, '/gameplay-live-actions?msg=Property%20claimed');
    }

    if (req.method === 'POST' && pathname === '/gameplay-actions/city-badge') {
      const body = await parseBody(req);
      const playerName = String(body.player_name || '').trim() || 'Guest Explorer';
      const cityName = String(body.city_name || '').trim();
      dbRun(`INSERT INTO city_progress_badges (player_name, city_name, badge_name, badge_type, badge_status)
             VALUES ('${q(playerName)}', '${q(cityName)}', '${q(cityName + ' Explorer')}','explorer','earned')`);
      dbRun(`INSERT INTO world_interaction_events (event_type, event_subject, event_payload, event_status)
             VALUES ('city_badge', '${q(playerName)}', '${q(cityName)}', 'processed')`);
      return redirect(res, '/gameplay-live-actions?msg=City%20badge%20earned');
    }

    if (req.method === 'POST' && pathname === '/gameplay-actions/save-session') {
      const body = await parseBody(req);
      const playerName = String(body.player_name || '').trim() || 'Guest Explorer';
      const currentZone = String(body.current_zone || '').trim();
      const currentCity = String(body.current_city || '').trim();
      const currentProperty = String(body.current_property || '').trim();
      const missionFocus = String(body.mission_focus || '').trim();
      dbRun(`INSERT INTO world_session_saves (player_name, current_zone, current_city, current_property, mission_focus, save_status)
             VALUES ('${q(playerName)}', '${q(currentZone)}', '${q(currentCity)}', '${q(currentProperty)}', '${q(missionFocus)}', 'active')`);
      dbRun(`INSERT INTO world_interaction_events (event_type, event_subject, event_payload, event_status)
             VALUES ('session_save', '${q(playerName)}', '${q(currentZone)}', 'processed')`);
      return redirect(res, '/gameplay-live-actions?msg=Session%20saved');
    }
"""

if "pathname === '/gameplay-actions/mission-complete'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/gameplay-live-actions') {"
    if anchor in text:
        text = text.replace(anchor, post_block + "\n\n" + anchor, 1)

p.write_text(text)
print("[OK] gameplay live actions patch applied")
PYEOF

########################################
# 4) RESTART / VERIFY
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 5) LIVE ACTION SMOKE TEST
########################################
curl -s -i -X POST "http://127.0.0.1:4900/gameplay-actions/mission-complete" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "player_name=Jacobie&mission_id=1" \
  > "test_results/gameplay_mission_complete_${STAMP}.txt" || true

curl -s -i -X POST "http://127.0.0.1:4900/gameplay-actions/reward-claim" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "player_name=Jacobie&reward_type=access&reward_value=world_unlock" \
  > "test_results/gameplay_reward_claim_${STAMP}.txt" || true

curl -s -i -X POST "http://127.0.0.1:4900/gameplay-actions/property-claim" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "player_name=Jacobie&building_name=Chicago Tower One" \
  > "test_results/gameplay_property_claim_${STAMP}.txt" || true

curl -s -i -X POST "http://127.0.0.1:4900/gameplay-actions/city-badge" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "player_name=Jacobie&city_name=Chicago" \
  > "test_results/gameplay_city_badge_${STAMP}.txt" || true

curl -s -i -X POST "http://127.0.0.1:4900/gameplay-actions/save-session" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "player_name=Jacobie&current_zone=Marketplace District&current_city=Chicago&current_property=Chicago Tower One&mission_focus=Claim Property Route" \
  > "test_results/gameplay_save_session_${STAMP}.txt" || true

for route in \
  / \
  /gameplay-live-actions \
  /gameplay-assets \
  /gameplay-progression \
  /gameplay-control \
  /property-market \
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
sqlite3 -json db/aam.db "select count(*) as mission_completion_log from mission_completion_log;" > "snapshots/mission_completion_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as reward_claim_log from reward_claim_log;" > "snapshots/reward_claim_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as player_property_claims from player_property_claims;" > "snapshots/player_property_claims_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as city_progress_badges from city_progress_badges;" > "snapshots/city_progress_badges_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_session_saves from world_session_saves;" > "snapshots/world_session_saves_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_interaction_events from world_interaction_events;" > "snapshots/world_interaction_events_${STAMP}.json"

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
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "gameplay_live_actions_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] gameplay live actions scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/gameplay_live_actions_and_stabilize_${STAMP}.txt" <<REPORT
GAMEPLAY LIVE ACTIONS + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- gameplay-live-actions route
- mission complete action
- reward claim action
- property claim action
- city badge action
- session save action

Purpose:
- convert seeded gameplay records into live actions
- strengthen real gameplay loop behavior
- move the world shell toward usable progression mechanics
REPORT

echo "GAMEPLAY LIVE ACTIONS + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/gameplay_live_actions_scan_latest.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/gameplay-live-actions"
echo "  termux-open-url http://127.0.0.1:4900/gameplay-assets"
echo "  termux-open-url http://127.0.0.1:4900/world3d"
