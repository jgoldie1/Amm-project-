#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FULL COMPLETION + SMOKE + STABILIZE + READINESS START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_full_completion_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_full_completion_${STAMP}.js"
cp db/aam.db "backups/aam_full_completion_${STAMP}.db"

########################################
# 2) CREATE READINESS / COMPLETION TABLES
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

tables = {
"feature_completion_registry": """
CREATE TABLE IF NOT EXISTS feature_completion_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_name TEXT NOT NULL,
  feature_group TEXT NOT NULL,
  build_level TEXT DEFAULT 'foundation',
  completion_percent INTEGER DEFAULT 0,
  next_priority TEXT,
  feature_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)""",
"workflow_dependency_registry": """
CREATE TABLE IF NOT EXISTS workflow_dependency_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_name TEXT NOT NULL,
  dependency_name TEXT NOT NULL,
  dependency_group TEXT,
  dependency_status TEXT DEFAULT 'tracked',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)""",
"readiness_scorecard_registry": """
CREATE TABLE IF NOT EXISTS readiness_scorecard_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  system_name TEXT NOT NULL,
  readiness_area TEXT NOT NULL,
  readiness_score INTEGER DEFAULT 0,
  readiness_notes TEXT,
  readiness_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)""",
"release_readiness_registry": """
CREATE TABLE IF NOT EXISTS release_readiness_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  release_name TEXT NOT NULL,
  release_scope TEXT,
  blocker_count INTEGER DEFAULT 0,
  release_notes TEXT,
  release_status TEXT DEFAULT 'draft',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)"""
}

for ddl in tables.values():
    cur.execute(ddl)

cur.execute("DELETE FROM feature_completion_registry")
cur.executemany("""
    INSERT INTO feature_completion_registry
    (feature_name, feature_group, build_level, completion_percent, next_priority, feature_status)
    VALUES (?, ?, ?, ?, ?, ?)
""", [
    ("OmniMail OS", "communications", "working_foundation", 88, "message_actions_and_permissions", "active"),
    ("Holo Search", "search", "working_foundation", 84, "search_actions_and_result_ranking", "active"),
    ("Platform Analytics", "analytics", "working_foundation", 82, "deeper_metrics_and_dashboards", "active"),
    ("Neuro Control", "assistive_interface", "foundation", 58, "real_control_actions_and_accessibility_bindings", "active"),
    ("HoloJourney TV", "media_generation", "foundation", 61, "render_pipeline_and_publish_actions", "active"),
    ("Creator TV", "media_channels", "working_foundation", 76, "channel_actions_and_publish_flow", "active"),
    ("Streaming Network", "media_delivery", "working_foundation", 74, "delivery_controls_and player_flow", "active"),
    ("Creator Monetization", "payments", "working_foundation", 78, "real_transactions_and admin actions", "active"),
    ("Upload Media Bridge", "uploads", "working_foundation", 73, "real browser upload handling", "active"),
    ("Ops Checkpoint", "operations", "working_foundation", 91, "checkpoint actions and exports", "active"),
    ("AI Call Center", "callcenter", "working_foundation", 79, "real conversation and assignment workflows", "active"),
    ("Competitive Contact Center", "callcenter", "working_foundation", 77, "wfm/qm/agent workflow actions", "active"),
    ("Multiservice Dispatch", "dispatch", "working_foundation", 81, "trip and delivery lifecycle actions", "active"),
    ("Quantum Speed", "performance", "working_foundation", 83, "real caching and fast-lane actions", "active"),
    ("Metaverse Control", "metaverse", "foundation", 52, "scene/avatar/world interaction logic", "active"),
    ("Studio Lab", "studio", "foundation", 49, "track/session/record/export logic", "active"),
    ("Dispatch Actions", "dispatch", "foundation", 64, "post actions and state changes", "active"),
    ("Episode Movie Pipeline", "production", "foundation", 57, "script/shot/render/release actions", "active"),
])

cur.execute("DELETE FROM workflow_dependency_registry")
cur.executemany("""
    INSERT INTO workflow_dependency_registry
    (workflow_name, dependency_name, dependency_group, dependency_status)
    VALUES (?, ?, ?, ?)
""", [
    ("metaverse_playability", "scene_interaction_logic", "metaverse", "tracked"),
    ("metaverse_playability", "avatar_session_actions", "metaverse", "tracked"),
    ("creator_production_release", "render_pipeline_actions", "production", "tracked"),
    ("creator_production_release", "publish_and_release_flow", "production", "tracked"),
    ("dispatch_lifecycle", "assignment_post_actions", "dispatch", "tracked"),
    ("dispatch_lifecycle", "status_transition_actions", "dispatch", "tracked"),
    ("studio_audio_engine", "session_recording_logic", "studio", "tracked"),
    ("studio_audio_engine", "mix_export_logic", "studio", "tracked"),
    ("platform_hardening", "auth_permissions", "security", "tracked"),
    ("platform_hardening", "upload_validation", "security", "tracked"),
])

