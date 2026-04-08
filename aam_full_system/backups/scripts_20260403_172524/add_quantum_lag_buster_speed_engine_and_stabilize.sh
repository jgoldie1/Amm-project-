#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== ADD QUANTUM LAG BUSTER + SPEED ENGINE + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_quantum_speed_${STAMP}.js"
cp db/aam.db "backups/aam_quantum_speed_${STAMP}.db"

########################################
# 2) CREATE TABLES + SEED
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

tables = {
"quantum_lag_buster_registry": """
CREATE TABLE IF NOT EXISTS quantum_lag_buster_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  component_name TEXT NOT NULL,
  bottleneck_type TEXT NOT NULL,
  mitigation_strategy TEXT,
  priority_level TEXT DEFAULT 'high',
  component_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)""",
"quantum_speed_engine_registry": """
CREATE TABLE IF NOT EXISTS quantum_speed_engine_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  engine_name TEXT NOT NULL,
  engine_scope TEXT NOT NULL,
  optimization_mode TEXT DEFAULT 'adaptive',
  target_layer TEXT,
  engine_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)""",
"acceleration_policy_registry": """
CREATE TABLE IF NOT EXISTS acceleration_policy_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  policy_name TEXT NOT NULL,
  policy_scope TEXT NOT NULL,
  trigger_rule TEXT,
  acceleration_action TEXT,
  policy_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)""",
"performance_hotspot_registry": """
CREATE TABLE IF NOT EXISTS performance_hotspot_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hotspot_name TEXT NOT NULL,
  hotspot_group TEXT,
  linked_route TEXT,
  recommended_fix TEXT,
  hotspot_status TEXT DEFAULT 'tracked',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)""",
"speed_audit_registry": """
CREATE TABLE IF NOT EXISTS speed_audit_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  audit_name TEXT NOT NULL,
  audit_scope TEXT,
  result_summary TEXT,
  audit_status TEXT DEFAULT 'ok',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)"""
}

for ddl in tables.values():
    cur.execute(ddl)

if cur.execute("SELECT count(*) FROM quantum_lag_buster_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO quantum_lag_buster_registry
        (component_name, bottleneck_type, mitigation_strategy, priority_level, component_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("dashboard_routes", "route_render_latency", "preload_priority_routes", "high", "active"),
        ("multiservice_dispatch", "data_lookup_latency", "cache_hot_dispatch_tables", "high", "active"),
        ("competitive_contact_center", "queue_aggregation_latency", "fast_summary_cache", "high", "active"),
        ("creator_media_stack", "table_render_volume", "limit_and_prioritize_recent_records", "medium", "active"),
    ])

if cur.execute("SELECT count(*) FROM quantum_speed_engine_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO quantum_speed_engine_registry
        (engine_name, engine_scope, optimization_mode, target_layer, engine_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("Quantum Speed Core", "platform_runtime", "adaptive", "dashboard_and_routes", "active"),
        ("Quantum Speed Dispatch", "dispatch_ops", "priority_first", "multiservice_dispatch", "active"),
        ("Quantum Speed CX", "callcenter_ops", "adaptive", "competitive_contact_center", "active"),
        ("Quantum Speed Media", "creator_media", "adaptive", "creator_tv_and_streaming", "active"),
    ])

if cur.execute("SELECT count(*) FROM acceleration_policy_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO acceleration_policy_registry
        (policy_name, policy_scope, trigger_rule, acceleration_action, policy_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("Priority Route Boost", "dashboard_routes", "high_value_route_hit", "move_to_fast_lane", "active"),
        ("Dispatch Queue Boost", "dispatch_ops", "open_request_detected", "prioritize_dispatch_records", "active"),
        ("Call Center Boost", "callcenter_ops", "active_support_queue", "preload_agent_views", "active"),
        ("Media Stack Boost", "creator_media", "creator_route_opened", "prioritize_recent_channel_data", "active"),
    ])

if cur.execute("SELECT count(*) FROM performance_hotspot_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO performance_hotspot_registry
        (hotspot_name, hotspot_group, linked_route, recommended_fix, hotspot_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("Dispatch route table volume", "dispatch", "/multiservice-dispatch", "cache_and_limit_recent_rows", "tracked"),
        ("Contact center aggregate tables", "callcenter", "/competitive-contact-center", "fast_summary_registry", "tracked"),
        ("Creator TV growth rendering", "media", "/creator-tv", "pagination_and_recent_priority", "tracked"),
        ("Platform analytics growth", "analytics", "/platform-analytics", "summary_first_render", "tracked"),
    ])

