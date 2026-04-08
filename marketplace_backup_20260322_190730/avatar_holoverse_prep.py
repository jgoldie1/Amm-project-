import sqlite3
from pathlib import Path

db = Path("instance/app.db")
db.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS avatar_profiles_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    avatar_style TEXT NOT NULL,
    outfit_style TEXT NOT NULL,
    badge_level TEXT NOT NULL,
    role_name TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS holoverse_worlds_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    world_name TEXT NOT NULL,
    region_group TEXT NOT NULL,
    world_type TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS teleport_log_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_name TEXT NOT NULL,
    from_world TEXT NOT NULL,
    to_world TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS presence_rooms_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_name TEXT NOT NULL,
    room_type TEXT NOT NULL,
    current_status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS online_presence_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    display_name TEXT NOT NULL,
    room_name TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS armed_forces_profiles_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_name TEXT NOT NULL,
    branch_name TEXT NOT NULL,
    service_status TEXT NOT NULL,
    rank_name TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS armed_forces_benefits_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    benefit_name TEXT NOT NULL,
    benefit_group TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS holoverse_portals_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    portal_name TEXT NOT NULL,
    destination_world TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("SELECT COUNT(*) FROM avatar_profiles_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO avatar_profiles_v1 (owner_name, display_name, avatar_style, outfit_style, badge_level, role_name, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
            ("James Stubbs", "Founder", "commander", "executive_holo", "founder", "founder", "live", "Primary founder avatar"),
            ("Alton Kevon Stubbs", "Alton Kevon", "guardian", "security_royal", "heir", "heir", "live", "Heir command avatar"),
            ("Aniyah Stubbs", "Aniyah", "creator_star", "birthday_drop", "heir", "creator", "live", "Heir creator avatar"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM holoverse_worlds_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO holoverse_worlds_v1 (world_name, region_group, world_type, status, notes) VALUES (?, ?, ?, ?, ?)",
        [
            ("Marketplace", "Core", "commerce", "live", "Main AAME commerce portal"),
            ("Streaming Studio", "Core", "media", "live", "Streaming and creator media world"),
            ("Creator Arena", "Core", "creator", "live", "Creator uploads and showcases"),
            ("University", "Core", "education", "live", "Training and advancement"),
            ("Armed Forces Command", "Core", "military", "live", "Military honor and support center"),
            ("Nigeria Hub", "Africa", "regional", "planned", "Regional portal"),
            ("Ethiopia Hub", "Africa", "regional", "planned", "Regional portal"),
            ("Kenya Hub", "Africa", "regional", "planned", "Regional portal"),
            ("Ghana Hub", "Africa", "regional", "planned", "Regional portal"),
            ("Morocco Hub", "Africa", "regional", "planned", "Regional portal"),
            ("Burkina Faso Hub", "Africa", "regional", "planned", "Regional portal"),
            ("Mexico Hub", "Americas", "regional", "planned", "Regional portal"),
            ("Canada Hub", "Americas", "regional", "planned", "Regional portal"),
            ("Cuba Hub", "Americas", "regional", "planned", "Regional portal"),
            ("Argentina Hub", "Americas", "regional", "planned", "Regional portal"),
            ("Venezuela Hub", "Americas", "regional", "planned", "Regional portal"),
            ("Ukraine Hub", "Europe", "regional", "planned", "Regional portal"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM presence_rooms_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO presence_rooms_v1 (room_name, room_type, current_status, notes) VALUES (?, ?, ?, ?)",
        [
            ("Founder Lobby", "lobby", "active", "Main entry room"),
            ("Streaming Stage", "media", "active", "Live media presence room"),
            ("Commerce Atrium", "commerce", "active", "Featured commerce room"),
            ("Soldier Command Room", "military", "active", "Armed forces room"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM online_presence_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO online_presence_v1 (display_name, room_name, status) VALUES (?, ?, ?)",
        [
            ("Founder", "Founder Lobby", "online"),
            ("Aniyah", "Streaming Stage", "online"),
            ("Alton Kevon", "Commerce Atrium", "online"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM armed_forces_profiles_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO armed_forces_profiles_v1 (profile_name, branch_name, service_status, rank_name, badge_name, notes) VALUES (?, ?, ?, ?, ?, ?)",
        [
            ("American Soldier", "Army", "honored", "Service Member", "Verified Service", "Special support lane for soldiers"),
            ("American Service Member", "Armed Forces", "honored", "Warrior", "American Forces Badge", "Cross-branch honor profile"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM armed_forces_benefits_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO armed_forces_benefits_v1 (benefit_name, benefit_group, status, notes) VALUES (?, ?, ?, ?)",
        [
            ("Priority Recognition", "honor", "live", "Special honor status and visual distinction"),
            ("Service Community Access", "community", "live", "Private support and brotherhood space"),
            ("Career + Opportunity Track", "career", "planned", "Future jobs and training support"),
            ("Special Founder Appreciation", "honor", "live", "Special treatment for service members in the ecosystem"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM holoverse_portals_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO holoverse_portals_v1 (portal_name, destination_world, status, notes) VALUES (?, ?, ?, ?)",
        [
            ("Enter Marketplace", "Marketplace", "live", "Commerce portal"),
            ("Enter Streaming Studio", "Streaming Studio", "live", "Media portal"),
            ("Enter Creator Arena", "Creator Arena", "live", "Creator portal"),
            ("Enter University", "University", "live", "Education portal"),
            ("Enter Armed Forces Command", "Armed Forces Command", "live", "Military honor portal"),
            ("Teleport to Nigeria", "Nigeria Hub", "planned", "Regional portal"),
            ("Teleport to Kenya", "Kenya Hub", "planned", "Regional portal"),
            ("Teleport to Mexico", "Mexico Hub", "planned", "Regional portal"),
            ("Teleport to Canada", "Canada Hub", "planned", "Regional portal"),
            ("Teleport to Ukraine", "Ukraine Hub", "planned", "Regional portal"),
        ],
    )

conn.commit()
conn.close()
print("Avatar / holoverse prep complete:", db)
