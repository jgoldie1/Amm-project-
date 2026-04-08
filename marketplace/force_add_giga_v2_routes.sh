#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

APP="/data/data/com.termux/files/home/marketplace/app.py"
BACKUP_DIR="/data/data/com.termux/files/home/marketplace/backups"
DATA_DIR="/data/data/com.termux/files/home/marketplace/data"
STAMP="$(date +%Y%m%d_%H%M%S)"

mkdir -p "$BACKUP_DIR" "$DATA_DIR"
cp "$APP" "$BACKUP_DIR/app_before_force_v2_${STAMP}.py"

python3 <<'PY'
from pathlib import Path
import json

app_path = Path("/data/data/com.termux/files/home/marketplace/app.py")
data_dir = Path("/data/data/com.termux/files/home/marketplace/data")
data_dir.mkdir(parents=True, exist_ok=True)

seed_files = {
    "district_missions_v2.json": [
        {
            "id": "district_mission_v2_001",
            "district": "South Loop",
            "title": "Clean and feed mission",
            "summary": "Support cleanup, food support, and community uplift.",
            "priority": "high",
            "status": "active",
            "reward_points": 150,
            "lat": 41.8578,
            "lng": -87.6243,
            "pin_type": "mission"
        }
    ],
    "district_map_pins_rich_v2.json": [
        {
            "id": "district_pin_v2_001",
            "name": "Omni Market Hub",
            "district": "South Loop",
            "lat": 41.8582,
            "lng": -87.6235,
            "pin_type": "market",
            "status": "open",
            "badge": "Featured",
            "score": 98
        }
    ],
    "omni_cinema_rows_v2.json": [
        {
            "id": "omni_row_v2_001",
            "title": "Trending Omni Cinema",
            "kind": "tv_row",
            "items": [
                {"id": "show_v2_001", "title": "Kingdom Rising", "category": "series"}
            ]
        }
    ],
    "omni_cinema_episodes_v2.json": [
        {
            "id": "episode_v2_001",
            "show_id": "show_v2_001",
            "show_title": "Kingdom Rising",
            "season": 1,
            "episode": 1,
            "title": "Pilot Mission",
            "summary": "The kingdom platform comes online.",
            "duration_minutes": 28
        }
    ],
    "attached_media_catalog_v2.json": [
        {
            "id": "media_v2_001",
            "entity_type": "feed_card",
            "entity_id": "feed_hero_v2_001",
            "media": [
                {"type": "image", "url": "/static/img/feed-hero.jpg", "label": "Feed hero"}
            ]
        }
    ]
}

for filename, payload in seed_files.items():
    fp = data_dir / filename
    if not fp.exists():
        fp.write_text(json.dumps(payload, indent=2), encoding="utf-8")

src = app_path.read_text(encoding="utf-8")
marker = "# === GIGA_V2_ROUTE_REPAIR_20260318 ==="

