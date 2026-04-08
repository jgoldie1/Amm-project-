import sqlite3
from pathlib import Path

db_path = Path("instance/app.db")
db_path.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS app_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS service_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    division_name TEXT NOT NULL,
    service_name TEXT NOT NULL,
    client_name TEXT NOT NULL,
    booking_date TEXT NOT NULL,
    booking_time TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS upload_project_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    upload_title TEXT NOT NULL,
    filename TEXT NOT NULL,
    linked_project TEXT NOT NULL,
    division_name TEXT NOT NULL,
    status TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS artist_releases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_name TEXT NOT NULL,
    release_title TEXT NOT NULL,
    release_type TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS creator_collections_featured (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    shelf_name TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("SELECT COUNT(*) FROM app_users")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO app_users (email, password, display_name, role, status) VALUES (?, ?, ?, ?, ?)",
        [
            ("admin@aame.local", "admin123", "AAME Admin", "admin", "active"),
            ("operator@aame.local", "operator123", "AAME Operator", "operator", "active"),
            ("creator@aame.local", "creator123", "AAME Creator", "creator", "active"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM service_bookings")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO service_bookings (division_name, service_name, client_name, booking_date, booking_time, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
            ("Alton Security", "Event Protection", "Demo Client", "2026-03-25", "14:00", "scheduled", "Security service booking sample"),
            ("Kevon Shot It Media", "Brand Shoot", "Demo Brand", "2026-03-26", "11:00", "scheduled", "Media shoot booking sample"),
            ("Big Al Records", "Artist Development Session", "Demo Artist", "2026-03-27", "16:00", "scheduled", "Label service booking sample"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM upload_project_links")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO upload_project_links (upload_title, filename, linked_project, division_name, status) VALUES (?, ?, ?, ?, ?)",
        [
            ("Stubbs Crest Master", "stubbs_crest.svg", "Stubbs Brand Visual Pack", "Kevon Shot It Media", "linked"),
            ("Holographic Lion Saturn Master", "holographic_lion_saturn.svg", "Holoverse Trailer", "Kevon Film Studio", "linked"),
            ("American Flag Holographic", "american_flag_holo.svg", "Big Al Records Launch Campaign", "Big Al Records", "linked"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM artist_releases")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO artist_releases (artist_name, release_title, release_type, status, notes) VALUES (?, ?, ?, ?, ?)",
        [
            ("Aniyah", "Rise In Sound", "single", "planned", "Artist growth release sample"),
            ("AAME Label Demo Artist", "Platform Anthem", "single", "active", "Streaming-connected release sample"),
            ("Platform Praise Collective", "Lifted Voices", "EP", "planned", "Label roster release sample"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM creator_collections_featured")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO creator_collections_featured (collection_name, owner_name, shelf_name, status, notes) VALUES (?, ?, ?, ?, ?)",
        [
            ("Stubbs Brand Assets", "Stubbs", "Featured Brand Shelf", "live", "Featured flagship brand visuals"),
            ("Lion Saturn Visuals", "Lion Saturn", "Featured Visual Shelf", "live", "Featured holographic visual shelf"),
            ("Aniyah Voice Sessions", "Aniyah", "Featured Artist Shelf", "planned", "Artist development collection"),
        ],
    )

try:
    cur.execute("""
        UPDATE heir_profiles
        SET full_name='Alton Kevon Stubbs',
            notes=REPLACE(notes, 'Alton Stubbs', 'Alton Kevon Stubbs')
        WHERE full_name='Alton Stubbs'
    """)
except Exception:
    pass

conn.commit()
conn.close()
print("Alton Kevon auth/booking/release setup ready:", db_path)
