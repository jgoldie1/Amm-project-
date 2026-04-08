import sqlite3
from pathlib import Path

db = Path("instance/app.db")
db.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS birthday_events_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_date TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS birthday_nfts_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    honoree_name TEXT NOT NULL,
    edition_label TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("SELECT COUNT(*) FROM birthday_events_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO birthday_events_v1 (person_name, event_type, event_date, status, notes) VALUES (?, ?, ?, ?, ?)",
        [
            ("Aniyah", "birthday", "today", "live", "Happy Birthday banner event"),
            ("Alton Kevon", "countdown", "3_days", "live", "3-day countdown event"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM birthday_nfts_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO birthday_nfts_v1 (title, honoree_name, edition_label, status, notes) VALUES (?, ?, ?, ?, ?)",
        [
            ("Happy Birthday Aniyah NFT", "Aniyah", "Edition 1/1", "concept_live", "Birthday keepsake NFT shell"),
            ("Happy Birthday Alton Kevon NFT", "Alton Kevon", "Edition 1/1", "concept_live", "Birthday keepsake NFT shell"),
        ],
    )

conn.commit()
conn.close()
print("Birthday prep complete:", db)
