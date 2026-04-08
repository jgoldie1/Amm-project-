import json
import sqlite3
from pathlib import Path

root = Path.home() / "aam_full_system"
db_path = root / "db" / "aam.db"
family_path = root / "data" / "family.json"
rules_path = root / "data" / "rules.json"

conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS businesses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY(person_id) REFERENCES people(id)
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS archive_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS rules (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
)
""")

cur.execute("DELETE FROM businesses")
cur.execute("DELETE FROM people")
cur.execute("DELETE FROM rules")

family = json.loads(family_path.read_text())
rules = json.loads(rules_path.read_text())

for person in family["people"]:
    cur.execute("INSERT INTO people (name, role) VALUES (?, ?)", (person["name"], person["role"]))
    person_id = cur.lastrowid
    for biz in person.get("businesses", []):
        cur.execute("INSERT INTO businesses (person_id, name) VALUES (?, ?)", (person_id, biz))

for k, v in rules.items():
    cur.execute("INSERT INTO rules (key, value) VALUES (?, ?)", (k, str(v)))

conn.commit()
conn.close()

print(f"Database initialized at: {db_path}")
