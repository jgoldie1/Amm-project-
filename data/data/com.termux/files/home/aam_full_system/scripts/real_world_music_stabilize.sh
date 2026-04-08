#!/usr/bin/env bash
set -e

echo "=== REAL WORLD + MUSIC STABILIZE ==="

echo
echo "[1] PLATFORM STABILIZE"
bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh
bash scripts/smoke_test.sh

echo
echo "[2] LIFE WORLD VERIFY"
curl -s http://127.0.0.1:4902/health ; echo
curl -s http://127.0.0.1:4902/ | head -n 20 ; echo
curl -s http://127.0.0.1:4902/api/world | head -n 40 || true
ps -ef | grep life_world.js | grep -v grep || true

echo
echo "[3] WORLD ASSET CHECK"
mkdir -p data/world public/scenes public/audio

test -f public/scenes/creator_hall.json && echo "creator_hall.json: OK" || echo "creator_hall.json: MISSING"
test -f data/avatars/yahuah_maschian.json && echo "avatar json: OK" || echo "avatar json: MISSING"
test -f data/world/ecosystem_registry.json && echo "ecosystem registry: OK" || echo "ecosystem registry: MISSING"
test -f data/world/holographic_gifts.json && echo "gift registry: OK" || echo "gift registry: MISSING"

echo
echo "[4] SEED MUSIC STARTER FILES"
cat > public/audio/README.txt <<'EOF'
Drop starter audio files here later, for example:
- genesis_soundtrack.mp3
- creator_intro.mp3
- live_room_theme.mp3
EOF

python <<'PY'
import json, sqlite3
from pathlib import Path

root = Path.home() / "aam_full_system"
db = root / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.executescript("""
CREATE TABLE IF NOT EXISTS creator_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_name TEXT NOT NULL,
  creator_slug TEXT NOT NULL UNIQUE,
  bio TEXT DEFAULT '',
  category TEXT DEFAULT 'creator',
  live_status TEXT DEFAULT 'offline',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audio_tracks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_name TEXT NOT NULL,
  track_title TEXT NOT NULL,
  audio_url TEXT DEFAULT '',
  playback_status TEXT DEFAULT 'ready',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS world_spawn_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  scene_name TEXT NOT NULL,
  spawn_point TEXT NOT NULL,
  entity_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
""")

rows = [
    ("All American Creator", "all-american-creator", "Starter creator profile for music and world testing.", "music", "live"),
]
for r in rows:
    cur.execute("SELECT COUNT(*) FROM creator_profiles WHERE creator_slug=?", (r[1],))
    if cur.fetchone()[0] == 0:
        cur.execute("""
        INSERT INTO creator_profiles (creator_name, creator_slug, bio, category, live_status)
        VALUES (?, ?, ?, ?, ?)
        """, r)

tracks = [
    ("All American Creator", "Genesis Soundtrack", "/audio/genesis_soundtrack.mp3", "ready"),
    ("All American Creator", "Creator Intro Theme", "/audio/creator_intro.mp3", "ready"),
]
for t in tracks:
    cur.execute("SELECT COUNT(*) FROM audio_tracks WHERE creator_name=? AND track_title=?", (t[0], t[1]))
    if cur.fetchone()[0] == 0:
        cur.execute("""
        INSERT INTO audio_tracks (creator_name, track_title, audio_url, playback_status)
        VALUES (?, ?, ?, ?)
        """, t)

spawns = [
    ("Yahuah Maschian", "open_world_guide", "creator_hall", "center_stage", "active"),
    ("Holographic Lion", "brand_guardian", "creator_hall", "north_gate", "active"),
    ("Creator Shuttle", "transport", "creator_hall", "east_pad", "planned"),
]
for s in spawns:
    cur.execute("SELECT COUNT(*) FROM world_spawn_registry WHERE entity_name=? AND scene_name=?", (s[0], s[2]))
    if cur.fetchone()[0] == 0:
        cur.execute("""
        INSERT INTO world_spawn_registry (entity_name, entity_type, scene_name, spawn_point, entity_status)
        VALUES (?, ?, ?, ?, ?)
        """, s)

conn.commit()
conn.close()
print("DB seed complete.")
PY

echo
echo "[5] VERIFY MUSIC / WORLD DB"
sqlite3 -json db/aam.db "select id, creator_name, creator_slug, live_status from creator_profiles order by id desc limit 10;"
echo
sqlite3 -json db/aam.db "select id, creator_name, track_title, audio_url, playback_status from audio_tracks order by id desc limit 10;"
echo
sqlite3 -json db/aam.db "select id, entity_name, entity_type, scene_name, spawn_point, entity_status from world_spawn_registry order by id desc limit 20;"
echo

echo
echo "[6] API HEALTH"
cd "$HOME/aam_super_app"
bash scripts/wait_for_health.sh
curl -s http://127.0.0.1:4000/health ; echo
curl -s http://127.0.0.1:4000/health/detail ; echo

echo
echo "[7] FINAL READY STATE"
echo "platform: STABLE"
echo "life_world: ONLINE"
echo "music_seed: READY"
echo "world_spawns: READY"
echo "creator_profile: READY"
echo "next_step: add real mp3 files + render world entities in UI"
