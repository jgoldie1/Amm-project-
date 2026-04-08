import sqlite3
from pathlib import Path

db = Path("instance/app.db")
db.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS gap_registry_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gap_name TEXT NOT NULL,
    gap_group TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS risk_registry_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    risk_name TEXT NOT NULL,
    risk_group TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS avatar_photo_intake_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    front_image_name TEXT NOT NULL,
    side_image_name TEXT NOT NULL,
    intake_status TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS military_verification_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    branch_name TEXT NOT NULL,
    service_type TEXT NOT NULL,
    verification_status TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS ai_task_center_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_name TEXT NOT NULL,
    task_group TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS world_regions_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    region_name TEXT NOT NULL,
    region_group TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS founder_command_checks_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    check_name TEXT NOT NULL,
    check_group TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("SELECT COUNT(*) FROM gap_registry_v2")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO gap_registry_v2 (gap_name, gap_group, severity, status, notes) VALUES (?, ?, ?, ?, ?)",
        [
            ("Unified activity cards", "ui", "high", "open", "More pages still use JSON-first review flow"),
            ("Invite acceptance visibility", "launch", "medium", "open", "Invite tracking exists but needs richer founder view"),
            ("Avatar photo intake", "avatar", "high", "open", "Need front/side photo intake workflow"),
            ("Military verification proof", "trust", "high", "open", "Need verified service workflow shell"),
            ("Region map expansion", "world", "medium", "open", "Need UK and Atlantic/Americas grouping"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM risk_registry_v2")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO risk_registry_v2 (risk_name, risk_group, severity, status, notes) VALUES (?, ?, ?, ?, ?)",
        [
            ("Broken route drift", "stability", "high", "controlled", "Restart + verify scripts reduce route drift"),
            ("Missing asset fallback", "branding", "medium", "controlled", "Brand fallback layer added"),
            ("Unauthorized tester access", "security", "high", "controlled", "NDA/beta gating should remain enforced"),
            ("Finance misuse", "finance", "high", "controlled", "Sandbox mode only"),
            ("Unverified military claims", "trust", "high", "open", "Verification result layer needed"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM ai_task_center_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO ai_task_center_v1 (task_name, task_group, status, notes) VALUES (?, ?, ?, ?)",
        [
            ("Guide user through app", "assistant", "live", "Onboarding and navigation support"),
            ("Summarize bug reports", "support", "live", "Turn raw issues into readable summaries"),
            ("Suggest booking next steps", "operations", "live", "Help route users to the right service"),
            ("Explain launch readiness", "founder", "live", "Founder-facing decision support"),
            ("Teach inside university", "education", "planned", "Smarter tutoring and learning support"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM world_regions_v2")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO world_regions_v2 (region_name, region_group, status, notes) VALUES (?, ?, ?, ?)",
        [
            ("UK Hub", "Europe", "planned", "United Kingdom regional hub"),
            ("Atlantic Hub", "World", "planned", "Bridge hub between Europe, Africa, and the Americas"),
            ("North America Hub", "Americas", "planned", "Regional grouping hub"),
            ("Central America Hub", "Americas", "planned", "Regional grouping hub"),
            ("South America Hub", "Americas", "planned", "Regional grouping hub"),
            ("Caribbean Hub", "Americas", "planned", "Island and Caribbean grouping hub"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM founder_command_checks_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO founder_command_checks_v1 (check_name, check_group, status, notes) VALUES (?, ?, ?, ?)",
        [
            ("Core pages live", "stability", "live", "app-home, heirs-app, launch ops"),
            ("Beta gate active", "security", "live", "Private access protection"),
            ("Reports active", "beta", "live", "Bug and issue intake"),
            ("Clip queue active", "beta", "live", "Streaming review flow"),
            ("Avatar shell active", "identity", "live", "Avatar creator + holoverse"),
            ("Military center active", "trust", "live", "Honor/support lane"),
        ],
    )

conn.commit()
conn.close()
print("Gap fix prep complete:", db)
