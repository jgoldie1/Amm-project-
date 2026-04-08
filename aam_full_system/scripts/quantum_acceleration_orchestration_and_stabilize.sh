#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== QUANTUM ACCELERATION + ORCHESTRATION + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_quantum_orchestration_${STAMP}.js"
cp db/aam.db "backups/aam_quantum_orchestration_${STAMP}.db"

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
CREATE TABLE IF NOT EXISTS quantum_cache_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cache_name TEXT NOT NULL,
  cache_scope TEXT DEFAULT 'global',
  cache_key TEXT,
  cache_status TEXT DEFAULT 'warm',
  refresh_strategy TEXT DEFAULT 'on_demand',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS orchestration_job_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_name TEXT NOT NULL,
  job_group TEXT DEFAULT 'general',
  priority_level TEXT DEFAULT 'medium',
  linked_route TEXT,
  execution_status TEXT DEFAULT 'queued',
  execution_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS recommendation_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recommendation_name TEXT NOT NULL,
  recommendation_group TEXT DEFAULT 'growth',
  target_system TEXT,
  target_route TEXT,
  recommendation_priority TEXT DEFAULT 'high',
  recommendation_status TEXT DEFAULT 'ready',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS cross_system_link_map (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_system TEXT NOT NULL,
  target_system TEXT NOT NULL,
  link_type TEXT DEFAULT 'data_flow',
  link_strength TEXT DEFAULT 'high',
  link_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS acceleration_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_name TEXT NOT NULL,
  metric_value INTEGER DEFAULT 0,
  metric_scope TEXT DEFAULT 'global',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

if cur.execute("SELECT count(*) FROM quantum_cache_registry").fetchone()[0] == 0:
    rows = [
        ("territory_forecast_cache", "territory", "forecast:global", "warm", "scheduled"),
        ("asset_library_cache", "assets", "assets:latest", "warm", "on_demand"),
        ("platform_analytics_cache", "analytics", "analytics:overview", "warm", "scheduled"),
        ("holo_search_cache", "search", "search:index", "warm", "scheduled"),
        ("transaction_summary_cache", "finance", "finance:summary", "warm", "scheduled"),
    ]
    cur.executemany("""
        INSERT INTO quantum_cache_registry
        (cache_name, cache_scope, cache_key, cache_status, refresh_strategy)
        VALUES (?, ?, ?, ?, ?)
    """, rows)

if cur.execute("SELECT count(*) FROM orchestration_job_queue").fetchone()[0] == 0:
    rows = [
        ("refresh territory forecast", "time_machine", "high", "/territory-bridge", "queued", "prepare next-best territory"),
        ("refresh holo search index", "search", "high", "/holo-search", "queued", "keep search fast"),
        ("refresh analytics summary", "analytics", "medium", "/platform-analytics", "queued", "update usage metrics"),
        ("refresh revenue summary", "finance", "high", "/transaction-engine", "queued", "update money flow"),
        ("refresh asset intake summary", "assets", "medium", "/asset-library", "queued", "update asset state"),
    ]
    cur.executemany("""
        INSERT INTO orchestration_job_queue
        (job_name, job_group, priority_level, linked_route, execution_status, execution_notes)
        VALUES (?, ?, ?, ?, ?, ?)
    """, rows)

if cur.execute("SELECT count(*) FROM recommendation_queue").fetchone()[0] == 0:
    rows = [
        ("Launch creator marketplace in Georgia", "growth", "territory_bridge", "/territory-bridge", "high", "ready"),
        ("Finalize browser upload flow", "assets", "asset_library", "/upload-backup-control", "high", "ready"),
        ("Finish creator live buy flow", "marketplace", "creator_marketplace", "/creator-marketplace", "high", "ready"),
        ("Add forecast recommendation dashboard", "time_machine", "territory_bridge", "/territory-bridge", "high", "ready"),
        ("Deepen world3d interactions", "world", "world3d", "/world3d", "high", "ready"),
    ]
    cur.executemany("""
        INSERT INTO recommendation_queue
        (recommendation_name, recommendation_group, target_system, target_route, recommendation_priority, recommendation_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, rows)

if cur.execute("SELECT count(*) FROM cross_system_link_map").fetchone()[0] == 0:
    rows = [
        ("territory_registry", "territory_monetization_bridge", "data_flow", "high", "active"),
        ("territory_monetization_bridge", "creator_marketplace", "activation_flow", "high", "active"),
        ("world_era_registry", "mobility_registry", "world_flow", "high", "active"),
        ("platform_analytics", "holo_search", "index_flow", "medium", "active"),
        ("transaction_engine", "scaling_control", "finance_flow", "high", "active"),
        ("asset_library", "world3d", "content_flow", "high", "active"),
        ("asset_library", "creator_marketplace", "commerce_flow", "high", "active"),
        ("holo_gpt_control", "platform_analytics", "assistant_flow", "medium", "active"),
    ]
    cur.executemany("""
        INSERT INTO cross_system_link_map
        (source_system, target_system, link_type, link_strength, link_status)
        VALUES (?, ?, ?, ?, ?)
    """, rows)

cur.execute("DELETE FROM acceleration_metrics")
metrics = [
    ("cache_entries", cur.execute("SELECT count(*) FROM quantum_cache_registry").fetchone()[0], "global"),
    ("queued_jobs", cur.execute("SELECT count(*) FROM orchestration_job_queue").fetchone()[0], "global"),
    ("ready_recommendations", cur.execute("SELECT count(*) FROM recommendation_queue").fetchone()[0], "global"),
    ("cross_system_links", cur.execute("SELECT count(*) FROM cross_system_link_map").fetchone()[0], "global"),
]
cur.executemany("""
    INSERT INTO acceleration_metrics
    (metric_name, metric_value, metric_scope)
    VALUES (?, ?, ?)
""", metrics)

conn.commit()
conn.close()
print("[OK] quantum acceleration + orchestration tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper1 = r"""
function renderQuantumAcceleratorPage(req, user = null, message = '') {
  const caches = dbQuery(`
    SELECT id, cache_name, cache_scope, cache_key, cache_status, refresh_strategy, created_at
    FROM quantum_cache_registry
    ORDER BY id DESC
    LIMIT 200
  `);

  const metrics = dbQuery(`
    SELECT id, metric_name, metric_value, metric_scope, created_at
    FROM acceleration_metrics
    ORDER BY id DESC
    LIMIT 100
  `);

  const cacheRows = caches.map(r => `<tr><td>${r.id}</td><td>${r.cache_name}</td><td>${r.cache_scope}</td><td>${r.cache_key || ''}</td><td>${r.cache_status}</td><td>${r.refresh_strategy}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const metricRows = metrics.map(r => `<tr><td>${r.id}</td><td>${r.metric_name}</td><td>${r.metric_value}</td><td>${r.metric_scope}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Quantum Accelerator', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="quantum-accelerator-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Acceleration Layer</div>
            <h1 id="quantum-accelerator-title">Quantum Speed Accelerator</h1>
            <p>Track warm caches, refresh strategies, and acceleration metrics across the platform.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/quantum-accelerator" class="hero-primary-btn">Quantum Accelerator</a>
              <a href="/orchestration-control" class="hero-secondary-btn">Orchestration</a>
              <a href="/holo-search" class="hero-secondary-btn">Holo Search</a>
              <a href="/platform-analytics" class="hero-secondary-btn">Analytics</a>
            </div>
          </div>
        </section>

        <section><table aria-label="Quantum Cache Registry"><thead><tr><th>ID</th><th>Name</th><th>Scope</th><th>Key</th><th>Status</th><th>Refresh</th><th>Created</th></tr></thead><tbody>${cacheRows || '<tr><td colspan="7">No cache rows yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Acceleration Metrics"><thead><tr><th>ID</th><th>Metric</th><th>Value</th><th>Scope</th><th>Created</th></tr></thead><tbody>${metricRows || '<tr><td colspan="5">No metrics yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}
"""

helper2 = r"""
function renderOrchestrationControlPage(req, user = null, message = '') {
  const jobs = dbQuery(`
    SELECT id, job_name, job_group, priority_level, linked_route, execution_status, execution_notes, created_at
    FROM orchestration_job_queue
    ORDER BY id DESC
    LIMIT 200
  `);

  const recs = dbQuery(`
    SELECT id, recommendation_name, recommendation_group, target_system, target_route, recommendation_priority, recommendation_status, created_at
    FROM recommendation_queue
    ORDER BY id DESC
    LIMIT 200
  `);

  const links = dbQuery(`
    SELECT id, source_system, target_system, link_type, link_strength, link_status, created_at
    FROM cross_system_link_map
    ORDER BY id DESC
    LIMIT 200
  `);

  const jobRows = jobs.map(r => `<tr><td>${r.id}</td><td>${r.job_name}</td><td>${r.job_group}</td><td>${r.priority_level}</td><td>${r.linked_route || ''}</td><td>${r.execution_status}</td><td>${r.execution_notes || ''}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const recRows = recs.map(r => `<tr><td>${r.id}</td><td>${r.recommendation_name}</td><td>${r.recommendation_group}</td><td>${r.target_system || ''}</td><td>${r.target_route || ''}</td><td>${r.recommendation_priority}</td><td>${r.recommendation_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const linkRows = links.map(r => `<tr><td>${r.id}</td><td>${r.source_system}</td><td>${r.target_system}</td><td>${r.link_type}</td><td>${r.link_strength}</td><td>${r.link_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Orchestration Control', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="orchestration-control-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Googleplex-Scale Coordination Layer</div>
            <h1 id="orchestration-control-title">Orchestration Control</h1>
            <p>Track priority jobs, next-best recommendations, and cross-system links across the platform.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>

        <section><table aria-label="Orchestration Job Queue"><thead><tr><th>ID</th><th>Job</th><th>Group</th><th>Priority</th><th>Route</th><th>Status</th><th>Notes</th><th>Created</th></tr></thead><tbody>${jobRows || '<tr><td colspan="8">No jobs yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Recommendation Queue"><thead><tr><th>ID</th><th>Recommendation</th><th>Group</th><th>Target System</th><th>Route</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead><tbody>${recRows || '<tr><td colspan="8">No recommendations yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Cross System Link Map"><thead><tr><th>ID</th><th>Source</th><th>Target</th><th>Type</th><th>Strength</th><th>Status</th><th>Created</th></tr></thead><tbody>${linkRows || '<tr><td colspan="7">No links yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}
"""

if "function renderQuantumAcceleratorPage(req, user = null, message = '')" not in text:
    text = text.replace("const server = http.createServer(async (req, res) => {", helper1 + "\n" + helper2 + "\nconst server = http.createServer(async (req, res) => {", 1)

if '<a href="/quantum-accelerator">Quantum</a>' not in text and '<a href="/holo-search">Holo Search</a>' in text:
    text = text.replace(
        '<a href="/holo-search">Holo Search</a>',
        '<a href="/holo-search">Holo Search</a>\n          <a href="/quantum-accelerator">Quantum</a>\n          <a href="/orchestration-control">Orchestration</a>',
        1
    )

route1 = """
    if (req.method === 'GET' && pathname === '/quantum-accelerator') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderQuantumAcceleratorPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

route2 = """
    if (req.method === 'GET' && pathname === '/orchestration-control') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderOrchestrationControlPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

if "pathname === '/quantum-accelerator'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/holo-search') {"
    if anchor in text:
        text = text.replace(anchor, route1 + "\n" + route2 + "\n" + anchor, 1)

p.write_text(text)
print("[OK] quantum accelerator + orchestration routes ready")
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
  /quantum-accelerator \
  /orchestration-control \
  /holo-search \
  /platform-gap-audit \
  /system-config \
  /platform-analytics \
  /transaction-engine \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as quantum_cache_registry from quantum_cache_registry;" > "snapshots/quantum_cache_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as orchestration_job_queue from orchestration_job_queue;" > "snapshots/orchestration_job_queue_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as recommendation_queue from recommendation_queue;" > "snapshots/recommendation_queue_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as cross_system_link_map from cross_system_link_map;" > "snapshots/cross_system_link_map_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as acceleration_metrics from acceleration_metrics;" > "snapshots/acceleration_metrics_${STAMP}.json"

sqlite3 -json db/aam.db "select id, cache_name, cache_scope, cache_key, cache_status, refresh_strategy, created_at from quantum_cache_registry order by id desc limit 50;" > "snapshots/quantum_cache_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, job_name, job_group, priority_level, linked_route, execution_status, execution_notes, created_at from orchestration_job_queue order by id desc limit 50;" > "snapshots/orchestration_job_queue_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, recommendation_name, recommendation_group, target_system, target_route, recommendation_priority, recommendation_status, created_at from recommendation_queue order by id desc limit 50;" > "snapshots/recommendation_queue_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, source_system, target_system, link_type, link_strength, link_status, created_at from cross_system_link_map order by id desc limit 50;" > "snapshots/cross_system_link_map_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, metric_name, metric_value, metric_scope, created_at from acceleration_metrics order by id desc limit 50;" > "snapshots/acceleration_metrics_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "quantum_orchestration_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] quantum acceleration + orchestration scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/quantum_acceleration_orchestration_and_stabilize_${STAMP}.txt" <<REPORT
QUANTUM ACCELERATION + ORCHESTRATION + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- quantum_cache_registry
- orchestration_job_queue
- recommendation_queue
- cross_system_link_map
- acceleration_metrics
- quantum-accelerator route
- orchestration-control route

Purpose:
- accelerate high-value platform flows
- coordinate platform modules at larger scale
- prioritize next-best actions across systems
- stabilize the orchestration layer
REPORT

echo "QUANTUM ACCELERATION + ORCHESTRATION + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/quantum_orchestration_scan_latest.json"
echo "  cat snapshots/acceleration_metrics_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/quantum-accelerator"
echo "  termux-open-url http://127.0.0.1:4900/orchestration-control"
echo "  termux-open-url http://127.0.0.1:4900/holo-search"
