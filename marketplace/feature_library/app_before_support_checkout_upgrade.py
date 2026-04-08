from flask import Flask, Response, request, redirect
import os, json, uuid, datetime

app = Flask(__name__)

BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
os.makedirs(DATA, exist_ok=True)

VOICE_NOTES_FILE = os.path.join(DATA, "aniyah_voice_notes.json")
SONG_PROJECTS_FILE = os.path.join(DATA, "aniyah_song_projects.json")

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
    if not os.path.exists(VOICE_NOTES_FILE):
        save_json(VOICE_NOTES_FILE, [])
    if not os.path.exists(SONG_PROJECTS_FILE):
        save_json(SONG_PROJECTS_FILE, [
            {
                "title": "Aniyah Debut Project",
                "stage": "idea",
                "notes": "Starter album concept and voice development direction"
            }
        ])

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
    return page("Aniyah Voice Lab Upgrade", """
    <div class="navbox">
        <h3>Creator Studio Navigation</h3>
    """ +
    btn("Aniyah Voice Coach", "/aniyah-voice-coach", "btn btn2") +
    btn("AI Voice Assistant", "/ai-voice-assistant", "btn btn3") +
    btn("Band Lab", "/band-lab", "btn btn4") +
    btn("Guitar Lab", "/guitar-lab", "btn btn5") +
    btn("Recording Studio", "/recording-studio", "btn btn6") +
    btn("Song Projects", "/song-projects", "btn") +
    btn("AI Mix Assistant", "/ai-mix-assistant", "btn btn2") +
    btn("Album Producer", "/album-producer", "btn btn3") +
    btn("Music Distribution", "/music-distribution", "btn btn4") +
    btn("El Saturn Records", "/el-saturn-records", "btn btn5") +
    btn("Spectra ENT Records", "/spectra-ent-records", "btn btn6") +
    btn("Health", "/health", "btn") +
    """
    </div>
    """ + section("What This Adds", [
        "Aniyah Voice Coach upgraded into a creator studio shell",
        "AI assistant for vocal practice and recording support",
        "Band Lab and Guitar Lab modules",
        "Recording, editing, AI mixing, and album workflow",
        "Connection to records and music distribution"
    ]))

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
            "Now connects into AI Voice Assistant",
            "Now connects into Band Lab and Guitar Lab",
            "Now supports recording and album workflow"
        ])
    ))

@app.route("/ai-voice-assistant", methods=["GET", "POST"])
def ai_voice_assistant():
    notes = load_json(VOICE_NOTES_FILE, [])
    if request.method == "POST":
        notes.append({
            "id": str(uuid.uuid4()),
            "title": request.form.get("title", "").strip() or "Voice Session",
            "note": request.form.get("note", "").strip() or "No note",
            "time": now()
        })
        save_json(VOICE_NOTES_FILE, notes)
        return redirect("/ai-voice-assistant")

    html = """
    <div class="card">
        <p>AI assistant shell for vocal lessons, session notes, coaching reminders, and recording prep.</p>
        <form method="post">
            <input name="title" placeholder="Session title">
            <textarea name="note" placeholder="Add vocal notes, AI coaching ideas, recording reminders"></textarea>
            <button class="btn btn2" type="submit">Save AI Voice Note</button>
        </form>
    </div>
    """
    for item in reversed(notes[-50:]):
        html += f"<div class='card'><p><strong>{item['title']}</strong></p><p>{item['note']}</p><p><small>{item['time']}</small></p></div>"
    return page("AI Voice Assistant", html)

@app.route("/band-lab")
def band_lab():
    return page("Band Lab", (
        section("Band Lab", [
            "Song building shell",
            "Arrangement planning",
            "Beat and instrumentation workflow",
            "Collaboration direction",
            "Draft session planning"
        ]) +
        section("What This Does", [
            "Creates the band and music arrangement workspace",
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
            "Song accompaniment direction",
            "Instrument arrangement planning"
        ]) +
        section("What This Does", [
            "Adds guitar-focused creation and learning support",
            "Connects instrumentation to recording and production"
        ])
    ))

@app.route("/recording-studio")
def recording_studio():
    return page("Recording Studio", (
        section("Recording Studio", [
            "Track recording workflow",
            "Vocal session planning",
            "Retake and comping direction",
            "Editing shell",
            "Session organization"
        ]) +
        section("What This Does", [
            "Creates a recording workflow inside the app",
            "Moves the platform toward real creator production support"
        ])
    ))

@app.route("/song-projects", methods=["GET", "POST"])
def song_projects():
    projects = load_json(SONG_PROJECTS_FILE, [])
    if request.method == "POST":
        projects.append({
            "title": request.form.get("title", "").strip() or "Untitled Song Project",
            "stage": request.form.get("stage", "").strip() or "idea",
            "notes": request.form.get("notes", "").strip() or "No notes"
        })
        save_json(SONG_PROJECTS_FILE, projects)
        return redirect("/song-projects")

    html = """
    <div class="card">
        <form method="post">
            <input name="title" placeholder="Song or project title">
            <select name="stage">
                <option value="idea">Idea</option>
                <option value="writing">Writing</option>
                <option value="recording">Recording</option>
                <option value="editing">Editing</option>
                <option value="mixing">Mixing</option>
                <option value="release">Release</option>
            </select>
            <textarea name="notes" placeholder="Project notes"></textarea>
            <button class="btn btn2" type="submit">Add Song Project</button>
        </form>
    </div>
    """
    for item in reversed(projects):
        html += f"<div class='card'><p><strong>{item['title']}</strong></p><p>Stage: {item['stage']}</p><p>{item['notes']}</p></div>"
    return page("Song Projects", html)

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
            "Adds a visible AI mixing layer to the creator workflow",
            "Supports better production organization before final release"
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
            "Lets the app support full album production planning",
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

@app.route("/el-saturn-records")
def el_saturn_records():
    return page("El Saturn Records", (
        section("El Saturn Records", [
            "Music label network",
            "Artist publishing direction",
            "Concert and event planning",
            "Streaming ecosystem integration",
            "Creator economy support"
        ]) +
        section("What This Does", [
            "Creates the main music and media network",
            "Connects artists to streaming, concerts, and media"
        ])
    ))

@app.route("/spectra-ent-records")
def spectra_ent_records():
    return page("Spectra ENT Records", (
        section("Spectra ENT Records", [
            "Independent artist label",
            "Artist incubation and development",
            "Music production direction",
            "Brand development support",
            "Digital concert and event planning"
        ]) +
        section("What This Does", [
            "Acts as the artist launchpad in the ecosystem",
            "Develops talent and connects artists to release paths"
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
