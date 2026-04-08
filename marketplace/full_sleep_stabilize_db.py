import sqlite3
from pathlib import Path
from werkzeug.security import generate_password_hash

db = Path("instance/app.db")
db.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS platform_users_v4 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS auth_audit_log_v4 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    action TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS sandbox_accounts_v4 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL,
    balance REAL NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS sandbox_transactions_v4 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,
    amount REAL NOT NULL,
    counterparty TEXT NOT NULL,
    memo TEXT NOT NULL,
    approval_status TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS finance_approvals_v4 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    reviewer_name TEXT NOT NULL,
    decision TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS finance_audit_log_v4 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_name TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS file_assets_v4 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    filename TEXT NOT NULL UNIQUE,
    file_type TEXT NOT NULL,
    category TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    project_name TEXT NOT NULL DEFAULT '',
    featured INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS file_tags_v4 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    tag_name TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS service_bookings_v4 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    division_name TEXT NOT NULL,
    service_name TEXT NOT NULL,
    client_name TEXT NOT NULL,
    booking_date TEXT NOT NULL,
    booking_time TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS booking_activity_log_v4 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER,
    action_name TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS artist_releases_v4 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_name TEXT NOT NULL,
    release_title TEXT NOT NULL,
    release_type TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS release_tasks_v4 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_name TEXT NOT NULL,
    release_title TEXT NOT NULL,
    task_name TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS workflow_templates_v4 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_name TEXT NOT NULL,
    division_name TEXT NOT NULL,
    action_name TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS workflow_jobs_v4 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_name TEXT NOT NULL,
    division_name TEXT NOT NULL,
    action_name TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    result_status TEXT NOT NULL,
    result_message TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS upload_project_links_v4 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    upload_title TEXT NOT NULL,
    filename TEXT NOT NULL,
    linked_project TEXT NOT NULL,
    division_name TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS creator_collections_v4 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    shelf_name TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS integrity_registry_v4 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_name TEXT NOT NULL,
    module_group TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("SELECT COUNT(*) FROM platform_users_v4")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO platform_users_v4 (email, password_hash, display_name, role, status) VALUES (?, ?, ?, ?, ?)",
        [
            ("admin@aame.local", generate_password_hash("admin123"), "AAME Admin", "admin", "active"),
            ("operator@aame.local", generate_password_hash("operator123"), "AAME Operator", "operator", "active"),
            ("creator@aame.local", generate_password_hash("creator123"), "AAME Creator", "creator", "active"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM sandbox_accounts_v4")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO sandbox_accounts_v4 (account_name, account_type, balance, currency, status) VALUES (?, ?, ?, ?, ?)",
        [
            ("AAME Sandbox Main", "platform", 25000.00, "USD", "active"),
            ("Creator Payout Sandbox", "payout", 8500.00, "USD", "active"),
            ("Cross Border Sandbox", "cross_border", 5000.00, "USD", "review_only"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM service_bookings_v4")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO service_bookings_v4 (division_name, service_name, client_name, booking_date, booking_time, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
            ("Alton Security", "Event Protection", "Demo Client", "2026-03-25", "14:00", "scheduled", "Security booking sample"),
            ("Kevon Shot It Media", "Brand Shoot", "Demo Brand", "2026-03-26", "11:00", "scheduled", "Media booking sample"),
            ("Big Al Records", "Artist Development Session", "Demo Artist", "2026-03-27", "16:00", "scheduled", "Label booking sample"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM artist_releases_v4")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO artist_releases_v4 (artist_name, release_title, release_type, status, notes) VALUES (?, ?, ?, ?, ?)",
        [
            ("Aniyah", "Rise In Sound", "single", "planned", "Artist growth release sample"),
            ("AAME Label Demo Artist", "Platform Anthem", "single", "active", "Streaming-connected release sample"),
            ("Platform Praise Collective", "Lifted Voices", "EP", "planned", "Roster release sample"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM release_tasks_v4")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO release_tasks_v4 (artist_name, release_title, task_name, status, notes) VALUES (?, ?, ?, ?, ?)",
        [
            ("Aniyah", "Rise In Sound", "Cover Art Prep", "planned", "Prepare visual package"),
            ("Aniyah", "Rise In Sound", "Promo Clip", "planned", "Create promo video"),
            ("AAME Label Demo Artist", "Platform Anthem", "Streaming Push", "active", "Streaming promo support"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM workflow_templates_v4")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO workflow_templates_v4 (template_name, division_name, action_name, status, notes) VALUES (?, ?, ?, ?, ?)",
        [
            ("Security Intake Workflow", "Alton Security", "create_demo_booking", "active", "Creates booking"),
            ("Media Promo Workflow", "Kevon Shot It Media", "create_demo_booking", "active", "Creates media booking"),
            ("Release Setup Workflow", "Big Al Records", "create_demo_release", "active", "Creates release"),
            ("Finance Review Workflow", "Finance Trust", "log_finance_review", "active", "Logs finance review"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM creator_collections_v4")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO creator_collections_v4 (collection_name, owner_name, shelf_name, status, notes) VALUES (?, ?, ?, ?, ?)",
        [
            ("Stubbs Brand Assets", "Stubbs", "Featured Brand Shelf", "live", "Featured flagship brand visuals"),
            ("Lion Saturn Visuals", "Lion Saturn", "Featured Visual Shelf", "live", "Featured holographic visual shelf"),
            ("Aniyah Voice Sessions", "Aniyah", "Featured Artist Shelf", "planned", "Artist development collection"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM integrity_registry_v4")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO integrity_registry_v4 (module_name, module_group, status, notes) VALUES (?, ?, ?, ?)",
        [
            ("Auth V4", "security", "live", "Hashed password login and protected routes"),
            ("Finance Sandbox V4", "finance", "live", "Sandbox ledger and approvals"),
            ("Files V4", "files", "live", "Tracked files, tags, and status"),
            ("Bookings V4", "operations", "live", "Booking creation and activity log"),
            ("Releases V4", "creator", "live", "Artist release tracking"),
            ("Workflow Jobs V4", "automation", "live", "Template-backed workflow jobs"),
            ("Sleep Protect Hub", "ops", "live", "Protected local command hub"),
        ],
    )

try:
    cur.execute("SELECT title, filename, file_type, category, owner_name FROM creator_uploads")
    rows = cur.fetchall()
    for title, filename, file_type, category, owner_name in rows:
        cur.execute("SELECT COUNT(*) FROM file_assets_v4 WHERE filename=?", (filename,))
        if cur.fetchone()[0] == 0:
            cur.execute(
                "INSERT INTO file_assets_v4 (title, filename, file_type, category, owner_name, status) VALUES (?, ?, ?, ?, ?, 'active')",
                (title, filename, file_type, category, owner_name)
            )
except Exception:
    pass

conn.commit()
conn.close()
print("Full sleep stabilization DB ready:", db)
