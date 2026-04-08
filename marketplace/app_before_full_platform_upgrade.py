from flask import Flask, Response, jsonify

app = Flask(__name__)

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
            .box {{
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
                max-width:650px;
                font-weight:bold;
                font-size:20px;
            }}
            .btn2 {{ background:#16a34a; }}
            .btn3 {{ background:#7c3aed; }}
            .btn4 {{ background:#d97706; }}
            .btn5 {{ background:#dc2626; }}
            .btn6 {{ background:#0891b2; }}
            ul {{
                text-align:left;
                max-width:860px;
                margin:0 auto;
            }}
        </style>
    </head>
    <body>
        <div class="box">
            <h1>All American Marketplace</h1>
            <h3>{title}</h3>
        </div>
        {body}
        <div class="box">
            <h3>Navigation</h3>
            <a class="btn" href="/">Home</a>
            <a class="btn btn2" href="/dashboard">Dashboard</a>
            <a class="btn btn3" href="/modules">Modules</a>
            <a class="btn btn4" href="/university">University</a>
            <a class="btn btn5" href="/ai-mentors">AI Mentors</a>
            <a class="btn btn6" href="/global-professionals">Global Professionals</a>
            <a class="btn" href="/talent-network">Talent Network</a>
            <a class="btn btn2" href="/alton-security">Alton Security Command</a>
            <a class="btn btn3" href="/alton-security/training">Security Training</a>
            <a class="btn btn4" href="/alton-security/compliance">Compliance</a>
            <a class="btn btn5" href="/alton-security/incidents">Incident Reports</a>
            <a class="btn btn6" href="/alton-security/scheduling">Guard Scheduling</a>
            <a class="btn" href="/alton-security/clients">Clients</a>
            <a class="btn btn2" href="/alton-security/ai-command">AI Security Command</a>
            <a class="btn btn3" href="/alton-security/events">Celebrity & Special Events</a>
            <a class="btn btn4" href="/health">Health</a>
            <a class="btn btn5" href="/status">Status</a>
        </div>
    </body>
    </html>
    """

def bullets(items):
    return "<ul>" + "".join(f"<li>{x}</li>" for x in items) + "</ul>"

@app.route("/")
def home():
    return page("Platform Ecosystem", """
    <div class="box">
        <p>Marketplace, University, Talent Network, and Security Operations integrated.</p>
    </div>
    """)

@app.route("/dashboard")
def dashboard():
    return page("Master Dashboard", """
    <div class="box">
        <p>University</p>
        <p>AI Mentors</p>
        <p>Global Professionals</p>
        <p>Talent Network</p>
        <p>Alton Security Command</p>
    </div>
    """)

@app.route("/modules")
def modules():
    return page("Module Inventory", """
    <div class="box">
        <p>University</p>
        <p>AI Mentors</p>
        <p>Global Professionals</p>
        <p>Talent Network</p>
        <p>Alton Security Operations Platform</p>
    </div>
    """)

@app.route("/university")
def university():
    return page("All American Marketplace University", bullets([
        "Grammar School",
        "High School",
        "GED Program",
        "Associate Degrees",
        "Bachelor Degrees",
        "Masters Programs",
        "PhD Programs",
        "Certification Programs"
    ]))

@app.route("/ai-mentors")
def ai_mentors():
    return page("AI Mentors", bullets([
        "AI Cybersecurity Mentor",
        "AI Blockchain Mentor",
        "AI Robotics Mentor",
        "AI Business Mentor",
        "AI Media Mentor"
    ]))

@app.route("/global-professionals")
def global_professionals():
    return page("Global Professionals", bullets([
        "Professors",
        "Industry Advisors",
        "Guest Lecturers",
        "Startup Mentors",
        "Research Leaders"
    ]))

@app.route("/talent-network")
def talent_network():
    return page("Global Talent Network", bullets([
        "Students",
        "AI Mentors",
        "Global Professionals",
        "Projects",
        "Startup Incubation",
        "Employment Matching"
    ]))

# --------------------------
# ALTON SECURITY PLATFORM
# --------------------------

@app.route("/alton-security")
def alton_security():
    return page("Alton Security Command Center", bullets([
        "Operations Dashboard",
        "Guard Scheduling",
        "Client Security Services",
        "Incident Report Center",
        "Compliance Tracking",
        "Training Academy",
        "Patrol Logs",
        "Vehicle Inspection Logs",
        "AI Command Assistant"
    ]))

@app.route("/alton-security/training")
def security_training():
    return page("Security Training Academy", bullets([
        "Observation Skills",
        "Access Control",
        "Radio Communication",
        "De-escalation Techniques",
        "First Aid / CPR Tracking",
        "Emergency Evacuation Procedures",
        "Report Writing",
        "Crowd Management"
    ]))

@app.route("/alton-security/compliance")
def security_compliance():
    return page("Compliance & Licensing", bullets([
        "Guard Card Status",
        "Certification Uploads",
        "License Renewal Reminders",
        "Insurance Records",
        "Background Check Tracking",
        "Permit Status Tracking (Concealed Carry Compliance)"
    ]))

@app.route("/alton-security/incidents")
def incident_reports():
    return page("Incident Reporting System", bullets([
        "Create Incident Reports",
        "Upload Evidence",
        "Incident Timeline Logs",
        "Supervisor Review",
        "Legal Documentation"
    ]))

@app.route("/alton-security/scheduling")
def scheduling():
    return page("Guard Scheduling System", bullets([
        "Shift Assignment",
        "Site Assignment",
        "Mobile Patrol Routes",
        "Overtime Tracking",
        "Team Availability"
    ]))

@app.route("/alton-security/clients")
def clients():
    return page("Client Management", bullets([
        "Client Contracts",
        "Site Security Plans",
        "Service Agreements",
        "Security Coverage Schedules"
    ]))

@app.route("/alton-security/ai-command")
def ai_command():
    return page("AI Security Command", bullets([
        "AI Incident Report Writer",
        "AI Risk Analysis",
        "AI Shift Planner",
        "AI Compliance Reminder",
        "AI Event Planning Assistant"
    ]))

@app.route("/alton-security/events")
def special_events():
    return page("Celebrity & Special Event Security Planning", bullets([
        "VIP Protection Planning",
        "Venue Security Coordination",
        "Access Control Zones",
        "Crowd Safety Planning",
        "Emergency Evacuation Routes",
        "Communication Command Center",
        "Coordination with Local Authorities"
    ]))

@app.route("/health")
def health():
    return "OK"

@app.route("/status")
def status():
    return jsonify({
        "platform":"All American Marketplace",
        "security_platform":"Alton Security",
        "university":"online",
        "talent_network":"online"
    })

@app.route("/favicon.ico")
def fav():
    return Response(status=204)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
