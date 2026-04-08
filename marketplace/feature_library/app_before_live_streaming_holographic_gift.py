from flask import Flask, Response

app = Flask(__name__)

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
            h1 {{ font-size:36px; margin:0 0 8px 0; }}
            h2,h3 {{ font-size:26px; }}
            p,li {{ font-size:20px; }}
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
    return page("Ministry Route Fix", """
    <div class="navbox">
        <h3>Ministry Navigation</h3>
        """ + 
        btn("Kofi Ofri Ministries", "/kofi-ofri-ministries", "btn btn2") +
        btn("Servants of Christ", "/servants-of-christ", "btn btn3") +
        btn("Ministry Platform", "/ministry-platform", "btn btn4") +
        btn("Sermons and Teachings", "/sermons-teachings", "btn btn5") +
        btn("Ministry Events Outreach", "/ministry-events-outreach", "btn btn6") +
        btn("Ministry Giving Support", "/ministry-giving-support", "btn") +
    """
    </div>
    """ + section("What This Fix Does", [
        "Registers ministry routes before the server starts",
        "Makes the ministry pages visible again"
    ]))

@app.route("/kofi-ofri-ministries")
def kofi_ofri_ministries():
    return page("Kofi Ofri Ministries", (
        section("Kofi Ofri Ministries", [
            "Pastor Kofi Ofri ministry hub",
            "Faith leadership and ministry support",
            "Sermons, teachings, and outreach direction",
            "Future standalone ministry ecosystem path"
        ]) +
        section("What This Does", [
            "Adds Pastor Kofi Ofri's ministry visibly to the platform",
            "Connects ministry, streaming, and giving systems",
            "Creates a path toward a separate dedicated ministry platform"
        ])
    ))

@app.route("/servants-of-christ")
def servants_of_christ():
    return page("Servants of Christ", (
        section("Servants of Christ", [
            "Church and ministry identity hub",
            "Community support and outreach direction",
            "Faith media and teaching direction",
            "Ministry growth pathway"
        ]) +
        section("What This Does", [
            "Creates the church identity layer inside the ecosystem",
            "Supports media, outreach, and ministry organization"
        ])
    ))

@app.route("/ministry-platform")
def ministry_platform():
    return page("Ministry Platform", (
        section("Ministry Platform", [
            "Ministry dashboard direction",
            "Sermon and teaching distribution",
            "Events and outreach coordination",
            "Giving and support pathways",
            "Future standalone ecosystem roadmap"
        ]) +
        section("What This Does", [
            "Turns the ministry into a structured digital platform",
            "Supports future separation into its own full ecosystem"
        ])
    ))

@app.route("/sermons-teachings")
def sermons_teachings():
    return page("Sermons and Teachings", (
        section("Sermons and Teachings", [
            "Video sermon library direction",
            "Audio messages and teachings",
            "Bible study and lesson distribution",
            "Streaming ecosystem integration"
        ]) +
        section("What This Does", [
            "Creates a faith media library",
            "Connects ministry content to streaming and outreach"
        ])
    ))

@app.route("/ministry-events-outreach")
def ministry_events_outreach():
    return page("Ministry Events Outreach", (
        section("Ministry Events Outreach", [
            "Church events direction",
            "Community outreach planning",
            "Special services and conferences",
            "Volunteer and support coordination"
        ]) +
        section("What This Does", [
            "Supports ministry operations beyond media",
            "Builds community and service infrastructure"
        ])
    ))

@app.route("/ministry-giving-support")
def ministry_giving_support():
    return page("Ministry Giving Support", (
        section("Ministry Giving Support", [
            "Giving and donation direction",
            "Support campaigns",
            "Faith-centered stewardship connection",
            "Bank of Yahavah and storefront linkage"
        ]) +
        section("What This Does", [
            "Creates a giving and support layer for the ministry",
            "Connects ministry finance to the broader ecosystem"
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
