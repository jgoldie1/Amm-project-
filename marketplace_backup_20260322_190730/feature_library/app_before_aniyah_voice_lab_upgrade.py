from flask import Flask, Response, request, redirect
import os, json, uuid, datetime

app = Flask(__name__)

BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
os.makedirs(DATA, exist_ok=True)

CHAT_FILE = os.path.join(DATA, "live_chat.json")
SCHEDULE_FILE = os.path.join(DATA, "stream_schedule.json")
REPLAY_FILE = os.path.join(DATA, "replay_archive.json")

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
    if not os.path.exists(SCHEDULE_FILE):
        save_json(SCHEDULE_FILE, [
            {"title": "Sunday Service", "host": "Kofi Ofri Ministries", "time": "Sunday 10:00 AM", "type": "Ministry"},
            {"title": "Bible Study Live", "host": "Servants of Christ", "time": "Wednesday 7:00 PM", "type": "Teaching"},
            {"title": "Creator Spotlight", "host": "Streaming Ecosystem", "time": "Friday 8:00 PM", "type": "Creator"}
        ])
    if not os.path.exists(REPLAY_FILE):
        save_json(REPLAY_FILE, [
            {"title": "Faith Message Replay", "host": "Kofi Ofri Ministries", "type": "Ministry Replay"},
            {"title": "Music Distribution Replay", "host": "El Saturn Records", "type": "Creator Replay"},
            {"title": "Streaming Ecosystem Replay", "host": "Streaming Network Omni", "type": "Platform Replay"}
        ])
    if not os.path.exists(CHAT_FILE):
        save_json(CHAT_FILE, [])

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
        <title>All American Marketplace</title>
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
            input, textarea {{
                width:90%;
                max-width:760px;
                padding:16px;
                margin:10px auto;
                display:block;
                border-radius:12px;
                border:1px solid #64748b;
                font-size:18px;
            }}
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
    return page("Live Engagement Upgrade", """
    <div class="navbox">
        <h3>Streaming Navigation</h3>
    """ +
    btn("Live Streaming", "/live-streaming", "btn btn2") +
    btn("Ministry Live", "/ministry-live", "btn btn3") +
    btn("Holographic Gift", "/holographic-gift", "btn btn4") +
    btn("Live Chat", "/live-chat", "btn btn5") +
    btn("Viewer Count", "/viewer-count", "btn btn6") +
    btn("Stream Schedule", "/stream-schedule", "btn") +
    btn("Replay Archive", "/replay-archive", "btn btn2") +
    btn("Creator / Ministry Stream Hub", "/stream-hub", "btn btn3") +
    """
    </div>
    """ + section("What This Adds", [
        "Live chat shell",
        "Viewer count shell",
        "Stream scheduling",
        "Replay archive",
        "Unified stream hub"
    ]))

@app.route("/live-streaming")
def live_streaming():
    return page("Live Streaming", (
        section("Live Streaming", [
            "Real-time video broadcast direction",
            "Live sermons, classes, concerts, and events",
            "Creator and ministry broadcast support",
            "Audience engagement and future replay library",
            "Streaming ecosystem integration"
        ]) +
        section("What This Does", [
            "Adds real-time broadcast capability direction",
            "Supports growth, outreach, teaching, and creator engagement",
            "Connects ministry and media into one live experience"
        ])
    ))

@app.route("/ministry-live")
def ministry_live():
    return page("Ministry Live", (
        section("Ministry Live", [
            "Live church services direction",
            "Live Bible study and prayer streams",
            "Live conferences and outreach sessions",
            "Future live audience participation layer"
        ]) +
        section("What This Does", [
            "Creates a live ministry channel inside the ecosystem",
            "Supports real-time faith engagement and expansion"
        ])
    ))

@app.route("/holographic-gift")
def holographic_gift():
    return page("Holographic Gift", (
        section("Holographic Gift", [
            "Digital support gifts during live sessions",
            "Celebration gifts for creators, ministry, and events",
            "Future tip, honor, and support layer",
            "Streaming and finance integration direction"
        ]) +
        section("What This Does", [
            "Creates interactive gifting during streams and events",
            "Supports audience participation and future monetization",
            "Connects live media to support and giving pathways"
        ])
    ))

