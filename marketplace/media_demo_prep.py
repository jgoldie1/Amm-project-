import sqlite3
from pathlib import Path

db = Path("instance/app.db")
db.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS media_shows_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    genre TEXT NOT NULL,
    status TEXT NOT NULL,
    audience TEXT NOT NULL,
    summary TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS media_tracks_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    mood TEXT NOT NULL,
    status TEXT NOT NULL,
    summary TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS music_coaching_requests_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name TEXT NOT NULL,
    email TEXT NOT NULL,
    goal TEXT NOT NULL,
    session_type TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS artist_signing_intake_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_name TEXT NOT NULL,
    email TEXT NOT NULL,
    style_name TEXT NOT NULL,
    current_stage TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS media_featured_rows_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    row_name TEXT NOT NULL,
    row_group TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("SELECT COUNT(*) FROM media_shows_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO media_shows_v1 (title, genre, status, audience, summary) VALUES (?, ?, ?, ?, ?)",
        [
            ("Heirs Launch Show", "family", "featured", "heirs", "Main family-first welcome show for the private beta."),
            ("Holo Stream Spotlight", "variety", "featured", "beta", "Spotlight show for creators, clips, and community moments."),
            ("Bloom Wellness Sessions", "wellness", "planned", "family", "Wellness and encouragement content lane."),
            ("Big Al Records Sessions", "music", "planned", "beta", "Music and artist development content lane."),
        ],
    )

cur.execute("SELECT COUNT(*) FROM media_tracks_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO media_tracks_v1 (title, artist_name, mood, status, summary) VALUES (?, ?, ?, ?, ?)",
        [
            ("Rise In Sound", "Aniyah", "uplifting", "featured", "Featured artist demo track lane."),
            ("Platform Anthem", "AAME Demo Artist", "epic", "featured", "Main anthem lane for the platform."),
            ("Lifted Voices", "Praise Collective", "worship", "planned", "Faith-centered music lane."),
            ("Night Drive Holo Mix", "Kevon Shot It Media", "cinematic", "planned", "Media-forward promo music lane."),
        ],
    )

cur.execute("SELECT COUNT(*) FROM media_featured_rows_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO media_featured_rows_v1 (row_name, row_group, status, notes) VALUES (?, ?, ?, ?)",
        [
            ("Featured Shows", "shows", "live", "Top media demo shows"),
            ("Featured Music", "music", "live", "Top media demo tracks"),
            ("Music Coaching", "coaching", "live", "Coaching entry lane"),
            ("Artist Signing", "signing", "live", "Artist intake lane"),
        ],
    )

conn.commit()
conn.close()
print("Media demo prep complete:", db)
