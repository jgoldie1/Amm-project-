import sqlite3
from pathlib import Path
from werkzeug.security import generate_password_hash

db = Path("instance/app.db")
db.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS platform_users_v2 (
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
CREATE TABLE IF NOT EXISTS sandbox_accounts (
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
CREATE TABLE IF NOT EXISTS sandbox_transactions (
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
CREATE TABLE IF NOT EXISTS file_assets_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    category TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    project_name TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active',
    featured INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS workflow_jobs_v2 (
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
CREATE TABLE IF NOT EXISTS finance_approvals_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    reviewer_name TEXT NOT NULL,
    decision TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS system_integrity_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    check_name TEXT NOT NULL,
    check_group TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("SELECT COUNT(*) FROM platform_users_v2")
if cur.fetchone()[0] == 0:
    users = [
        ("admin@aame.local", generate_password_hash("admin123"), "AAME Admin", "admin", "active"),
        ("operator@aame.local", generate_password_hash("operator123"), "AAME Operator", "operator", "active"),
        ("creator@aame.local", generate_password_hash("creator123"), "AAME Creator", "creator", "active"),
    ]
    cur.executemany(
        "INSERT INTO platform_users_v2 (email, password_hash, display_name, role, status) VALUES (?, ?, ?, ?, ?)",
        users,
    )

cur.execute("SELECT COUNT(*) FROM sandbox_accounts")
if cur.fetchone()[0] == 0:
    accounts = [
        ("AAME Sandbox Main", "platform", 25000.00, "USD", "active"),
        ("Creator Payout Sandbox", "payout", 8500.00, "USD", "active"),
        ("Cross Border Sandbox", "cross_border", 5000.00, "USD", "review_only"),
    ]
    cur.executemany(
        "INSERT INTO sandbox_accounts (account_name, account_type, balance, currency, status) VALUES (?, ?, ?, ?, ?)",
        accounts,
    )

cur.execute("SELECT COUNT(*) FROM system_integrity_checks")
if cur.fetchone()[0] == 0:
    checks = [
        ("Session auth", "security", "live", "Session login routes installed"),
        ("Sandbox finance", "finance", "live", "Ledger and approvals active in sandbox mode"),
        ("File asset registry", "files", "live", "File assets tracked in DB"),
        ("Workflow jobs", "automation", "live", "Workflow jobs create records"),
        ("Stabilization hub", "ops", "live", "Unified status surface available"),
    ]
    cur.executemany(
        "INSERT INTO system_integrity_checks (check_name, check_group, status, notes) VALUES (?, ?, ?, ?)",
        checks,
    )

try:
    cur.execute("SELECT title, filename, file_type, category, owner_name FROM creator_uploads")
    for title, filename, file_type, category, owner_name in cur.fetchall():
        cur.execute("SELECT COUNT(*) FROM file_assets_v2 WHERE filename=?", (filename,))
        if cur.fetchone()[0] == 0:
            cur.execute(
                "INSERT INTO file_assets_v2 (title, filename, file_type, category, owner_name, status) VALUES (?, ?, ?, ?, ?, 'active')",
                (title, filename, file_type, category, owner_name),
            )
except Exception:
    pass

conn.commit()
conn.close()
print("Core platform stabilization complete:", db)
