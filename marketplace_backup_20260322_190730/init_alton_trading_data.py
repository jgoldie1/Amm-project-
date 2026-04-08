import sqlite3
from pathlib import Path

db_path = Path("instance/app.db")
db_path.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS security_units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_name TEXT NOT NULL,
    unit_type TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS media_projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    project_type TEXT NOT NULL,
    status TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS trading_watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    market_type TEXT NOT NULL,
    strategy_label TEXT NOT NULL,
    status TEXT NOT NULL
)
""")

cur.execute("SELECT COUNT(*) FROM security_units")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO security_units (unit_name, unit_type, status, notes) VALUES (?, ?, ?, ?)",
        [
            ("Alton Security Command", "operations", "active", "Security operations and oversight shell"),
            ("Compliance & Licensing", "compliance", "active", "Policy, licensing, training, and audit tracking"),
            ("Access Control Team", "security", "planned", "Future admin and restricted route protection"),
            ("Incident Review Desk", "risk", "planned", "Future incident logging and review"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM media_projects")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO media_projects (project_name, owner_name, project_type, status) VALUES (?, ?, ?, ?)",
        [
            ("Kevon Shot It Launch Reel", "Alton Kevon", "video", "planned"),
            ("Stubbs Family Promo", "Alton Kevon", "media", "planned"),
            ("Holographic Creator Visual Pack", "Kevon Shot It", "creative", "concept"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM trading_watchlist")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO trading_watchlist (symbol, market_type, strategy_label, status) VALUES (?, ?, ?, ?)",
        [
            ("EURUSD", "forex", "trend-watch", "active"),
            ("GBPUSD", "forex", "momentum-watch", "active"),
            ("AAPL", "stock", "swing-watch", "active"),
            ("NVDA", "stock", "growth-watch", "active"),
            ("SPY", "ETF", "market-watch", "active"),
        ],
    )

conn.commit()
conn.close()
print("Seeded Alton/Trading data in", db_path)
