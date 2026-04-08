from flask import Flask, request, session, redirect
import sqlite3
from functools import lru_cache
import threading
import time
from pathlib import Path

app = Flask(__name__)


# === QUANTUM SPEED ACCELERATOR (QSA) ===
@lru_cache(maxsize=256)
def qsa_cache(route_key):
    return route_key

# === QUANTUM LAG BUSTER (QLB) ===
def qlb_monitor():
    while True:
        time.sleep(10)
        try:
            conn()
        except:
            pass

threading.Thread(target=qlb_monitor, daemon=True).start()

app.secret_key = "mini-app-secret-key"

MEMDB = Path("instance/mini_memory.db")
MEMDB.parent.mkdir(parents=True, exist_ok=True)

def mem_conn():
    return sqlite3.connect(MEMDB)

def init_memory_db():
    conn = mem_conn()
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS memory_notes (id INTEGER PRIMARY KEY AUTOINCREMENT, note TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)")
    cur.execute("CREATE TABLE IF NOT EXISTS join_requests (id INTEGER PRIMARY KEY AUTOINCREMENT, full_name TEXT, email TEXT, invite_code TEXT, role_name TEXT, why_join TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)")
    cur.execute("CREATE TABLE IF NOT EXISTS heir_profiles (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT UNIQUE, display_name TEXT, title TEXT, summary TEXT, primary_link TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)")
    conn.commit()

    seeds = [
        ("jacobie", "Jacobie", "Firstborn Heir Dashboard", "Personal family, business, and legacy lane.", "/family-launch-home"),
        ("isaiah", "Isaiah", "Heir Dashboard", "Growth, creator, and future business lane.", "/family-launch-home"),
        ("aniyah", "Aniyah", "Birthday and Cross Border Dashboard", "Birthday, cross-border, music, and family lane.", "/aniyah-cross-border"),
        ("alton-kevon", "Alton Kevon", "Heir Dashboard", "Birthday countdown, media, and future business lane.", "/countdown-alton-kevon"),
        ("brother-alton", "Brother Alton", "Leadership Dashboard", "Leadership, commerce, and family support lane.", "/family-launch-home"),
    ]
    for slug, display_name, title, summary, primary_link in seeds:
        cur.execute("INSERT OR IGNORE INTO heir_profiles (slug, display_name, title, summary, primary_link) VALUES (?, ?, ?, ?, ?)",
                    (slug, display_name, title, summary, primary_link))
    conn.commit()
    conn.close()

def save_note(note):
    if not note:
        return
    conn = mem_conn()
    cur = conn.cursor()
    cur.execute("INSERT INTO memory_notes (note) VALUES (?)", (note,))
    conn.commit()
    conn.close()

def get_notes(limit=10):
    conn = mem_conn()
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT note, created_at FROM memory_notes ORDER BY id DESC LIMIT ?", (limit,)).fetchall()
    conn.close()
    return rows

init_memory_db()



# ===== VERSE ENGINE =====


# ===== MEMORY SYSTEM =====
MEMORY = {
    "users": {},
    "notes": [],
    "events": []
}

def save_note(note):
    MEMORY["notes"].append(note)

def get_notes():
    return MEMORY["notes"][-10:]


VERSE_STATE = {
    "users": {},
    "worlds": {
        "Marketplace": {"type": "metaverse"},
        "Streaming Studio": {"type": "metaverse"},
        "Creator Arena": {"type": "metaverse"},
        "AAM Ecosystem": {"type": "multiverse"},
        "AAM University": {"type": "middleverse"}
    }
}

def enter_world(user, world):
    VERSE_STATE["users"][user] = world
    return world

def get_user_world(user):
    return VERSE_STATE["users"].get(user, "None")



