import sqlite3
from pathlib import Path

db_path = Path("instance/app.db")
db_path.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS heir_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    heir_role TEXT NOT NULL,
    division_group TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS alton_compliance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_name TEXT NOT NULL,
    record_type TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS alton_records_artists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_name TEXT NOT NULL,
    genre TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS kevon_film_projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    project_type TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS kevon_trading_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    market_type TEXT NOT NULL,
    ai_mode TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS business_intake_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    division_name TEXT NOT NULL,
    requester_name TEXT NOT NULL,
    request_title TEXT NOT NULL,
    request_type TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("SELECT COUNT(*) FROM heir_profiles")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO heir_profiles (full_name, heir_role, division_group, status, notes) VALUES (?, ?, ?, ?, ?)",
        [
            ("Alton Stubbs", "Heir", "Security / Compliance / Records", "active", "Alton Stubbs is an heir with leadership and operating roles across security, compliance, and records."),
        ],
    )

cur.execute("SELECT COUNT(*) FROM alton_compliance_records")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO alton_compliance_records (record_name, record_type, status, notes) VALUES (?, ?, ?, ?)",
        [
            ("Policy & Licensing Master", "policy", "active", "Master policy and licensing control record"),
            ("Audit Readiness Checklist", "audit", "active", "Cross-department audit readiness record"),
            ("Training Renewal Roster", "training", "active", "Staff training and renewal tracking"),
            ("Restricted Access Review", "access", "active", "Restricted area and credential review record"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM alton_records_artists")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO alton_records_artists (artist_name, genre, status, notes) VALUES (?, ?, ?, ?)",
        [
            ("Aniyah", "Vocal / Performance", "development", "Artist growth, media support, and promo direction"),
            ("AAME Label Demo Artist", "Hip-Hop / Media", "active", "Demo artist profile for Alton Records"),
            ("Platform Praise Collective", "Inspirational / Streaming", "planned", "Future label and streaming collaboration"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM kevon_film_projects")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO kevon_film_projects (title, project_type, status, notes) VALUES (?, ?, ?, ?)",
        [
            ("Holoverse Trailer", "trailer", "planned", "Cinematic launch trailer for Holoverse"),
            ("Stubbs Legacy Documentary", "documentary", "planned", "Family and platform legacy story"),
            ("Creator Spotlight Series", "series", "active", "Streaming-ready creator interview and promo series"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM kevon_trading_assets")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO kevon_trading_assets (symbol, market_type, ai_mode, status, notes) VALUES (?, ?, ?, ?, ?)",
        [
            ("EURUSD", "forex", "trend-ai", "active", "Forex research and market trend mode"),
            ("GBPUSD", "forex", "signal-ai", "active", "Forex signal and watch mode"),
            ("AAPL", "stock", "equity-ai", "active", "Equity tracking and research mode"),
            ("NVDA", "stock", "growth-ai", "active", "Growth and momentum research mode"),
            ("SPY", "ETF", "macro-ai", "active", "Market-wide trend monitoring"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM business_intake_requests")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO business_intake_requests (division_name, requester_name, request_title, request_type, status, notes) VALUES (?, ?, ?, ?, ?, ?)",
        [
            ("Alton Security", "Demo Client", "Event Protection Request", "security", "new", "Sample client intake for security coverage"),
            ("Alton Compliance", "Demo Business", "Compliance Review Request", "compliance", "reviewing", "Sample compliance intake"),
            ("Alton Records", "Demo Artist", "Artist Development Inquiry", "records", "new", "Sample label intake"),
            ("Kevon Shot It Media", "Demo Brand", "Brand Shoot Request", "media", "approved", "Sample media intake"),
            ("Kevon Film Studio", "Demo Producer", "Trailer Production Inquiry", "film", "new", "Sample film intake"),
            ("Kevon Forex & Stock AI", "Demo Trader", "AI Market Dashboard Inquiry", "trading", "new", "Sample trading intake"),
        ],
    )

conn.commit()
conn.close()
print("Alton heir full stack ready:", db_path)
