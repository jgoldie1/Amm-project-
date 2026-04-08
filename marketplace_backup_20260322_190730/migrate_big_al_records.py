import sqlite3
from pathlib import Path

db_path = Path("instance/app.db")
db_path.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

# heir_profiles
try:
    cur.execute("""
        UPDATE heir_profiles
        SET division_group = REPLACE(division_group, 'Security / Compliance / Records', 'Security / Compliance / Big Al Records')
        WHERE division_group LIKE '%Records%'
    """)
except Exception:
    pass

# ecosystem_divisions
try:
    cur.execute("""
        UPDATE ecosystem_divisions
        SET division_name='Big Al Records',
            notes='Artist development, releases, promotion, publishing direction, and streaming-linked growth under Big Al Records'
        WHERE division_name='Alton Records'
    """)
except Exception:
    pass

# streaming_ecosystem_links
try:
    cur.execute("""
        UPDATE streaming_ecosystem_links
        SET linked_division='Big Al Records'
        WHERE linked_division='Alton Records'
    """)
except Exception:
    pass

# business_intake_requests
try:
    cur.execute("""
        UPDATE business_intake_requests
        SET division_name='Big Al Records'
        WHERE division_name='Alton Records'
    """)
except Exception:
        pass

# alton_records_artists notes
try:
    cur.execute("""
        UPDATE alton_records_artists
        SET notes = REPLACE(notes, 'Alton Records', 'Big Al Records')
        WHERE notes LIKE '%Alton Records%'
    """)
except Exception:
    pass

conn.commit()
conn.close()
print("Big Al Records migration complete:", db_path)