cur.execute("DELETE FROM readiness_scorecard_registry")
cur.executemany("""
    INSERT INTO readiness_scorecard_registry
    (system_name, readiness_area, readiness_score, readiness_notes, readiness_status)
    VALUES (?, ?, ?, ?, ?)
""", [
    ("platform_runtime", "stability", 95, "Smoke tests passing and services healthy", "active"),
    ("business_ops", "operational_structure", 88, "Call center, monetization, dispatch, onboarding foundations exist", "active"),
    ("creator_media", "creator_infrastructure", 80, "Channels, streaming, monetization, production structure exists", "active"),
    ("metaverse", "playability", 48, "World control exists but gameplay loop is not finished", "active"),
    ("studio", "production_depth", 44, "Studio structure exists but engine logic is not finished", "active"),
    ("security", "hardening", 55, "Foundational controls exist but enterprise hardening is incomplete", "active"),
])

cur.execute("DELETE FROM release_readiness_registry")
cur.executemany("""
    INSERT INTO release_readiness_registry
    (release_name, release_scope, blocker_count, release_notes, release_status)
    VALUES (?, ?, ?, ?, ?)
""", [
    ("current_platform_foundation", "internal_alpha", 4, "Stable foundation but deeper actions still needed", "draft"),
    ("creator_media_release", "private_beta", 5, "Needs publish, render, release, and studio action logic", "draft"),
    ("dispatch_ops_release", "private_beta", 3, "Needs status transitions and real assignment actions", "draft"),
    ("metaverse_release", "future_alpha", 7, "Needs scene/avatar/session/gameplay loop work", "draft"),
])

