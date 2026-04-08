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
    button("AI Center", "/ai-center", "btn btn2") + \
    button("Call Center Hub", "/call-center", "btn btn3") + \
    button("AI Call Center", "/call-center/ai", "btn btn4") + \
    button("Work From Home", "/call-center/work-from-home", "btn btn5") + \
    button("Metaverse", "/metaverse", "btn btn6") + \
    button("Middleverse", "/middleverse", "btn") + \
    button("Multiverse", "/multiverse", "btn btn2") + \
    button("Worlds Workforce Bridge", "/worlds-workforce-bridge", "btn btn3") + \
    button("Aniyah App", "/aniyah-app", "btn btn4") + \
    button("Aniyah Voice Coach", "/aniyah-voice-coach", "btn btn5") + \
    button("Jacobie Vision", "/jacobie-vision", "btn btn6") + \
    button("Isaiah AI TV", "/isaiah-ai-tv", "btn") + \
    button("University", "/university", "btn btn2") + \
    button("Streaming Ecosystem", "/streaming-ecosystem", "btn btn3") + \
    button("Alton Security", "/alton-security", "btn btn4") + \
    button("Kevon Shot It", "/kevon-shot-it", "btn btn5") + \
    button("Health", "/health", "btn btn6") + \
    """
    </div>
    """ + \
    section("What Changed", [
        "AI call center is now a separate visible module",
        "Work-from-home now connects to the Middleverse bridge layer",
        "Metaverse is the immersive workspace and training layer",
        "Middleverse is the bridge between physical operations and digital operations",
        "Multiverse is the expansion layer for multiple brands, teams, and worlds"
    ]) + \
    section("Next-Level Direction", [
        "AI-driven job routing",
        "Virtual remote offices",
        "Digital training campuses",
        "Avatar-based call center simulation",
        "Multi-world business operations",
        "Voice-first platform control"
    ])
    return page("Worlds + Workforce Integration", body)

@app.route("/dashboard")
def dashboard():
    body = \
    section("AI + Workforce", [
        "AI Center",
        "AI Call Center",
        "Work From Home system",
        "Employment direction",
        "Voice-guided operations"
    ]) + \
    section("World Layers", [
        "Metaverse = immersive workspace and training",
        "Middleverse = bridge between real work and digital systems",
        "Multiverse = expansion across multiple worlds and brands"
    ]) + \
    section("Family / Platform Apps", [
        "Aniyah App",
        "Aniyah Voice Coach",
        "Jacobie Vision",
        "Jacobie Cyber Security direction",
        "Isaiah AI TV",
        "Kevon Shot It",
        "Alton Security"
    ]) + \
    section("Core Ecosystem", [
        "University",
        "Streaming Ecosystem",
        "AI Center",
        "Business and creator growth"
    ])
    return page("Master Dashboard", body)

@app.route("/ai-center")
def ai_center():
    return page("AI Center", \
        section("AI Services", [
            "Jarvis assistant",
            "AI education mentor",
            "AI security assistant",
            "AI call center guide",
            "AI trading assistant",
            "AI business advisor"
        ]) +
        section("What This Does", [
            "Guides users through the platform",
            "Supports work, learning, security, and creation",
            "Connects all departments into one AI layer"
        ])
    )

@app.route("/call-center")
def call_center():
    return page("Call Center Hub", \
        section("Call Center Core", [
            "Remote agent onboarding",
            "Support queue direction",
            "Shift and workflow structure",
            "Training and QA",
            "Work-from-home operations"
        ]) +
        section("Connected Layers", [
            "AI assistant support",
            "Middleverse bridge",
            "Metaverse training rooms",
            "Multiverse expansion for multi-brand support teams"
        ])
    )

@app.route("/call-center/ai")
def call_center_ai():
    return page("AI Call Center", \
        section("AI Call Center Features", [
            "AI script coaching",
            "AI response suggestions",
            "AI QA support",
            "AI escalation assistant",
            "AI onboarding guide",
            "AI productivity helper"
        ]) +
        section("What This Does", [
            "Makes remote support teams easier to train",
            "Improves consistency",
            "Reduces confusion for work-from-home agents",
            "Prepares the platform for large-scale customer service"
        ])
    )

