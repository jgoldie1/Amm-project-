#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== HEIRS SYSTEM EXPANSION START ==="

########################################
# 1) DATABASE: HEIRS + ROLES
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

def safe(sql):
    try:
        cur.execute(sql)
    except:
        pass

safe("""
CREATE TABLE IF NOT EXISTS heirs_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  role TEXT,
  division TEXT,
  access_level TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

safe("""
CREATE TABLE IF NOT EXISTS heirs_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER,
  system_name TEXT,
  access_type TEXT,
  status TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()
conn.close()
print("[OK] heirs DB ready")
PYEOF

########################################
# 2) SEED HEIRS
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

def add(name, role, division):
    cur.execute(f"""
    INSERT INTO heirs_registry (name, role, division, access_level)
    VALUES ('{name}', '{role}', '{division}', 'full')
    """)

# CORE
add("Jacobie", "Cybersecurity Lead", "Jacobie Vision")
add("Isaiah", "Entertainment Engine", "Anyone Can Be a Star")
add("Aniyah", "Voice AI + Singing Coach", "Aniyah App")
add("Alton", "Security Systems", "Alton Security")
add("Alton Kevon", "Advanced Systems", "Future Ops")

# FAMILY EXPANSION
add("Brielle Ryan", "Creator Node", "Heirs Network")
add("Leiandra Algegete", "Family Node", "Heirs Network")
add("Leiandra Child 1", "Next Gen", "Heirs Network")
add("Leiandra Child 2", "Next Gen", "Heirs Network")
add("Leiandra Child 3", "Next Gen", "Heirs Network")
add("Leiandra Child 4", "Next Gen", "Heirs Network")
add("Leiandra Child 5", "Next Gen", "Heirs Network")

add("Ajsia Watson", "Network Node", "Heirs Network")
add("Shawndell", "Network Node", "Heirs Network")
add("Deon", "Network Node", "Heirs Network")
add("Raymond", "Network Node", "Heirs Network")

add("Alyssa Robertson", "Expansion Node", "Heirs Network")

conn.commit()
conn.close()
print("[OK] heirs seeded")
PYEOF

########################################
# 3) DASHBOARD PAGE
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r'''
function renderHeirsPage(user = null) {
  const rows = dbQuery("SELECT * FROM heirs_registry ORDER BY id DESC");

  const list = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.name}</td>
      <td>${r.role}</td>
      <td>${r.division}</td>
      <td>${r.access_level}</td>
      <td>${r.created_at}</td>
    </tr>
  `).join('');

  return htmlPage('Heirs Network', `
    <div class="section">
      <div class="card">
        <h2>Heirs Network</h2>
        <p>All assigned heirs with system roles and divisions.</p>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Role</th><th>Division</th><th>Access</th><th>Created</th>
            </tr>
          </thead>
          <tbody>${list}</tbody>
        </table>
      </div>
    </div>
  `, user);
}
'''

if "renderHeirsPage" not in text:
    text = text.replace("const server = http.createServer(async (req, res) => {", helper + "\nconst server = http.createServer(async (req, res) => {")

if "/heirs" not in text:
    text = text.replace(
        "pathname === '/command-core'",
        """pathname === '/heirs' ? (res.writeHead(200, {'Content-Type':'text/html'}), res.end(renderHeirsPage(null))) :
        pathname === '/command-core'"""
    )

p.write_text(text)
print("[OK] heirs UI added")
PYEOF

########################################
# 4) RESTART
########################################
bash scripts/safe_restart.sh
bash scripts/status.sh

echo "HEIRS SYSTEM COMPLETE"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/heirs"
