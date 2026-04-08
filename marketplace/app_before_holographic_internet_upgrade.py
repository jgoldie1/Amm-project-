from flask import Flask, Response, request, redirect
import os, json, uuid, datetime

app = Flask(__name__)

BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
os.makedirs(DATA, exist_ok=True)

TRACKS_FILE = os.path.join(DATA, "track_manager.json")
LYRICS_FILE = os.path.join(DATA, "lyrics_writer.json")
BEATS_FILE = os.path.join(DATA, "beat_library.json")
RELEASES_FILE = os.path.join(DATA, "release_calendar.json")
SUPPORT_FILE = os.path.join(DATA, "support_checkout.json")

def load_json(path, default):
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return default
    return default

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def now():
    return str(datetime.datetime.now())

def ensure_defaults():
    if not os.path.exists(TRACKS_FILE):
        save_json(TRACKS_FILE, [
            {"title": "Starter Track", "stage": "idea", "notes": "First song concept"}
        ])
    if not os.path.exists(LYRICS_FILE):
        save_json(LYRICS_FILE, [
            {"title": "Hook Idea", "lyrics": "Write your hook here", "time": now()}
        ])
    if not os.path.exists(BEATS_FILE):
        save_json(BEATS_FILE, [
            {"title": "Ambient Beat Pack", "style": "ambient", "notes": "Starter beat collection"},
            {"title": "Gospel Drum Groove", "style": "gospel", "notes": "Live praise rhythm direction"},
            {"title": "R&B Soul Pocket", "style": "rnb", "notes": "Smooth vocal support beat"}
        ])
    if not os.path.exists(RELEASES_FILE):
        save_json(RELEASES_FILE, [
            {"title": "Aniyah Single", "date": "TBD", "type": "single"},
            {"title": "Ministry Live Replay Series", "date": "TBD", "type": "media"}
        ])
    if not os.path.exists(SUPPORT_FILE):
        save_json(SUPPORT_FILE, [])
ensure_defaults()

def section(title, items):
    rows = "".join(f"<li>{item}</li>" for item in items)
    return f'<div class="card"><h3>{title}</h3><ul>{rows}</ul></div>'

def btn(label, link, cls="btn"):
    return f'<a class="{cls}" href="{link}">{label}</a>'

def page(title, body):
    return f"""
    <html>
    <head>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>{title}</title>
        <style>
            body {{
                background:#0b1220;
                color:white;
                font-family:Arial,sans-serif;
                text-align:center;
                padding:16px;
                margin:0;
            }}
            .hero {{
                background:#182235;
                border:2px solid #334155;
                border-radius:18px;
                padding:24px;
                margin:16px auto;
                max-width:1100px;
            }}
            .card,.navbox {{
                background:#182235;
                border:2px solid #334155;
                border-radius:16px;
                padding:20px;
                margin:16px auto;
                max-width:1100px;
                text-align:left;
            }}
            .btn {{
                display:block;
                background:#0284c7;
                color:white;
                text-decoration:none;
                padding:18px;
                margin:12px auto;
                border-radius:14px;
                max-width:820px;
                font-weight:bold;
                font-size:20px;
                text-align:center;
            }}
            .btn2 {{ background:#16a34a; }}
            .btn3 {{ background:#7c3aed; }}
            .btn4 {{ background:#d97706; }}
            .btn5 {{ background:#dc2626; }}
            .btn6 {{ background:#0891b2; }}
            input, textarea, select {{
                width:90%;
                max-width:760px;
                padding:16px;
                margin:10px auto;
                display:block;
                border-radius:12px;
                border:1px solid #64748b;
                font-size:18px;
            }}
            textarea {{ min-height:140px; }}
            h1 {{ font-size:36px; margin:0 0 8px 0; }}
            h2,h3 {{ font-size:26px; }}
            p,li {{ font-size:20px; }}
            ul {{ padding-left:24px; margin:0; }}
            a {{ color:white; }}
        </style>
    </head>
    <body>
        <div class="hero">
            <h1>All American Marketplace</h1>
            <h2>{title}</h2>
        </div>
        {body}
    </body>
    </html>
    """

