#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== ADD CREATOR TV CHANNELS + CHECKPOINT START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_creator_tv_${STAMP}.js"
cp db/aam.db "backups/aam_creator_tv_${STAMP}.db"

########################################
# 2) TABLES + SEED
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS creator_tv_channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_name TEXT NOT NULL,
  channel_owner TEXT NOT NULL,
  channel_type TEXT DEFAULT 'ai_tv',
  visibility_mode TEXT DEFAULT 'public',
  monetization_mode TEXT DEFAULT 'enabled',
  channel_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS creator_tv_programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_name TEXT NOT NULL,
  program_name TEXT NOT NULL,
  program_type TEXT DEFAULT 'livestream',
  ai_assist_mode TEXT DEFAULT 'enabled',
  holographic_mode TEXT DEFAULT 'enabled',
  program_status TEXT DEFAULT 'scheduled',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

if cur.execute("SELECT count(*) FROM creator_tv_channels").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO creator_tv_channels
        (channel_name, channel_owner, channel_type, visibility_mode, monetization_mode, channel_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("Isaiah Anyone Can Be a Star AI TV", "Isaiah", "ai_tv", "public", "enabled", "active"),
        ("Jacobie Vision Holo TV", "Jacobie", "holographic_tv", "public", "enabled", "active"),
        ("Aniyah Creator Spotlight", "Aniyah", "creator_tv", "public", "enabled", "active"),
    ])

if cur.execute("SELECT count(*) FROM creator_tv_programs").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO creator_tv_programs
        (channel_name, program_name, program_type, ai_assist_mode, holographic_mode, program_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("Isaiah Anyone Can Be a Star AI TV", "Anyone Can Be a Star Live", "livestream", "enabled", "enabled", "scheduled"),
        ("Isaiah Anyone Can Be a Star AI TV", "AI Talent Discovery", "ai_showcase", "enabled", "enabled", "scheduled"),
        ("Jacobie Vision Holo TV", "Holographic World News", "broadcast", "enabled", "enabled", "scheduled"),
        ("Aniyah Creator Spotlight", "Creator Spotlight Weekly", "showcase", "enabled", "enabled", "scheduled"),
    ])

conn.commit()
conn.close()
print("[OK] creator TV tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderCreatorTVPage(req, user = null, message = '') {
  const channels = dbQuery(`
    SELECT id, channel_name, channel_owner, channel_type, visibility_mode, monetization_mode, channel_status, created_at
    FROM creator_tv_channels
    ORDER BY id DESC LIMIT 100
  `);

  const programs = dbQuery(`
    SELECT id, channel_name, program_name, program_type, ai_assist_mode, holographic_mode, program_status, created_at
    FROM creator_tv_programs
    ORDER BY id DESC LIMIT 200
  `);

  const channelRows = channels.map(r => `<tr><td>${r.id}</td><td>${r.channel_name}</td><td>${r.channel_owner}</td><td>${r.channel_type}</td><td>${r.visibility_mode}</td><td>${r.monetization_mode}</td><td>${r.channel_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const programRows = programs.map(r => `<tr><td>${r.id}</td><td>${r.channel_name}</td><td>${r.program_name}</td><td>${r.program_type}</td><td>${r.ai_assist_mode}</td><td>${r.holographic_mode}</td><td>${r.program_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Creator TV', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>Creator TV</h1><p>${message || 'Creator channels and scheduled AI/holographic programs.'}</p></section>
      <section><table><thead><tr><th>ID</th><th>Channel</th><th>Owner</th><th>Type</th><th>Visibility</th><th>Monetization</th><th>Status</th><th>Created</th></tr></thead><tbody>${channelRows || '<tr><td colspan="8">No channels</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Channel</th><th>Program</th><th>Type</th><th>AI</th><th>Holo</th><th>Status</th><th>Created</th></tr></thead><tbody>${programRows || '<tr><td colspan="8">No programs</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}
"""

server_marker = "const server = http.createServer(async (req, res) => {"
if "function renderCreatorTVPage(req, user = null, message = '')" not in text:
    text = text.replace(server_marker, helper + "\n" + server_marker, 1)

route = """
    if (req.method === 'GET' && pathname === '/creator-tv') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderCreatorTVPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

anchor = "    if (req.method === 'GET' && pathname === '/neuro-control') {"
if "pathname === '/creator-tv'" not in text and anchor in text:
    text = text.replace(anchor, route + "\n" + anchor, 1)

if '<a href="/creator-tv">Creator TV</a>' not in text and '<a href="/holojourney-tv">HoloJourney TV</a>' in text:
    text = text.replace(
        '<a href="/holojourney-tv">HoloJourney TV</a>',
        '<a href="/holojourney-tv">HoloJourney TV</a>\n          <a href="/creator-tv">Creator TV</a>',
        1
    )

p.write_text(text)
print("[OK] creator TV route added")
PYEOF

########################################
# 4) RESTART + SMOKE TEST
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 4
bash scripts/status.sh || true

for route in \
  /creator-tv \
  /neuro-control \
  /holojourney-tv \
  /quantum-mail \
  /holo-search \
  /platform-analytics
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 5) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as creator_tv_channels from creator_tv_channels;" > "snapshots/creator_tv_channels_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as creator_tv_programs from creator_tv_programs;" > "snapshots/creator_tv_programs_${STAMP}.json"
sqlite3 -json db/aam.db "select id, channel_name, channel_owner, channel_type, visibility_mode, monetization_mode, channel_status, created_at from creator_tv_channels order by id desc limit 20;" > "snapshots/creator_tv_channels_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, channel_name, program_name, program_type, ai_assist_mode, holographic_mode, program_status, created_at from creator_tv_programs order by id desc limit 20;" > "snapshots/creator_tv_programs_tail_${STAMP}.json"

########################################
# 6) ERROR SCAN
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
latest = Path.home() / "aam_full_system" / "snapshots" / "creator_tv_checkpoint_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] creator TV checkpoint scan complete: {len(issues)} issues")
PYEOF

########################################
# 7) REPORT
########################################
cat > "reports/add_creator_tv_channels_and_checkpoint_${STAMP}.txt" <<REPORT
ADD CREATOR TV CHANNELS + CHECKPOINT REPORT
Timestamp: ${STAMP}

Added:
- /creator-tv
- creator_tv_channels
- creator_tv_programs

Purpose:
- extend the stable media layer
- add channel/program visibility
- preserve runtime stability before streaming network layer
REPORT

echo "ADD CREATOR TV CHANNELS + CHECKPOINT COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/creator_tv_checkpoint_scan_latest.json"
echo "  cat snapshots/creator_tv_channels_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/creator-tv"
echo "  termux-open-url http://127.0.0.1:4900/holojourney-tv"
echo "  termux-open-url http://127.0.0.1:4900/neuro-control"
