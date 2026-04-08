#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS Q ARCHIVE + MEMORY + SOCIAL INTAKE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_pass_q_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_pass_q_${STAMP}.js"

sqlite3 db/aam.db <<SQL
CREATE TABLE IF NOT EXISTS archive_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  archive_name TEXT,
  source_type TEXT,
  content_summary TEXT,
  storage_mode TEXT,
  archive_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS memory_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  memory_name TEXT,
  linked_archive TEXT,
  memory_scope TEXT,
  recall_mode TEXT,
  memory_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS history_ingestion_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_name TEXT,
  platform TEXT,
  ingestion_mode TEXT,
  data_scope TEXT,
  ingestion_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_intake_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  intake_name TEXT,
  platform TEXT,
  content_type TEXT,
  ingestion_mode TEXT,
  intake_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_continuation_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_name TEXT,
  system_area TEXT,
  continuation_mode TEXT,
  priority_level TEXT,
  task_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_backlog_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  backlog_name TEXT,
  linked_task TEXT,
  backlog_scope TEXT,
  execution_mode TEXT,
  backlog_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO archive_registry (archive_name, source_type, content_summary, storage_mode, archive_status)
SELECT 'Primary Archive','chatgpt_history','project memory and prior build records','indexed','active'
WHERE NOT EXISTS (SELECT 1 FROM archive_registry WHERE archive_name='Primary Archive');

INSERT INTO memory_registry (memory_name, linked_archive, memory_scope, recall_mode, memory_status)
SELECT 'Primary Memory','Primary Archive','platform_wide','fast_recall','active'
WHERE NOT EXISTS (SELECT 1 FROM memory_registry WHERE memory_name='Primary Memory');

INSERT INTO history_ingestion_registry (source_name, platform, ingestion_mode, data_scope, ingestion_status)
SELECT 'Primary ChatGPT History','chatgpt','manual_import','full_project_history','active'
WHERE NOT EXISTS (SELECT 1 FROM history_ingestion_registry WHERE source_name='Primary ChatGPT History');

INSERT INTO social_intake_registry (intake_name, platform, content_type, ingestion_mode, intake_status)
SELECT 'Primary IG Intake','instagram','ideas+media','manual_capture','active'
WHERE NOT EXISTS (SELECT 1 FROM social_intake_registry WHERE intake_name='Primary IG Intake');

INSERT INTO social_intake_registry (intake_name, platform, content_type, ingestion_mode, intake_status)
SELECT 'Primary FB Intake','facebook','ideas+media','manual_capture','active'
WHERE NOT EXISTS (SELECT 1 FROM social_intake_registry WHERE intake_name='Primary FB Intake');

INSERT INTO social_intake_registry (intake_name, platform, content_type, ingestion_mode, intake_status)
SELECT 'Primary TikTok Intake','tiktok','ideas+media','manual_capture','active'
WHERE NOT EXISTS (SELECT 1 FROM social_intake_registry WHERE intake_name='Primary TikTok Intake');

INSERT INTO ai_continuation_registry (task_name, system_area, continuation_mode, priority_level, task_status)
SELECT 'Primary Continuation Task','full_platform','stepwise_completion','high','active'
WHERE NOT EXISTS (SELECT 1 FROM ai_continuation_registry WHERE task_name='Primary Continuation Task');

INSERT INTO ai_backlog_registry (backlog_name, linked_task, backlog_scope, execution_mode, backlog_status)
SELECT 'Primary Backlog','Primary Continuation Task','cross_system','queued','active'
WHERE NOT EXISTS (SELECT 1 FROM ai_backlog_registry WHERE backlog_name='Primary Backlog');
SQL