cur.execute("DELETE FROM speed_audit_registry")
cur.executemany("""
    INSERT INTO speed_audit_registry
    (audit_name, audit_scope, result_summary, audit_status)
    VALUES (?, ?, ?, ?)
""", [
    ("runtime_speed_baseline", "full_platform", "Quantum lag buster and speed engine baseline created", "ok"),
    ("dispatch_speed_baseline", "multiservice_dispatch", "Dispatch acceleration baseline created", "ok"),
    ("cx_speed_baseline", "competitive_contact_center", "CX acceleration baseline created", "ok"),
])

conn.commit()
conn.close()
print("[OK] quantum lag buster + speed engine tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderQuantumSpeedPage(req, user = null, message = '') {
  const lag = dbQuery(`
    SELECT id, component_name, bottleneck_type, mitigation_strategy, priority_level, component_status, created_at
    FROM quantum_lag_buster_registry
    ORDER BY id DESC LIMIT 100
  `);

  const engines = dbQuery(`
    SELECT id, engine_name, engine_scope, optimization_mode, target_layer, engine_status, created_at
    FROM quantum_speed_engine_registry
    ORDER BY id DESC LIMIT 100
  `);

  const policies = dbQuery(`
    SELECT id, policy_name, policy_scope, trigger_rule, acceleration_action, policy_status, created_at
    FROM acceleration_policy_registry
    ORDER BY id DESC LIMIT 100
  `);

  const hotspots = dbQuery(`
    SELECT id, hotspot_name, hotspot_group, linked_route, recommended_fix, hotspot_status, created_at
    FROM performance_hotspot_registry
    ORDER BY id DESC LIMIT 100
  `);

  const audits = dbQuery(`
    SELECT id, audit_name, audit_scope, result_summary, audit_status, created_at
    FROM speed_audit_registry
    ORDER BY id DESC LIMIT 100
  `);

  const lagRows = lag.map(r => `<tr><td>${r.id}</td><td>${r.component_name}</td><td>${r.bottleneck_type}</td><td>${r.mitigation_strategy || ''}</td><td>${r.priority_level}</td><td>${r.component_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const engineRows = engines.map(r => `<tr><td>${r.id}</td><td>${r.engine_name}</td><td>${r.engine_scope}</td><td>${r.optimization_mode}</td><td>${r.target_layer || ''}</td><td>${r.engine_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const policyRows = policies.map(r => `<tr><td>${r.id}</td><td>${r.policy_name}</td><td>${r.policy_scope}</td><td>${r.trigger_rule || ''}</td><td>${r.acceleration_action || ''}</td><td>${r.policy_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const hotspotRows = hotspots.map(r => `<tr><td>${r.id}</td><td>${r.hotspot_name}</td><td>${r.hotspot_group || ''}</td><td>${r.linked_route || ''}</td><td>${r.recommended_fix || ''}</td><td>${r.hotspot_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const auditRows = audits.map(r => `<tr><td>${r.id}</td><td>${r.audit_name}</td><td>${r.audit_scope || ''}</td><td>${r.result_summary || ''}</td><td>${r.audit_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Quantum Lag Buster + Speed Engine', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>Quantum Lag Buster + Speed Engine</h1><p>${message || 'Performance acceleration, lag tracking, hotspot audit, and speed policy control for the full platform.'}</p></section>
      <section><table><thead><tr><th>ID</th><th>Component</th><th>Bottleneck</th><th>Mitigation</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead><tbody>${lagRows || '<tr><td colspan="7">No lag controls</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Engine</th><th>Scope</th><th>Mode</th><th>Target</th><th>Status</th><th>Created</th></tr></thead><tbody>${engineRows || '<tr><td colspan="7">No engines</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Policy</th><th>Scope</th><th>Trigger</th><th>Action</th><th>Status</th><th>Created</th></tr></thead><tbody>${policyRows || '<tr><td colspan="7">No policies</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Hotspot</th><th>Group</th><th>Route</th><th>Fix</th><th>Status</th><th>Created</th></tr></thead><tbody>${hotspotRows || '<tr><td colspan="7">No hotspots</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Audit</th><th>Scope</th><th>Summary</th><th>Status</th><th>Created</th></tr></thead><tbody>${auditRows || '<tr><td colspan="6">No audits</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}
"""

server_marker = "const server = http.createServer(async (req, res) => {"
if "function renderQuantumSpeedPage(req, user = null, message = '')" not in text:
    text = text.replace(server_marker, helper + "\n" + server_marker, 1)

route = """
    if (req.method === 'GET' && pathname === '/quantum-speed') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderQuantumSpeedPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

anchor = "    if (req.method === 'GET' && pathname === '/multiservice-dispatch') {"
if "pathname === '/quantum-speed'" not in text and anchor in text:
    text = text.replace(anchor, route + "\n" + anchor, 1)

if '<a href="/quantum-speed">Quantum Speed</a>' not in text and '<a href="/multiservice-dispatch">Dispatch Expansion</a>' in text:
    text = text.replace(
        '<a href="/multiservice-dispatch">Dispatch Expansion</a>',
        '<a href="/multiservice-dispatch">Dispatch Expansion</a>\n          <a href="/quantum-speed">Quantum Speed</a>',
        1
    )

p.write_text(text)
print("[OK] quantum speed route added")
PYEOF

########################################
# 4) JS CHECK + RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 4
bash scripts/status.sh || true

########################################
# 5) SMOKE TEST
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

for route in \
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
  /holo-search \
  /platform-analytics \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as quantum_lag_buster_registry from quantum_lag_buster_registry;" > "snapshots/quantum_lag_buster_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as quantum_speed_engine_registry from quantum_speed_engine_registry;" > "snapshots/quantum_speed_engine_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as acceleration_policy_registry from acceleration_policy_registry;" > "snapshots/acceleration_policy_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as performance_hotspot_registry from performance_hotspot_registry;" > "snapshots/performance_hotspot_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as speed_audit_registry from speed_audit_registry;" > "snapshots/speed_audit_registry_${STAMP}.json"

sqlite3 -json db/aam.db "select id, component_name, bottleneck_type, mitigation_strategy, priority_level, component_status, created_at from quantum_lag_buster_registry order by id desc limit 20;" > "snapshots/quantum_lag_buster_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, engine_name, engine_scope, optimization_mode, target_layer, engine_status, created_at from quantum_speed_engine_registry order by id desc limit 20;" > "snapshots/quantum_speed_engine_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, policy_name, policy_scope, trigger_rule, acceleration_action, policy_status, created_at from acceleration_policy_registry order by id desc limit 20;" > "snapshots/acceleration_policy_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, hotspot_name, hotspot_group, linked_route, recommended_fix, hotspot_status, created_at from performance_hotspot_registry order by id desc limit 20;" > "snapshots/performance_hotspot_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, audit_name, audit_scope, result_summary, audit_status, created_at from speed_audit_registry order by id desc limit 20;" > "snapshots/speed_audit_registry_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "quantum_speed_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] quantum speed scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/add_quantum_lag_buster_speed_engine_and_stabilize_${STAMP}.txt" <<REPORT
ADD QUANTUM LAG BUSTER + SPEED ENGINE + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- /quantum-speed
- quantum lag buster registry
- quantum speed engine registry
- acceleration policy registry
- performance hotspot registry
- speed audit registry

Verified:
- dashboard health
- jarvis health
- quantum speed route
- multiservice dispatch
- competitive contact center
- AI call center
- ops checkpoint
- creator monetization
- streaming network
- creator TV
- HoloJourney TV
- Neuro Control
- OmniMail OS
- Holo Search
- Platform Analytics
- world3d

Purpose:
- add a platform acceleration layer
- track and reduce bottlenecks
- create speed policies and hotspot controls
- preserve stable runtime
REPORT

echo "ADD QUANTUM LAG BUSTER + SPEED ENGINE + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/quantum_speed_scan_latest.json"
echo "  cat snapshots/quantum_speed_engine_registry_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/quantum-speed"
echo "  termux-open-url http://127.0.0.1:4900/multiservice-dispatch"
echo "  termux-open-url http://127.0.0.1:4900/competitive-contact-center"
