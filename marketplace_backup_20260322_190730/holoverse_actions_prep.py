import sqlite3
from pathlib import Path

db = Path("instance/app.db")
db.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS holoverse_actions_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    world_name TEXT NOT NULL,
    action_name TEXT NOT NULL,
    action_group TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS holoverse_world_state_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    world_name TEXT NOT NULL,
    headline TEXT NOT NULL,
    subtext TEXT NOT NULL,
    status TEXT NOT NULL
)
""")

cur.execute("SELECT COUNT(*) FROM holoverse_actions_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO holoverse_actions_v1 (world_name, action_name, action_group, status, notes) VALUES (?, ?, ?, ?, ?)",
        [
            ("Marketplace", "Browse Drops", "commerce", "live", "Go to holo commerce"),
            ("Marketplace", "Open Creator Tools", "creator", "live", "Go to creator tools"),
            ("Streaming Studio", "Watch Shows", "media", "live", "Go to shows demo"),
            ("Streaming Studio", "Play Music", "media", "live", "Go to music demo"),
            ("Streaming Studio", "Open Coaching", "media", "live", "Go to coaching"),
            ("Creator Arena", "Upload Files", "creator", "live", "Go to files center"),
            ("Creator Arena", "Artist Signing", "creator", "live", "Go to artist signing"),
            ("University", "Open Learning", "education", "live", "Go to university"),
            ("Armed Forces Command", "Open Service Center", "military", "live", "Go to armed forces center"),
            ("Nigeria Hub", "Enter Regional Hub", "world", "live", "Regional world shell"),
            ("UK Hub", "Enter Regional Hub", "world", "live", "Regional world shell"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM holoverse_world_state_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO holoverse_world_state_v1 (world_name, headline, subtext, status) VALUES (?, ?, ?, ?)",
        [
            ("Marketplace", "Commerce World Active", "Explore products, drops, and business lanes.", "live"),
            ("Streaming Studio", "Media World Active", "Watch shows, play music, and open coaching.", "live"),
            ("Creator Arena", "Creator World Active", "Build, upload, sign, and launch.", "live"),
            ("University", "Learning World Active", "Grow skills and training.", "live"),
            ("Armed Forces Command", "Honor World Active", "Military support and service recognition.", "live"),
            ("Nigeria Hub", "Nigeria Hub Ready", "Regional hub shell for future growth.", "live"),
            ("UK Hub", "UK Hub Ready", "Regional hub shell for future growth.", "live"),
        ],
    )

conn.commit()
conn.close()
print("Holoverse actions prep complete:", db)
