from flask import Flask, request, jsonify
import sqlite3
from pathlib import Path
import random
import string

app = Flask(__name__)
app.secret_key = "rescue-key"

DB = Path("instance/app_rescue.db")
DB.parent.mkdir(parents=True, exist_ok=True)

def db():
    return sqlite3.connect(DB)

def init_db():
    conn = db()
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS birthday_gifts (id INTEGER PRIMARY KEY AUTOINCREMENT, nft_title TEXT, gifted_to_name TEXT, gifted_to_email TEXT, claim_code TEXT, claim_status TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)")
    cur.execute("CREATE TABLE IF NOT EXISTS coaching (id INTEGER PRIMARY KEY AUTOINCREMENT, student_name TEXT, email TEXT, goal TEXT, session_type TEXT, notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)")
    cur.execute("CREATE TABLE IF NOT EXISTS signing (id INTEGER PRIMARY KEY AUTOINCREMENT, artist_name TEXT, email TEXT, style_name TEXT, current_stage TEXT, notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)")
    cur.execute("CREATE TABLE IF NOT EXISTS care_profiles (id INTEGER PRIMARY KEY AUTOINCREMENT, person_name TEXT, care_level TEXT, insurance_plan TEXT, pharmacy_name TEXT, notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)")
    cur.execute("CREATE TABLE IF NOT EXISTS prescriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, person_name TEXT, medication_name TEXT, dosage TEXT, refill_date TEXT, pharmacy_name TEXT, notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)")
    cur.execute("CREATE TABLE IF NOT EXISTS insurance_items (id INTEGER PRIMARY KEY AUTOINCREMENT, person_name TEXT, provider_name TEXT, member_id TEXT, group_number TEXT, plan_type TEXT, notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)")
    conn.commit()
    conn.close()

init_db()

def shell(title: str, body: str) -> str:
    return f"""<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<style>
:root {{ --line: rgba(255,255,255,.08); --muted:#b5c0cd; }}
* {{ box-sizing:border-box; }}
body {{
  margin:0; font-family:Arial,sans-serif; color:#fff;
  background:
    radial-gradient(circle at 10% 10%, rgba(125,211,252,.12), transparent 22%),
    radial-gradient(circle at 90% 14%, rgba(167,139,250,.12), transparent 24%),
    linear-gradient(180deg,#04070c 0%, #0f172a 100%);
}}
.topbar {{
  position:sticky; top:0; z-index:50; border-bottom:1px solid var(--line);
  background:rgba(5,7,11,.72); backdrop-filter:blur(10px);
}}
.topbar-inner {{
  max-width:1240px; margin:0 auto; padding:14px 20px;
  display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;
}}
.brand {{ font-weight:700; }}
.nav {{ display:flex; gap:10px; flex-wrap:wrap; }}
.nav a, .card a, button {{
  display:inline-block; padding:10px 14px; border-radius:12px;
  background:#2563eb; color:#fff; text-decoration:none; border:none;
}}
.shell {{ max-width:1240px; margin:0 auto; padding:22px; }}
.hero, .card {{
  border:1px solid var(--line); border-radius:24px; padding:18px; background:rgba(255,255,255,.05);
}}
.hero {{ margin-bottom:18px; }}
.grid {{
  display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:16px;
}}
p {{ color:var(--muted); line-height:1.6; }}
input, textarea {{
  width:100%; padding:12px; border-radius:12px; border:1px solid var(--line);
  background:rgba(255,255,255,.04); color:#fff; margin:8px 0;
}}
textarea {{ min-height:90px; }}
</style>
</head>
<body>
<div class="topbar">
  <div class="topbar-inner">
    <div class="brand">AAME Rescue App</div>
    <div class="nav">
      <a href="/family-launch-home">Home</a>
      <a href="/birthday-center">Birthday</a>
      <a href="/birthday-nft-gift-center">NFT Gift</a>
      <a href="/shows-demo">Shows</a>
      <a href="/music-demo">Music</a>
      <a href="/omni-care-360">Omni Care 360</a>
      <a href="/holoverse-lobby-v2">Holoverse</a>
    </div>
  </div>
</div>
<div class="shell">{body}</div>
</body>
</html>"""

