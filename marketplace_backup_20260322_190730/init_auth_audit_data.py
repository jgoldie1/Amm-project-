import sqlite3
from pathlib import Path

db_path = Path("instance/app.db")
db_path.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS role_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name TEXT NOT NULL,
    access_level TEXT NOT NULL,
    status TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS audit_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name TEXT NOT NULL,
    module_name TEXT NOT NULL,
    severity TEXT NOT NULL,
    event_status TEXT NOT NULL
)
""")

cur.execute("SELECT COUNT(*) FROM role_profiles")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO role_profiles (role_name, access_level, status) VALUES (?, ?, ?)",
        [
            ("admin", "full", "active"),
            ("operator", "high", "active"),
            ("creator", "medium", "active"),
            ("vendor", "medium", "active"),
            ("student", "basic", "active"),
            ("customer", "basic", "active"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM audit_events")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO audit_events (event_name, module_name, severity, event_status) VALUES (?, ?, ?, ?)",
        [
            ("Wallet Sandbox Started", "wallet", "info", "logged"),
            ("Cross-Border Route Seeded", "cross-border", "info", "logged"),
            ("University Data Loaded", "university", "info", "logged"),
            ("Music Tracks Seeded", "music", "info", "logged"),
            ("Streaming Channels Seeded", "streaming", "info", "logged"),
            ("Risk Checklist Reviewed", "governance", "warning", "open"),
        ],
    )

conn.commit()
conn.close()
print("Seeded auth/audit data in", db_path)