@app.route("/call-center/work-from-home")
def work_from_home():
    return page("Work From Home", \
        section("Work From Home System", [
            "Remote setup readiness",
            "Home-office workflow",
            "Schedule discipline",
            "Digital support operations",
            "Training path",
            "Career path into employment hub"
        ]) +
        section("World Connection", [
            "Middleverse bridges home work to digital operations",
            "Metaverse can become the virtual office/training campus",
            "Multiverse can separate departments, brands, and regions"
        ])
    )

@app.route("/worlds-workforce-bridge")
def worlds_workforce_bridge():
    return page("Worlds Workforce Bridge", \
        section("Bridge Layer", [
            "AI routes people into the right work path",
            "Call center work-from-home becomes digitally managed",
            "Middleverse connects real workers to virtual systems",
            "Metaverse hosts virtual offices and simulations",
            "Multiverse expands the system into multiple operational worlds"
        ]) +
        section("What This Does", [
            "Turns pages into connected systems",
            "Creates a digital operating model",
            "Supports training, employment, and remote work at scale",
            "Builds a next-level workforce ecosystem"
        ])
    )

@app.route("/metaverse")
def metaverse():
    return page("Metaverse", \
        section("Metaverse Build-Out", [
            "Virtual workspace",
            "Immersive training rooms",
            "Digital campus",
            "Creator environments",
            "Remote collaboration spaces",
            "Future avatar operations"
        ]) +
        section("Connected To", [
            "University",
            "Call Center training",
            "AI Center",
            "Streaming ecosystem",
            "Creator and family apps"
        ])
    )

@app.route("/middleverse")
def middleverse():
    return page("Middleverse", \
        section("Middleverse Build-Out", [
            "Bridge between physical and digital operations",
            "Connects home workers to platform systems",
            "Connects real businesses to digital workspaces",
            "Operational handoff layer",
            "Hybrid workforce control layer"
        ]) +
        section("Connected To", [
            "Call Center",
            "Work From Home",
            "Security operations",
            "Marketplace workflows",
            "University to employment path"
        ])
    )

@app.route("/multiverse")
def multiverse():
    return page("Multiverse", \
        section("Multiverse Build-Out", [
            "Multiple worlds for multiple brands",
            "Department separation",
            "Regional expansion",
            "Creator worlds",
            "Business worlds",
            "Education worlds",
            "Security and operations worlds"
        ]) +
        section("Connected To", [
            "Metaverse",
            "Middleverse",
            "AI systems",
            "Streaming ecosystem",
            "Global expansion"
        ])
    )

@app.route("/aniyah-app")
def aniyah_app():
    return page("Aniyah App", section("Aniyah App", [
        "Artist identity hub",
        "Brand direction",
        "Creator path",
        "Family ecosystem integration"
    ]))

@app.route("/aniyah-voice-coach")
def aniyah_voice_coach():
    return page("Aniyah Voice Coach", section("Aniyah Voice Coach", [
        "Breath control",
        "Pitch matching",
        "Range extension",
        "Harmony practice",
        "Genre coaching"
    ]))

@app.route("/jacobie-vision")
def jacobie_vision():
    return page("Jacobie Vision", section("Jacobie Vision", [
        "Vision planning",
        "Innovation concepts",
        "Creative direction",
        "Platform expansion ideas"
    ]))

@app.route("/isaiah-ai-tv")
def isaiah_ai_tv():
    return page("Isaiah AI TV", section("Isaiah AI TV", [
        "Talent showcase",
        "Creator spotlight",
        "AI TV direction",
        "Media expansion"
    ]))

@app.route("/university")
def university():
    return page("University", section("All American Marketplace University", [
        "Grammar School",
        "Middle School",
        "High School",
        "GED",
        "College",
        "Masters",
        "PhD",
        "Certifications"
    ]))

@app.route("/streaming-ecosystem")
def streaming_ecosystem():
    return page("Holographic Streaming Ecosystem", section("Streaming Ecosystem", [
        "Live streaming direction",
        "Holographic preview shell",
        "Media channel hub",
        "Performance stage direction",
        "Interactive audience layer"
    ]))

@app.route("/alton-security")
def alton_security():
    return page("Alton Security", section("Alton Security", [
        "Operations dashboard",
        "Training academy",
        "Compliance direction",
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

@app.route("/health")
def health():
    return "OK"

@app.route("/favicon.ico")
def fav():
    return Response(status=204)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