@app.route("/")
@app.route("/family-launch-home")
def family_launch_home():
    return shell("Family Launch Home", """
    <div class="hero">
      <h1>Family Launch Home</h1>
      <p>Stable rescue version for today with birthday, media, Omni Care 360, NFT gifts, and holoverse actions.</p>
    </div>
    <div class="grid">
      <div class="card"><h2>Birthday Center</h2><p>Birthday pages and celebration hub.</p><a href="/birthday-center">Open</a></div>
      <div class="card"><h2>NFT Gift Center</h2><p>Create and claim birthday gift passes.</p><a href="/birthday-nft-gift-center">Open</a></div>
      <div class="card"><h2>Shows</h2><p>Simple watch demo.</p><a href="/shows-demo">Open</a></div>
      <div class="card"><h2>Music</h2><p>Simple music demo.</p><a href="/music-demo">Open</a></div>
      <div class="card"><h2>Music Coaching</h2><p>Submit coaching requests.</p><a href="/music-coaching-home">Open</a></div>
      <div class="card"><h2>Artist Signing</h2><p>Submit artist intake.</p><a href="/artist-signing-home">Open</a></div>
      <div class="card"><h2>Omni Care 360</h2><p>Care, prescriptions, and insurance shell.</p><a href="/omni-care-360">Open</a></div>
      <div class="card"><h2>Holoverse</h2><p>World-based actions.</p><a href="/holoverse-lobby-v2">Open</a></div>
    </div>
    """)

@app.route("/birthday-center")
def birthday_center():
    return shell("Birthday Center", """
    <div class="hero">
      <h1>Birthday Center</h1>
      <p>Happy Birthday Aniyah. Alton Kevon birthday countdown is 3 days.</p>
    </div>
    <div class="grid">
      <div class="card"><h2>Aniyah Birthday Page</h2><a href="/happy-birthday-aniyah">Open</a></div>
      <div class="card"><h2>Alton Kevon Countdown</h2><a href="/countdown-alton-kevon">Open</a></div>
      <div class="card"><h2>Birthday NFT Gallery</h2><a href="/birthday-nft-gallery">Open</a></div>
    </div>
    """)

@app.route("/happy-birthday-aniyah")
def happy_birthday_aniyah():
    return shell("Happy Birthday Aniyah", """
    <div class="hero"><h1>Happy Birthday Aniyah</h1><p>Your birthday spotlight is live inside the family app.</p></div>
    """)

@app.route("/countdown-alton-kevon")
def countdown_alton_kevon():
    return shell("Countdown Alton Kevon", """
    <div class="hero"><h1>3 Days Until Alton Kevon's Birthday</h1><p>The countdown page is active.</p></div>
    """)

@app.route("/birthday-nft-gallery")
def birthday_nft_gallery():
    return shell("Birthday NFT Gallery", """
    <div class="grid">
      <div class="card"><h2>Happy Birthday Aniyah NFT</h2><p>Edition 1/1 concept.</p></div>
      <div class="card"><h2>Happy Birthday Alton Kevon NFT</h2><p>Edition 1/1 concept.</p></div>
    </div>
    """)

@app.route("/birthday-nft-gift-center")
def birthday_nft_gift_center():
    return shell("Birthday NFT Gift Center", """
    <div class="hero"><h1>Birthday NFT Gift Center</h1><p>Create a gift pass for a friend and let them claim it after signup.</p></div>
    <div class="grid">
      <div class="card">
        <h2>Create Gift Pass</h2>
        <form method="post" action="/create-birthday-gift">
          <input name="nft_title" value="Happy Birthday Aniyah NFT">
          <input name="gifted_to_name" placeholder="Friend Name">
          <input name="gifted_to_email" placeholder="Friend Email">
          <button type="submit">Create Gift</button>
        </form>
      </div>
      <div class="card">
        <h2>Claim Gift Pass</h2>
        <form method="post" action="/claim-birthday-gift">
          <input name="claim_code" placeholder="Claim Code">
          <button type="submit">Claim Gift</button>
        </form>
      </div>
      <div class="card"><h2>Gift Records</h2><a href="/api/birthday-nft-gifts">Open</a></div>
    </div>
    """)

