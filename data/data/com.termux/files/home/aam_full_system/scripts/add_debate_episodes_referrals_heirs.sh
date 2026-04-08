#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== ADD DEBATE + EPISODES + REFERRALS + HEIRS ==="

echo
echo "[1] CREATE DATA FOLDERS"
mkdir -p data/content data/referrals data/heirs db

echo
echo "[2] WRITE DEBATE SEED"
cat > data/content/debates.json <<'EOF'
{
  "debates": [
    {
      "topic": "Faith vs Culture",
      "type": "live_debate",
      "participants": ["creator1", "creator2"],
      "status": "live"
    },
    {
      "topic": "Truth and Media",
      "type": "panel_discussion",
      "participants": ["host", "guest1", "guest2"],
      "status": "planned"
    }
  ]
}
EOF

echo
echo "[3] WRITE EPISODE SEED"
cat > data/content/episodes.json <<'EOF'
{
  "episodes": [
    {
      "episode_title": "Arrival in Bethlehem",
      "scene": "bethlehem",
      "audio": "/audio/genesis_soundtrack.mp3",
      "entities": ["Yahuah Maschian", "Villagers"],
      "type": "ai_generated_episode",
      "status": "ready"
    },
    {
      "episode_title": "Witness in Nazareth",
      "scene": "nazareth",
      "audio": "/audio/creator_intro.mp3",
      "entities": ["Yahuah Maschian", "Witnesses"],
      "type": "ai_generated_episode",
      "status": "planned"
    }
  ]
}
EOF

echo
echo "[4] CREATE REFERRAL + HEIR DB"
python <<'PY'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam_growth.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.executescript("""
CREATE TABLE IF NOT EXISTS referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_slug TEXT NOT NULL,
  new_user_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS heir_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  assets_owned_json TEXT NOT NULL,
  referrals_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
""")

cur.execute("SELECT COUNT(*) FROM referrals")
if cur.fetchone()[0] == 0:
    cur.execute(
        "INSERT INTO referrals (referrer_slug, new_user_id) VALUES (?, ?)",
        ("all_american_creator", "beta_user_001")
    )

cur.execute("SELECT COUNT(*) FROM heir_registry WHERE username = ?", ("all_american_creator",))
if cur.fetchone()[0] == 0:
    cur.execute(
        "INSERT INTO heir_registry (username, role, assets_owned_json, referrals_count) VALUES (?, ?, ?, ?)",
        ("all_american_creator", "founding_heir", '["lion_crown","creator_pod"]', 1)
    )

conn.commit()
conn.close()
print("DB ready:", db)
PY

echo
echo "[5] WRITE REFERRAL LINK EXAMPLE"
cat > data/referrals/referral_examples.txt <<'EOF'
Example referral links:
https://aam.app/join?ref=all_american_creator
https://aam.app/join?ref=creator1
https://aam.app/join?ref=founding_heir
EOF

echo
echo "[6] VERIFY JSON"
python -m json.tool data/content/debates.json >/dev/null && echo "debates.json: OK"
python -m json.tool data/content/episodes.json >/dev/null && echo "episodes.json: OK"

echo
echo "[7] VERIFY DB"
python <<'PY'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam_growth.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

print("referrals:")
for row in cur.execute("SELECT id, referrer_slug, new_user_id, created_at FROM referrals ORDER BY id DESC LIMIT 10"):
    print(row)

print("\nheir_registry:")
for row in cur.execute("SELECT id, username, role, assets_owned_json, referrals_count, created_at FROM heir_registry ORDER BY id DESC LIMIT 10"):
    print(row)

conn.close()
PY

echo
echo "[8] SMOKE + STABILIZE"
bash scripts/check_js.sh
bash scripts/status.sh
bash scripts/smoke_test.sh

echo
echo "=== DONE ==="
echo "debate_system: SEEDED"
echo "episode_system: SEEDED"
echo "referral_tracking_db: READY"
echo "heir_registry: READY"
echo "platform: STABLE"
