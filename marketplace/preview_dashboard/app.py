from flask import Flask
import os, json

app = Flask(__name__)

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE)
NEXT = os.path.join(ROOT, "next_level")

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
                background:#0b1220; color:white; font-family:Arial,sans-serif;
                margin:0; padding:16px; text-align:center;
            }}
            .hero {{
                background:linear-gradient(135deg,#182235,#243b55);
                border:2px solid #60a5fa; border-radius:18px;
                padding:24px; margin:16px auto; max-width:1100px;
            }}
            .card {{
                background:#182235; border:2px solid #334155; border-radius:16px;
                padding:20px; margin:16px auto; max-width:1100px; text-align:left;
            }}
            .btn {{
                display:block; background:#0284c7; color:white; text-decoration:none;
                padding:16px; margin:10px auto; border-radius:14px; max-width:900px;
                font-weight:bold; font-size:18px; text-align:center;
            }}
            h1 {{ font-size:36px; margin:0 0 8px 0; }}
            h2,h3 {{ font-size:26px; }}
            p,li {{ font-size:19px; }}
            ul {{ padding-left:24px; margin:0; }}
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
    creator_os = load_json(os.path.join(NEXT, "creator_os", "creator_os.json"))
    ai_brain = load_json(os.path.join(NEXT, "ai_brain", "intelligent_creator_engine.json"))
    fan = load_json(os.path.join(NEXT, "fan_engagement", "unified_fan_engagement.json"))
    revenue = load_json(os.path.join(NEXT, "revenue_network", "creator_revenue_network.json"))
    discovery = load_json(os.path.join(NEXT, "discovery_engine", "discovery_engine.json"))
    governance = load_json(os.path.join(NEXT, "governance", "platform_governance.json"))
    battles = load_json(os.path.join(NEXT, "battles", "pk_battle_modes.json"))
    collectibles = load_json(os.path.join(NEXT, "collectibles", "holographic_collectibles.json"))
    streaming = load_json(os.path.join(NEXT, "streaming_economy", "music_streaming_payout_models.json"))
    social = load_json(os.path.join(NEXT, "social_models", "golden_era_social_stack.json"))
    events = load_json(os.path.join(NEXT, "events", "creator_ecosystem_events.json"))

    body = ""
    body += section("Creator OS", creator_os.get("creator_os", {}).get("workspace_modules", []))
    body += section("Intelligent Creator Engine", ai_brain.get("intelligent_creator_engine", {}).get("features", []))
    body += section("Unified Fan Engagement", fan.get("fan_engagement", {}).get("features", []))
    body += section("Creator Revenue Network", revenue.get("creator_revenue_network", {}).get("income_streams", []))
    body += section("Discovery Engine", discovery.get("discovery_engine", {}).get("features", []))
    body += section("Governance", governance.get("governance", {}).get("features", []))
    body += section("PK Battle Modes", battles.get("battle_modes", []))
    body += section("Holographic Collectibles", collectibles.get("collectibles", {}).get("types", []) + collectibles.get("collectibles", {}).get("features", []))
    body += section("Music Streaming Payout Models", streaming.get("payout_models", {}).get("models", []))
    body += section("Golden Era Social Stack", social.get("golden_era_social_stack", {}).get("borrowed_patterns", []))
    body += section("Creator Ecosystem Events", events.get("event_types", []))
    body += section("What This Does", [
        "Loads the next_level modules into one preview UI",
        "Lets you review the full creator ecosystem safely",
        "Prepares the next merge into the live platform"
    ])
    return page("Next-Level Creator Ecosystem Preview", body)

@app.route("/health")
def health():
    return "OK"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8097)