@app.route("/create-birthday-gift", methods=["POST"])
def create_birthday_gift():
    claim_code = "BDAY-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
    conn = db()
    cur = conn.cursor()
    cur.execute("INSERT INTO birthday_gifts (nft_title, gifted_to_name, gifted_to_email, claim_code, claim_status) VALUES (?, ?, ?, ?, ?)", (
        request.form.get("nft_title", ""),
        request.form.get("gifted_to_name", ""),
        request.form.get("gifted_to_email", ""),
        claim_code,
        "gifted",
    ))
    conn.commit()
    conn.close()
    return shell("Gift Created", f'<div class="hero"><h1>Gift Created</h1><p>Claim Code: <strong>{claim_code}</strong></p><a href="/birthday-nft-gift-center">Back</a></div>')

@app.route("/claim-birthday-gift", methods=["POST"])
def claim_birthday_gift():
    claim_code = request.form.get("claim_code", "")
    conn = db()
    cur = conn.cursor()
    cur.execute("UPDATE birthday_gifts SET claim_status='claimed' WHERE claim_code=?", (claim_code,))
    conn.commit()
    conn.close()
    return shell("Gift Claimed", f'<div class="hero"><h1>Gift Claimed</h1><p>Claim Code: <strong>{claim_code}</strong></p><a href="/birthday-nft-gift-center">Back</a></div>')

@app.route("/api/birthday-nft-gifts")
def api_birthday_nft_gifts():
    conn = db()
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM birthday_gifts ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/shows-demo")
def shows_demo():
    return shell("Shows Demo", """
    <div class="hero"><h1>Shows Demo</h1><p>Tap a show to watch a demo page.</p></div>
    <div class="grid">
      <div class="card"><h2>Heirs Launch Show</h2><a href="/watch-show/1">Watch</a></div>
      <div class="card"><h2>Holo Stream Spotlight</h2><a href="/watch-show/2">Watch</a></div>
      <div class="card"><h2>Bloom Wellness</h2><a href="/watch-show/3">Watch</a></div>
      <div class="card"><h2>Big Al Records</h2><a href="/watch-show/4">Watch</a></div>
    </div>
    """)

@app.route("/watch-show/<int:show_id>")
def watch_show(show_id):
    return shell("Watch Show", f'<div class="hero"><h1>Now Watching</h1><p>Show ID: {show_id}</p></div><div class="card"><h2>Video Player Demo</h2><a href="/shows-demo">Back to Shows</a></div>')

@app.route("/music-demo")
def music_demo():
    return shell("Music Demo", """
    <div class="hero"><h1>Music Demo</h1><p>Tap a track to open the player demo.</p></div>
    <div class="grid">
      <div class="card"><h2>Rise In Sound</h2><a href="/play-track/1">Play</a></div>
      <div class="card"><h2>Platform Anthem</h2><a href="/play-track/2">Play</a></div>
      <div class="card"><h2>Lifted Voices</h2><a href="/play-track/3">Play</a></div>
      <div class="card"><h2>Night Drive Mix</h2><a href="/play-track/4">Play</a></div>
    </div>
    """)

@app.route("/play-track/<int:track_id>")
def play_track(track_id):
    return shell("Play Track", f'<div class="hero"><h1>Now Playing</h1><p>Track ID: {track_id}</p></div><div class="card"><h2>Audio Player Demo</h2><a href="/music-demo">Back to Music</a></div>')