@app.route("/")
def home():
    return page("Creator Support + Artist Studio Upgrade", """
    <div class="navbox">
        <h3>Navigation</h3>
    """ +
    btn("Artist Dashboard", "/artist-dashboard", "btn btn2") +
    btn("Track Manager", "/track-manager", "btn btn3") +
    btn("Lyrics Writer", "/lyrics-writer", "btn btn4") +
    btn("Beat Library", "/beat-library", "btn btn5") +
    btn("Release Calendar", "/release-calendar", "btn btn6") +
    btn("Support Checkout", "/support-checkout", "btn") +
    btn("Ministry Giving Checkout", "/support/ministry", "btn btn2") +
    btn("Holographic Gift Checkout", "/support/holographic-gift", "btn btn3") +
    btn("Creator Support Checkout", "/support/creator", "btn btn4") +
    btn("Aniyah Voice Coach", "/aniyah-voice-coach", "btn btn5") +
    btn("AI Voice Assistant", "/ai-voice-assistant", "btn btn6") +
    btn("Band Lab", "/band-lab", "btn") +
    btn("Guitar Lab", "/guitar-lab", "btn btn2") +
    btn("Recording Studio", "/recording-studio", "btn btn3") +
    btn("AI Mix Assistant", "/ai-mix-assistant", "btn btn4") +
    btn("Album Producer", "/album-producer", "btn btn5") +
    btn("Music Distribution", "/music-distribution", "btn btn6") +
    btn("Health", "/health", "btn") +
    """
    </div>
    """ + section("What This Adds", [
        "Donation and support checkout shell",
        "Ministry giving support flow",
        "Holographic gift support flow",
        "Creator support flow",
        "Track manager",
        "Lyrics writer",
        "Beat library",
        "Release calendar",
        "Artist dashboard"
    ]))

@app.route("/artist-dashboard")
def artist_dashboard():
    tracks = load_json(TRACKS_FILE, [])
    lyrics = load_json(LYRICS_FILE, [])
    beats = load_json(BEATS_FILE, [])
    releases = load_json(RELEASES_FILE, [])
    supports = load_json(SUPPORT_FILE, [])
    return page("Artist Dashboard", (
        section("Artist Dashboard", [
            f"Tracks: {len(tracks)}",
            f"Lyrics Drafts: {len(lyrics)}",
            f"Beat Packs: {len(beats)}",
            f"Release Items: {len(releases)}",
            f"Support Entries: {len(supports)}"
        ]) +
        section("Artist Workflow", [
            "Write lyrics",
            "Choose beats",
            "Manage tracks",
            "Record and edit",
            "AI mix guidance",
            "Build album",
            "Schedule release",
            "Collect support"
        ])
    ))

@app.route("/track-manager", methods=["GET","POST"])
def track_manager():
    tracks = load_json(TRACKS_FILE, [])
    if request.method == "POST":
        tracks.append({
            "title": request.form.get("title","").strip() or "Untitled Track",
            "stage": request.form.get("stage","").strip() or "idea",
            "notes": request.form.get("notes","").strip() or "No notes"
        })
        save_json(TRACKS_FILE, tracks)
        return redirect("/track-manager")
    html = """
    <div class="card">
        <form method="post">
            <input name="title" placeholder="Track title">
            <select name="stage">
                <option value="idea">Idea</option>
                <option value="writing">Writing</option>
                <option value="recording">Recording</option>
                <option value="editing">Editing</option>
                <option value="mixing">Mixing</option>
                <option value="release">Release</option>
            </select>
            <textarea name="notes" placeholder="Track notes"></textarea>
            <button class="btn btn2" type="submit">Add Track</button>
        </form>
    </div>
    """
    for t in reversed(tracks):
        html += f"<div class='card'><p><strong>{t['title']}</strong></p><p>Stage: {t['stage']}</p><p>{t['notes']}</p></div>"
    return page("Track Manager", html)