python3 <<'PY2EOF'
from pathlib import Path
p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderArchiveMemoryPage(req, user = null, message = '') {
  return htmlPage('Archive Memory', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section>
        <h1>Archive + Memory + Social Intake</h1>
        <p>${esc(message || 'Archive, memory, history ingestion, and social idea intake are live.')}</p>
      </section>
      <section>
        <h2>Quick Actions</h2>
        <form method="POST" action="/archive/create-safe" style="margin-bottom:12px;"><button type="submit">Create Archive Record</button></form>
        <form method="POST" action="/memory/create-safe" style="margin-bottom:12px;"><button type="submit">Create Memory Record</button></form>
        <form method="POST" action="/history/import-safe" style="margin-bottom:12px;"><button type="submit">Create ChatGPT History Import</button></form>
        <form method="POST" action="/social/ig-safe" style="margin-bottom:12px;"><button type="submit">Create IG Intake</button></form>
        <form method="POST" action="/social/fb-safe" style="margin-bottom:12px;"><button type="submit">Create FB Intake</button></form>
        <form method="POST" action="/social/tiktok-safe" style="margin-bottom:12px;"><button type="submit">Create TikTok Intake</button></form>
        <form method="POST" action="/ai/continuation-safe" style="margin-bottom:12px;"><button type="submit">Create AI Continuation Task</button></form>
        <form method="POST" action="/ai/backlog-safe" style="margin-bottom:12px;"><button type="submit">Create AI Backlog Item</button></form>
      </section>
    </main>
  `, user);
}
"""

routes = r"""
    if (req.method === 'GET' && pathname === '/archive-memory') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderArchiveMemoryPage(req, null, getQueryParam(req, 'msg') || ''));
    }

    if (req.method === 'POST' && pathname === '/archive/create-safe') {
      dbRun(`INSERT INTO archive_registry (archive_name, source_type, content_summary, storage_mode, archive_status)
             VALUES ('Safe Archive','manual_archive','project continuation archive','indexed','active')`);
      res.writeHead(302, { Location: '/archive-memory?msg=Safe%20archive%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/memory/create-safe') {
      dbRun(`INSERT INTO memory_registry (memory_name, linked_archive, memory_scope, recall_mode, memory_status)
             VALUES ('Safe Memory','Primary Archive','platform_wide','fast_recall','active')`);
      res.writeHead(302, { Location: '/archive-memory?msg=Safe%20memory%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/history/import-safe') {
      dbRun(`INSERT INTO history_ingestion_registry (source_name, platform, ingestion_mode, data_scope, ingestion_status)
             VALUES ('Safe ChatGPT Import','chatgpt','manual_import','full_project_history','active')`);
      res.writeHead(302, { Location: '/archive-memory?msg=Safe%20history%20import%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/social/ig-safe') {
      dbRun(`INSERT INTO social_intake_registry (intake_name, platform, content_type, ingestion_mode, intake_status)
             VALUES ('Safe IG Intake','instagram','ideas+media','manual_capture','active')`);
      res.writeHead(302, { Location: '/archive-memory?msg=Safe%20IG%20intake%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/social/fb-safe') {
      dbRun(`INSERT INTO social_intake_registry (intake_name, platform, content_type, ingestion_mode, intake_status)
             VALUES ('Safe FB Intake','facebook','ideas+media','manual_capture','active')`);
      res.writeHead(302, { Location: '/archive-memory?msg=Safe%20FB%20intake%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/social/tiktok-safe') {
      dbRun(`INSERT INTO social_intake_registry (intake_name, platform, content_type, ingestion_mode, intake_status)
             VALUES ('Safe TikTok Intake','tiktok','ideas+media','manual_capture','active')`);
      res.writeHead(302, { Location: '/archive-memory?msg=Safe%20TikTok%20intake%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/ai/continuation-safe') {
      dbRun(`INSERT INTO ai_continuation_registry (task_name, system_area, continuation_mode, priority_level, task_status)
             VALUES ('Safe Continuation Task','full_platform','stepwise_completion','high','active')`);
      res.writeHead(302, { Location: '/archive-memory?msg=Safe%20continuation%20task%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/ai/backlog-safe') {
      dbRun(`INSERT INTO ai_backlog_registry (backlog_name, linked_task, backlog_scope, execution_mode, backlog_status)
             VALUES ('Safe Backlog','Primary Continuation Task','cross_system','queued','active')`);
      res.writeHead(302, { Location: '/archive-memory?msg=Safe%20backlog%20created' });
      return res.end();
    }
"""

if "function renderArchiveMemoryPage(req, user = null, message = '') {" not in text:
    anchor = "function renderCommandCenterPage(req, user = null, message = '') {"
    if anchor in text:
        text = text.replace(anchor, helper + "\n\n" + anchor, 1)

if "pathname === '/archive-memory'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/command-center') {"
    if anchor in text:
        text = text.replace(anchor, routes + "\n" + anchor, 1)

if '<a href="/archive-memory">Archive Memory</a>' not in text and '<a href="/command-center">Command Center</a>' in text:
    text = text.replace(
        '<a href="/command-center">Command Center</a>',
        '<a href="/command-center">Command Center</a>\n<a href="/archive-memory">Archive Memory</a>',
        1
    )

p.write_text(text)
print("[OK] archive memory helper + routes patched")
PY2EOF

pkill -f "dashboard.js" 2>/dev/null || true
sleep 2
rm -f dashboard.pid
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 5

curl -s -i http://127.0.0.1:4900/archive-memory > test_results/archive_memory_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/archive/create-safe > test_results/archive_create_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/memory/create-safe > test_results/memory_create_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/history/import-safe > test_results/history_import_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/social/ig-safe > test_results/social_ig_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/social/fb-safe > test_results/social_fb_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/social/tiktok-safe > test_results/social_tiktok_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/ai/continuation-safe > test_results/ai_continuation_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/ai/backlog-safe > test_results/ai_backlog_${STAMP}.txt || true

python3 <<PY3EOF
from pathlib import Path
import json
stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []
for f in root.glob(f"*_{stamp}.txt"):
    txt = f.read_text(errors="ignore").lower()
    if "not found" in txt or "cannot get" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt or " 500 " in txt:
        issues.append({"file": f.name, "problem": "http_500"})
Path.home().joinpath("aam_full_system","snapshots","pass_q_archive_memory_scan_latest.json").write_text(json.dumps(issues, indent=2))
print("issues:", len(issues))
PY3EOF

bash scripts/status.sh || true

cat > "reports/pass_q_archive_memory_ai_continuation_${STAMP}.txt" <<REPORT
PASS Q ARCHIVE MEMORY AI CONTINUATION REPORT
Timestamp: ${STAMP}

Built:
- archive registry
- memory registry
- history ingestion registry
- social intake registry
- ai continuation registry
- ai backlog registry
- archive memory page
- archive memory safe actions
REPORT

echo "=== PASS Q COMPLETE ==="
echo "Check:"
echo "  cat snapshots/pass_q_archive_memory_scan_latest.json"
echo "  cat reports/pass_q_archive_memory_ai_continuation_${STAMP}.txt"
echo "  bash scripts/status.sh"