@app.route("/music-coaching-home")
def music_coaching_home():
    return shell("Music Coaching", """
    <div class="hero"><h1>Music Coaching</h1><p>Submit a coaching request.</p></div>
    <div class="card">
      <form method="post" action="/submit-coaching">
        <input name="student_name" placeholder="Student Name">
        <input name="email" placeholder="Email">
        <input name="goal" placeholder="Goal">
        <input name="session_type" placeholder="Session Type">
        <textarea name="notes">Music coaching request</textarea>
        <button type="submit">Submit</button>
      </form>
    </div>
    """)

@app.route("/submit-coaching", methods=["POST"])
def submit_coaching():
    conn = db()
    cur = conn.cursor()
    cur.execute("INSERT INTO coaching (student_name, email, goal, session_type, notes) VALUES (?, ?, ?, ?, ?)", (
        request.form.get("student_name", ""),
        request.form.get("email", ""),
        request.form.get("goal", ""),
        request.form.get("session_type", ""),
        request.form.get("notes", ""),
    ))
    conn.commit()
    conn.close()
    return shell("Coaching Submitted", '<div class="hero"><h1>Submitted</h1><a href="/music-coaching-home">Back</a></div>')

@app.route("/artist-signing-home")
def artist_signing_home():
    return shell("Artist Signing", """
    <div class="hero"><h1>Artist Signing</h1><p>Submit an artist intake request.</p></div>
    <div class="card">
      <form method="post" action="/submit-artist-signing">
        <input name="artist_name" placeholder="Artist Name">
        <input name="email" placeholder="Email">
        <input name="style_name" placeholder="Style / Genre">
        <input name="current_stage" placeholder="Current Stage">
        <textarea name="notes">Artist signing intake</textarea>
        <button type="submit">Submit</button>
      </form>
    </div>
    """)

@app.route("/submit-artist-signing", methods=["POST"])
def submit_artist_signing():
    conn = db()
    cur = conn.cursor()
    cur.execute("INSERT INTO signing (artist_name, email, style_name, current_stage, notes) VALUES (?, ?, ?, ?, ?)", (
        request.form.get("artist_name", ""),
        request.form.get("email", ""),
        request.form.get("style_name", ""),
        request.form.get("current_stage", ""),
        request.form.get("notes", ""),
    ))
    conn.commit()
    conn.close()
    return shell("Artist Intake Submitted", '<div class="hero"><h1>Submitted</h1><a href="/artist-signing-home">Back</a></div>')

@app.route("/omni-care-360")
def omni_care_360():
    return shell("Omni Care 360", """
    <div class="hero"><h1>Omni Care 360</h1><p>Family care dashboard with prescription and insurance management shells.</p></div>
    <div class="grid">
      <div class="card"><h2>Care Profiles</h2><a href="/omni-care-profiles">Open</a></div>
      <div class="card"><h2>Prescriptions</h2><a href="/omni-prescriptions">Open</a></div>
      <div class="card"><h2>Insurance</h2><a href="/omni-insurance">Open</a></div>
    </div>
    """)

@app.route("/omni-care-profiles", methods=["GET", "POST"])
def omni_care_profiles():
    if request.method == "POST":
        conn = db()
        cur = conn.cursor()
        cur.execute("INSERT INTO care_profiles (person_name, care_level, insurance_plan, pharmacy_name, notes) VALUES (?, ?, ?, ?, ?)", (
            request.form.get("person_name", ""),
            request.form.get("care_level", ""),
            request.form.get("insurance_plan", ""),
            request.form.get("pharmacy_name", ""),
            request.form.get("notes", ""),
        ))
        conn.commit()
        conn.close()
    return shell("Care Profiles", """
    <div class="hero"><h1>Care Profiles</h1><p>Create family care profiles.</p></div>
    <div class="card">
      <form method="post">
        <input name="person_name" placeholder="Person Name">
        <input name="care_level" placeholder="Care Level">
        <input name="insurance_plan" placeholder="Insurance Plan">
        <input name="pharmacy_name" placeholder="Pharmacy Name">
        <textarea name="notes">Care notes</textarea>
        <button type="submit">Save Profile</button>
      </form>
    </div>
    """)