@app.route("/lyrics-writer", methods=["GET","POST"])
def lyrics_writer():
    items = load_json(LYRICS_FILE, [])
    if request.method == "POST":
        items.append({
            "title": request.form.get("title","").strip() or "Untitled Lyrics",
            "lyrics": request.form.get("lyrics","").strip() or "",
            "time": now()
        })
        save_json(LYRICS_FILE, items)
        return redirect("/lyrics-writer")
    html = """
    <div class="card">
        <form method="post">
            <input name="title" placeholder="Song title or lyric title">
            <textarea name="lyrics" placeholder="Write your lyrics here"></textarea>
            <button class="btn btn2" type="submit">Save Lyrics</button>
        </form>
    </div>
    """
    for item in reversed(items[-50:]):
        html += f"<div class='card'><p><strong>{item['title']}</strong></p><p style='white-space:pre-wrap'>{item['lyrics']}</p><p><small>{item['time']}</small></p></div>"
    return page("Lyrics Writer", html)

@app.route("/beat-library", methods=["GET","POST"])
def beat_library():
    beats = load_json(BEATS_FILE, [])
    if request.method == "POST":
        beats.append({
            "title": request.form.get("title","").strip() or "Untitled Beat",
            "style": request.form.get("style","").strip() or "general",
            "notes": request.form.get("notes","").strip() or ""
        })
        save_json(BEATS_FILE, beats)
        return redirect("/beat-library")
    html = """
    <div class="card">
        <form method="post">
            <input name="title" placeholder="Beat title">
            <input name="style" placeholder="Style">
            <textarea name="notes" placeholder="Beat notes"></textarea>
            <button class="btn btn2" type="submit">Add Beat</button>
        </form>
    </div>
    """
    for beat in reversed(beats):
        html += f"<div class='card'><p><strong>{beat['title']}</strong></p><p>{beat['style']}</p><p>{beat['notes']}</p></div>"
    return page("Beat Library", html)

@app.route("/release-calendar", methods=["GET","POST"])
def release_calendar():
    items = load_json(RELEASES_FILE, [])
    if request.method == "POST":
        items.append({
            "title": request.form.get("title","").strip() or "Untitled Release",
            "date": request.form.get("date","").strip() or "TBD",
            "type": request.form.get("type","").strip() or "release"
        })
        save_json(RELEASES_FILE, items)
        return redirect("/release-calendar")
    html = """
    <div class="card">
        <form method="post">
            <input name="title" placeholder="Release title">
            <input name="date" placeholder="Release date">
            <input name="type" placeholder="single / album / replay / rollout">
            <button class="btn btn2" type="submit">Add Release</button>
        </form>
    </div>
    """
    for item in items:
        html += f"<div class='card'><p><strong>{item['title']}</strong></p><p>{item['date']} | {item['type']}</p></div>"
    return page("Release Calendar", html)

@app.route("/support-checkout", methods=["GET","POST"])
def support_checkout():
    supports = load_json(SUPPORT_FILE, [])
    if request.method == "POST":
        supports.append({
            "name": request.form.get("name","").strip() or "Anonymous",
            "support_type": request.form.get("support_type","").strip() or "general",
            "amount": request.form.get("amount","").strip() or "0",
            "message": request.form.get("message","").strip() or "",
            "time": now()
        })
        save_json(SUPPORT_FILE, supports)
        return redirect("/support-checkout")
    html = """
    <div class="card">
        <form method="post">
            <input name="name" placeholder="Name">
            <select name="support_type">
                <option value="general">General Support</option>
                <option value="ministry">Ministry Giving</option>
                <option value="holographic_gift">Holographic Gift</option>
                <option value="creator">Creator Support</option>
            </select>
            <input name="amount" placeholder="Amount">
            <textarea name="message" placeholder="Message"></textarea>
            <button class="btn btn2" type="submit">Submit Support Entry</button>
        </form>
    </div>
    """
    for item in reversed(supports[-50:]):
        html += f"<div class='card'><p><strong>{item['name']}</strong></p><p>{item['support_type']} | {item['amount']}</p><p>{item['message']}</p><p><small>{item['time']}</small></p></div>"
    return page("Support Checkout", html)

@app.route("/support/ministry")
def support_ministry():
    return page("Ministry Giving Checkout", (
        section("Ministry Giving Checkout", [
            "Faith giving support shell",
            "Donation direction for ministry broadcasts and outreach",
            "Future payment processor integration path"
        ]) +
        section("What This Does", [
            "Connects ministry support to checkout flow",
            "Supports outreach, events, and faith media growth"
        ])
    ))