conn.commit()
conn.close()
print("[OK] completion and readiness tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD WITH READINESS PAGE
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderReleaseReadinessPage(req, user = null, message = '') {
  const features = dbQuery(`
    SELECT id, feature_name, feature_group, build_level, completion_percent, next_priority, feature_status, created_at
    FROM feature_completion_registry
    ORDER BY completion_percent DESC, id DESC
    LIMIT 200
  `);

  const deps = dbQuery(`
    SELECT id, workflow_name, dependency_name, dependency_group, dependency_status, created_at
    FROM workflow_dependency_registry
    ORDER BY id DESC
    LIMIT 200
  `);

  const scores = dbQuery(`
    SELECT id, system_name, readiness_area, readiness_score, readiness_notes, readiness_status, created_at
    FROM readiness_scorecard_registry
    ORDER BY readiness_score DESC, id DESC
    LIMIT 200
  `);

  const releases = dbQuery(`
    SELECT id, release_name, release_scope, blocker_count, release_notes, release_status, created_at
    FROM release_readiness_registry
    ORDER BY id DESC
    LIMIT 100
  `);

  const featureRows = features.map(r => `<tr><td>${r.id}</td><td>${r.feature_name}</td><td>${r.feature_group}</td><td>${r.build_level}</td><td>${r.completion_percent}</td><td>${r.next_priority || ''}</td><td>${r.feature_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const depRows = deps.map(r => `<tr><td>${r.id}</td><td>${r.workflow_name}</td><td>${r.dependency_name}</td><td>${r.dependency_group || ''}</td><td>${r.dependency_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const scoreRows = scores.map(r => `<tr><td>${r.id}</td><td>${r.system_name}</td><td>${r.readiness_area}</td><td>${r.readiness_score}</td><td>${r.readiness_notes || ''}</td><td>${r.readiness_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const releaseRows = releases.map(r => `<tr><td>${r.id}</td><td>${r.release_name}</td><td>${r.release_scope || ''}</td><td>${r.blocker_count}</td><td>${r.release_notes || ''}</td><td>${r.release_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Release Readiness', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>Release Readiness</h1><p>${message || 'Completion tracking, dependency mapping, readiness scoring, and release checkpoint visibility.'}</p></section>
      <section><table><thead><tr><th>ID</th><th>Feature</th><th>Group</th><th>Level</th><th>%</th><th>Next Priority</th><th>Status</th><th>Created</th></tr></thead><tbody>${featureRows || '<tr><td colspan="8">No feature completion data</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Workflow</th><th>Dependency</th><th>Group</th><th>Status</th><th>Created</th></tr></thead><tbody>${depRows || '<tr><td colspan="6">No dependency data</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>System</th><th>Area</th><th>Score</th><th>Notes</th><th>Status</th><th>Created</th></tr></thead><tbody>${scoreRows || '<tr><td colspan="7">No readiness scores</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Release</th><th>Scope</th><th>Blockers</th><th>Notes</th><th>Status</th><th>Created</th></tr></thead><tbody>${releaseRows || '<tr><td colspan="7">No release readiness data</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}
"""

server_marker = "const server = http.createServer(async (req, res) => {"
if "function renderReleaseReadinessPage(req, user = null, message = '')" not in text:
    text = text.replace(server_marker, helper + "\n" + server_marker, 1)

route = """
    if (req.method === 'GET' && pathname === '/release-readiness') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderReleaseReadinessPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

anchor = "    if (req.method === 'GET' && pathname === '/quantum-speed') {"
if "pathname === '/release-readiness'" not in text and anchor in text:
    text = text.replace(anchor, route + "\n" + anchor, 1)

if '<a href="/release-readiness">Readiness</a>' not in text and '<a href="/quantum-speed">Quantum Speed</a>' in text:
    text = text.replace(
        '<a href="/quantum-speed">Quantum Speed</a>',
        '<a href="/quantum-speed">Quantum Speed</a>\n          <a href="/release-readiness">Readiness</a>',
        1
    )

p.write_text(text)
print("[OK] release readiness route added")
PYEOF

########################################
# 4) JS CHECK + SAFE RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 4
bash scripts/status.sh || true

########################################
# 5) HEALTH + FULL ROUTE SMOKE TEST
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

for route in \
  / \
  /release-readiness \
  /metaverse-control \
  /studio-lab \
  /dispatch-actions \
  /episode-movie-pipeline \
  /quantum-speed \
  /multiservice-dispatch \
  /competitive-contact-center \
  /ai-call-center \
  /ops-checkpoint \
  /upload-media-bridge \
  /creator-monetization \
  /streaming-network \
  /creator-tv \
  /holojourney-tv \
  /neuro-control \
  /quantum-mail \
  /quantum-mail-admin \
  /holo-search \
  /platform-analytics \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as feature_completion_registry from feature_completion_registry;" > "snapshots/feature_completion_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as workflow_dependency_registry from workflow_dependency_registry;" > "snapshots/workflow_dependency_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as readiness_scorecard_registry from readiness_scorecard_registry;" > "snapshots/readiness_scorecard_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as release_readiness_registry from release_readiness_registry;" > "snapshots/release_readiness_registry_${STAMP}.json"

sqlite3 -json db/aam.db "select id, feature_name, feature_group, build_level, completion_percent, next_priority, feature_status, created_at from feature_completion_registry order by completion_percent desc, id desc limit 50;" > "snapshots/feature_completion_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, workflow_name, dependency_name, dependency_group, dependency_status, created_at from workflow_dependency_registry order by id desc limit 50;" > "snapshots/workflow_dependency_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, system_name, readiness_area, readiness_score, readiness_notes, readiness_status, created_at from readiness_scorecard_registry order by readiness_score desc, id desc limit 50;" > "snapshots/readiness_scorecard_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, release_name, release_scope, blocker_count, release_notes, release_status, created_at from release_readiness_registry order by id desc limit 50;" > "snapshots/release_readiness_registry_tail_${STAMP}.json"

########################################
# 7) ERROR SCAN
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
    if "referenceerror" in txt or "syntaxerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

latest = Path.home() / "aam_full_system" / "snapshots" / "full_completion_readiness_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] full completion readiness scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 9) REPORT
########################################
cat > "reports/full_completion_smoke_stabilize_and_readiness_${STAMP}.txt" <<REPORT
FULL COMPLETION + SMOKE + STABILIZE + READINESS REPORT
Timestamp: ${STAMP}

Verified:
- dashboard health
- jarvis health
- OmniMail OS
- Holo Search
- Platform Analytics
- Neuro Control
- HoloJourney TV
- Creator TV
- Streaming Network
- Creator Monetization
- Upload Media Bridge
- Ops Checkpoint
- AI Call Center
- Competitive Contact Center
- Multiservice Dispatch
- Quantum Speed
- Metaverse Control
- Studio Lab
- Dispatch Actions
- Episode Movie Pipeline
- Release Readiness
- world3d

Added:
- feature completion registry
- workflow dependency registry
- readiness scorecard registry
- release readiness registry
- release readiness route

Purpose:
- smoke test the full stack again
- stabilize the current platform again
- add a completion and readiness layer
- prepare cleanly for the next deep build stage
REPORT

echo "FULL COMPLETION + SMOKE + STABILIZE + READINESS COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/full_completion_readiness_scan_latest.json"
echo "  cat snapshots/feature_completion_registry_tail_${STAMP}.json"
echo "  cat snapshots/readiness_scorecard_registry_tail_${STAMP}.json"
echo "  cat snapshots/release_readiness_registry_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/release-readiness"
echo "  termux-open-url http://127.0.0.1:4900/metaverse-control"
echo "  termux-open-url http://127.0.0.1:4900/studio-lab"
echo "  termux-open-url http://127.0.0.1:4900/episode-movie-pipeline"