@app.route("/omni-prescriptions", methods=["GET", "POST"])
def omni_prescriptions():
    if request.method == "POST":
        conn = db()
        cur = conn.cursor()
        cur.execute("INSERT INTO prescriptions (person_name, medication_name, dosage, refill_date, pharmacy_name, notes) VALUES (?, ?, ?, ?, ?, ?)", (
            request.form.get("person_name", ""),
            request.form.get("medication_name", ""),
            request.form.get("dosage", ""),
            request.form.get("refill_date", ""),
            request.form.get("pharmacy_name", ""),
            request.form.get("notes", ""),
        ))
        conn.commit()
        conn.close()
    return shell("Prescriptions", """
    <div class="hero"><h1>Prescriptions</h1><p>Track medication and refill information.</p></div>
    <div class="card">
      <form method="post">
        <input name="person_name" placeholder="Person Name">
        <input name="medication_name" placeholder="Medication Name">
        <input name="dosage" placeholder="Dosage">
        <input name="refill_date" placeholder="Refill Date">
        <input name="pharmacy_name" placeholder="Pharmacy Name">
        <textarea name="notes">Prescription notes</textarea>
        <button type="submit">Save Prescription</button>
      </form>
    </div>
    """)

@app.route("/omni-insurance", methods=["GET", "POST"])
def omni_insurance():
    if request.method == "POST":
        conn = db()
        cur = conn.cursor()
        cur.execute("INSERT INTO insurance_items (person_name, provider_name, member_id, group_number, plan_type, notes) VALUES (?, ?, ?, ?, ?, ?)", (
            request.form.get("person_name", ""),
            request.form.get("provider_name", ""),
            request.form.get("member_id", ""),
            request.form.get("group_number", ""),
            request.form.get("plan_type", ""),
            request.form.get("notes", ""),
        ))
        conn.commit()
        conn.close()
    return shell("Insurance", """
    <div class="hero"><h1>Insurance</h1><p>Track insurance plan details and member information.</p></div>
    <div class="card">
      <form method="post">
        <input name="person_name" placeholder="Person Name">
        <input name="provider_name" placeholder="Provider Name">
        <input name="member_id" placeholder="Member ID">
        <input name="group_number" placeholder="Group Number">
        <input name="plan_type" placeholder="Plan Type">
        <textarea name="notes">Insurance notes</textarea>
        <button type="submit">Save Insurance</button>
      </form>
    </div>
    """)

@app.route("/holoverse-lobby-v2")
def holoverse_lobby_v2():
    return shell("Holoverse Lobby", """
    <div class="hero"><h1>Holoverse Lobby</h1><p>World-based entry into app actions.</p></div>
    <div class="grid">
      <div class="card"><h2>Marketplace</h2><a href="/world/Marketplace">Enter</a></div>
      <div class="card"><h2>Streaming Studio</h2><a href="/world/Streaming Studio">Enter</a></div>
      <div class="card"><h2>Creator Arena</h2><a href="/world/Creator Arena">Enter</a></div>
      <div class="card"><h2>University</h2><a href="/world/University">Enter</a></div>
      <div class="card"><h2>Armed Forces Command</h2><a href="/world/Armed Forces Command">Enter</a></div>
      <div class="card"><h2>Nigeria Hub</h2><a href="/world/Nigeria Hub">Enter</a></div>
      <div class="card"><h2>UK Hub</h2><a href="/world/UK Hub">Enter</a></div>
    </div>
    """)

