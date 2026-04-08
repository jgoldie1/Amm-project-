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
    button("Bank of Yahavah", "/bank-of-yahavah", "btn btn2") + \
    button("Storefront of Yahavah", "/storefront-of-yahavah", "btn btn3") + \
    button("AI Center", "/ai-center", "btn btn4") + \
    button("Call Center Hub", "/call-center", "btn btn5") + \
    button("Work From Home", "/call-center/work-from-home", "btn btn6") + \
    button("Metaverse", "/metaverse", "btn") + \
    button("Middleverse", "/middleverse", "btn btn2") + \
    button("Multiverse", "/multiverse", "btn btn3") + \
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
    section("What You Have Created", [
        "A multi-world digital ecosystem platform",
        "A workforce and AI operations system",
        "A creator and media system",
        "A university and training system",
        "A security and services system",
        "A faith-centered finance and storefront expansion path"
    ]) + \
    section("New Faith Layer", [
        "Bank of Yahavah adds stewardship, giving, and community finance direction",
        "Storefront of Yahavah adds products, teachings, media, and service offerings",
        "This gives the platform a faith-centered commerce and support pillar"
    ])
    return page("Worlds + Workforce + Faith Integration", body)

@app.route("/dashboard")
def dashboard():
    body = \
    section("Core Platform", [
        "AI Center",
        "Call Center Hub",
        "Work From Home",
        "Worlds Workforce Bridge"
    ]) + \
    section("Faith and Stewardship", [
        "Bank of Yahavah",
        "Storefront of Yahavah",
        "Faith-centered stewardship direction",
        "Ministry storefront direction"
    ]) + \
    section("Family / Creator Systems", [
        "Aniyah App",
        "Aniyah Voice Coach",
        "Jacobie Vision",
        "Isaiah AI TV",
        "Kevon Shot It",
        "Alton Security"
    ]) + \
    section("Education and Media", [
        "University",
        "Streaming Ecosystem",
        "Metaverse",
        "Middleverse",
        "Multiverse"
    ])
    return page("Master Dashboard", body)

@app.route("/bank-of-yahavah")
def bank_of_yahavah():
    body = \
    section("Bank of Yahavah", [
        "Giving and stewardship hub",
        "Community support direction",
        "Faith-centered finance structure",
        "Ministry support pathway",
        "Storefront funding direction",
        "Future merchant support layer"
    ]) + \
    section("What This Does", [
        "Creates a faith-centered finance pillar",
        "Supports the storefront and ministry direction",
        "Can organize offerings, support, community commerce, and stewardship"
    ])
    return page("Bank of Yahavah", body)

@app.route("/storefront-of-yahavah")
def storefront_of_yahavah():
    body = \
    section("Storefront of Yahavah", [
        "Books and teachings",
        "Media and messages",
        "Faith-based classes",
        "Events and support services",
        "Apparel and digital goods",
        "Community resource offerings"
    ]) + \
    section("What This Does", [
        "Creates a visible faith-based storefront",
        "Lets the platform serve ministry, education, and commerce together",
        "Connects faith, education, media, and marketplace systems"
    ])
    return page("Storefront of Yahavah", body)

@app.route("/ai-center")
def ai_center():
    return page("AI Center", section("AI Services", [
        "Jarvis assistant",
        "AI education mentor",
        "AI security assistant",
        "AI call center guide",
        "AI trading assistant",
        "AI business advisor"
    ]))

@app.route("/call-center")
def call_center():
    return page("Call Center Hub", section("Call Center Core", [
        "Remote agent onboarding",
        "Support queue direction",
        "Shift and workflow structure",
        "Training and QA",
        "Work-from-home operations"
    ]))

@app.route("/call-center/work-from-home")
def work_from_home():
    return page("Work From Home", section("Work From Home System", [
        "Remote setup readiness",
        "Home-office workflow",
        "Schedule discipline",
        "Digital support operations",
        "Training path",
        "Career path into employment hub"
    ]))

@app.route("/metaverse")
def metaverse():
    return page("Metaverse", section("Metaverse Build-Out", [
        "Virtual workspace",
        "Immersive training rooms",
        "Digital campus",
        "Creator environments",
        "Remote collaboration spaces"
    ]))

@app.route("/middleverse")
def middleverse():
    return page("Middleverse", section("Middleverse Build-Out", [
        "Bridge between physical and digital operations",
        "Connects home workers to platform systems",
        "Connects real businesses to digital workspaces",
        "Hybrid workforce control layer"
    ]))

@app.route("/multiverse")
def multiverse():
    return page("Multiverse", section("Multiverse Build-Out", [
        "Multiple worlds for multiple brands",
        "Department separation",
        "Regional expansion",
        "Creator worlds",
        "Business worlds",
        "Education worlds"
    ]))

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
    return page("Streaming Ecosystem", section("Holographic Streaming Ecosystem", [
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
