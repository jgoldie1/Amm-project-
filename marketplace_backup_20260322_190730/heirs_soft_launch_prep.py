import sqlite3
from pathlib import Path

db = Path("instance/app.db")
db.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS heirs_directory_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    access_email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    access_status TEXT NOT NULL,
    school_group TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS invite_codes_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invite_code TEXT NOT NULL UNIQUE,
    assigned_to TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS app_announcements_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    audience TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS soft_launch_checklist_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL,
    item_group TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("SELECT COUNT(*) FROM heirs_directory_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO heirs_directory_v1 (full_name, access_email, role, access_status, school_group, notes) VALUES (?, ?, ?, ?, ?, ?)",
        [
            ("Alton Kevon Stubbs", "alton@heirs.local", "heir", "approved", "heirs", "Heir access"),
            ("Aniyah Stubbs", "aniyah@heirs.local", "heir", "approved", "elementary", "Birthday soft launch access"),
            ("Sasha Stubbs", "sasha@heirs.local", "heir", "approved", "high_school", "Heir access"),
            ("Kia Stubbs", "kia@heirs.local", "heir", "approved", "high_school", "Heir access"),
            ("Lila Stubbs", "lila@heirs.local", "heir", "approved", "elementary", "Heir access"),
            ("Soraya Stubbs", "soraya@heirs.local", "heir", "approved", "elementary", "Heir access"),
            ("Felix Ash", "felix@heirs.local", "heir", "approved", "senior", "Heir access"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM invite_codes_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO invite_codes_v1 (invite_code, assigned_to, status, notes) VALUES (?, ?, ?, ?)",
        [
            ("HEIR-ALTON-001", "Alton Kevon Stubbs", "active", "Primary heir code"),
            ("HEIR-ANIYAH-001", "Aniyah Stubbs", "active", "Birthday launch code"),
            ("HEIR-FAMILY-001", "Approved Heirs", "active", "General family launch code"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM app_announcements_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO app_announcements_v1 (title, body, audience, status) VALUES (?, ?, ?, ?)",
        [
            ("Welcome to the Heirs App", "This is the private family launch build. Access is invite-only.", "heirs", "live"),
            ("Soft Launch Mode", "Core flows are enabled for login, uploads, bookings, and browsing.", "heirs", "live"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM soft_launch_checklist_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO soft_launch_checklist_v1 (item_name, item_group, status, notes) VALUES (?, ?, ?, ?)",
        [
            ("Clean login experience", "auth", "live", "Use session-login-v4"),
            ("Heirs-only landing page", "ui", "live", "Simple launch home"),
            ("Basic browsing hub", "ui", "live", "Launchpad added"),
            ("Upload hub", "files", "live", "Files center wired"),
            ("Booking hub", "bookings", "live", "Bookings center wired"),
            ("Protected access model", "security", "live", "Invite-only messaging enabled"),
        ],
    )

conn.commit()
conn.close()
print("Heirs soft launch DB ready:", db)
