import sqlite3
from pathlib import Path

db = Path("instance/app.db")
db.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS commerce_brands_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand_name TEXT NOT NULL,
    brand_type TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS commerce_products_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    category_name TEXT NOT NULL,
    price_display TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS commerce_collections_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection_name TEXT NOT NULL,
    collection_type TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS featured_drops_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drop_name TEXT NOT NULL,
    drop_type TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS live_stream_shows_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    show_name TEXT NOT NULL,
    host_name TEXT NOT NULL,
    commerce_mode TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS commerce_value_props_v1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT NOT NULL
)
""")

cur.execute("SELECT COUNT(*) FROM commerce_brands_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO commerce_brands_v1 (brand_name, brand_type, owner_name, status, notes) VALUES (?, ?, ?, ?, ?)",
        [
            ("All American Marketplace", "platform", "James Stubbs", "live", "Main commerce and ecosystem platform brand"),
            ("Big Al Records", "music_label", "Alton Kevon Stubbs", "live", "Artist development, releases, and promo commerce"),
            ("Bloom N Flourish", "wellness_brand", "Mya Ofri", "live", "Herbal wellness and educational commerce brand"),
            ("Kevon Shot It Media", "media_brand", "Kevon", "live", "Visual storytelling, creator media, and promo commerce"),
            ("Servants of Christ", "community_brand", "Pastor Kofi Ofri", "live", "Faith/community-aligned presence and leadership"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM commerce_products_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO commerce_products_v1 (product_name, brand_name, category_name, price_display, status, notes) VALUES (?, ?, ?, ?, ?, ?)",
        [
            ("Birthday Launch Bundle", "All American Marketplace", "featured_drop", "$49", "featured", "Soft-launch bundle for early users"),
            ("Aniyah Creator Pack", "Big Al Records", "artist_drop", "$29", "featured", "Artist-themed promo and content bundle"),
            ("Bloom Wellness Starter", "Bloom N Flourish", "wellness", "$35", "featured", "Wellness education and starter brand pack"),
            ("Holo Stream Starter", "All American Marketplace", "streaming", "$99", "featured", "Streaming ecosystem starter offer"),
            ("Kevon Visual Promo Pack", "Kevon Shot It Media", "media_services", "$199", "live", "Promo visual package"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM commerce_collections_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO commerce_collections_v1 (collection_name, collection_type, status, notes) VALUES (?, ?, ?, ?)",
        [
            ("Featured Founder Picks", "founder", "live", "Top founder-curated commerce items"),
            ("Heirs Launch Collection", "heirs", "live", "Private heir-focused launch items"),
            ("Creator Spotlight Collection", "creator", "live", "Featured creators and products"),
            ("Holographic Streaming Collection", "streaming", "live", "Products tied to the streaming ecosystem"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM featured_drops_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO featured_drops_v1 (drop_name, drop_type, status, notes) VALUES (?, ?, ?, ?)",
        [
            ("Summer Soft Launch Drop", "seasonal", "live", "Founder-led early access launch drop"),
            ("Birthday Celebration Drop", "birthday", "live", "Special launch around birthday visibility and sharing"),
            ("Creator Holo Drop", "creator", "planned", "Creator commerce + streaming drop"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM live_stream_shows_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO live_stream_shows_v1 (show_name, host_name, commerce_mode, status, notes) VALUES (?, ?, ?, ?, ?)",
        [
            ("AAME Live Showcase", "Founder", "live_commerce", "live", "Premium founder-led commerce showcase"),
            ("Heirs Spotlight Live", "Heirs Team", "live_commerce", "planned", "Heirs-first showcase stream"),
            ("Bloom N Flourish Wellness Live", "Mya Ofri", "live_education", "planned", "Wellness education + commerce"),
            ("Big Al Records Drop Live", "Big Al Records", "music_drop", "planned", "Artist, promo, and drop showcase"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM commerce_value_props_v1")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO commerce_value_props_v1 (title, status, notes) VALUES (?, ?, ?)",
        [
            ("Live-selling + streaming + creator ecosystem in one platform", "live", "Differentiates from standard storefronts"),
            ("Founder-curated commerce with heirs-only launch control", "live", "Creates exclusivity and identity"),
            ("Holographic streaming ecosystem positioning", "live", "Gives the platform a unique entertainment-commerce layer"),
            ("Private network first, public scale later", "live", "Lets you grow carefully and build demand"),
        ],
    )

conn.commit()
conn.close()
print("Holo commerce premium prep complete:", db)
