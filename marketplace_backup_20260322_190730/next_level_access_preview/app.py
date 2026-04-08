from flask import Flask
import os, json

app = Flask(__name__)

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE)

def load_json(path, default=None):
    if default is None:
        default = {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default

def section(title, items):
    lis = "".join(f"<li>{item}</li>" for item in items)
    return f'<div class="card"><h3>{title}</h3><ul>{lis}</ul></div>'

def page(title, body):
    return f"""
    <html>
    <head>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>{title}</title>
        <style>
            body {{
                background:#000;
                color:#fff;
                font-family:Arial,sans-serif;
                margin:0;
                padding:16px;
                text-align:center;
            }}
            .hero {{
                background:#111827;
                border:3px solid #facc15;
                border-radius:18px;
                padding:24px;
                margin:16px auto;
                max-width:1100px;
            }}
            .card {{
                background:#111827;
                border:2px solid #374151;
                border-radius:16px;
                padding:20px;
                margin:16px auto;
                max-width:1100px;
                text-align:left;
            }}
            h1 {{ font-size:40px; }}
            h2,h3 {{ font-size:28px; }}
            p,li {{ font-size:22px; line-height:1.5; }}
            ul {{ padding-left:28px; }}
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
    profiles = load_json(os.path.join(ROOT, "accessibility", "profiles", "accessibility_profiles.json"))
    ui = load_json(os.path.join(ROOT, "accessibility", "ui", "accessibility_ui.json"))
    voice = load_json(os.path.join(ROOT, "accessibility", "voice", "voice_access.json"))
    media = load_json(os.path.join(ROOT, "accessibility", "media", "media_accessibility.json"))
    controls = load_json(os.path.join(ROOT, "accessibility", "controls", "alternate_controls.json"))
    ai = load_json(os.path.join(ROOT, "accessibility", "ai_assist", "accessibility_ai_assistant.json"))

    body = ""
    for profile in profiles.get("profiles", []):
        body += section(profile.get("name", "profile"), profile.get("features", []))
    body += section("UI Accessibility", ui.get("ui_features", []))
    body += section("Voice Access", voice.get("voice_access", []))
    body += section("Media Accessibility", media.get("media_accessibility", []))
    body += section("Alternate Controls", controls.get("alternate_controls", []))
    body += section("Accessibility AI Assistant", ai.get("accessibility_ai_assistant", {}).get("features", []))
    body += section("What This Does", [
        "Makes the platform accessible across disabilities",
        "Improves voice-first and low-effort interaction",
        "Strengthens accessibility for streaming, creator tools, education, ministry, and marketplace systems",
        "Takes the platform to a more public-ready next level"
    ])
    return page("Accessibility Next-Level Preview", body)

@app.route("/health")
def health():
    return "OK"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8098)
