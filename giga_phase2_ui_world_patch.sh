#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

cd ~/marketplace

APP="$HOME/marketplace/app.py"
BACKUP_DIR="$HOME/marketplace/backups"
STAMP="$(date +%Y%m%d_%H%M%S)"

mkdir -p "$BACKUP_DIR"
cp "$APP" "$BACKUP_DIR/app_pre_phase2_ui_${STAMP}.py"
echo "Backup saved: $BACKUP_DIR/app_pre_phase2_ui_${STAMP}.py"

python3 <<'PY'
from pathlib import Path

app_path = Path.home() / "marketplace" / "app.py"
src = app_path.read_text(encoding="utf-8")

marker = "# === GIGA_PHASE2_UI_WORLD_PATCH_20260318 ==="
if marker in src:
    print("Phase 2 UI patch already present.")
    raise SystemExit(0)

block = r'''

# === GIGA_PHASE2_UI_WORLD_PATCH_20260318 ===
def giga_phase2_read_json_ui_20260318(filename, fallback):
    try:
        from pathlib import Path
        import json
        fp = Path.home() / "marketplace" / "data" / filename
        if not fp.exists():
            return fallback
        return json.loads(fp.read_text(encoding="utf-8"))
    except Exception:
        return fallback

def giga_phase2_render_media_strip_20260318(items):
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
    return "".join(html) if html else "<div class='giga-muted'>No attached media yet</div>"

def giga_phase2_build_mission_cards_20260318():
    missions = giga_phase2_read_json_ui_20260318("district_missions_v2.json", [])
    cards = []
    for m in missions:
        cards.append(
            f"<div class='giga-card giga-mission-card'>"
            f"<div class='giga-badge giga-priority-{str(m.get('priority','medium')).lower()}'>{m.get('priority','medium')}</div>"
            f"<h3>{m.get('title','Untitled Mission')}</h3>"
            f"<p><strong>District:</strong> {m.get('district','Unknown')}</p>"
            f"<p>{m.get('summary','')}</p>"
            f"<p><strong>Reward:</strong> {m.get('reward_points',0)} pts</p>"
            f"<p><strong>Status:</strong> {m.get('status','unknown')}</p>"
            f"</div>"
        )
    return "".join(cards) if cards else "<div class='giga-card'>No missions loaded</div>"

def giga_phase2_build_pin_cards_20260318():
    pins = giga_phase2_read_json_ui_20260318("district_map_pins_rich_v2.json", [])
    cards = []
    for p in pins:
        media_html = giga_phase2_render_media_strip_20260318(p.get("attached_media", []))
        cards.append(
            f"<div class='giga-card giga-pin-card'>"
            f"<div class='giga-badge'>{p.get('badge','Pin')}</div>"
            f"<h3>{p.get('name','Unnamed Pin')}</h3>"
            f"<p><strong>District:</strong> {p.get('district','Unknown')}</p>"
            f"<p><strong>Type:</strong> {p.get('pin_type','unknown')}</p>"
            f"<p><strong>Status:</strong> {p.get('status','unknown')}</p>"
            f"<p><strong>Score:</strong> {p.get('score',0)}</p>"
            f"<p><strong>Coords:</strong> {p.get('lat','?')}, {p.get('lng','?')}</p>"
            f"<div class='giga-media-strip'>{media_html}</div>"
            f"</div>"
        )
    return "".join(cards) if cards else "<div class='giga-card'>No map pins loaded</div>"

def giga_phase2_build_omni_rows_20260318():
    rows = giga_phase2_read_json_ui_20260318("omni_cinema_rows_v2.json", [])
    html_rows = []
    for row in rows:
        items_html = []
        for item in row.get("items", [])[:8]:
            items_html.append(
                f"<div class='giga-shelf-item'>"
                f"<div class='giga-shelf-title'>{item.get('title') or item.get('episode_title') or item.get('id','Item')}</div>"
                f"<div class='giga-shelf-meta'>{item.get('category', row.get('kind','media'))}</div>"
                f"</div>"
            )
        html_rows.append(
            f"<div class='giga-card giga-row-card'>"
            f"<h3>{row.get('title','Untitled Row')}</h3>"
            f"<div class='giga-shelf-grid'>{''.join(items_html)}</div>"
            f"</div>"
        )
    return "".join(html_rows) if html_rows else "<div class='giga-card'>No cinema rows loaded</div>"

def giga_phase2_build_episode_cards_20260318():
    episodes = giga_phase2_read_json_ui_20260318("omni_cinema_episodes_v2.json", [])
    cards = []
    for ep in episodes:
        media_html = giga_phase2_render_media_strip_20260318(ep.get("attached_media", []))
        cards.append(
            f"<div class='giga-card giga-episode-card'>"
            f"<h3>{ep.get('show_title','Show')} — S{ep.get('season',0)}E{ep.get('episode',0)}</h3>"
            f"<p><strong>Episode:</strong> {ep.get('title','Untitled')}</p>"
            f"<p>{ep.get('summary','')}</p>"
            f"<p><strong>Duration:</strong> {ep.get('duration_minutes',0)} min</p>"
            f"<div class='giga-media-strip'>{media_html}</div>"
            f"</div>"
        )
    return "".join(cards) if cards else "<div class='giga-card'>No episodes loaded</div>"

def giga_phase2_build_attached_media_cards_20260318():
    items = giga_phase2_read_json_ui_20260318("attached_media_catalog_v2.json", [])
    cards = []
    for item in items:
        media_html = giga_phase2_render_media_strip_20260318(item.get("media", []))
        cards.append(
            f"<div class='giga-card giga-media-card'>"
            f"<h3>{item.get('entity_type','entity')} — {item.get('entity_id','unknown')}</h3>"
            f"<div class='giga-media-strip'>{media_html}</div>"
            f"</div>"
        )
    return "".join(cards) if cards else "<div class='giga-card'>No attached media loaded</div>"

def giga_phase2_shell_20260318(title, body_html):
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
        .giga-shelf-title {{ font-weight:bold; margin-bottom:6px; }}
        .giga-shelf-meta {{ color:#93c5fd; font-size:13px; }}
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
        .giga-media-chip a {{ background:none; padding:0; margin:0 0 0 6px; }}
        .giga-media-type {{
          color:#93c5fd;
          text-transform:uppercase;
          font-size:11px;
        }}
        .giga-muted {{ color:#94a3b8; }}
      </style>
    </head>
    <body>
      <h1>{title}</h1>
      <a href="/platform-home">Platform Home</a>
      <a href="/world-map-v4">World Map V4</a>
      <a href="/omni-cinema-v4">Omni Cinema V4</a>
      <a href="/dynamic-feed-v3">Dynamic Feed V3</a>
      {body_html}
    </body>
    </html>
    """

@app.route("/world-map-v5", methods=["GET"])
def giga_world_map_v5_20260318():
    body = f"""
    <div class='giga-grid'>
      <div>{giga_phase2_build_mission_cards_20260318()}</div>
      <div>{giga_phase2_build_pin_cards_20260318()}</div>
    </div>
    """
    return giga_phase2_shell_20260318("World Map V5 — District Missions + Rich Pins", body)

@app.route("/omni-cinema-v5", methods=["GET"])
def giga_omni_cinema_v5_20260318():
    body = f"""
    <div>{giga_phase2_build_omni_rows_20260318()}</div>
    <div class='giga-grid'>{giga_phase2_build_episode_cards_20260318()}</div>
    """
    return giga_phase2_shell_20260318("Omni Cinema V5 — Rows + Episode Surfacing", body)

@app.route("/dynamic-feed-v4", methods=["GET"])
def giga_dynamic_feed_v4_20260318():
    body = f"""
    <div class='giga-grid'>
      <div>{giga_phase2_build_attached_media_cards_20260318()}</div>
      <div>{giga_phase2_build_mission_cards_20260318()}</div>
    </div>
    """
    return giga_phase2_shell_20260318("Dynamic Feed V4 — Attached Media", body)
# === END_GIGA_PHASE2_UI_WORLD_PATCH_20260318 ===
'''

    # place above app.run / __main__
    import re
    m = re.search(r'if __name__ == ["\\\']__main__["\\\']:\s*\n(?:[ \t]+.*\n)+', src)
    if m:
        insert_pos = m.start()
    else:
        m2 = re.search(r'app\.run\s*\([^\n]*\)\s*\n', src)
        insert_pos = m2.start() if m2 else len(src)

    new_src = src[:insert_pos].rstrip() + "\n\n" + block + "\n\n" + src[insert_pos:].lstrip()
    app_path.write_text(new_src, encoding="utf-8")
    print("Phase 2 UI patch appended above app.run.")
PY

echo
echo "Restarting locked app..."
./recovery/start_giga_locked.sh

echo
echo "Testing Phase 2 pages..."
curl -I -s http://127.0.0.1:8080/world-map-v5 | head -5
curl -I -s http://127.0.0.1:8080/omni-cinema-v5 | head -5
curl -I -s http://127.0.0.1:8080/dynamic-feed-v4 | head -5