@app.route("/live-chat", methods=["GET", "POST"])
def live_chat():
    chat = load_json(CHAT_FILE, [])
    if request.method == "POST":
        name = request.form.get("name", "").strip() or "Guest"
        message = request.form.get("message", "").strip() or "No message"
        chat.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "message": message,
            "time": now()
        })
        save_json(CHAT_FILE, chat[-200:])
        return redirect("/live-chat")

    html = """
    <div class="card">
        <form method="post">
            <input name="name" placeholder="Name">
            <textarea name="message" placeholder="Send chat message"></textarea>
            <button class="btn btn2" type="submit">Send Message</button>
        </form>
    </div>
    """
    for item in reversed(chat[-50:]):
        html += f"<div class='card'><p><strong>{item['name']}</strong></p><p>{item['message']}</p><p><small>{item['time']}</small></p></div>"
    return page("Live Chat", html)

@app.route("/viewer-count")
def viewer_count():
    return page("Viewer Count", (
        section("Viewer Count", [
            "Current live viewers: 127",
            "Ministry Live viewers: 54",
            "Creator / Music viewers: 39",
            "Teaching / Study viewers: 34"
        ]) +
        section("What This Does", [
            "Creates social proof for streams",
            "Helps hosts track attention and reach",
            "Prepares the platform for live analytics"
        ])
    ))

@app.route("/stream-schedule", methods=["GET", "POST"])
def stream_schedule():
    schedule = load_json(SCHEDULE_FILE, [])
    if request.method == "POST":
        schedule.append({
            "title": request.form.get("title", "").strip() or "Untitled Stream",
            "host": request.form.get("host", "").strip() or "Unknown Host",
            "time": request.form.get("time", "").strip() or "TBD",
            "type": request.form.get("type", "").strip() or "General"
        })
        save_json(SCHEDULE_FILE, schedule)
        return redirect("/stream-schedule")

    html = """
    <div class="card">
        <form method="post">
            <input name="title" placeholder="Stream title">
            <input name="host" placeholder="Host">
            <input name="time" placeholder="Time">
            <input name="type" placeholder="Type">
            <button class="btn btn2" type="submit">Add Stream</button>
        </form>
    </div>
    """
    for item in schedule:
        html += f"<div class='card'><p><strong>{item['title']}</strong></p><p>{item['host']} | {item['time']} | {item['type']}</p></div>"
    return page("Stream Schedule", html)

@app.route("/replay-archive", methods=["GET", "POST"])
def replay_archive():
    replays = load_json(REPLAY_FILE, [])
    if request.method == "POST":
        replays.append({
            "title": request.form.get("title", "").strip() or "Untitled Replay",
            "host": request.form.get("host", "").strip() or "Unknown Host",
            "type": request.form.get("type", "").strip() or "Replay"
        })
        save_json(REPLAY_FILE, replays)
        return redirect("/replay-archive")

    html = """
    <div class="card">
        <form method="post">
            <input name="title" placeholder="Replay title">
            <input name="host" placeholder="Host">
            <input name="type" placeholder="Type">
            <button class="btn btn2" type="submit">Add Replay</button>
        </form>
    </div>
    """
    for item in replays:
        html += f"<div class='card'><p><strong>{item['title']}</strong></p><p>{item['host']} | {item['type']}</p></div>"
    return page("Replay Archive", html)

@app.route("/stream-hub")
def stream_hub():
    return page("Creator / Ministry Stream Hub", (
        section("Unified Stream Hub", [
            "Live Streaming",
            "Ministry Live",
            "Live Chat",
            "Viewer Count",
            "Stream Schedule",
            "Replay Archive",
            "Holographic Gift"
        ]) +
        section("What This Does", [
            "Combines creator and ministry streaming into one hub",
            "Makes the media side of the platform feel more complete",
            "Prepares for future subscriptions, gifts, and live events"
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
