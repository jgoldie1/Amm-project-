import sqlite3
from pathlib import Path

db = Path("instance/app.db")
db.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS bug_reports_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_area TEXT NOT NULL,
    report_type TEXT NOT NULL,
    reporter_name TEXT NOT NULL,
    title TEXT NOT NULL,
    details TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS streaming_clip_reviews_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clip_title TEXT NOT NULL,
    clip_type TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    review_stage TEXT NOT NULL,
    notes TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS profiles_showcase_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_name TEXT NOT NULL,
    profile_role TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS global_share_targets_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform_name TEXT NOT NULL,
    region_name TEXT NOT NULL,
    target_status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS translation_routes_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    route_status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS integration_hubs_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hub_name TEXT NOT NULL,
    hub_type TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS growth_prompts_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt_name TEXT NOT NULL,
    prompt_group TEXT NOT NULL,
    status TEXT NOT NULL,
    prompt_text TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS global_expansion_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    region_name TEXT NOT NULL,
    launch_stage TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("SELECT COUNT(*) FROM bug_reports_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO bug_reports_v1 (app_area, report_type, reporter_name, title, details, status) VALUES (?, ?, ?, ?, ?, ?)",
        [
            ("Streaming App", "bug", "System", "Sample stream issue", "Playback issue example for testing", "open"),
            ("Recording Studio", "problem", "System", "Sample recording issue", "Clip sync issue example for testing", "open"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM streaming_clip_reviews_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO streaming_clip_reviews_v1 (clip_title, clip_type, owner_name, review_stage, notes, status) VALUES (?, ?, ?, ?, ?, ?)",
        [
            ("Birthday Countdown Clip", "promo", "Aniyah", "submitted", "Clip leading up to valuation/review campaign", "queued"),
            ("Streaming Launch Teaser", "trailer", "AAME Media", "review", "Review before publish", "queued"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM profiles_showcase_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO profiles_showcase_v1 (profile_name, profile_role, brand_name, status, notes) VALUES (?, ?, ?, ?, ?)",
        [
            ("Pastor Kofi Ofri", "Pastor / Community Leader", "Servants of Christ", "live", "Faith leadership, guidance, community support, and ministry visibility inside the ecosystem."),
            ("Mya Ofri", "Chemistry + Herbal Wellness Entrepreneur", "Bloom N Flourish", "live", "Bloom N Flourish business profile for natural wellness, herbist work, and educational brand growth."),
        ],
    )

cur.execute("SELECT COUNT(*) FROM global_share_targets_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO global_share_targets_v1 (platform_name, region_name, target_status, notes) VALUES (?, ?, ?, ?)",
        [
            ("Discord", "Global", "planned", "Community and invite expansion"),
            ("YouTube", "Global", "planned", "Clip and promo distribution"),
            ("Instagram", "Global", "planned", "Short-form brand promotion"),
            ("TikTok", "Global", "planned", "Youth growth and discovery"),
            ("X", "Global", "planned", "Announcements and reach"),
            ("WeChat", "China", "planned", "China social reach planning"),
            ("LINE", "Japan", "planned", "Japan share planning"),
            ("WhatsApp", "Africa", "planned", "Community sharing and outreach"),
            ("Facebook", "Australia", "planned", "General audience promotion"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM translation_routes_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO translation_routes_v1 (source_language, target_language, route_status, notes) VALUES (?, ?, ?, ?)",
        [
            ("English", "Chinese", "planned", "Platform copy and share translation"),
            ("English", "Japanese", "planned", "Platform copy and share translation"),
            ("English", "French", "planned", "Africa and global reach support"),
            ("English", "Spanish", "planned", "Global reach support"),
            ("English", "Arabic", "planned", "Global reach support"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM integration_hubs_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO integration_hubs_v1 (hub_name, hub_type, status, notes) VALUES (?, ?, ?, ?)",
        [
            ("Quantum Discord", "community", "planned", "Discord community growth, brand announcements, and moderation workflow hub."),
            ("Zapier Growth Bridge", "automation", "planned", "Cross-platform automation shell for forms, announcements, and growth workflows."),
            ("HoloGPT Prompt Center", "ai", "planned", "Brand growth, support prompts, moderation prompts, and search prompts."),
        ],
    )

cur.execute("SELECT COUNT(*) FROM growth_prompts_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO growth_prompts_v1 (prompt_name, prompt_group, status, prompt_text) VALUES (?, ?, ?, ?)",
        [
            ("Discord Growth Prompt", "community", "live", "Welcome new members, explain the brand, and guide them to the best app features."),
            ("Bug Triage Prompt", "support", "live", "Review incoming bug reports, classify severity, and recommend next action."),
            ("Search Engine Brand Prompt", "search", "live", "Explain why the AAME ecosystem is powerful, private, and creator-first."),
            ("Global Share Prompt", "growth", "live", "Generate region-friendly social copy for launches, creator clips, and platform announcements."),
        ],
    )

cur.execute("SELECT COUNT(*) FROM global_expansion_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO global_expansion_v1 (region_name, launch_stage, status, notes) VALUES (?, ?, ?, ?)",
        [
            ("United States", "soft_launch", "active", "Private heirs-only app and beta sharing"),
            ("China", "planning", "planned", "Translation, sharing, and platform research"),
            ("Japan", "planning", "planned", "Translation and region fit"),
            ("Australia", "planning", "planned", "English-first regional launch prep"),
            ("Africa", "planning", "planned", "WhatsApp/community-led growth prep"),
        ],
    )

conn.commit()
conn.close()
print("Growth / brand / global prep ready:", db)