def page(title, body):
    return f"""<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<style>
body {{ margin:0; font-family:Arial,sans-serif; background:#0f172a; color:white; }}
.top {{ padding:14px; background:#111827; position:sticky; top:0; }}
.top a {{ color:white; text-decoration:none; margin-right:10px; padding:8px 12px; background:#2563eb; border-radius:8px; display:inline-block; }}
.wrap {{ max-width:1000px; margin:0 auto; padding:20px; }}
.card {{ background:#1f2937; border:1px solid #334155; border-radius:16px; padding:16px; margin-bottom:14px; }}
.grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:14px; }}
.card a {{ color:white; text-decoration:none; padding:8px 12px; background:#2563eb; border-radius:8px; display:inline-block; }}
</style>
</head>
<body>
<div class="top">
<a href="/family-launch-home">Home</a>
<a href="/birthday-center">Birthday</a>
<a href="/shows-demo">Shows</a>
<a href="/music-demo">Music</a>
<a href="/omni-care-360">Omni Care 360</a>
<a href="/holoverse-lobby-v2">Holoverse</a>
</div>
<div class="wrap">{body}</div>
</body>
</html>"""

@app.route("/")
@app.route("/family-launch-home")
def home():
    return page("Family Launch Home", """
    <div class="card"><h1>Family Launch Home</h1><p>Stable mini rescue app for today.</p></div>
    <div class="grid">
      <div class="card"><h2>Birthday Center</h2><a href="/birthday-center">Open</a></div>
      <div class="card"><h2>Shows</h2><a href="/shows-demo">Open</a></div>
      <div class="card"><h2>Music</h2><a href="/music-demo">Open</a></div>
      <div class="card"><h2>Omni Care 360</h2><a href="/omni-care-360">Open</a></div>
      <div class="card"><h2>Holoverse</h2><a href="/holoverse-lobby-v2">Open</a></div>
      <div class="card"><h2>Join App</h2><a href="/join-app">Open</a></div>
      <div class="card"><h2>Heir Dashboards</h2><a href="/heirs">Open</a></div>
      <div class="card"><h2>Aniyah Cross Border</h2><a href="/aniyah-cross-border">Open</a></div>
      <div class="card"><h2>AAM Ecosystem</h2><a href="/aam-holographic-streaming-ecosystem">Open</a></div>
      <div class="card"><h2>AAM University</h2><a href="/aam-university">Open</a></div>
      <div class="card"><h2>AI Command Center</h2><a href="/ai-command-center">Open</a></div>
      <div class="card"><h2>System Status</h2><a href="/system-status">Open</a></div>
      <div class="card"><h2>AI Command Center</h2><a href="/ai-command-center">Open</a></div>
      <div class="card"><h2>Smart Dashboard</h2><a href="/smart-dashboard">Open</a></div>
      <div class="card"><h2>System Status</h2><a href="/system-status">Open</a></div>
      <div class="card"><h2>AAM Ecosystem</h2><a href="/aam-holographic-streaming-ecosystem">Open</a></div>
      <div class="card"><h2>AAM University</h2><a href="/aam-university">Open</a></div>
      <div class="card"><h2>Aniyah Cross Border</h2><a href="/aniyah-cross-border">Open</a></div>
      <div class="card"><h2>Aniyah Cross Border</h2><a href="/aniyah-cross-border">Open</a></div>
    </div>
    """)

@app.route("/birthday-center")
def birthday():
    return page("Birthday Center", """
    <div class="card"><h1>Birthday Center</h1><p>Happy Birthday Aniyah. Alton Kevon countdown: 3 days.</p></div>
    <div class="grid">
      <div class="card"><h2>Aniyah Birthday Page</h2><a href="/happy-birthday-aniyah">Open</a></div>
      <div class="card"><h2>Alton Kevon Countdown</h2><a href="/countdown-alton-kevon">Open</a></div>
    </div>
    """)

@app.route("/happy-birthday-aniyah")
def hba():
    return page("Happy Birthday Aniyah", '<div class="card"><h1>Happy Birthday Aniyah</h1><p>Your birthday spotlight is live.</p></div>')

@app.route("/countdown-alton-kevon")
def cak():
    return page("Countdown Alton Kevon", "<div class=\"card\"><h1>3 Days Until Alton Kevon's Birthday</h1></div>")

@app.route("/shows-demo")
def shows():
    return page("Shows Demo", """
    <div class="card"><h1>Shows Demo</h1></div>
    <div class="grid">
      <div class="card"><h2>Heirs Launch Show</h2><a href="/watch-show/1">Watch</a></div>
      <div class="card"><h2>Holo Stream Spotlight</h2><a href="/watch-show/2">Watch</a></div>
    </div>
    """)

