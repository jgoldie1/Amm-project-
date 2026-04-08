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
    rows = "".join(f"<li>{item}</li>" for item in items)
    return f'<div class="card"><h3>{title}</h3><ul>{rows}</ul></div>'

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
                max-width:1180px;
                margin:16px auto;
                padding:30px;
                border-radius:24px;
                border:2px solid rgba(96,165,250,0.8);
                background:linear-gradient(135deg,rgba(17,24,39,0.95),rgba(30,41,59,0.92));
                box-shadow:0 0 25px rgba(56,189,248,0.25), inset 0 0 25px rgba(255,255,255,0.04);
            }}
            .card {{
                max-width:1180px;
                margin:16px auto;
                padding:22px;
                text-align:left;
                border-radius:22px;
                border:1px solid rgba(148,163,184,0.35);
                background:linear-gradient(180deg,rgba(15,23,42,0.92),rgba(30,41,59,0.90));
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
            {badge("Level 20")} {badge("Creator OS")} {badge("Accessibility")} {badge("Holographic Ads")} {badge("Verification")} {badge("Monetization")}
        </div>
        {body}
    </body>
    </html>
    """

@app.route("/")
def home():
    data = load_json(os.path.join(ROOT, "ultimate_vision", "config", "ultimate_manifest.json"), {})
    sections = data.get("sections", {})
    body = ""
    ordered = [
        "creator_os",
        "ai_creator_engine",
        "fan_engagement",
        "revenue_network",
        "discovery_engine",
        "governance",
        "battle_modes",
        "collectibles",
        "streaming_payout_models",
        "social_stack",
        "accessibility",
        "level20_visual_system",
        "holographic_ad_network",
        "verification_system",
        "pricing",
        "music_lab",
        "event_core",
        "network_and_scaling"
    ]
    labels = {
        "creator_os":"Creator OS",
        "ai_creator_engine":"Intelligent Creator Engine",
        "fan_engagement":"Unified Fan Engagement",
        "revenue_network":"Creator Revenue Network",
        "discovery_engine":"Discovery Engine",
        "governance":"Governance + Trust + Compliance",
        "battle_modes":"PK + Battle Modes",
        "collectibles":"Holographic Collectibles + Printable Decks",
        "streaming_payout_models":"Music Streaming Payout Models",
        "social_stack":"Golden Era Social Stack",
        "accessibility":"Accessibility + Disability Support",
        "level20_visual_system":"Level 20 Visual System",
        "holographic_ad_network":"Holographic Ad Network",
        "verification_system":"Verification System",
        "pricing":"Pricing + Beta Access",
        "music_lab":"Music Lab",
        "event_core":"Event Core",
        "network_and_scaling":"Network + Blockchain Scaling"
    }
    for key in ordered:
        body += section(labels.get(key, key), sections.get(key, []))
    body += section("What This Does", [
        "Shows the full ecosystem in one investor-grade dashboard",
        "Makes the platform easier to understand and present",
        "Unifies creator tools, monetization, accessibility, visuals, ads, verification, and infrastructure"
    ])
    return page("Ultimate Vision Center", body)

@app.route("/health")
def health():
    return "OK"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8100)
