import sqlite3
from pathlib import Path

db = Path("instance/app.db")
db.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS invite_tracking_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invite_code TEXT NOT NULL,
    invited_by TEXT NOT NULL,
    invited_name TEXT NOT NULL,
    invited_email TEXT NOT NULL,
    school_group TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS join_tracking_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    joined_from TEXT NOT NULL,
    school_group TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS activity_feed_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_name TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    object_name TEXT NOT NULL,
    audience TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS notifications_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    audience TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS moderation_queue_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type TEXT NOT NULL,
    item_title TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    review_status TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS profile_cards_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_name TEXT NOT NULL,
    role_name TEXT NOT NULL,
    school_group TEXT NOT NULL,
    bio TEXT NOT NULL,
    status TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS launch_readiness_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL,
    item_group TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("SELECT COUNT(*) FROM invite_tracking_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO invite_tracking_v1 (invite_code, invited_by, invited_name, invited_email, school_group, status) VALUES (?, ?, ?, ?, ?, ?)",
        [
            ("HEIR-FAMILY-001", "James Stubbs", "Aniyah Friend 1", "friend1@beta.local", "elementary", "pending"),
            ("HEIR-FAMILY-001", "James Stubbs", "Sasha Friend 1", "friend2@beta.local", "high_school", "pending"),
            ("HEIR-FAMILY-001", "James Stubbs", "Felix Friend 1", "friend3@beta.local", "senior", "pending"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM join_tracking_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO join_tracking_v1 (user_name, user_email, joined_from, school_group, status) VALUES (?, ?, ?, ?, ?)",
        [
            ("Alton Kevon Stubbs", "alton@heirs.local", "heirs-app", "heirs", "active"),
            ("Aniyah Stubbs", "aniyah@heirs.local", "heirs-app", "elementary", "active"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM activity_feed_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO activity_feed_v1 (actor_name, activity_type, object_name, audience, status) VALUES (?, ?, ?, ?, ?)",
        [
            ("Aniyah Stubbs", "joined", "Heirs App", "heirs", "live"),
            ("AAME Admin", "created", "Soft Launch", "heirs", "live"),
            ("System", "opened", "Heirs Launchpad", "heirs", "live"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM notifications_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO notifications_v1 (title, body, audience, status) VALUES (?, ?, ?, ?)",
        [
            ("Soft Launch Live", "The heirs-only app is now available for approved users.", "heirs", "live"),
            ("Report Issues", "Use the Report Center to report bugs and streaming issues.", "heirs", "live"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM moderation_queue_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO moderation_queue_v1 (item_type, item_title, owner_name, review_status, notes) VALUES (?, ?, ?, ?, ?)",
        [
            ("bug_report", "Sample stream issue", "System", "open", "Needs review"),
            ("clip_review", "Birthday Countdown Clip", "Aniyah", "queued", "Needs review"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM profile_cards_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO profile_cards_v1 (profile_name, role_name, school_group, bio, status) VALUES (?, ?, ?, ?, ?)",
        [
            ("Alton Kevon Stubbs", "Heir", "heirs", "Leadership, security, compliance, and family ecosystem access.", "live"),
            ("Aniyah Stubbs", "Heir", "elementary", "Creator, birthday launch user, and future artist growth lane.", "live"),
            ("Pastor Kofi Ofri", "Pastor / Community Leader", "community", "Servants of Christ community leadership profile.", "live"),
            ("Mya Ofri", "Chemistry + Herbal Wellness Entrepreneur", "community", "Bloom N Flourish wellness and brand profile.", "live"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM launch_readiness_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO launch_readiness_v1 (item_name, item_group, status, notes) VALUES (?, ?, ?, ?)",
        [
            ("Login flow", "core", "live", "session-login-v4 ready"),
            ("Uploads", "core", "live", "files-center-v4 ready"),
            ("Bookings", "core", "live", "bookings-center-v4 ready"),
            ("Browsing", "core", "live", "creator-market ready"),
            ("Reports", "beta", "live", "report-center ready"),
            ("Clip reviews", "beta", "live", "streaming-review-center ready"),
            ("Invite tracking", "launch", "live", "launch ops ready"),
            ("Activity feed", "launch", "live", "launch ops ready"),
        ],
    )

conn.commit()
conn.close()
print("Launch ops prep complete:", db)
