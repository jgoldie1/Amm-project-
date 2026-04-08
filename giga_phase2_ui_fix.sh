#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/marketplace

APP="$HOME/marketplace/app.py"
BACKUP="$HOME/marketplace/backups/app_phase2_safe_$(date +%s).py"

cp "$APP" "$BACKUP"
echo "Backup saved: $BACKUP"

python3 <<'PY'
from pathlib import Path

app_path = Path.home() / "marketplace" / "app.py"
src = app_path.read_text()

marker = "# === GIGA_PHASE2_UI_SIMPLE ==="
if marker in src:
    print("Already installed")
    exit()

block = '''

# === GIGA_PHASE2_UI_SIMPLE ===

@app.route("/world-map-v5")
def world_map_v5_simple():
    return """
    <h1>World Map V5</h1>
    <a href='/api/v2/giga-phase1-health'>Check Health</a>
    <a href='/platform-home'>Home</a>
    """

@app.route("/omni-cinema-v5")
def omni_v5_simple():
    return """
    <h1>Omni Cinema V5</h1>
    <a href='/api/v2/omni-cinema/episodes'>Episodes</a>
    """

@app.route("/dynamic-feed-v4")
def feed_v4_simple():
    return """
    <h1>Dynamic Feed V4</h1>
    <a href='/api/v2/attached-media'>Media</a>
    """

# === END_GIGA_PHASE2_UI_SIMPLE ===
'''

# simple safe append
app_path.write_text(src + block)
print("Patch applied safely")
PY

echo "Restarting..."
./recovery/start_giga_locked.sh

echo "Testing..."
curl -I http://127.0.0.1:8080/world-map-v5 | head -5
curl -I http://127.0.0.1:8080/omni-cinema-v5 | head -5
curl -I http://127.0.0.1:8080/dynamic-feed-v4 | head -5
