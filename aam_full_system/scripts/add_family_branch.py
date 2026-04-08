import sqlite3
import sys
from pathlib import Path

def main():
    if len(sys.argv) < 3:
        print("Usage:")
        print("  python scripts/add_family_branch.py \"Parent Name\" 3")
        print("  python scripts/add_family_branch.py \"Parent Name\" 3 \"Child A\" \"Child B\" \"Child C\"")
        sys.exit(1)

    parent_name = sys.argv[1].strip()
    child_count = int(sys.argv[2])

    custom_children = [x.strip() for x in sys.argv[3:]]
    if custom_children and len(custom_children) != child_count:
        print("Error: number of custom child names must match child_count")
        sys.exit(1)

    db_path = Path.home() / "aam_full_system" / "db" / "aam.db"
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    starter_businesses = [
        "All American University Access",
        "Branch Dashboard Access"
    ]

    def ensure_person(name: str, role: str) -> int:
        cur.execute("SELECT id FROM people WHERE name = ?", (name,))
        row = cur.fetchone()
        if row:
            return row[0]

        cur.execute("INSERT INTO people (name, role) VALUES (?, ?)", (name, role))
        return cur.lastrowid

    def ensure_starter_businesses(person_id: int):
        for biz in starter_businesses:
            cur.execute(
                "SELECT 1 FROM businesses WHERE person_id = ? AND name = ?",
                (person_id, biz)
            )
            if not cur.fetchone():
                cur.execute(
                    "INSERT INTO businesses (person_id, name) VALUES (?, ?)",
                    (person_id, biz)
                )

    parent_id = ensure_person(parent_name, "Branch Leader / Parent")
    ensure_starter_businesses(parent_id)

    added_names = [parent_name]

    for i in range(child_count):
        child_name = custom_children[i] if custom_children else f"{parent_name} Child {i+1}"
        child_id = ensure_person(child_name, "Heir / Student / Builder")
        ensure_starter_businesses(child_id)
        added_names.append(child_name)

    conn.commit()
    conn.close()

    print("Family branch ensured:")
    for name in added_names:
        print("-", name)

if __name__ == "__main__":
    main()
