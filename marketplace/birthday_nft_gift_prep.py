import sqlite3
from pathlib import Path

db = Path("instance/app.db")
db.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS birthday_nft_gifts_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nft_title TEXT NOT NULL,
    honoree_name TEXT NOT NULL,
    gifted_by TEXT NOT NULL,
    gifted_to_name TEXT NOT NULL,
    gifted_to_email TEXT NOT NULL,
    claim_code TEXT NOT NULL,
    claim_status TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS birthday_nft_claims_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_code TEXT NOT NULL,
    claimer_name TEXT NOT NULL,
    claimer_email TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS birthday_nft_catalog_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nft_title TEXT NOT NULL,
    honoree_name TEXT NOT NULL,
    edition_label TEXT NOT NULL,
    rarity_label TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("SELECT COUNT(*) FROM birthday_nft_catalog_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO birthday_nft_catalog_v1 (nft_title, honoree_name, edition_label, rarity_label, status, notes) VALUES (?, ?, ?, ?, ?, ?)",
        [
            ("Happy Birthday Aniyah NFT", "Aniyah", "Edition 1/1", "legendary", "live", "Birthday keepsake and giftable claim pass"),
            ("Happy Birthday Alton Kevon NFT", "Alton Kevon", "Edition 1/1", "legendary", "planned", "Birthday keepsake and giftable claim pass"),
        ],
    )

conn.commit()
conn.close()
print("Birthday NFT gift prep complete:", db)
