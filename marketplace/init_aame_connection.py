import sqlite3
from pathlib import Path

db_path = Path("instance/app.db")
db_path.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS ecosystem_divisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    division_name TEXT NOT NULL,
    parent_system TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS streaming_ecosystem_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_name TEXT NOT NULL,
    linked_division TEXT NOT NULL,
    link_type TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("SELECT COUNT(*) FROM ecosystem_divisions")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO ecosystem_divisions (division_name, parent_system, category, status, notes) VALUES (?, ?, ?, ?, ?)",
        [
            ("Alton Security", "All American Marketplace Holographic Streaming Ecosystem", "security", "active", "Security operations, access control, event protection, and incident review"),
            ("Alton Compliance", "All American Marketplace Holographic Streaming Ecosystem", "compliance", "active", "Licensing, policy, audit readiness, and training controls"),
            ("Alton Records", "All American Marketplace Holographic Streaming Ecosystem", "label", "active", "Artist development, releases, promotion, and streaming-linked growth"),
            ("Kevon Shot It Media", "All American Marketplace Holographic Streaming Ecosystem", "media", "active", "Video production, promo media, event coverage, and creator visuals"),
            ("Kevon Film Studio", "All American Marketplace Holographic Streaming Ecosystem", "film", "active", "Trailers, documentaries, series, and cinematic production"),
            ("Kevon Forex & Stock AI", "All American Marketplace Holographic Streaming Ecosystem", "finance_ai", "active", "AI-assisted market research, watchlists, and finance education"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM streaming_ecosystem_links")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO streaming_ecosystem_links (module_name, linked_division, link_type, status, notes) VALUES (?, ?, ?, ?, ?)",
        [
            ("Music App", "Alton Records", "artist_promo", "active", "Artists and releases connect into streaming/music surfaces"),
            ("Streaming App", "Kevon Shot It Media", "media_distribution", "active", "Promo videos and creator visuals feed the streaming ecosystem"),
            ("Holoverse Center", "Kevon Film Studio", "cinematic_content", "active", "Film/trailer content supports immersive presentation"),
            ("Finance Trust Center", "Alton Compliance", "risk_control", "active", "Compliance supports finance hardening and review"),
            ("Creator Market", "Kevon Shot It Media", "creator_visuals", "active", "Media production and uploads connect to creator surfaces"),
            ("System Readiness", "Alton Security", "operations_readiness", "active", "Security and ops readiness support platform stability"),
            ("Search Pro", "Kevon Forex & Stock AI", "research_surface", "active", "Trading research and AI insights connect to search/discovery"),
        ],
    )

conn.commit()
conn.close()
print("AAME connection data ready:", db_path)
