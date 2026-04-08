import sqlite3
from pathlib import Path

db_path = Path("instance/app.db")
db_path.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS protected_routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    route TEXT NOT NULL,
    required_role TEXT NOT NULL,
    status TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS finance_guardrails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    control_name TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS workflow_execution_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workflow_name TEXT NOT NULL,
    action_name TEXT NOT NULL,
    result_status TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS upload_collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL
)
""")

cur.execute("SELECT COUNT(*) FROM protected_routes")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO protected_routes (route, required_role, status) VALUES (?, ?, ?)",
        [
            ("/finbank-international", "admin", "active"),
            ("/finance-hardening-center", "admin", "active"),
            ("/uploads-admin", "admin", "active"),
            ("/action-workflow-center", "operator", "active"),
            ("/security-compliance-center", "operator", "active"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM finance_guardrails")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO finance_guardrails (control_name, severity, status, notes) VALUES (?, ?, ?, ?)",
        [
            ("Sandbox only finance mode", "high", "active", "No real money processing until hardening is complete"),
            ("Cross-border review gate", "high", "active", "Transfers remain review-only"),
            ("Audit logging required", "high", "active", "All finance actions should be logged"),
            ("Manual payout approval", "medium", "active", "No auto-payout execution"),
            ("Role-restricted finance pages", "high", "active", "Sensitive pages should require admin or operator roles"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM upload_collections")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO upload_collections (collection_name, owner_name, category, status) VALUES (?, ?, ?, ?)",
        [
            ("Stubbs Brand Assets", "Stubbs", "brand", "live"),
            ("Lion Saturn Visuals", "Lion Saturn", "brand", "live"),
            ("Aniyah Voice Sessions", "Aniyah", "voice", "planned"),
            ("Streaming Launch Pack", "AAME Media", "streaming", "planned"),
        ],
    )

conn.commit()
conn.close()
print("Core completion seed complete:", db_path)
