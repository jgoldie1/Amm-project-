import sqlite3
from pathlib import Path

db_path = Path("instance/app.db")
db_path.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS module_registry_live (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_name TEXT NOT NULL,
    route TEXT NOT NULL,
    status TEXT NOT NULL,
    category TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS media_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_title TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    status TEXT NOT NULL
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS ai_workflows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workflow_name TEXT NOT NULL,
    workflow_type TEXT NOT NULL,
    module_name TEXT NOT NULL,
    status TEXT NOT NULL
)
""")

cur.execute("SELECT COUNT(*) FROM module_registry_live")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO module_registry_live (module_name, route, status, category) VALUES (?, ?, ?, ?)",
        [
            ("Marketplace", "/", "live", "commerce"),
            ("Kingdom", "/kingdom", "live", "governance"),
            ("University", "/all-american-marketplace-university", "live", "education"),
            ("Wallet", "/all-american-marketplace-wallet", "live", "finance"),
            ("Holographic Streaming", "/holo-stream", "live", "media"),
            ("Music App", "/music-app", "live", "media"),
            ("Vocal Coach Studio Recorder", "/vocal-coach-studio-recorder", "live", "media"),
            ("Aniyah Cross-Border Payment", "/aniyah-cross-border-payment", "live", "finance"),
            ("AI Command Center", "/ai-command-center", "live", "ai"),
            ("Memory Fabric", "/memory-fabric", "live", "ai"),
            ("Blockchain Core", "/blockchain-core", "live", "blockchain"),
            ("Verse Map", "/verse-map", "live", "immersive"),
            ("Quantum Cloud", "/quantum-cloud", "live", "infrastructure"),
            ("Flagship AI Suite", "/flagship-ai-suite", "live", "ai"),
            ("Control Tower", "/control-tower", "live", "operations"),
            ("Search Hub", "/search-hub", "new", "search"),
            ("Media Studio", "/media-studio", "new", "media"),
            ("Upload Vault", "/upload-vault", "new", "media"),
            ("Workflow Lab", "/workflow-lab", "new", "ai"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM media_assets")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO media_assets (asset_title, asset_type, owner_name, status) VALUES (?, ?, ?, ?)",
        [
            ("Founder Vision Cover Art", "image", "AAME Creative", "ready"),
            ("Quantum Beats Promo", "audio", "El Saturn Sounds", "draft"),
            ("Vocal Lesson Session 01", "voice", "Aniyah", "archived"),
            ("Marketplace Launch Trailer", "video", "AAME Media", "ready"),
            ("Holographic Scene Mockup", "holo-art", "Holo Lab", "concept"),
        ],
    )

cur.execute("SELECT COUNT(*) FROM ai_workflows")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "INSERT INTO ai_workflows (workflow_name, workflow_type, module_name, status) VALUES (?, ?, ?, ?)",
        [
            ("Marketplace Route Guidance", "assistant", "marketplace", "active"),
            ("University Enrollment Guidance", "assistant", "university", "active"),
            ("Wallet Status Review", "analysis", "wallet", "active"),
            ("Cross-Border Payment Review", "compliance", "cross-border", "planned"),
            ("Music Release Support", "creator", "music", "active"),
            ("Streaming Channel Review", "operations", "streaming", "active"),
            ("Vocal Practice Progress Review", "coach", "vocal", "planned"),
            ("Gap Fix Prioritizer", "governance", "gap-fix", "active"),
        ],
    )

conn.commit()
conn.close()
print("Seeded final core data in", db_path)
