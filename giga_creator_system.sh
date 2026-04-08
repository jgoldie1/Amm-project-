#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/marketplace

APP="$HOME/marketplace/app.py"
DATA="$HOME/marketplace/data"
BACKUP="$HOME/marketplace/backups/app_creator_$(date +%s).py"

mkdir -p "$DATA"
cp "$APP" "$BACKUP"
echo "Backup saved: $BACKUP"

# ensure data files exist
for f in creator_shows.json creator_episodes.json creator_media.json; do
  [ -f "$DATA/$f" ] || echo "[]" > "$DATA/$f"
done

python3 <<'PY'
from pathlib import Path
import json

app_path = Path.home() / "marketplace" / "app.py"
src = app_path.read_text()

marker = "# === GIGA_CREATOR_SYSTEM ==="
if marker in src:
    print("Creator system already installed")
    exit()

block = '''

# === GIGA_CREATOR_SYSTEM ===

def giga_safe_read(file):
    try:
        import json, os
        from pathlib import Path
        fp = Path.home() / "marketplace" / "data" / file
        if not fp.exists():
            return []
        return json.loads(fp.read_text())
    except:
        return []

def giga_safe_write(file, data):
    try:
        import json
        from pathlib import Path
        fp = Path.home() / "marketplace" / "data" / file
        fp.write_text(json.dumps(data, indent=2))
    except:
        pass

@app.route("/creator-studio")
def creator_studio():
    return """
    <h1>Creator Studio</h1>
    <a href='/creator-create-show'>Create Show</a>
    <a href='/creator-create-episode'>Create Episode</a>
    <a href='/creator-library'>My Library</a>
    """

@app.route("/creator-create-show", methods=["GET","POST"])
def creator_create_show():
    from flask import request, redirect
    if request.method == "POST":
        shows = giga_safe_read("creator_shows.json")
        show = {
            "id": f"show_{len(shows)+1}",
            "title": request.form.get("title"),
            "region": request.form.get("region"),
            "rating": request.form.get("rating"),
            "monetization": {
                "ads": True,
                "product_placement": True,
                "holographic_ads": True
            }
        }
        shows.append(show)
        giga_safe_write("creator_shows.json", shows)
        return redirect("/creator-library")

    return """
    <h2>Create Show</h2>
    <form method='post'>
    Title:<br><input name='title'><br>
    Region:<br><input name='region'><br>
    Rating:<br><input name='rating'><br>
    <button>Create</button>
    </form>
    """

@app.route("/creator-create-episode", methods=["GET","POST"])
def creator_create_episode():
    from flask import request, redirect
    if request.method == "POST":
        eps = giga_safe_read("creator_episodes.json")
        ep = {
            "id": f"ep_{len(eps)+1}",
            "show_id": request.form.get("show_id"),
            "title": request.form.get("title"),
            "duration": request.form.get("duration"),
            "media": [],
            "ads": {
                "pre_roll": True,
                "mid_roll": True,
                "product_slots": True
            }
        }
        eps.append(ep)
        giga_safe_write("creator_episodes.json", eps)
        return redirect("/creator-library")

    return """
    <h2>Create Episode</h2>
    <form method='post'>
    Show ID:<br><input name='show_id'><br>
    Title:<br><input name='title'><br>
    Duration:<br><input name='duration'><br>
    <button>Create</button>
    </form>
    """

@app.route("/creator-library")
def creator_library():
    shows = giga_safe_read("creator_shows.json")
    eps = giga_safe_read("creator_episodes.json")

    html = "<h1>Creator Library</h1>"

    html += "<h2>Shows</h2>"
    for s in shows:
        html += f"<div><b>{s['title']}</b> ({s['region']})</div>"

    html += "<h2>Episodes</h2>"
    for e in eps:
        html += f"<div>{e['title']} ({e['show_id']})</div>"

    return html

# === END_GIGA_CREATOR_SYSTEM ===
'''

# insert above app.run
import re
pos = src.find("if __name__ == \"__main__\"")
new_src = src[:pos] + block + "\n" + src[pos:]
app_path.write_text(new_src)

print("Creator system installed")
PY

./recovery/start_giga_locked.sh

echo
echo "TEST CREATOR SYSTEM"
curl -s http://127.0.0.1:8080/creator-studio | head -20
