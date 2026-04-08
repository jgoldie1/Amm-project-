#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PLATFORM HARDENING + UPLOAD CONFIG BACKUP ROLES + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results
mkdir -p storage/uploads/images
mkdir -p storage/uploads/video
mkdir -p storage/uploads/audio
mkdir -p storage/uploads/docs
mkdir -p storage/uploads/other

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_platform_hardening_${STAMP}.js"
cp db/aam.db "backups/aam_platform_hardening_${STAMP}.db"

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
CREATE TABLE IF NOT EXISTS system_config_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_name TEXT NOT NULL,
  config_value TEXT,
  config_group TEXT DEFAULT 'general',
  config_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS backup_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  backup_name TEXT NOT NULL,
  backup_type TEXT DEFAULT 'manual',
  backup_path TEXT,
  backup_status TEXT DEFAULT 'saved',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS admin_role_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  role_name TEXT NOT NULL,
  role_scope TEXT DEFAULT 'platform',
  role_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS upload_policy_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_type TEXT NOT NULL,
  allowed_extensions TEXT,
  max_size_mb INTEGER DEFAULT 50,
  target_folder TEXT,
  policy_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS upload_event_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT,
  asset_type TEXT,
  uploader_name TEXT,
  upload_status TEXT DEFAULT 'queued',
  upload_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# seed configs
if cur.execute("SELECT count(*) FROM system_config_registry").fetchone()[0] == 0:
    rows = [
        ("feature_revenue_engine", "enabled", "features", "active"),
        ("feature_creator_marketplace", "enabled", "features", "active"),
        ("feature_world3d", "enabled", "features", "active"),
        ("feature_holo_gpt", "enabled", "features", "active"),
        ("territory_rollout_mode", "controlled", "rollout", "active"),
        ("payout_mode", "queued_auto", "finance", "active"),
        ("analytics_mode", "enabled", "analytics", "active"),
        ("upload_mode", "prepared", "uploads", "active"),
    ]
    cur.executemany("""
        INSERT INTO system_config_registry
        (config_name, config_value, config_group, config_status)
        VALUES (?, ?, ?, ?)
    """, rows)

# seed backup registry
backup_file = str(Path.home() / "aam_full_system" / "backups" / f"aam_platform_hardening_{Path.home().name if False else ''}")
cur.execute("""
INSERT INTO backup_registry
(backup_name, backup_type, backup_path, backup_status)
VALUES (?, ?, ?, ?)
""", (f"platform_hardening_{Path.home().name}_{'current'}", "manual", "backups/", "saved"))

# seed roles
if cur.execute("SELECT count(*) FROM admin_role_registry").fetchone()[0] == 0:
    rows = [
        ("Jacobie", "admin", "platform", "active"),
        ("Aniyah", "creator", "creator_marketplace", "active"),
        ("Isaiah", "operator", "world_operations", "active"),
        ("Guest Explorer", "explorer", "general", "active"),
    ]
    cur.executemany("""
        INSERT INTO admin_role_registry
        (username, role_name, role_scope, role_status)
        VALUES (?, ?, ?, ?)
    """, rows)

# seed upload policies
if cur.execute("SELECT count(*) FROM upload_policy_registry").fetchone()[0] == 0:
    rows = [
        ("image", "png,jpg,jpeg,webp,gif", 25, "storage/uploads/images", "active"),
        ("video", "mp4,webm,mov", 500, "storage/uploads/video", "active"),
        ("audio", "mp3,wav,m4a,ogg", 100, "storage/uploads/audio", "active"),
        ("document", "pdf,doc,docx,txt,md", 50, "storage/uploads/docs", "active"),
        ("other", "zip,json,csv,glb,gltf", 250, "storage/uploads/other", "active"),
    ]
    cur.executemany("""
        INSERT INTO upload_policy_registry
        (asset_type, allowed_extensions, max_size_mb, target_folder, policy_status)
        VALUES (?, ?, ?, ?, ?)
    """, rows)