@app.route("/world/<path:world_name>")
def holoverse_world_page(world_name):
    action_map = {
        "Marketplace": [("Browse Drops", "/holo-commerce-home"), ("Open Creator Tools", "/artist-signing-home")],
        "Streaming Studio": [("Watch Shows", "/shows-demo"), ("Play Music", "/music-demo"), ("Open Coaching", "/music-coaching-home")],
        "Creator Arena": [("Artist Signing", "/artist-signing-home"), ("Go Home", "/family-launch-home")],
        "University": [("Open Learning", "/family-launch-home")],
        "Armed Forces Command": [("Open Service Center", "/family-launch-home")],
        "Nigeria Hub": [("Regional Hub", "/family-launch-home")],
        "UK Hub": [("Regional Hub", "/family-launch-home")],
    }
    cards = ""
    for title, href in action_map.get(world_name, []):
        cards += f'<div class="card"><h2>{title}</h2><a href="{href}">Open</a></div>'
    return shell(world_name, f'<div class="hero"><h1>{world_name}</h1><p>World actions are connected.</p><a href="/holoverse-lobby-v2">Back to Holoverse</a></div><div class="grid">{cards if cards else "<div class=\"card\"><h2>No actions yet</h2></div>"}</div>')

@app.route("/holo-commerce-home")
def holo_commerce_home():
    return shell("Holo Commerce", """
    <div class="hero"><h1>Holo Commerce</h1><p>Commerce shell with drops and discovery.</p></


cd ~/marketplace || exit 1

cat > app_rescue.py <<'PY'
from flask import Flask, request
app = Flask(__name__)

GIFTS = []
CARE = []
RX = []
INS = []

def page(title, body):
    return f"""<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title}</title>
