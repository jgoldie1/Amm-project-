import sqlite3
from pathlib import Path

db_path = Path("instance/app.db")
db_path.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS creator_uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL
)
""")

cur.execute("SELECT COUNT(*) FROM creator_uploads")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO creator_uploads (title, filename, file_type, owner_name, category, status) VALUES (?, ?, ?, ?, ?, ?)",
        [
            ("Stubbs Crest Master", "stubbs_crest.svg", "image", "Stubbs", "brand", "live"),
            ("Holographic Lion Saturn Master", "holographic_lion_saturn.svg", "image", "Lion Saturn", "brand", "live"),
            ("American Flag Holographic", "american_flag_holo.svg", "image", "AAME", "brand", "live")
        ],
    )

conn.commit()
conn.close()
print("creator_uploads ready:", db_path)