if marker not in src:
    block = '''

# === GIGA_V2_ROUTE_REPAIR_20260318 ===
import json as giga_json_repair_20260318
from pathlib import Path as giga_Path_repair_20260318

def giga_data_dir_repair_20260318():
    return giga_Path_repair_20260318("/data/data/com.termux/files/home/marketplace/data")

def giga_read_json_repair_20260318(filename, fallback):
    try:
        fp = giga_data_dir_repair_20260318() / filename
        if not fp.exists():
            return fallback
        return giga_json_repair_20260318.loads(fp.read_text(encoding="utf-8"))
    except Exception:
        return fallback

def giga_priority_sort_repair_20260318(value):
    order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    return order.get(str(value).lower(), 9)

@app.route("/api/v2/district-missions", methods=["GET"])
def giga_api_v2_district_missions_repair_20260318():
    missions = giga_read_json_repair_20260318("district_missions_v2.json", [])
    district = request.args.get("district")
    status = request.args.get("status")
    if district:
        missions = [m for m in missions if str(m.get("district", "")).lower() == district.lower()]
    if status:
        missions = [m for m in missions if str(m.get("status", "")).lower() == status.lower()]
    missions = sorted(missions, key=lambda m: (giga_priority_sort_repair_20260318(m.get("priority")), str(m.get("district", "")), str(m.get("title", ""))))
    return jsonify({"ok": True, "count": len(missions), "missions": missions})

@app.route("/api/v2/district-pins", methods=["GET"])
def giga_api_v2_district_pins_repair_20260318():
    pins = giga_read_json_repair_20260318("district_map_pins_rich_v2.json", [])
    district = request.args.get("district")
    pin_type = request.args.get("pin_type")
    if district:
        pins = [p for p in pins if str(p.get("district", "")).lower() == district.lower()]
    if pin_type:
        pins = [p for p in pins if str(p.get("pin_type", "")).lower() == pin_type.lower()]
    pins = sorted(pins, key=lambda p: (-int(p.get("score", 0)), str(p.get("name", ""))))
    return jsonify({"ok": True, "count": len(pins), "pins": pins})

@app.route("/api/v2/omni-cinema/rows", methods=["GET"])
def giga_api_v2_omni_cinema_rows_repair_20260318():
    rows = giga_read_json_repair_20260318("omni_cinema_rows_v2.json", [])
    row_kind = request.args.get("kind")
    if row_kind:
        rows = [r for r in rows if str(r.get("kind", "")).lower() == row_kind.lower()]
    return jsonify({"ok": True, "count": len(rows), "rows": rows})

@app.route("/api/v2/omni-cinema/episodes", methods=["GET"])
def giga_api_v2_omni_cinema_episodes_repair_20260318():
    episodes = giga_read_json_repair_20260318("omni_cinema_episodes_v2.json", [])
    show_id = request.args.get("show_id")
    if show_id:
        episodes = [e for e in episodes if str(e.get("show_id", "")) == show_id]
    episodes = sorted(episodes, key=lambda e: (str(e.get("show_title", "")), int(e.get("season", 0)), int(e.get("episode", 0))))
    return jsonify({"ok": True, "count": len(episodes), "episodes": episodes})

@app.route("/api/v2/attached-media", methods=["GET"])
def giga_api_v2_attached_media_repair_20260318():
    items = giga_read_json_repair_20260318("attached_media_catalog_v2.json", [])
    entity_type = request.args.get("entity_type")
    entity_id = request.args.get("entity_id")
    if entity_type:
        items = [m for m in items if str(m.get("entity_type", "")).lower() == entity_type.lower()]
    if entity_id:
        items = [m for m in items if str(m.get("entity_id", "")) == entity_id]
    return jsonify({"ok": True, "count": len(items), "items": items})

@app.route("/api/v2/giga-phase1-health", methods=["GET"])
def giga_api_v2_phase1_health_repair_20260318():
    return jsonify({
        "ok": True,
        "district_missions": len(giga_read_json_repair_20260318("district_missions_v2.json", [])),
        "district_pins": len(giga_read_json_repair_20260318("district_map_pins_rich_v2.json", [])),
        "omni_rows": len(giga_read_json_repair_20260318("omni_cinema_rows_v2.json", [])),
        "omni_episodes": len(giga_read_json_repair_20260318("omni_cinema_episodes_v2.json", [])),
        "attached_media": len(giga_read_json_repair_20260318("attached_media_catalog_v2.json", []))
    })
# === END_GIGA_V2_ROUTE_REPAIR_20260318 ===
'''
    app_path.write_text(src.rstrip() + "\n\n" + block + "\n", encoding="utf-8")
    print("Routes appended.")
else:
    print("Routes already present.")
PY

echo
echo "Checking app.py for route marker..."
grep -n 'GIGA_V2_ROUTE_REPAIR_20260318\|/api/v2/giga-phase1-health\|/api/v2/omni-cinema/episodes\|/api/v2/attached-media' "$APP" || true

echo
echo "Restarting..."
./recovery/start_giga_locked.sh

echo
echo "Testing..."
curl -s http://127.0.0.1:8080/api/v2/giga-phase1-health
echo
curl -s http://127.0.0.1:8080/api/v2/omni-cinema/episodes
echo
curl -s http://127.0.0.1:8080/api/v2/attached-media
echo
