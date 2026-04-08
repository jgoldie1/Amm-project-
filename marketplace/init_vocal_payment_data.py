import sqlite3
from pathlib import Path

db_path = Path("instance/app.db")
db_path.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS vocal_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name TEXT NOT NULL,
    coach_name TEXT NOT NULL,
    lesson_title TEXT NOT NULL,
    session_status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS cross_border_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_name TEXT NOT NULL,
    receiver_name TEXT NOT NULL,
    origin_country TEXT NOT NULL,
    destination_country TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_status TEXT NOT NULL
)
""")

cur.execute("SELECT COUNT(*) FROM vocal_sessions")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO vocal_sessions (student_name, coach_name, lesson_title, session_status, notes) VALUES (?, ?, ?, ?, ?)",
        [
            ("Aniyah", "Coach Lila", "Breath Control Basics", "scheduled", "Intro vocal strength session"),
            ("Aniyah", "Coach Lila", "Pitch Accuracy Lab", "completed", "Improved pitch control and ear training"),
            ("Isaiah", "Coach Zion", "Stage Voice Projection", "scheduled", "Projection and confidence building"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM cross_border_payments")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO cross_border_payments (sender_name, receiver_name, origin_country, destination_country, amount, payment_status) VALUES (?, ?, ?, ?, ?, ?)",
        [
            ("Aniyah Payments", "Vendor One", "United States", "Trinidad and Tobago", 125.50, "pending"),
            ("AAME Wallet", "Creator Payout", "United States", "Canada", 280.00, "processing"),
            ("El Saturn FinBank", "Partner Account", "United States", "United Kingdom", 950.75, "completed"),
        ],
    )

conn.commit()
conn.close()
print("Seeded vocal and cross-border payment data in", db_path)
