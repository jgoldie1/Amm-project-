from flask import Flask, Response

app = Flask(__name__)

def section(title, items):
    rows = "".join(f"<li>{item}</li>" for item in items)
    return f"""
    <div class="card">
        <h3>{title}</h3>
        <ul>{rows}</ul>
    </div>
    """

def button(label, link, cls="btn"):
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
            .card {{
                background:#182235;
                border:2px solid #334155;
                border-radius:16px;
                padding:20px;
                margin:16px auto;
                max-width:1100px;
                text-align:left;
            }}
            .navbox {{
                background:#182235;
                border:2px solid #334155;
                border-radius:16px;
                padding:20px;
                margin:16px auto;
                max-width:1100px;
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
            h1 {{ font-size:36px; margin:0 0 8px 0; }}
            h2, h3 {{ font-size:26px; }}
            p, li {{ font-size:20px; }}
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
    body = """
    <div class="navbox">
        <h3>Main Navigation</h3>
    """ + \
    button("Dashboard", "/dashboard", "btn") + \
    button("Full Modules", "/modules", "btn btn2") + \
    button("Aniyah App", "/aniyah-app", "btn btn3") + \
    button("Aniyah Voice Coach", "/aniyah-voice-coach", "btn btn4") + \
    button("Jacobie Vision", "/jacobie-vision", "btn btn5") + \
    button("Jacobie Holoverse", "/jacobie-holoverse", "btn btn6") + \
    button("Jacobie Cyber Security", "/jacobie-cyber-security", "btn") + \
    button("Isaiah AI TV", "/isaiah-ai-tv", "btn btn2") + \
    button("University", "/university", "btn btn3") + \
    button("Holographic Streaming Ecosystem", "/streaming-ecosystem", "btn btn4") + \
    button("Alton Security", "/alton-security", "btn btn5") + \
    button("Kevon Shot It", "/kevon-shot-it", "btn btn6") + \
    button("AI Center", "/ai-center", "btn") + \
    button("Health", "/health", "btn btn2") + \
    """
    </div>
    """ + \
    section("What Happened", [
        "The current file had been reduced to a minimal recovery version",
        "That recovery version kept the server alive but did not show the full ecosystem",
        "Your larger platform ideas were not erased; they just were not included in the smaller running file",
        "This page restores the missing major modules into one organized master view"
    ]) + \
    section("Restored Major Systems", [
        "Aniyah App",
        "Aniyah Voice Coach",
        "Jacobie Vision",
        "Jacobie Holoverse",
        "Jacobie Cyber Security",
        "Isaiah AI TV",
        "All American Marketplace University",
        "All American Marketplace Holographic Streaming Ecosystem",
        "Alton Security",
        "Kevon Shot It",
        "AI Center"
    ])
    return page("Full Restore View", body)

@app.route("/dashboard")
def dashboard():
    body = \
    section("Creator and Family Apps", [
        "Aniyah App",
        "Aniyah Voice Coach",
        "Jacobie Vision",
        "Jacobie Holoverse",
        "Jacobie Cyber Security",
        "Isaiah AI TV",
        "Kevon Shot It",
        "Alton Security"
    ]) + \
    section("Education and Training", [
        "All American Marketplace University",
        "Grammar school to PhD path",
        "Certifications and degrees",
        "AI mentors and global professionals"
    ]) + \
    section("Streaming and Media", [
        "All American Marketplace Holographic Streaming Ecosystem",
        "Creator media direction",
        "Production and editing direction",
        "Future AI TV and streaming expansion"
    ]) + \
    section("AI and Platform Control", [
        "AI Center",
        "Jarvis assistant direction",
        "AI business advisor",
        "AI education mentor",
        "AI security assistant",
        "AI trading assistant"
    ])
    return page("Master Dashboard", body)

@app.route("/modules")
def modules():
    body = \
    section("Aniyah System", [
        "Aniyah App",
        "Aniyah Voice Coach",
        "Artist development",
        "Voice training"
    ]) + \
    section("Jacobie System", [
        "Jacobie Vision",
        "Jacobie Holoverse",
        "Jacobie Cyber Security",
        "Future training and employment direction"
    ]) + \
    section("Isaiah System", [
        "Isaiah AI TV",
        "Talent showcase direction",
        "Media and creator expansion"
    ]) + \
    section("University System", [
        "Grammar school",
        "Middle school",
        "High school",
        "GED",
        "College",
        "Masters",
        "PhD",
        "Certifications"
    ]) + \
    section("Streaming System", [
        "All American Marketplace Holographic Streaming Ecosystem",
        "Media hub",
        "Future performance stage",
        "Holographic platform direction"
    ]) + \
    section("Business and Security", [
        "Alton Security",
        "Kevon Shot It",
        "AI Center"
    ])
    return page("Full Modules", body)

@app.route("/aniyah-app")
def aniyah_app():
    return page("Aniyah App", section("Aniyah App", [
        "Main artist and identity hub",
        "Brand direction",
        "Creator platform path",
        "Family ecosystem integration"
    ]))

@app.route("/aniyah-voice-coach")
def aniyah_voice_coach():
    return page("Aniyah Voice Coach", section("Aniyah Voice Coach", [
        "Breath control",
        "Pitch matching",
        "Range extension",
        "Harmony practice",
        "Performance confidence",
        "Genre coaching"
    ]))

@app.route("/jacobie-vision")
def jacobie_vision():
    return page("Jacobie Vision", section("Jacobie Vision", [
        "Vision planning",
        "Creative direction",
        "Innovation concepts",
        "Platform expansion ideas"
    ]))

@app.route("/jacobie-holoverse")
def jacobie_holoverse():
    return page("Jacobie Holoverse", section("Jacobie Holoverse", [
        "Immersive world hub",
        "Visionary media experience",
        "Interactive environment shell",
        "Future holographic scene direction"
    ]))

@app.route("/jacobie-cyber-security")
def jacobie_cyber_security():
    return page("Jacobie Cyber Security", section("Jacobie Cyber Security", [
        "Threat monitoring",
        "Identity protection",
        "Encryption tools",
        "System integrity review",
        "Blockchain security direction"
    ]))

@app.route("/isaiah-ai-tv")
def isaiah_ai_tv():
    return page("Isaiah AI TV", section("Isaiah AI TV", [
        "Talent showcase",
        "Creator spotlight",
        "Media channel direction",
        "Future AI TV platform expansion"
    ]))

@app.route("/university")
def university():
    return page("All American Marketplace University", section("University", [
        "Grammar School",
        "Middle School",
        "High School",
        "GED Program",
        "Undergraduate Programs",
        "Masters Programs",
        "PhD Programs",
        "Certification Programs"
    ]))

@app.route("/streaming-ecosystem")
def streaming_ecosystem():
    return page("All American Marketplace Holographic Streaming Ecosystem", section("Holographic Streaming Ecosystem", [
        "Live streaming direction",
        "Holographic preview shell",
        "Media channel hub",
        "Future performance stage",
        "Interactive audience layer"
    ]))

@app.route("/alton-security")
def alton_security():
    return page("Alton Security", section("Alton Security", [
        "Operations dashboard",
        "Training academy",
        "Compliance tracking",
        "Scheduling and patrol logs",
        "Celebrity and special event planning"
    ]))

@app.route("/kevon-shot-it")
def kevon_shot_it():
    return page("Kevon Shot It", section("Kevon Shot It", [
        "Movie production",
        "Video production",
        "Photography",
        "Editing services",
        "Trading education",
        "Stocks / forex / market direction"
    ]))

@app.route("/ai-center")
def ai_center():
    return page("AI Center", section("AI Center", [
        "Jarvis assistant",
        "AI business advisor",
        "AI education mentor",
        "AI security assistant",
        "AI trading assistant",
        "Instructions for how to use the app"
    ]))

@app.route("/health")
def health():
    return "OK"

@app.route("/favicon.ico")
def fav():
    return Response(status=204)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