@app.route("/watch-show/<int:show_id>")
def watch(show_id):
    return page("Watch Show", f'<div class="card"><h1>Now Watching</h1><p>Show ID: {show_id}</p><a href="/shows-demo">Back to Shows</a></div>')

@app.route("/music-demo")
def music():
    return page("Music Demo", """
    <div class="card"><h1>Music Demo</h1></div>
    <div class="grid">
      <div class="card"><h2>Rise In Sound</h2><a href="/play-track/1">Play</a></div>
      <div class="card"><h2>Platform Anthem</h2><a href="/play-track/2">Play</a></div>
    </div>
    """)

@app.route("/play-track/<int:track_id>")
def play(track_id):
    return page("Play Track", f'<div class="card"><h1>Now Playing</h1><p>Track ID: {track_id}</p><a href="/music-demo">Back to Music</a></div>')

@app.route("/omni-care-360")
def omni():
    return page("Omni Care 360", """
    <div class="card"><h1>Omni Care 360</h1><p>Family care dashboard with prescription and insurance shells.</p></div>
    <div class="grid">
      <div class="card"><h2>Care Profiles</h2><a href="/omni-care-profiles">Open</a></div>
      <div class="card"><h2>Prescriptions</h2><a href="/omni-prescriptions">Open</a></div>
      <div class="card"><h2>Insurance</h2><a href="/omni-insurance">Open</a></div>
    </div>
    """)

@app.route("/omni-care-profiles")
def care():
    return page("Care Profiles", '<div class="card"><h1>Care Profiles</h1><p>Care profile shell is ready.</p></div>')

@app.route("/omni-prescriptions")
def rx():
    return page("Prescriptions", '<div class="card"><h1>Prescriptions</h1><p>Prescription tracking shell is ready.</p></div>')

@app.route("/omni-insurance")
def ins():
    return page("Insurance", '<div class="card"><h1>Insurance</h1><p>Insurance tracking shell is ready.</p></div>')

@app.route("/holoverse-lobby-v2")
def holo():
    return page("Holoverse Lobby", """
    
<div class="card">
  <h1>Holoverse Control Center</h1>
  <p>This is your Metaverse → Middleverse → Multiverse gateway.</p>
</div>

<div class="card">
  <h2>System Layers</h2>
  <p>Metaverse = worlds</p>
  <p>Middleverse = logic + actions</p>
  <p>Multiverse = all systems connected</p>
</div>

    <div class="grid">
      <div class="card"><h2>Marketplace</h2><a href="/world/Marketplace">Enter</a></div>
      <div class="card"><h2>Streaming Studio</h2><a href="/world/Streaming Studio">Enter</a></div>
      <div class="card"><h2>Creator Arena</h2><a href="/world/Creator Arena">Enter</a></div>
      <div class="card"><h2>AAM Ecosystem</h2><a href="/aam-holographic-streaming-ecosystem">Enter</a></div>
      <div class="card"><h2>AAM University</h2><a href="/aam-university">Enter</a></div>
      <div class="card"><h2>AI Command Center</h2><a href="/ai-command-center">Enter</a></div>
      <div class="card"><h2>AAM Ecosystem</h2><a href="/aam-holographic-streaming-ecosystem">Enter</a></div>
      <div class="card"><h2>AAM University</h2><a href="/aam-university">Enter</a></div>
    </div>
    """)

@app.route("/world/<path:name>")
def world(name):
    user = "guest"

    current = enter_world(user, name)

    return page(name, f"""
    <div class="card">
        <h1>{name}</h1>
        <p>You are now inside the {name}.</p>
        <p><strong>Current User World:</strong> {current}</p>
        <a href="/holoverse-lobby-v2">Back to Holoverse</a>
    </div>

    <div class="grid">
        <div class="card">
            <h2>Teleport</h2>
            <a href="/world/Marketplace">Marketplace</a>
            <a href="/world/Streaming Studio">Streaming</a>
            <a href="/world/Creator Arena">Creator</a>
            <a href="/aam-holographic-streaming-ecosystem">Ecosystem</a>
            <a href="/aam-university">University</a>
        </div>

        <div class="card">
            <h2>World Actions</h2>
            <p>Buy, stream, learn, create — actions depend on world type.</p>
        </div>
    </div>
    """)


