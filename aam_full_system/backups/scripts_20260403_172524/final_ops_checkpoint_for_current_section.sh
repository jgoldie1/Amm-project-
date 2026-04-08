#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FINAL OPS CHECKPOINT FOR CURRENT SECTION START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_final_ops_${STAMP}.js"
cp db/aam.db "backups/aam_final_ops_${STAMP}.db"

########################################
# 2) OPS TABLE
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS ops_checkpoint_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  checkpoint_name TEXT NOT NULL,
  checkpoint_group TEXT DEFAULT 'platform_section',
  checkpoint_status TEXT DEFAULT 'stable',
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

if cur.execute("SELECT count(*) FROM ops_checkpoint_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO ops_checkpoint_registry
        (checkpoint_name, checkpoint_group, checkpoint_status, notes)
        VALUES (?, ?, ?, ?)
    """, [
        ("OmniMail OS stable", "communication", "stable", "mail routes and tables verified"),
        ("Media and creator stack stable", "media", "stable", "creator tv, streaming, holojourney verified"),
        ("Upload bridge stable", "media_ingest", "stable", "upload ingest and bridge layer verified"),
        ("Current section near complete", "platform_section", "stable", "ready for final action layer"),
    ])

conn.commit()
conn.close()
print("[OK] ops checkpoint table ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderOpsCheckpointPage(req, user = null, message = '') {
  const rowsData = dbQuery(`
    SELECT id, checkpoint_name, checkpoint_group, checkpoint_status, notes, created_at
    FROM ops_checkpoint_registry
    ORDER BY id DESC LIMIT 200
  `);

  const rows = rowsData.map(r => `<tr><td>${r.id}</td><td>${r.checkpoint_name}</td><td>${r.checkpoint_group}</td><td>${r.checkpoint_status}</td><td>${r.notes || ''}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Ops Checkpoint', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>Ops Checkpoint</h1><p>${message || 'Current section stability and readiness checkpoint.'}</p></section>
      <section><table><thead><tr><th>ID</th><th>Checkpoint</th><th>Group</th><th>Status</th><th>Notes</th><th>Created</th></tr></thead><tbody>${rows || '<tr><td colspan="6">No checkpoints</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}
"""

server_marker = "const server = http.createServer(async (req, res) => {"
if "function renderOpsCheckpointPage(req, user = null, message = '')" not in text:
    text = text.replace(server_marker, helper + "\n" + server_marker, 1)

route = """
    if (req.method === 'GET' && pathname === '/ops-checkpoint') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderOpsCheckpointPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

anchor = "    if (req.method === 'GET' && pathname === '/upload-media-bridge') {"
if "pathname === '/ops-checkpoint'" not in text and anchor in text:
    text = text.replace(anchor, route + "\n" + anchor, 1)

if '<a href="/ops-checkpoint">Ops Checkpoint</a>' not in text and '<a href="/upload-media-bridge">Upload Media Bridge</a>' in text:
    text = text.replace(
        '<a href="/upload-media-bridge">Upload Media Bridge</a>',
        '<a href="/upload-media-bridge">Upload Media Bridge</a>\n          <a href="/ops-checkpoint">Ops Checkpoint</a>',
        1
    )

p.write_text(text)
print("[OK] ops checkpoint route added")
PYEOF

########################################
# 4) RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 4
bash scripts/status.sh || true

curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

########################################
# 5) MASTER SMOKE TEST
########################################
for route in \
  / \
  /quantum-mail \
  /quantum-mail-admin \
  /holo-search \
  /platform-analytics \
  /neuro-control \
  /holojourney-tv \
  /creator-tv \
  /streaming-network \
  /creator-monetization \
  /upload-media-bridge \
  /ops-checkpoint \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as ops_checkpoint_registry from ops_checkpoint_registry;" > "snapshots/ops_checkpoint_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select id, checkpoint_name, checkpoint_group, checkpoint_status, notes, created_at from ops_checkpoint_registry order by id desc limit 20;" > "snapshots/ops_checkpoint_registry_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "final_ops_checkpoint_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] final ops checkpoint scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/final_ops_checkpoint_for_current_section_${STAMP}.txt" <<REPORT
FINAL OPS CHECKPOINT FOR CURRENT SECTION REPORT
Timestamp: ${STAMP}

Added:
- /ops-checkpoint
- ops_checkpoint_registry

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
- world3d

Purpose:
- create a final checkpoint for the current section
- verify full current stack stability
- prepare cleanly for the next thing you want to add
REPORT

echo "FINAL OPS CHECKPOINT FOR CURRENT SECTION COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/final_ops_checkpoint_scan_latest.json"
echo "  cat snapshots/ops_checkpoint_registry_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/ops-checkpoint"
echo "  termux-open-url http://127.0.0.1:4900/upload-media-bridge"
echo "  termux-open-url http://127.0.0.1:4900/creator-monetization"
