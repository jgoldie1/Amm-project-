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

def badge(text):
    return f'<span class="badge">{text}</span>'

def page(title, body):
    return f"""
    <html>
    <head>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>{title}</title>
        <style>
            body {{
                margin:0;
                padding:18px;
                font-family:Arial,sans-serif;
                background:
                    radial-gradient(circle at top left, rgba(0,255,255,0.14), transparent 30%),
                    radial-gradient(circle at top right, rgba(255,0,255,0.14), transparent 30%),
                    linear-gradient(135deg,#060b16,#0b1220,#111827);
                color:white;
                text-align:center;
            }}
            .hero {{
                max-width:1150px;
                margin:16px auto;
                padding:30px;
                border-radius:24px;
                border:2px solid rgba(96,165,250,0.8);
                background:linear-gradient(135deg,rgba(17,24,39,0.95),rgba(30,41,59,0.92));
                box-shadow:0 0 25px rgba(56,189,248,0.25), inset 0 0 25px rgba(255,255,255,0.04);
            }}
            .card {{
                max-width:1150px;
                margin:16px auto;
                padding:22px;
                text-align:left;
                border-radius:22px;
                border:1px solid rgba(148,163,184,0.35);
                background:linear-gradient(180deg,rgba(15,23,42,0.92),rgba(30,41,59,0.9));
                box-shadow:0 0 18px rgba(34,211,238,0.12);
            }}
            .badge {{
                display:inline-block;
                margin:6px;
                padding:10px 16px;
                border-radius:999px;
                border:1px solid #60a5fa;
                background:rgba(8,15,30,0.9);
                font-weight:bold;
                box-shadow:0 0 10px rgba(96,165,250,0.25);
            }}
            h1 {{ font-size:40px; margin:0 0 8px 0; }}
            h2 {{ font-size:28px; margin:0 0 10px 0; }}
            h3 {{ font-size:24px; }}
            li,p {{ font-size:19px; line-height:1.5; }}
            ul {{ padding-left:24px; }}
        </style>
    </head>
    <body>
        <div class="hero">
            <h1>All American Marketplace</h1>
            <h2>{title}</h2>
            {badge("Level 20 Immersive")} {badge("Holographic Ads")} {badge("Verified Identity")}
        </div>
        {body}
    </body>
    </html>
    """

@app.route("/")
def home():
    theme = load_json(os.path.join(ROOT, "visual_level20", "theme", "level20_visual_system.json"))
    ads = load_json(os.path.join(ROOT, "visual_level20", "ads", "holographic_ad_network.json"))
    verified = load_json(os.path.join(ROOT, "visual_level20", "verification", "verified_system.json"))

    body = ""
    body += section("Level 20 Visual System", theme.get("level20_visual_system", {}).get("features", []))
    body += section("Holographic Advertising Network", ads.get("holographic_ad_network", {}).get("placements", []))
    body += section("Verification Badge System", verified.get("verification_system", {}).get("badges", []))
    body += section("Verification Benefits", verified.get("verification_system", {}).get("benefits", []))
    body += section("What This Does", [
        "Makes the platform visually sharper and more premium",
        "Adds immersive ad inventory and sponsor revenue opportunities",
        "Creates a native trust and status layer for creators, ministries, and businesses"
    ])
    return page("Level 20 Visual + Ad + Verification Preview", body)

@app.route("/health")
def health():
    return "OK"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8099)
