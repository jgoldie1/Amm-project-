from flask import Flask, Response
import os

app = Flask(__name__)

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
            .box {{
                background:#182235;
                border:2px solid #334155;
                border-radius:16px;
                padding:20px;
                margin:16px auto;
                max-width:920px;
            }}
            .btn {{
                display:block;
                background:#0284c7;
                color:white;
                text-decoration:none;
                padding:18px;
                margin:12px auto;
                border-radius:14px;
                max-width:520px;
                font-weight:bold;
                font-size:20px;
            }}
        </style>
    </head>
    <body>
        <div class="box">
            <h1>All American Marketplace</h1>
            <p>{title}</p>
        </div>
        {body}
        <div class="box">
            <a class="btn" href="/">Home</a>
            <a class="btn" href="/dashboard">Dashboard</a>
            <a class="btn" href="/modules">Module Inventory</a>
            <a class="btn" href="/assistant-center">Assistant Center</a>
        <a class="btn btn5" href="/assistant-chat">Assistant Chat</a>
        <a class="btn btn3" href="/health">Health</a>
        </div>
    </body>
    </html>
    """

@app.route("/")
def home():
    return page("Recovered Local Shell", """
    <div class="box">
        <p>Server is working.</p>
        <p>This is the stable checkpoint page.</p>
    </div>
    """)

@app.route("/dashboard")
def dashboard():
    return page("Dashboard", """
    <div class="box">
        <p>Marketplace</p>
        <p>Streaming Ecosystem</p>
        <p>Quantum Speed Accelerator</p>
        <p>Quantum Lag Buster</p>
        <p>Omniverse 360 Insurance</p>
        <p>Aniyah App</p>
        <p>Cross Border</p>
        <p>FinBank</p>
        <p>Holoverse</p>
        <p>Cyber Security</p>
        <p>Employment</p>
        <p>AI TV</p>
        <p>Metaverse / Middleverse / Multiverse</p>
    </div>
    """)

@app.route("/modules")
def modules():
    return page("Module Inventory", """
    <div class="box">
        <p>All American Marketplace</p>
        <p>Holographic Streaming Ecosystem</p>
        <p>Streaming Network Omni</p>
        <p>Quantum Speed Accelerator</p>
        <p>Quantum Lag Buster</p>
        <p>Omniverse 360 Insurance</p>
        <p>Jarvis</p>
        <p>Aniyah Vocal Training</p>
        <p>Aniyah Cross Border</p>
        <p>FinBank</p>
        <p>Jacobie Vision Holoverse</p>
        <p>Jacobie Cyber Security</p>
        <p>Jacobie Employment</p>
        <p>Isaiah Anyone Can Be a Star AI TV</p>
        <p>Metaverse</p>
        <p>Middleverse</p>
        <p>Multiverse</p>
    </div>
    """)



# -------------------------
# Verified Merge Block 3: Assistant Center + Chat
# -------------------------

def _assistant_cfg_verified():
    try:
        return _cfg_load("voice_assistant.json", {"assistant": {}})
    except Exception:
        return {
            "assistant": {
                "name": "AAM Voice Assistant",
                "speech_enabled": True,
                "speech_mode": "assist",
                "voices": ["warm_assistant"],
                "default_voice": "warm_assistant",
                "talk_if_needed": True
            }
        }

def _assistant_chat_rows_verified():
    try:
        return _load("assistant/chat_history.json", [])
    except Exception:
        return []

def _save_assistant_chat_rows_verified(rows):
    try:
        _save("assistant/chat_history.json", rows)
    except Exception:
        pass

@app.route("/assistant-center")
def assistant_center_verified():
    cfg = _assistant_cfg_verified().get("assistant", {})
    body = ""
    body += section("Assistant Center", [
        f"Assistant Name: {cfg.get('name', 'AAM Voice Assistant')}",
        f"Speech Enabled: {cfg.get('speech_enabled', True)}",
        f"Speech Mode: {cfg.get('speech_mode', 'assist')}",
        f"Default Voice: {cfg.get('default_voice', 'warm_assistant')}",
        f"Talk If Needed: {cfg.get('talk_if_needed', True)}"
    ])
    body += section("Available Voices", cfg.get("voices", []))
    body += section("Modes", [
        "silent = text only",
        "assist = text first, voice optional",
        "hands_free = voice-priority mode",
        "accessibility = guided support mode"
    ])
    body += section("What This Does", [
        "Adds a private assistant layer into the platform",
        "Creates the base for future voice-first workflows",
        "Supports low-effort navigation and help"
    ])
    return page("Assistant Center", body)

@app.route("/assistant-chat", methods=["GET", "POST"])
def assistant_chat_verified():
    rows = _assistant_chat_rows_verified()
    cfg = _assistant_cfg_verified().get("assistant", {})

    if request.method == "POST":
        user_message = request.form.get("message", "").strip()
        selected_voice = request.form.get("voice", "").strip() or cfg.get("default_voice", "warm_assistant")
        reply_mode = request.form.get("reply_mode", "").strip() or cfg.get("speech_mode", "assist")

        if user_message:
            rows.append({
                "id": str(uuid.uuid4()),
                "role": "user",
                "message": user_message,
                "voice": selected_voice,
                "mode": reply_mode,
                "created_at": str(datetime.datetime.now())
            })

            assistant_reply = f"Assistant received: {user_message}"
            rows.append({
                "id": str(uuid.uuid4()),
                "role": "assistant",
                "message": assistant_reply,
                "voice": selected_voice,
                "mode": reply_mode,
                "created_at": str(datetime.datetime.now())
            })

            _save_assistant_chat_rows_verified(rows)

        return redirect("/assistant-chat")

    voice_options = "".join([
        f'<option value="{v}">{v}</option>' for v in cfg.get("voices", [])
    ])

    body = f"""
    <div class="card">
        <form method="post">
            <input name="message" placeholder="Type a message to the assistant">
            <select name="voice">{voice_options}</select>
            <select name="reply_mode">
                <option value="silent">silent</option>
                <option value="assist">assist</option>
                <option value="hands_free">hands_free</option>
                <option value="accessibility">accessibility</option>
            </select>
            <button class="btn btn2" type="submit">Send To Assistant</button>
        </form>
    </div>
    """

    recent = rows[-20:]
    if recent:
        body += section("Recent Chat Activity", [
            f"{x.get('role')}: {x.get('message')} | voice={x.get('voice')} | mode={x.get('mode')}"
            for x in recent
        ])
    else:
        body += section("Recent Chat Activity", ["No chat messages yet"])

    body += section("Important Note", [
        "This is a private assistant scaffold",
        "Real spoken voice needs TTS later",
        "Real voice input needs STT later"
    ])

    return page("Assistant Chat", body)

@app.route("/health")
def health():
    return "OK"

@app.route("/favicon.ico")
def fav():
    return Response(status=204)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
