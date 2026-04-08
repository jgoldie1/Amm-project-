import sqlite3
from pathlib import Path

db_path = Path("instance/app.db")
db_path.parent.mkdir(parents=True, exist_ok=True)
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS upload_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT NOT NULL,
    asset_kind TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    status TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS finance_controls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    control_name TEXT NOT NULL,
    control_scope TEXT NOT NULL,
    status TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS workflow_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_name TEXT NOT NULL,
    action_module TEXT NOT NULL,
    action_status TEXT NOT NULL
)
""")

cur.execute("SELECT COUNT(*) FROM upload_assets")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO upload_assets (file_name, asset_kind, owner_name, status) VALUES (?, ?, ?, ?)",
        [
            ("stubbs_crest.svg", "brand", "Stubbs", "ready"),
            ("holographic_lion_saturn.svg", "holo-art", "Lion Saturn", "ready"),
            ("american_flag_holo.svg", "flag", "AAME", "ready"),
            ("founder_vision_intro.mp4", "video", "AAME Media", "planned"),
            ("aniyah_voice_session_01.wav", "voice", "Aniyah", "planned"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM finance_controls")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO finance_controls (control_name, control_scope, status) VALUES (?, ?, ?)",
        [
            ("Wallet Sandbox Mode", "wallet", "active"),
            ("Cross-Border Review", "cross-border", "active"),
            ("Audit Trail Required", "finance", "active"),
            ("Payout Approval Gate", "creator-payouts", "planned"),
            ("International Bank Expansion", "finbank", "planned"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM workflow_actions")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO workflow_actions (action_name, action_module, action_status) VALUES (?, ?, ?)",
        [
            ("Guide new vendor into marketplace", "marketplace", "active"),
            ("Show university learning path", "university", "active"),
            ("Review wallet and rewards", "wallet", "active"),
            ("Show vocal coaching sessions", "vocal", "active"),
            ("Show cross-border payment dashboard", "cross-border", "active"),
            ("Open flagship AI suite", "ai", "active"),
        ],
    )

conn.commit()
conn.close()
print("Flagship stabilization data ready:", db_path)
