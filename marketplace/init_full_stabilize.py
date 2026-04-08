import sqlite3
from pathlib import Path
from werkzeug.security import generate_password_hash

db_path = Path("instance/app.db")
db_path.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS auth_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    action TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS finance_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_name TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS release_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_name TEXT NOT NULL,
    release_title TEXT NOT NULL,
    task_name TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS upload_asset_admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    title TEXT NOT NULL,
    featured INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    notes TEXT NOT NULL DEFAULT ''
)
""")

# app_users compatibility + password hardening
cur.execute("PRAGMA table_info(app_users)")
cols = [r[1] for r in cur.fetchall()]
if "password_hash" not in cols:
    try:
        cur.execute("ALTER TABLE app_users ADD COLUMN password_hash TEXT")
    except Exception:
        pass

if "display_name" in cols:
    cur.execute("SELECT id, email, password, display_name, role, status FROM app_users")
    rows = cur.fetchall()
    for row in rows:
        user_id, email, password, display_name, role, status = row
        if password:
            hashed = generate_password_hash(password)
            cur.execute("UPDATE app_users SET password_hash=? WHERE id=?", (hashed, user_id))

# seed release tasks
cur.execute("SELECT COUNT(*) FROM release_tasks")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO release_tasks (artist_name, release_title, task_name, status, notes) VALUES (?, ?, ?, ?, ?)",
        [
            ("Aniyah", "Rise In Sound", "Cover Art Prep", "planned", "Prepare visual package"),
            ("Aniyah", "Rise In Sound", "Promo Clip", "planned", "Create promo video"),
            ("AAME Label Demo Artist", "Platform Anthem", "Streaming Push", "active", "Streaming promo support"),
        ],
    )

# seed upload admin rows from creator_uploads if present
cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='creator_uploads'")
if cur.fetchone():
    cur.execute("SELECT filename, title FROM creator_uploads")
    for filename, title in cur.fetchall():
        cur.execute("SELECT COUNT(*) FROM upload_asset_admin WHERE filename=?", (filename,))
        if cur.fetchone()[0] == 0:
            cur.execute(
                "INSERT INTO upload_asset_admin (filename, title, featured, status, notes) VALUES (?, ?, 0, 'active', '')",
                (filename, title),
            )

# seed finance audit
cur.execute("SELECT COUNT(*) FROM finance_audit_log")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO finance_audit_log (action_name, actor_name, status, notes) VALUES (?, ?, ?, ?)",
        [
            ("Sandbox finance mode enabled", "system", "active", "No real-money processing"),
            ("Manual approval requirement", "system", "active", "Sensitive finance actions require review"),
        ],
    )

conn.commit()
conn.close()
print("Full stabilize database prep complete:", db_path)