@app.route("/support/holographic-gift")
def support_holographic_gift():
    return page("Holographic Gift Checkout", (
        section("Holographic Gift Checkout", [
            "Digital support gifts during streams",
            "Celebration gift support shell",
            "Future tip and honor path"
        ]) +
        section("What This Does", [
            "Supports live interaction during streams and events",
            "Connects audience energy to creator or ministry support"
        ])
    ))

@app.route("/support/creator")
def support_creator():
    return page("Creator Support Checkout", (
        section("Creator Support Checkout", [
            "Artist and creator support shell",
            "Future fan support path",
            "Project and album support direction"
        ]) +
        section("What This Does", [
            "Connects creator growth to direct support",
            "Supports music projects, releases, and production work"
        ])
    ))

@app.route("/aniyah-voice-coach")
def aniyah_voice_coach():
    return page("Aniyah Voice Coach", (
        section("Aniyah Voice Coach", [
            "Breath control lessons",
            "Pitch matching practice",
            "Range extension exercises",
            "Harmony coaching",
            "Genre and delivery training",
            "Performance confidence building"
        ]) +
        section("Upgraded Direction", [
            "Connects into AI Voice Assistant",
            "Connects into Band Lab and Guitar Lab",
            "Supports recording and album workflow"
        ])
    ))

@app.route("/ai-voice-assistant")
def ai_voice_assistant():
    return page("AI Voice Assistant", (
        section("AI Voice Assistant", [
            "Session notes",
            "AI coaching reminders",
            "Recording prep guidance",
            "Voice development support"
        ]) +
        section("What This Does", [
            "Acts as a vocal creation assistant inside the app",
            "Supports practice, prep, and workflow organization"
        ])
    ))

@app.route("/band-lab")
def band_lab():
    return page("Band Lab", (
        section("Band Lab", [
            "Song building shell",
            "Arrangement planning",
            "Beat and instrumentation workflow",
            "Collaboration direction"
        ]) +
        section("What This Does", [
            "Creates the band and arrangement workspace",
            "Supports song structure and production planning"
        ])
    ))

@app.route("/guitar-lab")
def guitar_lab():
    return page("Guitar Lab", (
        section("Guitar Lab", [
            "Chord progression workspace",
            "Riff and melody idea planning",
            "Practice workflow",
            "Instrument arrangement planning"
        ]) +
        section("What This Does", [
            "Adds guitar-focused creation support",
            "Connects instrumentation to recording and production"
        ])
    ))

@app.route("/recording-studio")
def recording_studio():
    return page("Recording Studio", (
        section("Recording Studio", [
            "Track recording workflow",
            "Vocal session planning",
            "Editing shell",
            "Session organization"
        ]) +
        section("What This Does", [
            "Creates a recording workflow inside the app",
            "Moves the platform toward creator production support"
        ])
    ))

@app.route("/ai-mix-assistant")
def ai_mix_assistant():
    return page("AI Mix Assistant", (
        section("AI Mix Assistant", [
            "Mix planning shell",
            "Vocal and instrumental balance direction",
            "Reference mix notes",
            "Mastering preparation",
            "AI-assisted production guidance"
        ]) +
        section("What This Does", [
            "Adds a visible AI mixing layer",
            "Supports better production organization before release"
        ])
    ))

@app.route("/album-producer")
def album_producer():
    return page("Album Producer", (
        section("Album Producer", [
            "Album concept planning",
            "Track list organization",
            "Recording schedule direction",
            "Mix and release workflow",
            "Visual and branding planning"
        ]) +
        section("What This Does", [
            "Supports full album production planning",
            "Connects lessons, recording, mixing, and release into one path"
        ])
    ))

@app.route("/music-distribution")
def music_distribution():
    return page("Music Distribution", (
        section("Music Distribution", [
            "Streaming ecosystem distribution",
            "Digital album releases",
            "Music licensing direction",
            "Content monetization",
            "Global creator reach"
        ]) +
        section("What This Does", [
            "Distributes music through the platform network",
            "Supports artist revenue and release planning"
        ])
    ))

@app.route("/health")
def health():
    return "OK"

@app.route("/favicon.ico")
def fav():
    return Response(status=204)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