# seed upload events
if cur.execute("SELECT count(*) FROM upload_event_log").fetchone()[0] == 0:
    rows = [
        ("sample_banner.png", "image", "Jacobie", "queued", "sample image intake"),
        ("world_trailer.mp4", "video", "Aniyah", "queued", "sample video intake"),
        ("welcome_audio.mp3", "audio", "Isaiah", "queued", "sample audio intake"),
        ("guide.pdf", "document", "Jacobie", "queued", "sample document intake"),
    ]
    cur.executemany("""
        INSERT INTO upload_event_log
        (filename, asset_type, uploader_name, upload_status, upload_notes)
        VALUES (?, ?, ?, ?, ?)
    """, rows)

conn.commit()
conn.close()
print("[OK] platform hardening tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper1 = r"""
function renderSystemConfigPage(req, user = null, message = '') {
  const configs = dbQuery(`
    SELECT id, config_name, config_value, config_group, config_status, created_at
    FROM system_config_registry
    ORDER BY id DESC
    LIMIT 200
  `);

  const roles = dbQuery(`
    SELECT id, username, role_name, role_scope, role_status, created_at
    FROM admin_role_registry
    ORDER BY id DESC
    LIMIT 200
  `);

  const configRows = configs.map(r => `<tr><td>${r.id}</td><td>${r.config_name}</td><td>${r.config_value || ''}</td><td>${r.config_group}</td><td>${r.config_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const roleRows = roles.map(r => `<tr><td>${r.id}</td><td>${r.username || ''}</td><td>${r.role_name}</td><td>${r.role_scope}</td><td>${r.role_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('System Config', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="system-config-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Platform Hardening</div>
            <h1 id="system-config-title">System Config + Roles</h1>
            <p>Track feature flags, rollout settings, payout mode, analytics mode, upload mode, and user roles.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>

        <section><table aria-label="System Config"><thead><tr><th>ID</th><th>Name</th><th>Value</th><th>Group</th><th>Status</th><th>Created</th></tr></thead><tbody>${configRows || '<tr><td colspan="6">No configs yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Admin Role Registry"><thead><tr><th>ID</th><th>User</th><th>Role</th><th>Scope</th><th>Status</th><th>Created</th></tr></thead><tbody>${roleRows || '<tr><td colspan="6">No roles yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}
"""

helper2 = r"""
function renderUploadControlPage(req, user = null, message = '') {
  const policies = dbQuery(`
    SELECT id, asset_type, allowed_extensions, max_size_mb, target_folder, policy_status, created_at
    FROM upload_policy_registry
    ORDER BY id DESC
    LIMIT 100
  `);

  const events = dbQuery(`
    SELECT id, filename, asset_type, uploader_name, upload_status, upload_notes, created_at
    FROM upload_event_log
    ORDER BY id DESC
    LIMIT 200
  `);

  const backups = dbQuery(`
    SELECT id, backup_name, backup_type, backup_path, backup_status, created_at
    FROM backup_registry
    ORDER BY id DESC
    LIMIT 100
  `);

  const policyRows = policies.map(r => `<tr><td>${r.id}</td><td>${r.asset_type}</td><td>${r.allowed_extensions || ''}</td><td>${r.max_size_mb}</td><td>${r.target_folder || ''}</td><td>${r.policy_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const eventRows = events.map(r => `<tr><td>${r.id}</td><td>${r.filename || ''}</td><td>${r.asset_type}</td><td>${r.uploader_name || ''}</td><td>${r.upload_status}</td><td>${r.upload_notes || ''}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const backupRows = backups.map(r => `<tr><td>${r.id}</td><td>${r.backup_name}</td><td>${r.backup_type}</td><td>${r.backup_path || ''}</td><td>${r.backup_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Upload + Backup Control', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="upload-control-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Upload + Recovery Layer</div>
            <h1 id="upload-control-title">Upload + Backup Control</h1>
            <p>Track upload policies, upload events, and backup history across the platform.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>

        <section><table aria-label="Upload Policies"><thead><tr><th>ID</th><th>Type</th><th>Extensions</th><th>Max MB</th><th>Folder</th><th>Status</th><th>Created</th></tr></thead><tbody>${policyRows || '<tr><td colspan="7">No upload policies yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Upload Event Log"><thead><tr><th>ID</th><th>Filename</th><th>Type</th><th>Uploader</th><th>Status</th><th>Notes</th><th>Created</th></tr></thead><tbody>${eventRows || '<tr><td colspan="7">No upload events yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Backup Registry"><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Path</th><th>Status</th><th>Created</th></tr></thead><tbody>${backupRows || '<tr><td colspan="6">No backups yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}
"""

if "function renderSystemConfigPage(req, user = null, message = '')" not in text:
    text = text.replace("const server = http.createServer(async (req, res) => {", helper1 + "\n" + helper2 + "\nconst server = http.createServer(async (req, res) => {", 1)

if '<a href="/system-config">Config</a>' not in text and '<a href="/asset-library">Assets</a>' in text:
    text = text.replace(
        '<a href="/asset-library">Assets</a>',
        '<a href="/asset-library">Assets</a>\n          <a href="/system-config">Config</a>\n          <a href="/upload-backup-control">Upload+Backup</a>',
        1
    )

route1 = """
    if (req.method === 'GET' && pathname === '/system-config') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderSystemConfigPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

route2 = """
    if (req.method === 'GET' && pathname === '/upload-backup-control') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderUploadControlPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

if "pathname === '/system-config'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/asset-library') {"
    if anchor in text:
        text = text.replace(anchor, route1 + "\n" + route2 + "\n" + anchor, 1)

p.write_text(text)
print("[OK] system config + upload backup routes ready")
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
  /system-config \
  /upload-backup-control \
  /asset-library \
  /asset-gap-audit \
  /platform-analytics \
  /transaction-engine \
  /scaling-control \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as system_config_registry from system_config_registry;" > "snapshots/system_config_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as backup_registry from backup_registry;" > "snapshots/backup_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as admin_role_registry from admin_role_registry;" > "snapshots/admin_role_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as upload_policy_registry from upload_policy_registry;" > "snapshots/upload_policy_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as upload_event_log from upload_event_log;" > "snapshots/upload_event_log_${STAMP}.json"

sqlite3 -json db/aam.db "select id, config_name, config_value, config_group, config_status, created_at from system_config_registry order by id desc limit 50;" > "snapshots/system_config_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, backup_name, backup_type, backup_path, backup_status, created_at from backup_registry order by id desc limit 50;" > "snapshots/backup_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, username, role_name, role_scope, role_status, created_at from admin_role_registry order by id desc limit 50;" > "snapshots/admin_role_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, asset_type, allowed_extensions, max_size_mb, target_folder, policy_status, created_at from upload_policy_registry order by id desc limit 50;" > "snapshots/upload_policy_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, filename, asset_type, uploader_name, upload_status, upload_notes, created_at from upload_event_log order by id desc limit 50;" > "snapshots/upload_event_log_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "platform_hardening_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] platform hardening scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/platform_hardening_upload_config_backup_roles_and_stabilize_${STAMP}.txt" <<REPORT
PLATFORM HARDENING + UPLOAD CONFIG BACKUP ROLES + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- system_config_registry
- backup_registry
- admin_role_registry
- upload_policy_registry
- upload_event_log
- system-config route
- upload-backup-control route

Purpose:
- harden platform settings and recovery visibility
- track roles and upload policies
- prepare for full browser upload handling
- reduce important operational gaps
REPORT

echo "PLATFORM HARDENING + UPLOAD CONFIG BACKUP ROLES + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/platform_hardening_scan_latest.json"
echo "  cat snapshots/system_config_registry_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/system-config"
echo "  termux-open-url http://127.0.0.1:4900/upload-backup-control"
echo "  termux-open-url http://127.0.0.1:4900/asset-library"
