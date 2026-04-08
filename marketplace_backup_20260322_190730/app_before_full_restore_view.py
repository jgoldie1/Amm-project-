from flask import Flask, Response

app = Flask(__name__)

def section(title, items):
    lines = "".join(f"<li>{item}</li>" for item in items)
    return f"""
    <div class="card">
        <h3>{title}</h3>
        <ul>{lines}</ul>
    </div>
    """

def nav_button(label, link, cls="btn"):
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
                max-width:1000px;
            }}
            .grid {{
                display:block;
                max-width:1000px;
                margin:0 auto;
            }}
            .card {{
                background:#182235;
                border:2px solid #334155;
                border-radius:16px;
                padding:20px;
                margin:16px auto;
                max-width:1000px;
                text-align:left;
            }}
            .navbox {{
                background:#182235;
                border:2px solid #334155;
                border-radius:16px;
                padding:20px;
                margin:16px auto;
                max-width:1000px;
            }}
            .btn {{
                display:block;
                background:#0284c7;
                color:white;
                text-decoration:none;
                padding:18px;
                margin:12px auto;
                border-radius:14px;
                max-width:760px;
                font-weight:bold;
                font-size:20px;
                text-align:center;
            }}
            .btn2 {{ background:#16a34a; }}
            .btn3 {{ background:#7c3aed; }}
            .btn4 {{ background:#d97706; }}
            .btn5 {{ background:#dc2626; }}
            .btn6 {{ background:#0891b2; }}
            h1 {{ font-size:34px; margin:0 0 8px 0; }}
            h2, h3 {{ font-size:26px; }}
            p, li {{ font-size:20px; }}
            ul {{
                margin:0;
                padding-left:24px;
            }}
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
        <h3>Start Here</h3>
        """ + \
        nav_button("Dashboard", "/dashboard", "btn") + \
        nav_button("Organized Modules", "/modules", "btn btn2") + \
        nav_button("Instructions", "/instructions", "btn btn3") + \
        nav_button("Alton Security", "/alton-security", "btn btn4") + \
        nav_button("Kevon Shot It", "/kevon-shot-it", "btn btn5") + \
        nav_button("AI Center", "/ai-center", "btn btn6") + \
    """
    </div>
    """ + \
    section("What You Created", [
        "Marketplace ecosystem",
        "University and education system",
        "Global talent network",
        "Call center and work-from-home path",
        "Security operations system",
        "Media and creator system",
        "Trading and business expansion direction",
        "AI-assisted platform control"
    ]) + \
    section("Why It Wasn't Showing Everything", [
        "We were using smaller recovery files to keep the server stable",
        "Those recovery files only showed part of the ecosystem",
        "The full structure had not been merged into one organized master layout yet",
        "This page is the first clean organized master view"
    ])
    return page("Organized Master Page", body)

@app.route("/dashboard")
def dashboard():
    body = \
    section("Platform Core", [
        "Accounts and profiles",
        "Listings and posting system",
        "Media uploads",
        "Instructions and help",
        "AI guidance"
    ]) + \
    section("Education", [
        "All American Marketplace University",
        "Grammar school to PhD path",
        "Certifications",
        "AI mentors",
        "Global professionals"
    ]) + \
    section("Employment", [
        "Employment hub",
        "Call center",
        "Work-from-home system",
        "Training pathways",
        "Talent network"
    ]) + \
    section("Security and Operations", [
        "Alton Security command",
        "Compliance and training path",
        "Scheduling and reporting direction",
        "Celebrity and special event planning"
    ]) + \
    section("Creator and Media", [
        "Kevon Shot It",
        "Movie and video production",
        "Photography and editing",
        "Streaming ecosystem",
        "AI TV / creator direction"
    ]) + \
    section("Advanced Systems", [
        "Quantum speed accelerator",
        "Quantum lag buster",
        "Insurance",
        "FinBank",
        "Metaverse / Middleverse / Multiverse"
    ])
    return page("Master Dashboard", body)

@app.route("/modules")
def modules():
    body = \
    section("Marketplace Modules", [
        "Listings",
        "Posting system",
        "Vendor path",
        "FinBank",
        "Insurance"
    ]) + \
    section("Education Modules", [
        "University",
        "AI mentors",
        "Global professionals",
        "Certifications",
        "Degrees / Masters / PhD"
    ]) + \
    section("Employment Modules", [
        "Employment hub",
        "Call center",
        "Work-from-home",
        "Talent network"
    ]) + \
    section("Security Modules", [
        "Alton Security",
        "Training",
        "Compliance",
        "Celebrity and special event planning"
    ]) + \
    section("Creator Modules", [
        "Kevon Shot It",
        "Aniyah App",
        "Aniyah Voice Coach",
        "Streaming ecosystem",
        "AI Center"
    ]) + \
    section("Future Expansion Modules", [
        "Stocks / market learning",
        "Forex education",
        "Trading assistant",
        "Metaverse",
        "Middleverse",
        "Multiverse"
    ])
    return page("Organized Modules", body)

@app.route("/instructions")
def instructions():
    body = section("How To Use The App", [
        "Open Dashboard to see the full ecosystem grouped by purpose",
        "Open Modules to see the full list organized by category",
        "Use Alton Security for the security branch",
        "Use Kevon Shot It for production, media, and trading direction",
        "Use AI Center for guided help and AI features",
        "Expand features one stable section at a time"
    ])
    return page("Instructions", body)

@app.route("/alton-security")
def alton_security():
    body = \
    section("Alton Security Command", [
        "Operations dashboard",
        "Client services",
        "Incident reporting direction",
        "Compliance tracking",
        "Training academy",
        "Scheduling and patrol logs",
        "Celebrity and special event security planning"
    ]) + \
    section("What This Does", [
        "Turns Alton's app into a real security operations platform",
        "Supports business services, training, and event protection planning",
        "Creates a path for employment, contracts, and team coordination"
    ])
    return page("Alton Security", body)

@app.route("/kevon-shot-it")
def kevon():
    body = \
    section("Kevon Shot It Studio", [
        "Movie production",
        "Video production",
        "Photography",
        "Editing services",
        "Media business expansion",
        "Trading education direction",
        "Stocks / market / forex learning path"
    ]) + \
    section("What This Does", [
        "Lets Kevon earn through media services",
        "Builds a film and production brand inside the marketplace",
        "Adds a trading education and market-interest branch"
    ])
    return page("Kevon Shot It", body)

@app.route("/ai-center")
def ai_center():
    body = \
    section("AI Center", [
        "Jarvis assistant",
        "AI business advisor",
        "AI education mentor",
        "AI trading assistant",
        "AI security assistant",
        "Instructions for how to use the app"
    ]) + \
    section("What This Does", [
        "Guides users through the platform",
        "Reduces confusion",
        "Supports creators, students, businesses, and security operations",
        "Sets up the future voice-first control layer"
    ])
    return page("AI Center", body)

@app.route("/health")
def health():
    return "OK"

@app.route("/favicon.ico")
def fav():
    return Response(status=204)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
