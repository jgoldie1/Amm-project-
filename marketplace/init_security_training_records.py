import sqlite3
from pathlib import Path

db_path = Path("instance/app.db")
db_path.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS security_training_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_name TEXT NOT NULL,
    training_name TEXT NOT NULL,
    certification_status TEXT NOT NULL,
    renewal_status TEXT NOT NULL
)
""")

cur.execute("SELECT COUNT(*) FROM security_training_records")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO security_training_records (person_name, training_name, certification_status, renewal_status) VALUES (?, ?, ?, ?)",
        [
            ("Alton Security Team Lead", "Security Compliance Orientation", "active", "current"),
            ("Operations Supervisor", "Incident Review Procedures", "active", "current"),
            ("Training Candidate A", "Policy & Licensing Review", "pending", "not_due"),
            ("Training Candidate B", "Documentation & Audit Basics", "active", "renewal_due"),
        ],
    )

conn.commit()
conn.close()
print("Seeded security training records in", db_path)