@app.route("/aniyah-cross-border")
def aniyah_cross_border():
    return page("Aniyah Cross Border App", """
    <div class="card">
      <h1>Aniyah Cross Border App</h1>
      <p>This is Aniyah's cross-border lane for future family, creator, and global expansion features.</p>
    </div>
    <div class="grid">
      <div class="card"><h2>Birthday</h2><a href="/happy-birthday-aniyah">Open</a></div>
      <div class="card"><h2>Music</h2><a href="/music-demo">Open</a></div>
      <div class="card"><h2>Shows</h2><a href="/shows-demo">Open</a></div>
      <div class="card"><h2>Omni Care 360</h2><a href="/omni-care-360">Open</a></div>
    </div>
    """)


@app.route("/aam-holographic-streaming-ecosystem")
def aam_holographic_streaming_ecosystem():
    return page("All American Marketplace Holographic Streaming Ecosystem", """
    <div class="card">
      <h1>All American Marketplace Holographic Streaming Ecosystem</h1>
      <p>This is the main ecosystem shell for family, creators, media, commerce, and holographic experiences.</p>
    </div>
    <div class="grid">
      <div class="card"><h2>Family Launch</h2><a href="/family-launch-home">Open</a></div>
      <div class="card"><h2>Birthday Center</h2><a href="/birthday-center">Open</a></div>
      <div class="card"><h2>Shows</h2><a href="/shows-demo">Open</a></div>
      <div class="card"><h2>Music</h2><a href="/music-demo">Open</a></div>
      <div class="card"><h2>Omni Care 360</h2><a href="/omni-care-360">Open</a></div>
      <div class="card"><h2>Holoverse</h2><a href="/holoverse-lobby-v2">Open</a></div>
      <div class="card"><h2>Join App</h2><a href="/join-app">Open</a></div>
      <div class="card"><h2>Heir Dashboards</h2><a href="/heirs">Open</a></div>
      <div class="card"><h2>Aniyah Cross Border</h2><a href="/aniyah-cross-border">Open</a></div>
      <div class="card"><h2>AAM Ecosystem</h2><a href="/aam-holographic-streaming-ecosystem">Open</a></div>
      <div class="card"><h2>AAM University</h2><a href="/aam-university">Open</a></div>
      <div class="card"><h2>AI Command Center</h2><a href="/ai-command-center">Open</a></div>
      <div class="card"><h2>System Status</h2><a href="/system-status">Open</a></div>
      <div class="card"><h2>AI Command Center</h2><a href="/ai-command-center">Open</a></div>
      <div class="card"><h2>Smart Dashboard</h2><a href="/smart-dashboard">Open</a></div>
      <div class="card"><h2>System Status</h2><a href="/system-status">Open</a></div>
      <div class="card"><h2>AAM Ecosystem</h2><a href="/aam-holographic-streaming-ecosystem">Open</a></div>
      <div class="card"><h2>AAM University</h2><a href="/aam-university">Open</a></div>
      <div class="card"><h2>AAM University</h2><a href="/aam-university">Open</a></div>
    </div>
    """)

@app.route("/aam-university")
def aam_university():
    return page("All American Marketplace University", """
    <div class="card">
      <h1>All American Marketplace University</h1>
      <p>This is the university shell for training, learning, creator growth, family education, and future certifications.</p>
    </div>
    <div class="grid">
      <div class="card"><h2>Family Orientation</h2><a href="/family-launch-home">Open</a></div>
      <div class="card"><h2>Music Coaching</h2><a href="/music-coaching-home">Open</a></div>
      <div class="card"><h2>Artist Signing</h2><a href="/artist-signing-home">Open</a></div>
      <div class="card"><h2>Omni Care Learning</h2><a href="/omni-care-360">Open</a></div>
      <div class="card"><h2>Holoverse Learning</h2><a href="/holoverse-lobby-v2">Open</a></div>
    </div>
    """)


