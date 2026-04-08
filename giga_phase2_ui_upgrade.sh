#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

cd ~/marketplace

APP="$HOME/marketplace/app.py"
BACKUP="$HOME/marketplace/backups/app_phase2_upgrade_$(date +%Y%m%d_%H%M%S).py"

cp "$APP" "$BACKUP"
echo "Backup saved: $BACKUP"

python3 <<'PY'
from pathlib import Path

app_path = Path.home() / "marketplace" / "app.py"
src = app_path.read_text(encoding="utf-8")

start_marker = "# === GIGA_PHASE2_UI_SIMPLE ==="
end_marker = "# === END_GIGA_PHASE2_UI_SIMPLE ==="

if start_marker not in src or end_marker not in src:
    print("Could not find existing Phase 2 block to upgrade.")
    raise SystemExit(1)

start = src.index(start_marker)
end = src.index(end_marker) + len(end_marker)

new_block = r'''
# === GIGA_PHASE2_UI_SIMPLE ===

def giga_phase2_ui_read_json_upgrade_20260318(filename, fallback):
    try:
        import json
        from pathlib import Path
        fp = Path.home() / "marketplace" / "data" / filename
        if not fp.exists():
            return fallback
        return json.loads(fp.read_text(encoding="utf-8"))
    except Exception:
        return fallback

def giga_phase2_ui_media_strip_upgrade_20260318(items):
    html = []
    for item in items[:4]:
        label = item.get("label", "media")
        media_type = item.get("type", "media")
        url = item.get("url", "#")
        html.append(
            f"<div class='giga-media-chip'>"
            f"<span class='giga-media-type'>{media_type}</span>"
            f"<a href='{url}' target='_blank'>{label}</a>"
            f"</div>"
        )
    return "".join(html) if html else "<div class='giga-muted'>No media attached yet</div>"

def giga_phase2_ui_shell_upgrade_20260318(title, subtitle, body):
    return f"""
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>{title}</title>
      <style>
        body {{
          font-family: Arial, sans-serif;
          background: linear-gradient(180deg,#020617 0%,#0f172a 100%);
          color: white;
          padding: 20px;
        }}
        a, button {{
          display:inline-block;
          margin:6px 8px 6px 0;
          padding:10px 14px;
          background:#2563eb;
          color:white;
          text-decoration:none;
          border:none;
          border-radius:10px;
        }}
        .giga-hero {{
          background: linear-gradient(135deg,#111827,#1e3a8a,#4c1d95);
          border-radius: 18px;
          padding: 22px;
          margin-bottom: 18px;
          box-shadow: 0 14px 34px rgba(0,0,0,.28);
        }}
        .giga-sub {{
          color:#cbd5e1;
          margin-top: 8px;
        }}
        .giga-grid {{
          display:grid;
          grid-template-columns: repeat(auto-fit,minmax(280px,1fr));
          gap:14px;
        }}
        .giga-card {{
          background:#1e293b;
          padding:16px;
          border-radius:14px;
          margin:14px 0;
          box-shadow: 0 10px 25px rgba(0,0,0,.25);
          border:1px solid #334155;
        }}
        .giga-badge {{
          display:inline-block;
          padding:6px 10px;
          border-radius:999px;
          background:#7c3aed;
          font-size:12px;
          margin-bottom:8px;
        }}
        .giga-priority-high {{ background:#dc2626; }}
        .giga-priority-medium {{ background:#d97706; }}
        .giga-priority-low {{ background:#16a34a; }}
        .giga-stat {{
          color:#93c5fd;
          font-size:13px;
          margin:6px 0;
        }}
        .giga-shelf-grid {{
          display:grid;
          grid-template-columns: repeat(auto-fit,minmax(180px,1fr));
          gap:10px;
          margin-top:10px;
        }}
        .giga-shelf-item {{
          background:#0f172a;
          border:1px solid #334155;
          border-radius:12px;
          padding:12px;
        }}
        .giga-shelf-title {{
          font-weight:bold;
          margin-bottom:6px;
        }}
        .giga-shelf-meta {{
          color:#93c5fd;
          font-size:13px;
        }}
        .giga-media-strip {{
          display:flex;
          flex-wrap:wrap;
          gap:8px;
          margin-top:10px;
        }}
        .giga-media-chip {{
          background:#0f172a;
          border:1px solid #334155;
          border-radius:999px;
          padding:8px 10px;
          font-size:12px;
        }}
        .giga-media-chip a {{
          background:none;
          padding:0;
          margin:0 0 0 6px;
        }}
        .giga-media-type {{
          color:#93c5fd;
          text-transform:uppercase;
          font-size:11px;
        }}
        .giga-muted {{ color:#94a3b8; }}
      </style>
    </head>
    <body>
      <div class='giga-hero'>
        <h1>{title}</h1>
        <div class='giga-sub'>{subtitle}</div>
        <div style='margin-top:12px;'>
          <a href='/platform-home'>Platform Home</a>
          <a href='/world-map-v4'>World Map V4</a>
          <a href='/omni-cinema-v4'>Omni Cinema V4</a>
          <a href='/dynamic-feed-v3'>Dynamic Feed V3</a>
          <a href='/api/v2/giga-phase1-health'>Phase 1 Health</a>
        </div>
      </div>
      {body}
    </body>
    </html>
    """

def giga_phase2_ui_build_mission_cards_upgrade_20260318():
    missions = giga_phase2_ui_read_json_upgrade_20260318("district_missions_v2.json", [])
    cards = []
    for m in missions:
        priority = str(m.get("priority","medium")).lower()
        cards.append(
            f"<div class='giga-card'>"
            f"<div class='giga-badge giga-priority-{priority}'>{priority}</div>"
            f"<h3>{m.get('title','Untitled Mission')}</h3>"
            f"<div class='giga-stat'>District: {m.get('district','Unknown')}</div>"
            f"<div class='giga-stat'>Reward: {m.get('reward_points',0)} points</div>"
            f"<div class='giga-stat'>Status: {m.get('status','unknown')}</div>"
            f"<p>{m.get('summary','')}</p>"
            f"</div>"
        )
    return "".join(cards) if cards else "<div class='giga-card'>No district missions loaded</div>"

def giga_phase2_ui_build_pin_cards_upgrade_20260318():
    pins = giga_phase2_ui_read_json_upgrade_20260318("district_map_pins_rich_v2.json", [])
    cards = []
    for p in pins:
        media_html = giga_phase2_ui_media_strip_upgrade_20260318(p.get("attached_media", []))
        cards.append(
            f"<div class='giga-card'>"
            f"<div class='giga-badge'>{p.get('badge','Pin')}</div>"
            f"<h3>{p.get('name','Unnamed Pin')}</h3>"
            f"<div class='giga-stat'>District: {p.get('district','Unknown')}</div>"
            f"<div class='giga-stat'>Type: {p.get('pin_type','unknown')}</div>"
            f"<div class='giga-stat'>Status: {p.get('status','unknown')}</div>"
            f"<div class='giga-stat'>Score: {p.get('score',0)}</div>"
            f"<div class='giga-stat'>Coords: {p.get('lat','?')}, {p.get('lng','?')}</div>"
            f"<div class='giga-media-strip'>{media_html}</div>"
            f"</div>"
        )
    return "".join(cards) if cards else "<div class='giga-card'>No rich pins loaded</div>"

def giga_phase2_ui_build_rows_upgrade_20260318():
    rows = giga_phase2_ui_read_json_upgrade_20260318("omni_cinema_rows_v2.json", [])
    row_html = []
    for row in rows:
        item_html = []
        for item in row.get("items", [])[:8]:
            label = item.get("title") or item.get("episode_title") or item.get("id","Item")
            meta = item.get("category", row.get("kind","media"))
            item_html.append(
                f"<div class='giga-shelf-item'>"
                f"<div class='giga-shelf-title'>{label}</div>"
                f"<div class='giga-shelf-meta'>{meta}</div>"
                f"</div>"
            )
        row_html.append(
            f"<div class='giga-card'>"
            f"<h3>{row.get('title','Untitled Row')}</h3>"
            f"<div class='giga-shelf-grid'>{''.join(item_html)}</div>"
            f"</div>"
        )
    return "".join(row_html) if row_html else "<div class='giga-card'>No cinema rows loaded</div>"

def giga_phase2_ui_build_episode_cards_upgrade_20260318():
    episodes = giga_phase2_ui_read_json_upgrade_20260318("omni_cinema_episodes_v2.json", [])
    cards = []
    for ep in episodes:
        media_html = giga_phase2_ui_media_strip_upgrade_20260318(ep.get("attached_media", []))
        cards.append(
            f"<div class='giga-card'>"
            f"<h3>{ep.get('show_title','Show')} — S{ep.get('season',0)}E{ep.get('episode',0)}</h3>"
            f"<div class='giga-stat'>Episode: {ep.get('title','Untitled')}</div>"
            f"<div class='giga-stat'>Duration: {ep.get('duration_minutes',0)} min</div>"
            f"<p>{ep.get('summary','')}</p>"
            f"<div class='giga-media-strip'>{media_html}</div>"
            f"</div>"
        )
    return "".join(cards) if cards else "<div class='giga-card'>No episodes loaded</div>"

def giga_phase2_ui_build_attached_media_upgrade_20260318():
    items = giga_phase2_ui_read_json_upgrade_20260318("attached_media_catalog_v2.json", [])
    cards = []
    for item in items:
        media_html = giga_phase2_ui_media_strip_upgrade_20260318(item.get("media", []))
        cards.append(
            f"<div class='giga-card'>"
            f"<h3>{item.get('entity_type','entity')} — {item.get('entity_id','unknown')}</h3>"
            f"<div class='giga-media-strip'>{media_html}</div>"
            f"</div>"
        )
    return "".join(cards) if cards else "<div class='giga-card'>No attached media loaded</div>"

@app.route("/world-map-v5")
def world_map_v5_simple():
    body = (
        "<div class='giga-grid'>"
        f"{giga_phase2_ui_build_mission_cards_upgrade_20260318()}"
        f"{giga_phase2_ui_build_pin_cards_upgrade_20260318()}"
        "</div>"
    )
    return giga_phase2_ui_shell_upgrade_20260318(
        "World Map V5",
        "District missions, richer place pins, and stronger world discovery.",
        body
    )

@app.route("/omni-cinema-v5")
def omni_v5_simple():
    body = (
        f"{giga_phase2_ui_build_rows_upgrade_20260318()}"
        "<div class='giga-grid'>"
        f"{giga_phase2_ui_build_episode_cards_upgrade_20260318()}"
        "</div>"
    )
    return giga_phase2_ui_shell_upgrade_20260318(
        "Omni Cinema V5",
        "Deeper shelves, stronger episode surfacing, and cinematic lobby energy.",
        body
    )

@app.route("/dynamic-feed-v4")
def feed_v4_simple():
    body = (
        "<div class='giga-grid'>"
        f"{giga_phase2_ui_build_attached_media_upgrade_20260318()}"
        f"{giga_phase2_ui_build_mission_cards_upgrade_20260318()}"
        "</div>"
    )
    return giga_phase2_ui_shell_upgrade_20260318(
        "Dynamic Feed V4",
        "Attached media across feed, storefront, and channel-style cards.",
        body
    )

# === END_GIGA_PHASE2_UI_SIMPLE ===
'''

new_src = src[:start] + new_block + src[end:]
app_path.write_text(new_src, encoding="utf-8")
print("Phase 2 block upgraded.")
PY

./recovery/start_giga_locked.sh

echo
echo "Testing upgraded pages..."
curl -s http://127.0.0.1:8080/world-map-v5 | head -30
echo
curl -s http://127.0.0.1:8080/omni-cinema-v5 | head -30
echo
curl -s http://127.0.0.1:8080/dynamic-feed-v4 | head -30
echo
