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
    body = """
    <div class="navbox">
        <h3>Visible Upgrade Navigation</h3>
    """ + \
    btn("Dashboard", "/dashboard", "btn") + \
    btn("Master Command Center", "/command-center", "btn btn2") + \
    btn("El Saturn FinTech", "/el-saturn-fintech", "btn btn3") + \
    btn("El Saturn Robotics", "/el-saturn-robotics", "btn btn4") + \
    btn("Auto-Man Light Technology", "/auto-man-light-technology", "btn btn5") + \
    btn("Self-Healing System", "/self-healing-system", "btn btn6") + \
    btn("Self-Repair System", "/self-repair-system", "btn") + \
    btn("Self-Audit System", "/self-audit-system", "btn btn2") + \
    btn("KITT Automation", "/kitt-automation", "btn btn3") + \
    btn("Blue Energy System", "/blue-energy-system", "btn btn4") + \
    btn("Ambient Energy Harvesting", "/ambient-energy-harvesting", "btn btn5") + \
    btn("El Saturn Records", "/el-saturn-records", "btn btn6") + \
    btn("Spectra ENT Records", "/spectra-ent-records", "btn") + \
    btn("Health", "/health", "btn btn2") + \
    """
    </div>
    """ + \
    section("What Changed", [
        "This is a forced visible upgrade build",
        "It makes the newest modules appear clearly",
        "If you see these links, the upgrade worked"
    ])
    return page("Visible Upgrade Fix", body)

@app.route("/dashboard")
def dashboard():
    return page("Dashboard", (
        section("New Visible Upgrades", [
            "Master Command Center",
            "El Saturn FinTech",
            "El Saturn Robotics",
            "Auto-Man Light Technology",
            "Self-Healing System",
            "Self-Repair System",
            "Self-Audit System",
            "KITT Automation",
            "Blue Energy System",
            "Ambient Energy Harvesting",
            "El Saturn Records",
            "Spectra ENT Records"
        ]) +
        section("What You Created", [
            "A super-platform ecosystem",
            "Finance and banking layer",
            "Creator and media network",
            "Automation and AI hierarchy",
            "Energy and smart infrastructure layer",
            "Robotics and command center layer"
        ])
    ))

@app.route("/command-center")
def command_center():
    return page("Master Command Center", section("Master Command Center", [
        "Finance command",
        "Creator/media command",
        "AI and automation command",
        "Logistics and transport command",
        "Security and infrastructure command",
        "Education and worlds command"
    ]))

@app.route("/el-saturn-fintech")
def el_saturn_fintech():
    return page("El Saturn FinTech", section("El Saturn FinTech", [
        "Digital finance infrastructure",
        "Marketplace transaction support",
        "Credit and payment services direction",
        "Merchant tools direction",
        "Banking technology layer"
    ]))

@app.route("/el-saturn-robotics")
def el_saturn_robotics():
    return page("El Saturn Robotics", section("El Saturn Robotics", [
        "Delivery robotics direction",
        "Warehouse robotics direction",
        "Construction robotics direction",
        "Security robotics direction",
        "Smart automation support"
    ]))

@app.route("/auto-man-light-technology")
def auto_man_light_technology():
    return page("Auto-Man Light Technology", section("Auto-Man Light Technology", [
        "Smart lighting automation",
        "Motion-triggered lighting direction",
        "Security-linked lighting",
        "Energy optimization direction",
        "Emergency path illumination concepts"
    ]))

@app.route("/self-healing-system")
def self_healing_system():
    return page("Self-Healing System", section("Self-Healing System", [
        "Failure detection direction",
        "Workflow rerouting",
        "Auto-recovery logic",
        "Service restoration path",
        "Resilience layer"
    ]))

@app.route("/self-repair-system")
def self_repair_system():
    return page("Self-Repair System", section("Self-Repair System", [
        "Broken-module detection",
        "Restart and repair suggestions",
        "Maintenance workflow automation",
        "Recovery scripts direction",
        "System repair coordination"
    ]))

@app.route("/self-audit-system")
def self_audit_system():
    return page("Self-Audit System", section("Self-Audit System", [
        "Internal review logging",
        "Account and access checks",
        "Payment flow review direction",
        "Module status checks",
        "Operational consistency checks"
    ]))

@app.route("/kitt-automation")
def kitt_automation():
    return page("KITT Automation", section("KITT Automation", [
        "Voice-guided command routing",
        "Automation routines",
        "Alert handling",
        "Mission-control style operations",
        "AI-assisted command interface"
    ]))

@app.route("/blue-energy-system")
def blue_energy_system():
    return page("Blue Energy System", section("Blue Energy System", [
        "Resilient energy system concept",
        "Distributed energy direction",
        "Smart power management",
        "Microgrid and backup direction",
        "Home and facility energy support"
    ]))

@app.route("/ambient-energy-harvesting")
def ambient_energy_harvesting():
    return page("Ambient Energy Harvesting", section("Ambient Energy Harvesting", [
        "Background energy capture concepts",
        "Low-power device support direction",
        "Sensor and monitoring support",
        "Energy research and experimentation layer"
    ]))

@app.route("/el-saturn-records")
def el_saturn_records():
    return page("El Saturn Records", section("El Saturn Records", [
        "Music label network",
        "Artist publishing direction",
        "Concert and event planning",
        "Streaming ecosystem integration",
        "Creator economy support"
    ]))

@app.route("/spectra-ent-records")
def spectra_ent_records():
    return page("Spectra ENT Records", section("Spectra ENT Records", [
        "Independent artist label",
        "Artist incubation and development",
        "Music production direction",
        "Brand development support",
        "Digital concert and event planning"
    ]))

@app.route("/health")
def health():
    return "OK"

@app.route("/favicon.ico")
def fav():
    return Response(status=204)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
