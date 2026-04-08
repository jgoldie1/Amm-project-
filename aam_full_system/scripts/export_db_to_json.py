import json
import sqlite3
from pathlib import Path

root = Path.home() / "aam_full_system"
db_path = root / "db" / "aam.db"
family_path = root / "data" / "family.json"

conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("SELECT id, name, role FROM people ORDER BY id")
people_rows = cur.fetchall()

people = []
for pid, name, role in people_rows:
    cur.execute("SELECT name FROM businesses WHERE person_id = ? ORDER BY id", (pid,))
    businesses = [row[0] for row in cur.fetchall()]
    people.append({
        "name": name,
        "role": role,
        "businesses": businesses
    })

family_path.write_text(json.dumps({"people": people}, indent=2))
conn.close()

print(f"Exported database back to: {family_path}")
