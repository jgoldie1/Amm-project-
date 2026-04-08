import sqlite3
from pathlib import Path

db_path = Path("instance/app.db")
db_path.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS university_courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    track TEXT NOT NULL,
    level TEXT NOT NULL,
    status TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS wallet_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_name TEXT NOT NULL,
    balance REAL NOT NULL,
    rewards_points INTEGER NOT NULL,
    status TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS music_tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    genre TEXT NOT NULL,
    status TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS stream_channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_name TEXT NOT NULL,
    category TEXT NOT NULL,
    live_status TEXT NOT NULL,
    featured TEXT NOT NULL
)
""")

cur.execute("SELECT COUNT(*) FROM university_courses")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO university_courses (title, track, level, status) VALUES (?, ?, ?, ?)",
        [
            ("Marketplace Foundations", "Business", "Beginner", "active"),
            ("Creator Academy", "Media", "Intermediate", "active"),
            ("Blockchain Basics", "Technology", "Intermediate", "active"),
            ("Cybersecurity Operations", "Security", "Advanced", "active"),
            ("Leadership and Governance", "Kingdom", "Advanced", "active"),
            ("FinBank Readiness", "Finance", "Intermediate", "planned"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM wallet_accounts")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO wallet_accounts (account_name, balance, rewards_points, status) VALUES (?, ?, ?, ?)",
        [
            ("Main Wallet", 0.00, 0, "active"),
            ("Creator Wallet", 125.50, 320, "active"),
            ("Vendor Wallet", 480.00, 950, "active"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM music_tracks")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO music_tracks (title, artist, genre, status) VALUES (?, ?, ?, ?)",
        [
            ("Kingdom Rise", "AAME Collective", "Inspirational", "published"),
            ("Quantum Beats", "El Saturn Sounds", "Electronic", "published"),
            ("Any One Can Be a Star", "Legacy Voices", "Anthem", "draft"),
            ("Vision Flow", "Jacobie Vision", "Hip-Hop", "published"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM stream_channels")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO stream_channels (channel_name, category, live_status, featured) VALUES (?, ?, ?, ?)",
        [
            ("Founder Vision Cast", "Talk", "offline", "yes"),
            ("Quantum Beats Live", "Music", "live", "yes"),
            ("Marketplace Seller Training", "Education", "offline", "no"),
            ("Holo Sports Preview", "Sports", "offline", "yes"),
        ],
    )

conn.commit()
conn.close()
print("Seeded ecosystem data in", db_path)
