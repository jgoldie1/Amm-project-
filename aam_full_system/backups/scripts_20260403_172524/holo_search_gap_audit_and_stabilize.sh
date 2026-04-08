#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== HOLO SEARCH + GAP AUDIT + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_holo_search_${STAMP}.js"
cp db/aam.db "backups/aam_holo_search_${STAMP}.db"

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
CREATE TABLE IF NOT EXISTS holo_search_index (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_type TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_route TEXT,
  source_group TEXT DEFAULT 'general',
  search_keywords TEXT,
  search_summary TEXT,
  index_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS holo_search_queries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query_text TEXT NOT NULL,
  username TEXT DEFAULT 'system',
  query_scope TEXT DEFAULT 'global',
  result_count INTEGER DEFAULT 0,
  query_status TEXT DEFAULT 'completed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS holo_search_result_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query_text TEXT NOT NULL,
  matched_source_name TEXT,
  matched_route TEXT,
  matched_group TEXT,
  cache_status TEXT DEFAULT 'ready',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS platform_gap_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gap_name TEXT NOT NULL,
  gap_group TEXT DEFAULT 'platform',
  priority_level TEXT DEFAULT 'medium',
  linked_route TEXT,
  gap_status TEXT DEFAULT 'open',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# seed search index
if cur.execute("SELECT count(*) FROM holo_search_index").fetchone()[0] == 0:
    rows = [
        ("route", "World3D", "/world3d", "world", "world 3d metaverse realworld city vehicle route", "Interactive 3D world layer", "active"),
        ("route", "Territory Activation", "/territory-activation", "territory", "territory launch live archived rollout", "Territory rollout control", "active"),
        ("route", "Territory Bridge", "/territory-bridge", "territory", "territory monetization creator property premium", "Territory monetization bridge", "active"),
        ("route", "World Era Mobility", "/world-era-mobility", "time_machine", "past present future horse boat car plane flying vehicle", "World era and mobility control", "active"),
        ("route", "Creator Marketplace", "/creator-marketplace", "marketplace", "creator sell buy asset item wallet payout", "Creator economy marketplace", "active"),
        ("route", "Asset Library", "/asset-library", "assets", "image video audio document upload asset library", "Universal asset library", "active"),
        ("route", "Platform Analytics", "/platform-analytics", "analytics", "analytics users sessions activity holoverse holo gpt", "Platform analytics surface", "active"),
        ("route", "Holo GPT Control", "/holo-gpt-control", "assistant", "holo gpt assistant holographic prompts events", "Holo GPT control center", "active"),
        ("route", "Transaction Engine", "/transaction-engine", "finance", "transaction payout scaling revenue fee", "Money engine and payouts", "active"),
        ("route", "Scaling Control", "/scaling-control", "finance", "scaling growth metrics revenue", "Scaling metrics control", "active"),
        ("route", "System Config", "/system-config", "ops", "config feature flags upload mode payout mode analytics mode", "System configuration center", "active"),
        ("route", "Upload Backup Control", "/upload-backup-control", "ops", "upload backup restore policies files", "Upload and backup control", "active"),
    ]
    cur.executemany("""
        INSERT INTO holo_search_index
        (source_type, source_name, source_route, source_group, search_keywords, search_summary, index_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, rows)

# seed gap registry
if cur.execute("SELECT count(*) FROM platform_gap_registry").fetchone()[0] == 0:
    rows = [
        ("Browser multipart upload handler", "uploads", "high", "/upload-backup-control", "open"),
        ("Asset preview and playback widgets", "assets", "medium", "/asset-library", "open"),
        ("Creator marketplace live buy flow finalization", "marketplace", "high", "/creator-marketplace", "open"),
        ("Search-to-route quick actions", "search", "medium", "/holo-search", "open"),
        ("Forecast recommendation dashboard", "time_machine", "high", "/territory-bridge", "open"),
        ("World3D in-world asset interaction", "world", "high", "/world3d", "open"),
        ("Role-based action enforcement", "security", "medium", "/system-config", "open"),
    ]
    cur.executemany("""
        INSERT INTO platform_gap_registry
        (gap_name, gap_group, priority_level, linked_route, gap_status)
        VALUES (?, ?, ?, ?, ?)
    """, rows)

# seed example query/cache
if cur.execute("SELECT count(*) FROM holo_search_queries").fetchone()[0] == 0:
    q = "world creator analytics"
    cur.execute("""
        INSERT INTO holo_search_queries
        (query_text, username, query_scope, result_count, query_status)
        VALUES (?, 'system', 'global', 3, 'completed')
    """, (q,))
    cache_rows = [
        (q, "World3D", "/world3d", "world", "ready"),
        (q, "Creator Marketplace", "/creator-marketplace", "marketplace", "ready"),
        (q, "Platform Analytics", "/platform-analytics", "analytics", "ready"),
    ]
    cur.executemany("""
        INSERT INTO holo_search_result_cache
        (query_text, matched_source_name, matched_route, matched_group, cache_status)
        VALUES (?, ?, ?, ?, ?)
    """, cache_rows)

conn.commit()
conn.close()
print("[OK] holo search + platform gap tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper1 = r"""
function renderHoloSearchPage(req, user = null, message = '') {
  const indexRowsData = dbQuery(`
    SELECT id, source_type, source_name, source_route, source_group, search_keywords, search_summary, index_status, created_at
    FROM holo_search_index
    ORDER BY id DESC
    LIMIT 300
  `);

  const queryRowsData = dbQuery(`
    SELECT id, query_text, username, query_scope, result_count, query_status, created_at
    FROM holo_search_queries
    ORDER BY id DESC
    LIMIT 200
  `);

  const cacheRowsData = dbQuery(`
    SELECT id, query_text, matched_source_name, matched_route, matched_group, cache_status, created_at
    FROM holo_search_result_cache
    ORDER BY id DESC
    LIMIT 300
  `);

  const indexRows = indexRowsData.map(r => `<tr><td>${r.id}</td><td>${r.source_type}</td><td>${r.source_name}</td><td>${r.source_route || ''}</td><td>${r.source_group}</td><td>${r.search_keywords || ''}</td><td>${r.search_summary || ''}</td><td>${r.index_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const queryRows = queryRowsData.map(r => `<tr><td>${r.id}</td><td>${r.query_text}</td><td>${r.username || ''}</td><td>${r.query_scope}</td><td>${r.result_count}</td><td>${r.query_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const cacheRows = cacheRowsData.map(r => `<tr><td>${r.id}</td><td>${r.query_text}</td><td>${r.matched_source_name || ''}</td><td>${r.matched_route || ''}</td><td>${r.matched_group || ''}</td><td>${r.cache_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Holo Search', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="holo-search-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Holographic Search Layer</div>
            <h1 id="holo-search-title">Holo Search Engine</h1>
            <p>Search routes, systems, worlds, assets, analytics, and business layers across the platform.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/holo-search" class="hero-primary-btn">Holo Search</a>
              <a href="/platform-gap-audit" class="hero-secondary-btn">Gap Audit</a>
              <a href="/asset-library" class="hero-secondary-btn">Assets</a>
              <a href="/platform-analytics" class="hero-secondary-btn">Analytics</a>
            </div>
          </div>
        </section>

        <section><table aria-label="Search Index"><thead><tr><th>ID</th><th>Type</th><th>Name</th><th>Route</th><th>Group</th><th>Keywords</th><th>Summary</th><th>Status</th><th>Created</th></tr></thead><tbody>${indexRows || '<tr><td colspan="9">No search index rows yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Search Queries"><thead><tr><th>ID</th><th>Query</th><th>User</th><th>Scope</th><th>Results</th><th>Status</th><th>Created</th></tr></thead><tbody>${queryRows || '<tr><td colspan="7">No search queries yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Search Result Cache"><thead><tr><th>ID</th><th>Query</th><th>Matched Name</th><th>Route</th><th>Group</th><th>Status</th><th>Created</th></tr></thead><tbody>${cacheRows || '<tr><td colspan="7">No search cache rows yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}
"""

helper2 = r"""
function renderPlatformGapAuditPage(req, user = null, message = '') {
  const gaps = dbQuery(`
    SELECT id, gap_name, gap_group, priority_level, linked_route, gap_status, created_at
    FROM platform_gap_registry
    ORDER BY id DESC
    LIMIT 300
  `);

  const gapRows = gaps.map(r => `<tr><td>${r.id}</td><td>${r.gap_name}</td><td>${r.gap_group}</td><td>${r.priority_level}</td><td>${r.linked_route || ''}</td><td>${r.gap_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Platform Gap Audit', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="platform-gap-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Completion Audit</div>
            <h1 id="platform-gap-title">Platform Gap Audit</h1>
            <p>Track the most important remaining platform gaps, their priority, and where they connect.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>

        <section><table aria-label="Platform Gap Audit"><thead><tr><th>ID</th><th>Gap</th><th>Group</th><th>Priority</th><th>Route</th><th>Status</th><th>Created</th></tr></thead><tbody>${gapRows || '<tr><td colspan="7">No platform gaps yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}
"""

if "function renderHoloSearchPage(req, user = null, message = '')" not in text:
    text = text.replace("const server = http.createServer(async (req, res) => {", helper1 + "\n" + helper2 + "\nconst server = http.createServer(async (req, res) => {", 1)

if '<a href="/holo-search">Holo Search</a>' not in text and '<a href="/system-config">Config</a>' in text:
    text = text.replace(
        '<a href="/system-config">Config</a>',
        '<a href="/system-config">Config</a>\n          <a href="/holo-search">Holo Search</a>\n          <a href="/platform-gap-audit">Platform Gaps</a>',
        1
    )

route1 = """
    if (req.method === 'GET' && pathname === '/holo-search') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderHoloSearchPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

route2 = """
    if (req.method === 'GET' && pathname === '/platform-gap-audit') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPlatformGapAuditPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

if "pathname === '/holo-search'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/system-config') {"
    if anchor in text:
        text = text.replace(anchor, route1 + "\n" + route2 + "\n" + anchor, 1)

p.write_text(text)
print("[OK] holo search + platform gap routes ready")
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
  /holo-search \
  /platform-gap-audit \
  /system-config \
  /upload-backup-control \
  /asset-library \
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
sqlite3 -json db/aam.db "select count(*) as holo_search_index from holo_search_index;" > "snapshots/holo_search_index_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as holo_search_queries from holo_search_queries;" > "snapshots/holo_search_queries_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as holo_search_result_cache from holo_search_result_cache;" > "snapshots/holo_search_result_cache_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as platform_gap_registry from platform_gap_registry;" > "snapshots/platform_gap_registry_${STAMP}.json"

sqlite3 -json db/aam.db "select id, source_type, source_name, source_route, source_group, search_keywords, search_summary, index_status, created_at from holo_search_index order by id desc limit 50;" > "snapshots/holo_search_index_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, query_text, username, query_scope, result_count, query_status, created_at from holo_search_queries order by id desc limit 50;" > "snapshots/holo_search_queries_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, query_text, matched_source_name, matched_route, matched_group, cache_status, created_at from holo_search_result_cache order by id desc limit 50;" > "snapshots/holo_search_result_cache_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, gap_name, gap_group, priority_level, linked_route, gap_status, created_at from platform_gap_registry order by id desc limit 50;" > "snapshots/platform_gap_registry_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "holo_search_gap_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] holo search + gap scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/holo_search_gap_audit_and_stabilize_${STAMP}.txt" <<REPORT
HOLO SEARCH + GAP AUDIT + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- holo_search_index
- holo_search_queries
- holo_search_result_cache
- platform_gap_registry
- holo-search route
- platform-gap-audit route

Purpose:
- add a holo search engine across routes, worlds, assets, and systems
- centralize remaining platform gaps
- stabilize the intelligence and completion-audit layer
REPORT

echo "HOLO SEARCH + GAP AUDIT + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/holo_search_gap_scan_latest.json"
echo "  cat snapshots/holo_search_index_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/holo-search"
echo "  termux-open-url http://127.0.0.1:4900/platform-gap-audit"
echo "  termux-open-url http://127.0.0.1:4900/system-config"