@app.route("/ai-command-center")
def ai_command_center():
    return page("AI Command Center", """
    <div class="card">
      <h1>AI Command Center</h1>
      <p>This is the live AI control center for the family ecosystem.</p>
      <p>Type or tap a command and let the AI talk back.</p>
    </div>

    <div class="grid">
      <div class="card">
        <h2>Voice Commands</h2>
        <input id="cmd" placeholder="Type command like: open birthday center">
        <button onclick="runCmd()">Run Command</button>
        <button onclick="speakText('Hello James. The AI system is online.')">Test Voice</button>
      </div>

      <div class="card">
        <h2>Quick Actions</h2>
        <button onclick="go('/birthday-center','Opening Birthday Center')">Birthday Center</button>
        <button onclick="go('/aniyah-cross-border','Opening Aniyah Cross Border')">Aniyah Cross Border</button>
        <button onclick="go('/omni-care-360','Opening Omni Care 360')">Omni Care 360</button>
        <button onclick="go('/aam-holographic-streaming-ecosystem','Opening AAM Ecosystem')">AAM Ecosystem</button>
        <button onclick="go('/aam-university','Opening AAM University')">AAM University</button>
        <button onclick="go('/holoverse-lobby-v2','Opening Holoverse Lobby')">Holoverse</button>
      </div>

      <div class="card">
        <h2>Status</h2>
        <div id="status">AI waiting for command.</div>
      </div>
    </div>

    <script>
    function speakText(text){
      const msg = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(msg);
    }

    function go(url, text){
      document.getElementById('status').innerText = text;
      speakText(text);
      setTimeout(() => { window.location.href = url; }, 700);
    }

    function runCmd(){
      const v = (document.getElementById('cmd').value || '').toLowerCase().trim();
      if(!v){
        speakText('Please enter a command.');
        return;
      }

      if(v.includes('birthday')) return go('/birthday-center','Opening Birthday Center');
      if(v.includes('aniyah')) return go('/aniyah-cross-border','Opening Aniyah Cross Border');
      if(v.includes('care')) return go('/omni-care-360','Opening Omni Care 360');
      if(v.includes('ecosystem')) return go('/aam-holographic-streaming-ecosystem','Opening AAM Ecosystem');
      if(v.includes('university')) return go('/aam-university','Opening AAM University');
      if(v.includes('holoverse') || v.includes('metaverse')) return go('/holoverse-lobby-v2','Opening Holoverse Lobby');
      if(v.includes('shows')) return go('/shows-demo','Opening Shows Demo');
      if(v.includes('music')) return go('/music-demo','Opening Music Demo');

      document.getElementById('status').innerText = 'Unknown command: ' + v;
      speakText('Unknown command');
    }
    </script>
    """)

@app.route("/system-status")
def system_status():
    return page("System Status", """
    <div class="card">
      <h1>System Status</h1>
      <p>Metaverse shell: active</p>
      <p>Middleverse logic: active</p>
      <p>Multiverse links: active</p>
      <p>AAM Ecosystem: active</p>
      <p>AAM University: active</p>
      <p>Omni Care 360: active</p>
      <p>AI Command Center: active</p>
    </div>
    """)


@app.route("/smart-dashboard")
def smart_dashboard():
    notes = "<br>".join(get_notes())
    return page("Smart Dashboard", f"""
    <div class="card">
      <h1>Smart Dashboard</h1>
      <p>This is your central intelligence panel.</p>
    </div>

    <div class="grid">
      <div class="card">
        <h2>System Overview</h2>
        <p>Metaverse: active</p>
        <p>AI: active</p>
        <p>Holoverse: active</p>
      </div>

      <div class="card">
        <h2>Recent Memory</h2>
        <div>{notes}</div>
      </div>

      <div class="card">
        <h2>Quick Control</h2>
        <a href="/ai-command-center">AI Control</a>
        <a href="/holoverse-lobby-v2">Holoverse</a>
        <a href="/aam-holographic-streaming-ecosystem">Ecosystem</a>
      </div>
    </div>
    """)


