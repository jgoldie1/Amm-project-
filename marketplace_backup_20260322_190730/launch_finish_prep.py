import sqlite3
from pathlib import Path

db = Path("instance/app.db")
db.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS external_integrations_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    integration_name TEXT NOT NULL,
    integration_group TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS announcements_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    audience TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS admin_moderation_actions_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    action_name TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("SELECT COUNT(*) FROM external_integrations_v2")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO external_integrations_v2 (integration_name, integration_group, status, notes) VALUES (?, ?, ?, ?)",
        [
            ("Discord Community Bridge", "community", "planned", "Community sync and announcements shell"),
            ("Zapier Automation Bridge", "automation", "planned", "Workflow automation bridge"),
            ("Translation API Bridge", "translation", "planned", "Multilingual translation connector shell"),
            ("Social Posting Bridge", "growth", "planned", "Cross-platform post publishing shell"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM announcements_v2")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO announcements_v2 (title, body, audience, status) VALUES (?, ?, ?, ?)",
        [
            ("Heirs Soft Launch Live", "The heirs-only launch is active with login, uploads, bookings, reports, and browsing.", "heirs", "live"),
            ("Report Bugs Early", "Use the report center to flag issues so the app can improve quickly.", "heirs", "live"),
            ("Invite Tracking Enabled", "Founder dashboard now tracks invites, joins, activity, and launch readiness.", "admin", "live"),
        ],
    )

conn.commit()
conn.close()
print("Launch finish prep complete:", db)