<style>
body{{margin:0;font-family:Arial;background:linear-gradient(180deg,#04070c,#0f172a);color:#fff}}
.top{{padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.08);background:rgba(5,7,11,.8);position:sticky;top:0}}
.top a{{color:#fff;text-decoration:none;margin-right:10px;padding:8px 12px;background:#2563eb;border-radius:10px;display:inline-block}}
.wrap{{max-width:1100px;margin:0 auto;padding:20px}}
.hero,.card{{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:18px}}
.hero{{margin-bottom:16px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}}
.card a,button{{display:inline-block;background:#2563eb;color:#fff;text-decoration:none;border:none;border-radius:10px;padding:10px 12px}}
input,textarea{{width:100%;margin:8px 0;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:#fff}}
p{{color:#cbd5e1}}
pre{{white-space:pre-wrap}}
</style></head><body>
<div class="top">
<a href="/family-launch-home">Home</a>
<a href="/birthday-center">Birthday</a>
<a href="/birthday-nft-gift-center">NFT Gift</a>
<a href="/shows-demo">Shows</a>
<a href="/music-demo">Music</a>
<a href="/omni-care-360">Omni Care 360</a>
<a href="/holoverse-lobby-v2">Holoverse</a>
</div>
<div class="wrap">{body}</div></body></html>"""

@app.route("/")
@app.route("/family-launch-home")
def home():
    return page("Family Launch Home", """
    <div class="hero"><h1>Family Launch Home</h1><p>Stable rescue version for today.</p></div>
    <div class="grid">
      <div class="card"><h2>Birthday Center</h2><a href="/birthday-center">Open</a></div>
      <div class="card"><h2>NFT Gift Center</h2><a href="/birthday-nft-gift-center">Open</a></div>
      <div class="card"><h2>Shows</h2><a href="/shows-demo">Open</a></div>
      <div class="card"><h2>Music</h2><a href="/music-demo">Open</a></div>
      <div class="card"><h2>Omni Care 360</h2><a href="/omni-care-360">Open</a></div>
      <div class="card"><h2>Holoverse</h2><a href="/holoverse-lobby-v2">Open</a></div>
    </div>
    """)

@app.route("/birthday-center")
def birthday():
    return page("Birthday Center", """
    <div class="hero"><h1>Birthday Center</h1><p>Happy Birthday Aniyah. Alton Kevon countdown: 3 days.</p></div>
    <div class="grid">
      <div class="card"><h2>Aniyah Birthday Page</h2><a href="/happy-birthday-aniyah">Open</a></div>
      <div class="card"><h2>Alton Kevon Countdown</h2><a href="/countdown-alton-kevon">Open</a></div>
      <div class="card"><h2>Birthday NFT Gallery</h2><a href="/birthday-nft-gallery">Open</a></div>
    </div>
    """)

@app.route("/happy-birthday-aniyah")
def hba():
    return page("Happy Birthday Aniyah", '<div class="hero"><h1>Happy Birthday Aniyah</h1><p>Your birthday spotlight is live.</p></div>')

@app.route("/countdown-alton-kevon")
def cak():
    return page("Countdown Alton Kevon", '<div class="hero"><h1>3 Days Until Alton Kevon\\'s Birthday</h1></div>')

@app.route("/birthday-nft-gallery")
def nft_gallery():
    return page("Birthday NFT Gallery", '<div class="grid"><div class="card"><h2>Happy Birthday Aniyah NFT</h2><p>Edition 1/1 concept.</p></div><div class="card"><h2>Happy Birthday Alton Kevon NFT</h2><p>Edition 1/1 concept.</p></div></div>')

@app.route("/birthday-nft-gift-center", methods=["GET","POST"])
def gift_center():
    msg = ""
    if request.method == "POST":
        code = f"BDAY-{len(GIFTS)+1:04d}"
        GIFTS.append({"name": request.form.get("gifted_to_name",""), "email": request.form.get("gifted_to_email",""), "code": code})
        msg = f"<p>Gift code created: <strong>{code}</strong></p>"
    return page("Birthday NFT Gift Center", f"""
    <div class="hero"><h1>Birthday NFT Gift Center</h1>{msg}<p>Create a gift pass for a friend.</p></div>
    <div class="grid">
      <div class="card">
        <form method="post">
          <input name="gifted_to_name" placeholder="Friend Name">
          <input name="gifted_to_email" placeholder="Friend Email">
          <button type="submit">Create Gift</button>
        </form>
      </div>
      <div class="card"><h2>Gift Records</h2><pre>{GIFTS}</pre></div>
    </div>
    """)

@app.route("/shows-demo")
def shows():
    return page("Shows Demo", """
    <div class="hero"><h1>Shows Demo</h1></div>
    <div class="grid">
      <div class="card"><h2>Heirs Launch Show</h2><a href="/watch-show/1">Watch</a></div>
      <div class="card"><h2>Holo Stream Spotlight</h2><a href="/watch-show/2">Watch</a></div>
    </div>
    """)

@app.route("/watch-show/<int:show_id>")
def watch(show_id):
    return page("Watch Show", f'<div class="hero"><h1>Now Watching</h1><p>Show ID: {show_id}</p></div><div class="card"><a href="/shows-demo">Back to Shows</a></div>')

@app.route("/music-demo")
def music():
    return page("Music Demo", """
    <div class="hero"><h1>Music Demo</h1></div>
    <div class="grid">
      <div class="card"><h2>Rise In Sound</h2><a href="/play-track/1">Play</a></div>
      <div class="card"><h2>Platform Anthem</h2><a href="/play-track/2">Play</a></div>
    </div>
    """)

@app.route("/play-track/<int:track_id>")
def play(track_id):
    return page("Play Track", f'<div class="hero"><h1>Now Playing</h1><p>Track ID: {track_id}</p></div><div class="card"><a href="/music-demo">Back to Music</a></div>')

@app.route("/omni-care-360")
def omni():
    return page("Omni Care 360", """
    <div class="hero"><h1>Omni Care 360</h1><p>Family care dashboard with prescription and insurance shells.</p></div>
    <div class="grid">
      <div class="card"><h2>Care Profiles</h2><a href="/omni-care-profiles">Open</a></div>
      <div class="card"><h2>Prescriptions</h2><a href="/omni-prescriptions">Open</a></div>
      <div class="card"><h2>Insurance</h2><a href="/omni-insurance">Open</a></div>
    </div>
    """)

@app.route("/omni-care-profiles", methods=["GET","POST"])
def care_profiles():
    if request.method == "POST":
        CARE.append(request.form.to_dict())
    return page("Care Profiles", f"""
    <div class="hero"><h1>Care Profiles</h1></div>
    <div class="grid">
      <div class="card">
        <form method="post">
          <input name="person_name" placeholder="Person Name">
          <input name="care_level" placeholder="Care Level">
          <input name="insurance_plan" placeholder="Insurance Plan">
          <input name="pharmacy_name" placeholder="Pharmacy Name">
          <textarea name="notes">Care notes</textarea>
          <button type="submit">Save Profile</button>
        </form>
      </div>
      <div class="card"><pre>{CARE}</pre></div>
    </div>
    """)

@app.route("/omni-prescriptions", methods=["GET","POST"])
def prescriptions():
    if request.method == "POST":
        RX.append(request.form.to_dict())
    return page("Prescriptions", f"""
    <div class="hero"><h1>Prescriptions</h1></div>
    <div class="grid">
      <div class="card">
        <form method="post">
          <input name="person_name" placeholder="Person Name">
          <input name="medication_name" placeholder="Medication Name">
          <input name="dosage" placeholder="Dosage">
          <input name="refill_date" placeholder="Refill Date">
          <input name="pharmacy_name" placeholder="Pharmacy Name">
          <textarea name="notes">Prescription notes</textarea>
          <button type="submit">Save Prescription</button>
        </form>
      </div>
      <div class="card"><pre>{RX}</pre></div>
    </div>
    """)

@app.route("/omni-insurance", methods=["GET","POST"])
def insurance():
    if request.method == "POST":
        INS.append(request.form.to_dict())
    return page("Insurance", f"""
    <div class="hero"><h1>Insurance</h1></div>
    <div class="grid">
      <div class="card">
        <form method="post">
          <input name="person_name" placeholder="Person Name">
          <input name="provider_name" placeholder="Provider Name">
          <input name="member_id" placeholder="Member ID">
          <input name="group_number" placeholder="Group Number">
          <input name="plan_type" placeholder="Plan Type">
          <textarea name="notes">Insurance notes</textarea>
          <button type="submit">Save Insurance</button>
        </form>
      </div>
      <div class="card"><pre>{INS}</pre></div>
    </div>
    """)

@app.route("/holoverse-lobby-v2")
def holo():
    return page("Holoverse Lobby", """
    <div class="hero"><h1>Holoverse Lobby</h1><p>World-based entry into app actions.</p></div>
    <div class="grid">
      <div class="card"><h2>Marketplace</h2><a href="/world/Marketplace">Enter</a></div>
      <div class="card"><h2>Streaming Studio</h2><a href="/world/Streaming Studio">Enter</a></div>
      <div class="card"><h2>Creator Arena</h2><a href="/world/Creator Arena">Enter</a></div>
    </div>
    """)

@app.route("/world/<path:world_name>")
def world(world_name):
    links = {
        "Marketplace": [("Browse Drops", "/family-launch-home"), ("Open Creator Tools", "/artist-signing-home")],
        "Streaming Studio": [("Watch Shows", "/shows-demo"), ("Play Music", "/music-demo"), ("Open Coaching", "/music-coaching-home")],
        "Creator Arena": [("Artist Signing", "/artist-signing-home"), ("Go Home", "/family-launch-home")],
    }
    cards = "".join([f'<div class="card"><h2>{t}</h2><a href="{u}">Open</a></div>' for t,u in links.get(world_name, [])])
    return page(world_name, f'<div class="hero"><h1>{world_name}</h1><p>World actions are connected.</p><a href="/holoverse-lobby-v2">Back to Holoverse</a></div><div class="grid">{cards}</div>')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