@app.route("/save-memory", methods=["POST"])
def save_memory():
    from flask import request
    data = request.get_json()
    note = data.get("note","")
    save_note(note)
    return {"ok": True}


@app.route("/music-coaching-home")
def music_coaching_home():
    return page("Music Coaching", """
    <div class="card"><h1>Music Coaching</h1><p>Music coaching shell is ready.</p></div>
    """)


@app.route("/artist-signing-home")
def artist_signing_home():
    return page("Artist Signing", """
    <div class="card"><h1>Artist Signing</h1><p>Artist signing shell is ready.</p></div>
    """)


@app.route("/login", methods=["GET", "POST"])
def login():
    msg = ""
    if request.method == "POST":
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "").strip()
        c = conn()
        c.row_factory = sqlite3.Row
        user = c.execute("SELECT * FROM users WHERE email=? AND password=?", (email, password)).fetchone()
        c.close()
        if user:
            session["user_id"] = user["id"]
            save_note(f"Login: {user['email']}")
            return redirect("/dashboard")
        msg = "<p><strong>Login failed.</strong></p>"

    return page("Login", f"""
    <div class="card">
      <h1>Login</h1>
      <p>Demo accounts:</p>
      <p><small>admin@aam.local / admin123</small></p>
      <p><small>family@aam.local / family123</small></p>
      <p><small>heir@aam.local / heir123</small></p>
      {msg}
    </div>
    <div class="card">
      <form method="post">
        <input name="email" placeholder="Email">
        <input name="password" placeholder="Password" type="password">
        <button type="submit">Login</button>
      </form>
    </div>
    """)

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/family-launch-home")

@app.route("/dashboard")
def dashboard():
    user = get_current_user()
    if not user:
        return redirect("/login")

    role = user["role_name"]
    return page("Dashboard", f"""
    <div class="card">
      <h1>{esc(user['display_name'])} Dashboard</h1>
      <p><strong>Email:</strong> {esc(user['email'])}</p>
      <p><strong>Role:</strong> {esc(role)}</p>
      <p><strong>Current World:</strong> {esc(get_world())}</p>
    </div>
    <div class="grid">
      <div class="card"><h2>Family Home</h2><a href="/family-launch-home">Open</a></div>
      <div class="card"><h2>Heirs</h2><a href="/heirs">Open</a></div>
      <div class="card"><h2>World Registry</h2><a href="/world-registry">Open</a></div>
      <div class="card"><h2>AI Command Center</h2><a href="/ai-command-center">Open</a></div>
      <div class="card"><h2>System Status</h2><a href="/system-status">Open</a></div>
      <div class="card"><h2>Join App</h2><a href="/join-app">Open</a></div>
    </div>
    """)

@app.route("/admin")
def admin():
    if not require_role("admin"):
        return page("Access Denied", """
        <div class="card">
          <h1>Access Denied</h1>
          <p>You must be logged in as admin to view this page.</p>
          <a href="/login">Login</a>
        </div>
        """)

    c = conn()
    c.row_factory = sqlite3.Row
    users = c.execute("SELECT * FROM users ORDER BY id DESC").fetchall()
    joins = c.execute("SELECT * FROM join_requests ORDER BY id DESC LIMIT 20").fetchall()
    c.close()

    users_html = ""
    for u in users:
        users_html += f"<div class='card'><h2>{esc(u['display_name'])}</h2><p>{esc(u['email'])}</p><p>{esc(u['role_name'])}</p></div>"

    joins_html = ""
    for j in joins:
        joins_html += f"<div class='card'><h2>{esc(j['full_name'])}</h2><p>{esc(j['email'])}</p><p>{esc(j['role_name'])}</p><p>{esc(j['invite_code'])}</p></div>"

    return page("Admin Dashboard", f"""
    <div class="card">
      <h1>Admin Dashboard</h1>
      <p>Manage users, joins, ecosystem state, and growth.</p>
    </div>
    <div class="card">
      <h2>User Accounts</h2>
    </div>
    <div class="grid">{users_html}</div>
    <div class="card">
      <h2>Recent Join Requests</h2>
    </div>
    <div class="grid">{joins_html or "<div class='card'><p>No join requests yet.</p></div>"}</div>
    """)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
