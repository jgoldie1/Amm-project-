from flask import Flask, Response
import os

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
                max-width:920px;
            }}
            .btn {{
                display:block;
                background:#0284c7;
                color:white;
                text-decoration:none;
                padding:18px;
                margin:12px auto;
                border-radius:14px;
                max-width:520px;
                font-weight:bold;
                font-size:20px;
            }}
        </style>
    </head>
    <body>
        <div class="box">
            <h1>All American Marketplace</h1>
            <p>{title}</p>
        </div>
        {body}
        <div class="box">
            <a class="btn" href="/">Home</a>
            <a class="btn" href="/dashboard">Dashboard</a>
            <a class="btn" href="/modules">Module Inventory</a>
            <a class="btn" href="/health">Health</a>
        </div>
    <script src='/static/js/gesture_nav.js'></script><script src='/static/js/world_viewer.js'></script><script src='/static/js/webgl_canvas_viewer.js'></script></body>
    </html>
    """

@app.route("/")
def home():
    return page("Recovered Local Shell", """
    <div class="box">
        <p>Server is working.</p>
        <p>This is the stable checkpoint page.</p>
    </div>
    """)

@app.route("/dashboard")
def dashboard():
    return page("Dashboard", """
    <div class="box">
        <p>Marketplace</p>
        <p>Streaming Ecosystem</p>
        <p>Quantum Speed Accelerator</p>
        <p>Quantum Lag Buster</p>
        <p>Omniverse 360 Insurance</p>
        <p>Aniyah App</p>
        <p>Cross Border</p>
        <p>FinBank</p>
        <p>Holoverse</p>
        <p>Cyber Security</p>
        <p>Employment</p>
        <p>AI TV</p>
        <p>Metaverse / Middleverse / Multiverse</p>
    </div>
    """)

@app.route("/modules")
def modules():
    return page("Module Inventory", """
    <div class="box">
        <p>All American Marketplace</p>
        <p>Holographic Streaming Ecosystem</p>
        <p>Streaming Network Omni</p>
        <p>Quantum Speed Accelerator</p>
        <p>Quantum Lag Buster</p>
        <p>Omniverse 360 Insurance</p>
        <p>Jarvis</p>
        <p>Aniyah Vocal Training</p>
        <p>Aniyah Cross Border</p>
        <p>FinBank</p>
        <p>Jacobie Vision Holoverse</p>
        <p>Jacobie Cyber Security</p>
        <p>Jacobie Employment</p>
        <p>Isaiah Anyone Can Be a Star AI TV</p>
        <p>Metaverse</p>
        <p>Middleverse</p>
        <p>Multiverse</p>
    </div>
    """)



# -------------------------
# Verified Merge Block: AAM Passport + ID Wallet
# -------------------------

def _passport_users():
    try:
        return _load("passport/passport_users.json", [])
    except:
        return []

def _save_passport_users(rows):
    _save("passport/passport_users.json", rows)

def _wallet_rows():
    try:
        return _load("passport/id_wallet.json", [])
    except:
        return []

def _save_wallet_rows(rows):
    _save("passport/id_wallet.json", rows)



# -------------------------
# Safe Render Helpers
# -------------------------
from flask import request, redirect, session

if "page" not in globals():
    def page(title, body):
        return f"""
        <html>
        <head>
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <title>{title}</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background: #0f172a;
                    color: white;
                    margin: 0;
                    padding: 20px;
                }}
                .wrap {{
                    max-width: 1000px;
                    margin: 0 auto;
                }}
                .card {{
                    background: #1e293b;
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 18px;
                    margin: 16px 0;
                }}
                .btn {{
                    display: inline-block;
                    background: #2563eb;
                    color: white;
                    text-decoration: none;
                    padding: 10px 14px;
                    border-radius: 8px;
                    margin: 6px 6px 6px 0;
                }}
                input, textarea, select {{
                    width: 100%;
                    padding: 10px;
                    margin: 8px 0;
                    border-radius: 8px;
                    border: 1px solid #475569;
                    background: #0f172a;
                    color: white;
                }}
                button {{
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 10px 14px;
                    border-radius: 8px;
                }}
                h1, h2, h3 {{ margin-top: 0; }}
                ul {{ padding-left: 20px; }}
            </style>
        </head>
        <body>
            <div class="wrap">
                <div class="card">
                    <h1>All American Marketplace</h1>
                    <h2>{title}</h2>
                    <a class="btn" href="/">Home</a>
                    <a class="btn" href="/passport-center">Passport Center</a>
                    <a class="btn" href="/passport-dashboard">Passport Dashboard</a>
                    <a class="btn" href="/passport-verify">Passport Verify</a>
                    <a class="btn" href="/id-wallet">ID Wallet</a>
                    <a class="btn" href="/login-private">Private Login</a>
                    <a class="btn" href="/logout-private">Logout Private</a>
                    <a class="btn" href="/health">Health</a>
                </div>
                {body}
            </div>
        <script src='/static/js/gesture_nav.js'></script><script src='/static/js/world_viewer.js'></script><script src='/static/js/webgl_canvas_viewer.js'></script></body>
        </html>
        """

if "section" not in globals():
    def section(title, items):
        rows = "".join(f"<li>{item}</li>" for item in items)
        return f'<div class="card"><h3>{title}</h3><ul>{rows}</ul></div>'

if not hasattr(app, "secret_key") or not app.secret_key:
    app.secret_key = "aam_private_key_fixed"

def _private_cfg_fixed():
    try:
        return _cfg_load("private_access.json", {})
    except Exception:
        return {"private_mode": False, "access_key": "AAM_PRIVATE_KEY"}

@app.route("/login-private", methods=["GET", "POST"])
def login_private_fixed():
    cfg = _private_cfg_fixed()
    if request.method == "POST":
        key = request.form.get("key", "").strip()
        if key == cfg.get("access_key", "AAM_PRIVATE_KEY"):
            session["private_access_ok"] = True
            return redirect("/passport-center")
        return page("Private Access", section("Access Error", ["Invalid private access key"]))

    body = """
    <div class="card">
        <form method="post">
            <input name="key" placeholder="Private access key">
            <button type="submit">Enter Private Site</button>
        </form>
    </div>
    """
    body += section("Private Access", [
        "This page lets you protect the platform while building",
        "Use your private key to enter"
    ])
    return page("Private Login", body)

@app.route("/logout-private")
def logout_private_fixed():
    session.pop("private_access_ok", None)
    return redirect("/login-private")



# -------------------------
# Simple Home Dashboard
# -------------------------

@app.route("/")
def home_dashboard_fixed():
    body = ""
    body += section("All American Marketplace", [
        "Private platform workspace",
        "Passport and ID wallet",
        "Visible progress tracking",
        "Assistant center",
        "Payments and commerce scaffolds",
        "Safe verified build flow"
    ])

    body += """
    <div class="card">
        <h3>Main Navigation</h3>
        <a class="btn" href="/passport-center">Passport Center</a>
        <a class="btn" href="/passport-dashboard">Passport Dashboard</a>
        <a class="btn" href="/progress">Progress</a>
        <a class="btn" href="/update-hub">Update Hub</a>
        <a class="btn" href="/login-private">Private Login</a>
        <a class="btn" href="/assistant-center">Assistant Center</a>
        <a class="btn" href="/assistant-chat">Assistant Chat</a>
        <a class="btn" href="/payments-live">Payments Live</a>
        <a class="btn" href="/marketplace">Marketplace</a>
        <a class="btn" href="/health">Health</a>
    </div>
    """

    body += section("What This Does", [
        "Creates one clear homepage for the live app",
        "Makes testing and navigation much easier",
        "Turns the current working build into a more usable platform shell"
    ])

    return page("Home Dashboard", body)

@app.route("/passport-center")
def passport_center():
    body=""
    body+=section("All American Marketplace Passport",[
        "Universal identity across the platform",
        "Creator verification",
        "Marketplace seller verification",
        "University student ID",
        "Delivery and logistics verification"
    ])
    body+=section("Open Passport Tools",[
        "/passport-dashboard",
        "/passport-verify",
        "/id-wallet"
    ])
    return page("AAM Passport Center",body)

@app.route("/passport-dashboard")
def passport_dashboard():
    users=_passport_users()
    body=""
    body+=section("Passport Registry",[
        f"Registered Passport Users: {len(users)}"
    ])
    return page("Passport Dashboard",body)

@app.route("/passport-verify",methods=["GET","POST"])
def passport_verify():
    rows=_passport_users()
    if request.method=="POST":
        email=request.form.get("email","").strip()
        pid="AAM-"+str(uuid.uuid4())[:8]
        rows.append({
            "passport_id": pid,
            "email": email,
            "verified": True,
            "created_at": str(datetime.datetime.now())
        })
        _save_passport_users(rows)
        return redirect("/passport-dashboard")

    body="""
    <div class="card">
      <form method="post">
        <input name="email" placeholder="User Email">
        <button class="btn btn2" type="submit">Create Passport</button>
      </form>
    </div>
    """
    return page("Passport Verification",body)

@app.route("/id-wallet")
def id_wallet():
    wallet=_wallet_rows()
    body=""
    body+=section("Identity Wallet",[
        f"Stored Credentials: {len(wallet)}"
    ])
    body+=section("Wallet Types",[
        "Creator Verification",
        "Seller License",
        "University Certificate",
        "Security Credential",
        "Delivery Driver Approval"
    ])
    return page("ID Wallet",body)



# -------------------------
# Visible Progress + Update Hub
# -------------------------

def _safe_load_json(relpath):
    try:
        return _load(relpath, [])
    except Exception:
        return []

@app.route("/progress")
def progress_live_fixed():
    users = _safe_load_json("users_live.json")
    join_free = _safe_load_json("join_free_submissions.json")
    creator_setup = _safe_load_json("creator_setup_submissions.json")
    upgrades = _safe_load_json("upgrade_interest.json")
    verification = _safe_load_json("verification_applications.json")
    founder = _safe_load_json("founder_access_requests.json")
    media = _safe_load_json("media_assets.json")
    support = _safe_load_json("support_payments_live.json")
    automation = _safe_load_json("automation_events.json")
    moderation = _safe_load_json("moderation_queue.json")
    notifications = _safe_load_json("notifications_live.json")
    checkout = _safe_load_json("checkout_requests.json")
    passports = _safe_load_json("passport/passport_users.json")
    wallet = _safe_load_json("passport/id_wallet.json")

    body = ""
    body += section("Platform Progress Summary", [
        f"Users: {len(users)}",
        f"Join Free submissions: {len(join_free)}",
        f"Creator Setup submissions: {len(creator_setup)}",
        f"Upgrade requests: {len(upgrades)}",
        f"Verification applications: {len(verification)}",
        f"Founder requests: {len(founder)}",
        f"Media uploads: {len(media)}",
        f"Support payments: {len(support)}",
        f"Checkout requests: {len(checkout)}",
        f"Automation events: {len(automation)}",
        f"Moderation items: {len(moderation)}",
        f"Notifications: {len(notifications)}",
        f"Passport users: {len(passports)}",
        f"ID wallet credentials: {len(wallet)}"
    ])

    if users:
        body += section("Recent Users", [
            f"{u.get('username', 'unknown')} | {u.get('role', 'member')}"
            for u in users[-10:]
        ])

    if media:
        body += section("Recent Media Uploads", [
            f"{m.get('title', 'Untitled')} | {m.get('owner', 'unknown')}"
            for m in media[-10:]
        ])

    body += section("What This Does", [
        "Shows what is actually saved in the platform",
        "Makes your progress visible in one place",
        "Helps confirm the live app is updating correctly"
    ])

    return page("Progress Dashboard", body)

@app.route("/update-hub")
def update_hub_live_fixed():
    body = ""
    body += section("Visible Route Hub", [
        "/passport-center",
        "/passport-dashboard",
        "/passport-verify",
        "/id-wallet",
        "/progress",
        "/update-hub",
        "/login-private",
        "/logout-private",
        "/health"
    ])
    body += section("What This Does", [
        "Gives you one place to see the important live routes",
        "Makes testing much easier"
    ])
    return page("Update Hub", body)



# -------------------------
# Payments + Marketplace Cleanup
# -------------------------

@app.route("/payments-live")
def payments_live_fixed():
    body = ""
    body += section("Payments Live", [
        "Stripe-ready payment scaffold",
        "Cash App support option",
        "Creator upgrades",
        "Support and donation intake",
        "Marketplace checkout bridge",
        "Future wallet and treasury connection"
    ])

    body += """
    <div class="card">
        <h3>Payment Actions</h3>
        <a class="btn" href="/support-center">Support Center</a>
        <a class="btn" href="/progress">View Progress</a>
        <a class="btn" href="/marketplace">Open Marketplace</a>
    </div>
    """

    body += section("What This Does", [
        "Creates a cleaner money flow center",
        "Prepares the platform for real checkout later",
        "Supports upgrades, donations, and creator payments"
    ])
    return page("Payments Live", body)

@app.route("/marketplace")
def marketplace_fixed():
    body = ""
    body += section("All American Marketplace", [
        "American-made product promotion",
        "Global supplier bridge",
        "Creator storefront commerce",
        "Live selling foundation",
        "AI product analysis direction",
        "Shipping and tracking integration"
    ])

    body += """
    <div class="card">
        <h3>Marketplace Navigation</h3>
        <a class="btn" href="/marketplace-sellers">Seller Center</a>
        <a class="btn" href="/payments-live">Payments Live</a>
        <a class="btn" href="/support-center">Support Center</a>
        <a class="btn" href="/progress">Progress</a>
    </div>
    """

    body += section("Marketplace Features", [
        "USA and global sourcing",
        "Quantum shipping direction",
        "Tariff intelligence direction",
        "Live commerce direction",
        "Seller trust and verification direction"
    ])

    return page("Marketplace", body)

@app.route("/marketplace-sellers")
def marketplace_sellers_fixed():
    body = ""
    body += section("Seller Center", [
        "Seller onboarding",
        "American-made vendor promotion",
        "Global supplier registration",
        "Vendor trust planning",
        "Seller payout readiness",
        "Marketplace verification pathway"
    ])
    body += section("What This Does", [
        "Creates a seller-focused entry point",
        "Supports marketplace growth and vendor organization"
    ])
    return page("Marketplace Seller Center", body)

@app.route("/support-center")
def support_center_fixed():
    body = ""
    body += section("Support Center", [
        "Founder support",
        "Creator support",
        "Marketplace support",
        "Beta support",
        "Upgrade questions",
        "Payment questions"
    ])
    body += section("What This Does", [
        "Creates a cleaner support and contribution page",
        "Improves trust and funding pathways"
    ])
    return page("Support Center", body)



# -------------------------
# Policy + Risk + Insurance Readiness Layer
# -------------------------

def _protection_cfg():
    try:
        return _cfg_load("protection_policy.json", {})
    except Exception:
        return {"policy_hub": {"documents": []}, "coverage_layer": {"categories": []}}

def _risk_rows():
    try:
        return _load("protection/risk_register.json", [])
    except Exception:
        return []

def _save_risk_rows(rows):
    _save("protection/risk_register.json", rows)

def _claim_rows():
    try:
        return _load("protection/claims_register.json", [])
    except Exception:
        return []

def _save_claim_rows(rows):
    _save("protection/claims_register.json", rows)

def _coverage_rows():
    try:
        return _load("protection/coverage_register.json", [])
    except Exception:
        return []

def _save_coverage_rows(rows):
    _save("protection/coverage_register.json", rows)

@app.route("/policy-hub")
def policy_hub():
    cfg = _protection_cfg()
    body = ""
    body += section("Policy Hub", cfg.get("policy_hub", {}).get("documents", []))
    body += section("What This Does", [
        "Creates one place for platform policies and governance references",
        "Makes the platform easier to manage and review"
    ])
    return page("Policy Hub", body)

@app.route("/coverage-layer")
def coverage_layer():
    cfg = _protection_cfg()
    coverage = _coverage_rows()
    body = ""
    body += section("Coverage Layer", cfg.get("coverage_layer", {}).get("categories", []))
    body += section("Coverage Records", [f"Tracked coverage items: {len(coverage)}"])
    body += section("What This Does", [
        "Tracks protection categories the business should review",
        "Prepares the platform for future insurance planning"
    ])
    return page("Coverage Layer", body)

@app.route("/risk-protection", methods=["GET","POST"])
def risk_protection():
    rows = _risk_rows()
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "risk_type": request.form.get("risk_type", "").strip() or "general_risk",
            "area": request.form.get("area", "").strip() or "platform",
            "severity": request.form.get("severity", "").strip() or "medium",
            "notes": request.form.get("notes", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_risk_rows(rows)
        return redirect("/risk-protection")

    body = """
    <div class="card">
        <form method="post">
            <input name="risk_type" placeholder="payment_dispute / fraud / outage / delivery_loss / content_claim">
            <input name="area" placeholder="platform / marketplace / creator / delivery / streaming">
            <input name="severity" placeholder="low / medium / high / critical">
            <textarea name="notes" placeholder="Risk notes"></textarea>
            <button class="btn btn2" type="submit">Save Risk Record</button>
        </form>
    </div>
    """
    body += section("Risk Records", [
        f"Total tracked risks: {len(rows)}"
    ])
    if rows:
        body += section("Recent Risks", [
            f"{x.get('risk_type')} | {x.get('area')} | {x.get('severity')}"
            for x in rows[-20:]
        ])
    return page("Risk Protection", body)

@app.route("/business-protection-shell")
def business_protection_shell():
    body = ""
    body += section("Business Protection Shell", [
        "policy hub",
        "coverage layer",
        "risk protection",
        "claims workflow",
        "fraud protection",
        "compliance and tax layers",
        "legal and moderation references"
    ])
    body += section("What This Does", [
        "Creates an operating shell for business protection and governance",
        "Connects policy, risk, compliance, and claims readiness"
    ])
    return page("Business Protection Shell", body)

@app.route("/asset-protection", methods=["GET","POST"])
def asset_protection():
    rows = _coverage_rows()
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "asset_type": request.form.get("asset_type", "").strip() or "general_asset",
            "asset_name": request.form.get("asset_name", "").strip() or "unnamed_asset",
            "coverage_status": request.form.get("coverage_status", "").strip() or "planned",
            "notes": request.form.get("notes", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_coverage_rows(rows)
        return redirect("/asset-protection")

    body = """
    <div class="card">
        <form method="post">
            <input name="asset_type" placeholder="equipment / cloud / IP / delivery_asset / warehouse / brand">
            <input name="asset_name" placeholder="Asset name">
            <input name="coverage_status" placeholder="planned / under_review / active / deferred">
            <textarea name="notes" placeholder="Asset protection notes"></textarea>
            <button class="btn btn2" type="submit">Save Asset Protection Record</button>
        </form>
    </div>
    """
    body += section("Asset Protection Records", [f"Tracked assets: {len(rows)}"])
    if rows:
        body += section("Recent Assets", [
            f"{x.get('asset_type')} | {x.get('asset_name')} | {x.get('coverage_status')}"
            for x in rows[-20:]
        ])
    return page("Asset Protection", body)

@app.route("/claims-workflow", methods=["GET","POST"])
def claims_workflow():
    rows = _claim_rows()
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "claim_type": request.form.get("claim_type", "").strip() or "general_claim",
            "incident_area": request.form.get("incident_area", "").strip() or "platform",
            "status": request.form.get("status", "").strip() or "open",
            "notes": request.form.get("notes", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_claim_rows(rows)
        return redirect("/claims-workflow")

    body = """
    <div class="card">
        <form method="post">
            <input name="claim_type" placeholder="chargeback / outage / delivery_loss / content_claim / property_loss">
            <input name="incident_area" placeholder="platform / marketplace / creator / delivery / streaming">
            <input name="status" placeholder="open / review / resolved / closed">
            <textarea name="notes" placeholder="Claim notes"></textarea>
            <button class="btn btn2" type="submit">Save Claim Record</button>
        </form>
    </div>
    """
    body += section("Claims Workflow", [f"Tracked claims: {len(rows)}"])
    if rows:
        body += section("Recent Claims", [
            f"{x.get('claim_type')} | {x.get('incident_area')} | {x.get('status')}"
            for x in rows[-20:]
        ])
    body += section("What This Does", [
        "Creates a future claims handling structure",
        "Improves evidence tracking and incident organization"
    ])
    return page("Claims Workflow", body)



# -------------------------
# Protection Center Dashboard
# -------------------------

@app.route("/protection-center")
def protection_center():

    body = ""

    body += section("Platform Protection Center",[
        "Policy Hub",
        "Coverage Layer",
        "Risk Protection",
        "Business Protection Shell",
        "Asset Protection",
        "Claims Workflow"
    ])

    body += '''
    <div class="card">
        <h3>Protection Navigation</h3>

        <a class="btn" href="/policy-hub">Policy Hub</a>
        <a class="btn" href="/coverage-layer">Coverage Layer</a>
        <a class="btn" href="/risk-protection">Risk Protection</a>
        <a class="btn" href="/business-protection-shell">Business Protection Shell</a>
        <a class="btn" href="/asset-protection">Asset Protection</a>
        <a class="btn" href="/claims-workflow">Claims Workflow</a>

    </div>
    '''

    body += section("What This Does",[
        "Makes the entire protection system visible",
        "Centralizes legal and risk management",
        "Prepares the platform for insurance and compliance"
    ])

    return page("Protection Center", body)



# -------------------------
# Metaverse + Middleverse + Multiverse
# -------------------------

def _verse_cfg():
    try:
        return _cfg_load("verse_system.json", {})
    except Exception:
        return {
            "metaverse": {"functions": []},
            "middleverse": {"functions": []},
            "multiverse": {"functions": []}
        }

@app.route("/verse-center")
def verse_center():
    body = ""
    body += section("Verse Center", [
        "Metaverse",
        "Middleverse",
        "Multiverse"
    ])
    body += """
    <div class="card">
        <h3>Verse Navigation</h3>
        <a class="btn" href="/metaverse">Metaverse</a>
        <a class="btn" href="/middleverse">Middleverse</a>
        <a class="btn" href="/multiverse">Multiverse</a>
    </div>
    """
    body += section("What This Does", [
        "Creates the immersive world structure of the platform",
        "Connects standard app use to immersive experiences",
        "Organizes the ecosystem into connected experience layers"
    ])
    return page("Verse Center", body)

@app.route("/metaverse")
def metaverse():
    cfg = _verse_cfg()
    body = ""
    body += section("Metaverse Functions", cfg.get("metaverse", {}).get("functions", []))
    body += section("What This Does", [
        "Creates immersive creator, commerce, event, and education spaces",
        "Supports holographic and experiential platform growth"
    ])
    return page("Metaverse", body)

@app.route("/middleverse")
def middleverse():
    cfg = _verse_cfg()
    body = ""
    body += section("Middleverse Functions", cfg.get("middleverse", {}).get("functions", []))
    body += section("What This Does", [
        "Acts as the bridge between normal app pages and immersive environments",
        "Makes transitions between systems easier and more organized"
    ])
    return page("Middleverse", body)

@app.route("/multiverse")
def multiverse():
    cfg = _verse_cfg()
    body = ""
    body += section("Multiverse Functions", cfg.get("multiverse", {}).get("functions", []))
    body += section("What This Does", [
        "Connects multiple worlds across creators, commerce, ministry, education, logistics, and streaming",
        "Turns the ecosystem into a network of connected platform domains"
    ])
    return page("Multiverse", body)



@app.route("/verse-links")
def verse_links():
    body = ""
    body += section("Verse Links", [
        "/verse-center",
        "/metaverse",
        "/middleverse",
        "/multiverse"
    ])
    body += """
    <div class="card">
        <a class="btn" href="/verse-center">Verse Center</a>
        <a class="btn" href="/metaverse">Metaverse</a>
        <a class="btn" href="/middleverse">Middleverse</a>
        <a class="btn" href="/multiverse">Multiverse</a>
    </div>
    """
    return page("Verse Links", body)



# -------------------------
# Gesture Navigation + Accessibility Layer
# -------------------------

@app.route("/gesture-center")
def gesture_center():
    body = ""
    body += section("Gesture Navigation", [
        "swipe left = next panel",
        "swipe right = previous panel",
        "swipe up = expand details",
        "swipe down = close panel"
    ])
    body += section("Accessibility Protections", [
        "button fallback for every gesture action",
        "voice fallback supported",
        "keyboard fallback supported",
        "one-hand mode support",
        "reduced motion safety"
    ])
    body += """
    <div class="card">
        <h3>Accessible Navigation Options</h3>
        <a class="btn" href="/gesture-demo">Gesture Demo</a>
        <a class="btn" href="/assistant-center">Assistant Center</a>
        <a class="btn" href="/progress">Progress</a>
        <a class="btn" href="/update-hub">Update Hub</a>
    </div>
    """
    body += section("What This Does", [
        "Adds swipe navigation without removing accessible alternatives",
        "Makes the mobile app feel more modern while staying inclusive"
    ])
    return page("Gesture Center", body)

@app.route("/gesture-demo")
def gesture_demo():
    body = """
    <div class="card" id="gesture-box">
        <h3>Gesture Demo Area</h3>
        <p>Swipe left, right, up, or down inside the app.</p>
        <p id="gesture-status">Last gesture: none</p>
        <div style="margin-top:12px;">
            <button onclick="document.getElementById('gesture-status').innerText='Last gesture: previous panel'">Previous Panel</button>
            <button onclick="document.getElementById('gesture-status').innerText='Last gesture: next panel'">Next Panel</button>
            <button onclick="document.getElementById('gesture-status').innerText='Last gesture: expand details'">Expand Details</button>
            <button onclick="document.getElementById('gesture-status').innerText='Last gesture: close panel'">Close Panel</button>
        </div>
    </div>
    <script>
      document.addEventListener("aam-swipe-left", function(){ document.getElementById("gesture-status").innerText = "Last gesture: swipe left → next panel"; });
      document.addEventListener("aam-swipe-right", function(){ document.getElementById("gesture-status").innerText = "Last gesture: swipe right → previous panel"; });
      document.addEventListener("aam-swipe-up", function(){ document.getElementById("gesture-status").innerText = "Last gesture: swipe up → expand details"; });
      document.addEventListener("aam-swipe-down", function(){ document.getElementById("gesture-status").innerText = "Last gesture: swipe down → close panel"; });
    </script>
    """
    body += section("Accessibility Note", [
        "Every swipe action also has a visible button",
        "This keeps the app usable across disability needs"
    ])
    return page("Gesture Demo", body)



# -------------------------
# Platform Command Center
# -------------------------

@app.route("/command-center")
def command_center():
    body = ""
    body += section("Platform Command Center", [
        "Identity and passport systems",
        "Visible progress tracking",
        "Policy, risk, and claims readiness",
        "Verse and immersive layers",
        "Payments and marketplace systems",
        "Assistant and accessibility layers",
        "Gesture and mobile interaction layer"
    ])

    body += """
    <div class="card">
        <h3>Core Controls</h3>
        <a class="btn" href="/passport-center">Passport Center</a>
        <a class="btn" href="/passport-dashboard">Passport Dashboard</a>
        <a class="btn" href="/progress">Progress</a>
        <a class="btn" href="/update-hub">Update Hub</a>
        <a class="btn" href="/protection-center">Protection Center</a>
        <a class="btn" href="/policy-hub">Policy Hub</a>
        <a class="btn" href="/coverage-layer">Coverage Layer</a>
        <a class="btn" href="/risk-protection">Risk Protection</a>
        <a class="btn" href="/claims-workflow">Claims Workflow</a>
    </div>
    """

    body += """
    <div class="card">
        <h3>Experience Layers</h3>
        <a class="btn" href="/verse-center">Verse Center</a>
        <a class="btn" href="/metaverse">Metaverse</a>
        <a class="btn" href="/middleverse">Middleverse</a>
        <a class="btn" href="/multiverse">Multiverse</a>
        <a class="btn" href="/gesture-center">Gesture Center</a>
        <a class="btn" href="/gesture-demo">Gesture Demo</a>
    </div>
    """

    body += """
    <div class="card">
        <h3>Commerce and Support</h3>
        <a class="btn" href="/payments-live">Payments Live</a>
        <a class="btn" href="/marketplace">Marketplace</a>
        <a class="btn" href="/marketplace-sellers">Seller Center</a>
        <a class="btn" href="/support-center">Support Center</a>
        <a class="btn" href="/id-wallet">ID Wallet</a>
    </div>
    """

    body += """
    <div class="card">
        <h3>Assistant and Private Access</h3>
        <a class="btn" href="/assistant-center">Assistant Center</a>
        <a class="btn" href="/assistant-chat">Assistant Chat</a>
        <a class="btn" href="/login-private">Private Login</a>
        <a class="btn" href="/logout-private">Logout Private</a>
        <a class="btn" href="/health">Health</a>
    </div>
    """

    body += section("What This Does", [
        "Creates one operator dashboard for the whole platform",
        "Makes navigation easier and more professional",
        "Turns the working app into a more unified control shell"
    ])

    return page("Platform Command Center", body)



# -------------------------
# History + Memory + Archive + Holographic Generation
# -------------------------

def _history_rows():
    try:
        return _load("memory/chat_history.json", [])
    except Exception:
        return []

def _save_history_rows(rows):
    _save("memory/chat_history.json", rows)

def _memory_rows():
    try:
        return _load("memory/pinned_memory.json", [])
    except Exception:
        return []

def _save_memory_rows(rows):
    _save("memory/pinned_memory.json", rows)

def _archive_rows():
    try:
        return _load("archive/archive_sessions.json", [])
    except Exception:
        return []

def _save_archive_rows(rows):
    _save("archive/archive_sessions.json", rows)

def _holo_rows():
    try:
        return _load("holographic/generation_jobs.json", [])
    except Exception:
        return []

def _save_holo_rows(rows):
    _save("holographic/generation_jobs.json", rows)

def _holo_cfg():
    try:
        return _cfg_load("holographic_generation.json", {})
    except Exception:
        return {"holographic_generation": {"types": [], "quality_modes": []}}

@app.route("/history-center", methods=["GET","POST"])
def history_center():
    rows = _history_rows()
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "title": request.form.get("title", "").strip() or "Untitled Session",
            "content": request.form.get("content", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_history_rows(rows)
        return redirect("/history-center")

    body = """
    <div class="card">
        <form method="post">
            <input name="title" placeholder="Session title">
            <textarea name="content" placeholder="Conversation or notes"></textarea>
            <button class="btn btn2" type="submit">Save History</button>
        </form>
    </div>
    """
    body += section("History Records", [f"Saved sessions: {len(rows)}"])
    if rows:
        body += section("Recent History", [
            f"{x.get('title')} | {x.get('created_at')}"
            for x in rows[-20:]
        ])
    body += section("What This Does", [
        "Creates conversation and work-session continuity",
        "Keeps a running record of platform activity and notes"
    ])
    return page("History Center", body)

@app.route("/memory-center", methods=["GET","POST"])
def memory_center():
    rows = _memory_rows()
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "memory_key": request.form.get("memory_key", "").strip() or "general_memory",
            "memory_value": request.form.get("memory_value", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_memory_rows(rows)
        return redirect("/memory-center")

    body = """
    <div class="card">
        <form method="post">
            <input name="memory_key" placeholder="Preference / setting / pinned fact">
            <textarea name="memory_value" placeholder="Memory value"></textarea>
            <button class="btn btn2" type="submit">Save Memory</button>
        </form>
    </div>
    """
    body += section("Pinned Memory", [f"Saved memory items: {len(rows)}"])
    if rows:
        body += section("Recent Memory", [
            f"{x.get('memory_key')} | {x.get('memory_value')}"
            for x in rows[-20:]
        ])
    body += section("What This Does", [
        "Stores important long-term preferences and facts",
        "Makes the platform feel more personalized and persistent"
    ])
    return page("Memory Center", body)

@app.route("/archive-center", methods=["GET","POST"])
def archive_center():
    rows = _archive_rows()
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "title": request.form.get("title", "").strip() or "Archived Session",
            "notes": request.form.get("notes", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_archive_rows(rows)
        return redirect("/archive-center")

    body = """
    <div class="card">
        <form method="post">
            <input name="title" placeholder="Archive title">
            <textarea name="notes" placeholder="Archive notes"></textarea>
            <button class="btn btn2" type="submit">Archive Session</button>
        </form>
    </div>
    """
    body += section("Archive", [f"Archived items: {len(rows)}"])
    if rows:
        body += section("Recent Archive", [
            f"{x.get('title')} | {x.get('created_at')}"
            for x in rows[-20:]
        ])
    body += section("What This Does", [
        "Moves older sessions out of the main flow without deleting them",
        "Improves organization and long-term record keeping"
    ])
    return page("Archive Center", body)

@app.route("/holographic-generation", methods=["GET","POST"])
def holographic_generation():
    rows = _holo_rows()
    cfg = _holo_cfg().get("holographic_generation", {})
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "job_type": request.form.get("job_type", "").strip() or "creator_scene",
            "quality_mode": request.form.get("quality_mode", "").strip() or "draft",
            "prompt": request.form.get("prompt", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_holo_rows(rows)
        return redirect("/holographic-generation")

    type_options = "".join([f'<option value="{v}">{v}</option>' for v in cfg.get("types", [])])
    quality_options = "".join([f'<option value="{v}">{v}</option>' for v in cfg.get("quality_modes", [])])

    body = f"""
    <div class="card">
        <form method="post">
            <select name="job_type">{type_options}</select>
            <select name="quality_mode">{quality_options}</select>
            <textarea name="prompt" placeholder="Describe the holographic visual or immersive scene"></textarea>
            <button class="btn btn2" type="submit">Create Generation Job</button>
        </form>
    </div>
    """
    body += section("Generation Jobs", [f"Saved holographic jobs: {len(rows)}"])
    if rows:
        body += section("Recent Generation Jobs", [
            f"{x.get('job_type')} | {x.get('quality_mode')} | {x.get('created_at')}"
            for x in rows[-20:]
        ])
    body += section("What This Does", [
        "Creates a holographic generation command layer",
        "Supports immersive promos, scenes, cards, overlays, and world concepts"
    ])
    return page("Holographic Generation", body)

@app.route("/memory-command")
def memory_command():
    body = ""
    body += section("Memory Command Layer", [
        "/history-center",
        "/memory-center",
        "/archive-center",
        "/holographic-generation"
    ])
    body += section("What This Does", [
        "Creates a central command layer for memory, archive, and holographic generation",
        "Makes the platform feel more like a persistent assistant operating system"
    ])
    return page("Memory Command", body)



# -------------------------
# Holographic Generation Results Layer
# -------------------------

@app.route("/holographic-results")
def holographic_results():
    rows = _holo_rows() if "_holo_rows" in globals() else []
    body = ""
    body += section("Holographic Results Queue", [
        f"Saved generation jobs: {len(rows)}"
    ])

    if rows:
        cards = ""
        for x in rows[-20:][::-1]:
            prompt = x.get("prompt", "No prompt")
            job_type = x.get("job_type", "creator_scene")
            quality = x.get("quality_mode", "draft")
            status = x.get("status", "complete_mock")
            cards += f"""
            <div class="card">
                <h3>{job_type} | {quality}</h3>
                <p><strong>Status:</strong> {status}</p>
                <p><strong>Prompt:</strong> {prompt}</p>
                <div style="margin-top:12px;padding:18px;border-radius:12px;background:linear-gradient(135deg,#0ea5e9,#7c3aed,#22c55e);color:white;">
                    <h3>Mock Holographic Preview</h3>
                    <p>This is the current visual placeholder for: {job_type}</p>
                    <p>Quality mode: {quality}</p>
                </div>
            </div>
            """
        body += cards
    else:
        body += section("No Results Yet", [
            "Create a holographic generation job first"
        ])

    body += section("What This Does", [
        "Makes saved holographic jobs visible",
        "Adds a preview/result experience",
        "Prepares the platform for real rendered outputs later"
    ])
    return page("Holographic Results", body)


# -------------------------
# XR Holographic Engine
# -------------------------

def _xr_worlds():
    try:
        return _load("xr_engine/worlds.json",[])
    except:
        return []

@app.route("/xr-engine")
def xr_engine():

    body=""

    body+=section("XR Engine",[
        "3D environments",
        "4D event timelines",
        "5D intelligent worlds",
        "AR overlay system",
        "VR immersive worlds",
        "Mixed reality interaction"
    ])

    body+="""
    <div class="card">
    <h3>XR Navigation</h3>
    <a class="btn" href="/xr-worlds">Worlds</a>
    <a class="btn" href="/xr-scenes">Scenes</a>
    <a class="btn" href="/xr-games">Gaming Engine</a>
    </div>
    """

    body+=section("What This Does",[
        "Creates the holographic AR VR infrastructure",
        "Supports immersive creator worlds",
        "Prepares the platform for holographic gaming"
    ])

    return page("XR Engine",body)

@app.route("/xr-worlds")
def xr_worlds():

    rows=_xr_worlds()

    body=section("XR Worlds",[f"Worlds created: {len(rows)}"])

    return page("XR Worlds",body)

@app.route("/xr-games")
def xr_games():

    body=section("Holographic Gaming Engine",[
        "battle arenas",
        "creator tournaments",
        "collectible holographic cards",
        "metaverse competitions"
    ])

    return page("XR Gaming",body)



# -------------------------
# AI World Builder + Scene Generator
# -------------------------

def _world_builder_cfg():
    try:
        return _cfg_load("world_builder.json", {})
    except Exception:
        return {"world_builder": {"world_types": [], "scene_types": [], "quality_modes": []}}

def _xr_world_rows():
    try:
        return _load("xr_engine/worlds.json", [])
    except Exception:
        return []

def _save_xr_world_rows(rows):
    _save("xr_engine/worlds.json", rows)

def _xr_scene_rows():
    try:
        return _load("xr_engine/scenes.json", [])
    except Exception:
        return []

def _save_xr_scene_rows(rows):
    _save("xr_engine/scenes.json", rows)

@app.route("/ai-world-builder", methods=["GET","POST"])
def ai_world_builder():
    cfg = _world_builder_cfg().get("world_builder", {})
    rows = _xr_world_rows()

    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "world_name": request.form.get("world_name", "").strip() or "Untitled World",
            "world_type": request.form.get("world_type", "").strip() or "creator_world",
            "quality_mode": request.form.get("quality_mode", "").strip() or "draft",
            "description": request.form.get("description", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_xr_world_rows(rows)
        return redirect("/world-registry")

    world_options = "".join([f'<option value="{v}">{v}</option>' for v in cfg.get("world_types", [])])
    quality_options = "".join([f'<option value="{v}">{v}</option>' for v in cfg.get("quality_modes", [])])

    body = f"""
    <div class="card">
        <form method="post">
            <input name="world_name" placeholder="World name">
            <select name="world_type">{world_options}</select>
            <select name="quality_mode">{quality_options}</select>
            <textarea name="description" placeholder="Describe the world"></textarea>
            <button class="btn btn2" type="submit">Create World</button>
        </form>
    </div>
    """
    body += section("What This Does", [
        "Creates immersive world records for the platform",
        "Supports creators, commerce, education, events, and gaming"
    ])
    return page("AI World Builder", body)

@app.route("/scene-generator", methods=["GET","POST"])
def scene_generator():
    cfg = _world_builder_cfg().get("world_builder", {})
    rows = _xr_scene_rows()

    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "scene_name": request.form.get("scene_name", "").strip() or "Untitled Scene",
            "scene_type": request.form.get("scene_type", "").strip() or "stage_scene",
            "quality_mode": request.form.get("quality_mode", "").strip() or "draft",
            "prompt": request.form.get("prompt", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_xr_scene_rows(rows)
        return redirect("/xr-scenes")

    scene_options = "".join([f'<option value="{v}">{v}</option>' for v in cfg.get("scene_types", [])])
    quality_options = "".join([f'<option value="{v}">{v}</option>' for v in cfg.get("quality_modes", [])])

    body = f"""
    <div class="card">
        <form method="post">
            <input name="scene_name" placeholder="Scene name">
            <select name="scene_type">{scene_options}</select>
            <select name="quality_mode">{quality_options}</select>
            <textarea name="prompt" placeholder="Describe the holographic scene"></textarea>
            <button class="btn btn2" type="submit">Create Scene</button>
        </form>
    </div>
    """
    body += section("What This Does", [
        "Creates scene records for holographic and XR environments",
        "Supports stages, shops, arenas, classrooms, promos, and avatars"
    ])
    return page("Scene Generator", body)

@app.route("/xr-scenes")
def xr_scenes():
    rows = _xr_scene_rows()
    body = ""
    body += section("XR Scenes", [f"Saved scenes: {len(rows)}"])
    if rows:
        body += section("Recent Scenes", [
            f"{x.get('scene_name')} | {x.get('scene_type')} | {x.get('quality_mode')}"
            for x in rows[-20:]
        ])
    return page("XR Scenes", body)

@app.route("/world-registry")
def world_registry():
    rows = _xr_world_rows()
    body = ""
    body += section("World Registry", [f"Saved worlds: {len(rows)}"])
    if rows:
        body += section("Recent Worlds", [
            f"{x.get('world_name')} | {x.get('world_type')} | {x.get('quality_mode')}"
            for x in rows[-20:]
        ])
    return page("World Registry", body)



# -------------------------
# World Blueprint System
# -------------------------

def _world_blueprint_cfg():
    try:
        return _cfg_load("world_blueprint_system.json", {})
    except Exception:
        return {"world_blueprint_system": {"sections": []}}

def _world_blueprint_rows():
    try:
        return _load("xr_engine/world_blueprints.json", [])
    except Exception:
        return []

def _save_world_blueprint_rows(rows):
    _save("xr_engine/world_blueprints.json", rows)

@app.route("/world-blueprint-center")
def world_blueprint_center():
    cfg = _world_blueprint_cfg().get("world_blueprint_system", {})
    body = ""
    body += section("World Blueprint Sections", cfg.get("sections", []))
    body += """
    <div class="card">
        <h3>World Blueprint Navigation</h3>
        <a class="btn" href="/world-blueprint-builder">World Blueprint Builder</a>
        <a class="btn" href="/world-blueprint-registry">World Blueprint Registry</a>
        <a class="btn" href="/world-prompt-guide">World Prompt Guide</a>
    </div>
    """
    body += section("What This Does", [
        "Creates a complete world-planning structure",
        "Helps the AI and builder generate more useful immersive worlds",
        "Supports monetization, accessibility, security, and mobile readiness"
    ])
    return page("World Blueprint Center", body)

@app.route("/world-blueprint-builder", methods=["GET","POST"])
def world_blueprint_builder():
    rows = _world_blueprint_rows()

    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "world_name": request.form.get("world_name", "").strip() or "Untitled World",
            "world_type": request.form.get("world_type", "").strip() or "creator_world",
            "mission_statement": request.form.get("mission_statement", "").strip(),
            "zone_map": request.form.get("zone_map", "").strip(),
            "object_inventory": request.form.get("object_inventory", "").strip(),
            "interaction_map": request.form.get("interaction_map", "").strip(),
            "avatar_behavior_guide": request.form.get("avatar_behavior_guide", "").strip(),
            "event_timeline": request.form.get("event_timeline", "").strip(),
            "commerce_logic": request.form.get("commerce_logic", "").strip(),
            "accessibility_map": request.form.get("accessibility_map", "").strip(),
            "security_risk_notes": request.form.get("security_risk_notes", "").strip(),
            "performance_budget": request.form.get("performance_budget", "").strip(),
            "mobile_fallback_mode": request.form.get("mobile_fallback_mode", "").strip(),
            "gesture_voice_control_plan": request.form.get("gesture_voice_control_plan", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_world_blueprint_rows(rows)
        return redirect("/world-blueprint-registry")

    body = """
    <div class="card">
        <form method="post">
            <input name="world_name" placeholder="World name">
            <input name="world_type" placeholder="creator_world / storefront_world / battle_world / classroom_world / ministry_world">
            <textarea name="mission_statement" placeholder="World mission statement"></textarea>
            <textarea name="zone_map" placeholder="Zone map"></textarea>
            <textarea name="object_inventory" placeholder="Object inventory"></textarea>
            <textarea name="interaction_map" placeholder="Interaction map"></textarea>
            <textarea name="avatar_behavior_guide" placeholder="Avatar behavior guide"></textarea>
            <textarea name="event_timeline" placeholder="Event timeline"></textarea>
            <textarea name="commerce_logic" placeholder="Commerce logic"></textarea>
            <textarea name="accessibility_map" placeholder="Accessibility map"></textarea>
            <textarea name="security_risk_notes" placeholder="Security and risk notes"></textarea>
            <textarea name="performance_budget" placeholder="Performance budget"></textarea>
            <textarea name="mobile_fallback_mode" placeholder="Mobile fallback mode"></textarea>
            <textarea name="gesture_voice_control_plan" placeholder="Gesture and voice control plan"></textarea>
            <button class="btn btn2" type="submit">Save World Blueprint</button>
        </form>
    </div>
    """
    body += section("What This Does", [
        "Creates complete world design records",
        "Prepares the world engine for better generation and operation"
    ])
    return page("World Blueprint Builder", body)

@app.route("/world-blueprint-registry")
def world_blueprint_registry():
    rows = _world_blueprint_rows()
    body = ""
    body += section("World Blueprint Registry", [f"Saved blueprints: {len(rows)}"])
    if rows:
        body += section("Recent Blueprints", [
            f"{x.get('world_name')} | {x.get('world_type')} | {x.get('created_at')}"
            for x in rows[-20:]
        ])
    body += section("What This Does", [
        "Creates a reusable world design library",
        "Lets you review world plans before generation or deployment"
    ])
    return page("World Blueprint Registry", body)

@app.route("/world-prompt-guide")
def world_prompt_guide():
    body = ""
    body += section("Suggested Prompt Structure", [
        "World Name",
        "World Type",
        "Mission Statement",
        "Primary Users",
        "Zone Map",
        "Object Inventory",
        "Interaction Map",
        "Avatar Behavior Guide",
        "Event Timeline",
        "Commerce Logic",
        "Accessibility Map",
        "Security and Risk Notes",
        "Performance Budget",
        "Mobile Fallback Mode",
        "Gesture and Voice Control Plan",
        "Cross-World Links"
    ])
    body += section("What This Does", [
        "Gives you a strong template for world design prompts",
        "Improves AI world-building consistency"
    ])
    return page("World Prompt Guide", body)



# -------------------------
# OASIS World Systems Layer
# -------------------------

def _oasis_cfg():
    try:
        return _cfg_load("oasis_world_system.json", {})
    except Exception:
        return {"oasis_world_system": {"layers": [], "npc_roles": [], "monetization_presets": []}}

def _oasis_load(name):
    try:
        return _load(f"oasis/{name}", [])
    except Exception:
        return []

def _oasis_save(name, rows):
    _save(f"oasis/{name}", rows)

@app.route("/oasis-center")
def oasis_center():
    cfg = _oasis_cfg().get("oasis_world_system", {})
    body = ""
    body += section("OASIS World Systems", cfg.get("layers", []))
    body += """
    <div class="card">
        <h3>OASIS Navigation</h3>
        <a class="btn" href="/avatar-model-center">Avatar Model Center</a>
        <a class="btn" href="/teleport-map">Teleport Map</a>
        <a class="btn" href="/world-monetization">World Monetization</a>
        <a class="btn" href="/world-analytics">World Analytics</a>
        <a class="btn" href="/npc-guide-center">NPC Guide Center</a>
        <a class="btn" href="/world-controls">World Controls</a>
        <a class="btn" href="/inventory-sync">Inventory Sync</a>
    </div>
    """
    body += section("What This Does", [
        "Creates the main immersive world systems layer",
        "Connects avatars, teleportation, analytics, monetization, moderation, and ownership"
    ])
    return page("OASIS Center", body)

@app.route("/avatar-model-center", methods=["GET","POST"])
def avatar_model_center():
    rows = _oasis_load("avatar_registry.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "avatar_name": request.form.get("avatar_name", "").strip() or "Untitled Avatar",
            "passport_id": request.form.get("passport_id", "").strip() or "UNBOUND",
            "model_style": request.form.get("model_style", "").strip() or "standard",
            "role": request.form.get("role", "").strip() or "guest",
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _oasis_save("avatar_registry.json", rows)
        return redirect("/avatar-model-center")

    body = """
    <div class="card">
        <form method="post">
            <input name="avatar_name" placeholder="Avatar name">
            <input name="passport_id" placeholder="AAM Passport ID">
            <input name="model_style" placeholder="heroic / creator / merchant / student / racer / guide">
            <input name="role" placeholder="creator / buyer / student / moderator / guest">
            <button class="btn btn2" type="submit">Save Avatar Model</button>
        </form>
    </div>
    """
    body += section("Avatar Registry", [f"Saved avatars: {len(rows)}"])
    if rows:
        body += section("Recent Avatars", [
            f"{x.get('avatar_name')} | {x.get('passport_id')} | {x.get('role')}"
            for x in rows[-20:]
        ])
    return page("Avatar Model Center", body)

@app.route("/teleport-map", methods=["GET","POST"])
def teleport_map():
    rows = _oasis_load("teleport_map.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "from_world": request.form.get("from_world", "").strip() or "hub",
            "to_world": request.form.get("to_world", "").strip() or "unknown_world",
            "teleport_type": request.form.get("teleport_type", "").strip() or "standard",
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _oasis_save("teleport_map.json", rows)
        return redirect("/teleport-map")

    body = """
    <div class="card">
        <form method="post">
            <input name="from_world" placeholder="From world">
            <input name="to_world" placeholder="To world">
            <input name="teleport_type" placeholder="standard / premium / event / creator / commerce">
            <button class="btn btn2" type="submit">Save Teleport Link</button>
        </form>
    </div>
    """
    body += section("Teleport Links", [f"Saved teleport routes: {len(rows)}"])
    if rows:
        body += section("Recent Routes", [
            f"{x.get('from_world')} → {x.get('to_world')} | {x.get('teleport_type')}"
            for x in rows[-20:]
        ])
    return page("Teleport Map", body)

@app.route("/world-monetization", methods=["GET","POST"])
def world_monetization():
    cfg = _oasis_cfg().get("oasis_world_system", {})
    rows = _oasis_load("monetization_presets.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "world_name": request.form.get("world_name", "").strip() or "Untitled World",
            "preset": request.form.get("preset", "").strip() or "paid_entry",
            "notes": request.form.get("notes", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _oasis_save("monetization_presets.json", rows)
        return redirect("/world-monetization")

    preset_options = "".join([f'<option value="{v}">{v}</option>' for v in cfg.get("monetization_presets", [])])

    body = f"""
    <div class="card">
        <form method="post">
            <input name="world_name" placeholder="World name">
            <select name="preset">{preset_options}</select>
            <textarea name="notes" placeholder="Monetization notes"></textarea>
            <button class="btn btn2" type="submit">Save Monetization Preset</button>
        </form>
    </div>
    """
    body += section("Monetization Presets", [f"Saved presets: {len(rows)}"])
    if rows:
        body += section("Recent Presets", [
            f"{x.get('world_name')} | {x.get('preset')}"
            for x in rows[-20:]
        ])
    return page("World Monetization", body)

@app.route("/world-analytics")
def world_analytics():
    rows = _oasis_load("world_analytics.json")
    body = ""
    body += section("World Analytics Dashboard", [
        f"Analytics records: {len(rows)}",
        "visit tracking",
        "zone heatmaps",
        "event density",
        "sales zones",
        "engagement zones"
    ])
    body += section("What This Does", [
        "Prepares world analytics and heatmap tracking",
        "Shows where activity and value are concentrated"
    ])
    return page("World Analytics", body)

@app.route("/npc-guide-center")
def npc_guide_center():
    cfg = _oasis_cfg().get("oasis_world_system", {})
    body = ""
    body += section("NPC / AI Guide Roles", cfg.get("npc_roles", []))
    body += section("What This Does", [
        "Creates AI guides for worlds, events, learning, and commerce",
        "Supports user onboarding and immersive interaction"
    ])
    return page("NPC Guide Center", body)

@app.route("/world-controls", methods=["GET","POST"])
def world_controls():
    rows = _oasis_load("object_permissions.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "world_name": request.form.get("world_name", "").strip() or "Untitled World",
            "rule_type": request.form.get("rule_type", "").strip() or "object_permission",
            "rule_value": request.form.get("rule_value", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _oasis_save("object_permissions.json", rows)
        return redirect("/world-controls")

    body = """
    <div class="card">
        <form method="post">
            <input name="world_name" placeholder="World name">
            <input name="rule_type" placeholder="object_permission / moderation / trust_zone / ticket_rule">
            <textarea name="rule_value" placeholder="Rule details"></textarea>
            <button class="btn btn2" type="submit">Save World Control</button>
        </form>
    </div>
    """
    body += section("World Controls", [f"Saved control rules: {len(rows)}"])
    if rows:
        body += section("Recent Rules", [
            f"{x.get('world_name')} | {x.get('rule_type')}"
            for x in rows[-20:]
        ])
    return page("World Controls", body)

@app.route("/inventory-sync")
def inventory_sync():
    rows = _oasis_load("inventory_sync.json")
    body = ""
    body += section("Cross-World Inventory Sync", [
        f"Inventory sync rules: {len(rows)}",
        "object ownership",
        "cross-world item visibility",
        "commerce inventory sync",
        "creator asset continuity"
    ])
    body += section("What This Does", [
        "Prepares item ownership and commerce sync across worlds",
        "Lets objects and products persist across multiple world layers"
    ])
    return page("Inventory Sync", body)



# -------------------------
# Legacy / VIP / Living World Systems
# -------------------------

def _legacy_cfg():
    try:
        return _cfg_load("legacy_vip_worlds.json", {})
    except Exception:
        return {"roles": [], "zone_types": [], "vehicle_types": [], "animal_types": []}

def _oasis_rows(name):
    try:
        return _load(f"oasis/{name}", [])
    except Exception:
        return []

def _save_oasis_rows(name, rows):
    _save(f"oasis/{name}", rows)

@app.route("/vip-access-center")
def vip_access_center():
    cfg = _legacy_cfg()
    body = ""
    body += section("Legacy / VIP Roles", cfg.get("roles", []))
    body += section("What This Does", [
        "Creates founder, heir, legacy, VIP, entourage, and backstage access layers",
        "Controls premium and inherited access across worlds and events"
    ])
    return page("VIP Access Center", body)

@app.route("/avatar-customization-studio", methods=["GET","POST"])
def avatar_customization_studio():
    rows = _oasis_rows("avatar_customizations.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "avatar_name": request.form.get("avatar_name", "").strip() or "Untitled Avatar",
            "style": request.form.get("style", "").strip() or "standard",
            "role_skin": request.form.get("role_skin", "").strip() or "creator",
            "notes": request.form.get("notes", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_oasis_rows("avatar_customizations.json", rows)
        return redirect("/avatar-customization-studio")

    body = """
    <div class="card">
        <form method="post">
            <input name="avatar_name" placeholder="Avatar name">
            <input name="style" placeholder="heroic / luxury / creator / racer / fantasy">
            <input name="role_skin" placeholder="creator / vip / founder / heir / backstage">
            <textarea name="notes" placeholder="Customization notes"></textarea>
            <button class="btn btn2" type="submit">Save Avatar Customization</button>
        </form>
    </div>
    """
    body += section("Avatar Studio", [f"Saved avatar customizations: {len(rows)}"])
    return page("Avatar Customization Studio", body)

@app.route("/city-zoning-engine", methods=["GET","POST"])
def city_zoning_engine():
    rows = _oasis_rows("city_zones.json")
    cfg = _legacy_cfg()
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "zone_name": request.form.get("zone_name", "").strip() or "Untitled Zone",
            "zone_type": request.form.get("zone_type", "").strip() or "creator_district",
            "notes": request.form.get("notes", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_oasis_rows("city_zones.json", rows)
        return redirect("/city-zoning-engine")

    options = "".join([f'<option value="{z}">{z}</option>' for z in cfg.get("zone_types", [])])
    body = f"""
    <div class="card">
        <form method="post">
            <input name="zone_name" placeholder="Zone name">
            <select name="zone_type">{options}</select>
            <textarea name="notes" placeholder="Zone notes"></textarea>
            <button class="btn btn2" type="submit">Save Zone</button>
        </form>
    </div>
    """
    body += section("Zone Registry", [f"Saved zones: {len(rows)}"])
    return page("City Zoning Engine", body)

@app.route("/vehicle-animal-systems", methods=["GET","POST"])
def vehicle_animal_systems():
    rows = _oasis_rows("vehicles_animals.json")
    cfg = _legacy_cfg()
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "entry_name": request.form.get("entry_name", "").strip() or "Untitled Entry",
            "entry_type": request.form.get("entry_type", "").strip() or "vehicle",
            "subtype": request.form.get("subtype", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_oasis_rows("vehicles_animals.json", rows)
        return redirect("/vehicle-animal-systems")

    vehicle_list = ", ".join(cfg.get("vehicle_types", []))
    animal_list = ", ".join(cfg.get("animal_types", []))
    body = f"""
    <div class="card">
        <form method="post">
            <input name="entry_name" placeholder="Vehicle or animal name">
            <input name="entry_type" placeholder="vehicle / animal">
            <input name="subtype" placeholder="Subtype">
            <button class="btn btn2" type="submit">Save Entry</button>
        </form>
    </div>
    """
    body += section("Vehicle Types", [vehicle_list or "None configured"])
    body += section("Animal Types", [animal_list or "None configured"])
    body += section("Saved Entries", [f"Total entries: {len(rows)}"])
    return page("Vehicle + Animal Systems", body)

@app.route("/event-gate-logic", methods=["GET","POST"])
def event_gate_logic():
    rows = _oasis_rows("event_gates.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "event_name": request.form.get("event_name", "").strip() or "Untitled Event",
            "access_rule": request.form.get("access_rule", "").strip() or "vip_all_access",
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_oasis_rows("event_gates.json", rows)
        return redirect("/event-gate-logic")

    body = """
    <div class="card">
        <form method="post">
            <input name="event_name" placeholder="Event name">
            <input name="access_rule" placeholder="vip_all_access / backstage_pass / founder / ticketed">
            <button class="btn btn2" type="submit">Save Event Gate Rule</button>
        </form>
    </div>
    """
    body += section("Ticket Scanner + Event Gate Logic", [f"Saved gate rules: {len(rows)}"])
    return page("Event Gate Logic", body)

@app.route("/trust-zone-manager", methods=["GET","POST"])
def trust_zone_manager():
    rows = _oasis_rows("trust_zones.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "zone_name": request.form.get("zone_name", "").strip() or "Untitled Zone",
            "trust_level": request.form.get("trust_level", "").strip() or "standard",
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_oasis_rows("trust_zones.json", rows)
        return redirect("/trust-zone-manager")

    body = """
    <div class="card">
        <form method="post">
            <input name="zone_name" placeholder="Zone name">
            <input name="trust_level" placeholder="new_user / verified / vip / founder / moderated">
            <button class="btn btn2" type="submit">Save Trust Zone</button>
        </form>
    </div>
    """
    body += section("Trust / Reputation Zones", [f"Saved trust zones: {len(rows)}"])
    return page("Trust Zone Manager", body)

@app.route("/world-heatmap-dashboard")
def world_heatmap_dashboard():
    rows = _oasis_rows("heatmap_records.json")
    body = ""
    body += section("World Heatmap Dashboard", [
        f"Heatmap records: {len(rows)}",
        "hot zones",
        "engagement zones",
        "sales zones",
        "traffic concentration",
        "stuck zones"
    ])
    return page("World Heatmap Dashboard", body)

@app.route("/creator-asset-placement", methods=["GET","POST"])
def creator_asset_placement():
    rows = _oasis_rows("creator_assets.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "world_name": request.form.get("world_name", "").strip() or "Untitled World",
            "asset_name": request.form.get("asset_name", "").strip() or "Untitled Asset",
            "placement_type": request.form.get("placement_type", "").strip() or "display",
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_oasis_rows("creator_assets.json", rows)
        return redirect("/creator-asset-placement")

    body = """
    <div class="card">
        <form method="post">
            <input name="world_name" placeholder="World name">
            <input name="asset_name" placeholder="Asset name">
            <input name="placement_type" placeholder="display / stage / booth / promo / shop / collectible">
            <button class="btn btn2" type="submit">Save Asset Placement</button>
        </form>
    </div>
    """
    body += section("Creator Asset Placement Tool", [f"Saved asset placements: {len(rows)}"])
    return page("Creator Asset Placement", body)



# -------------------------
# Living OASIS Governance Layer
# -------------------------

def _living_oasis_cfg():
    try:
        return _cfg_load("living_oasis_governance.json", {})
    except Exception:
        return {"living_oasis_governance": {"roles": [], "essential_services": [], "sabbath_closed_layers": []}}

def _lo_rows(name):
    try:
        return _load(f"oasis/{name}", [])
    except Exception:
        return []

def _save_lo_rows(name, rows):
    _save(f"oasis/{name}", rows)

@app.route("/living-oasis-center")
def living_oasis_center():
    cfg = _living_oasis_cfg().get("living_oasis_governance", {})
    body = ""
    body += section("Living OASIS Governance", [
        "avatar wardrobe and skins",
        "district ownership and leasing",
        "vehicle garage and tuning",
        "animal ecosystem behaviors",
        "VIP event scheduler",
        "access badge scanner",
        "founder and family inheritance permissions",
        "world pass wallet",
        "zone economy manager",
        "face avatar intake",
        "Sabbath operating mode"
    ])
    body += section("Essential Services During Sabbath", cfg.get("essential_services", []))
    body += section("Closed Layers During Sabbath", cfg.get("sabbath_closed_layers", []))
    body += """
    <div class="card">
        <h3>Living OASIS Navigation</h3>
        <a class="btn" href="/avatar-wardrobe">Avatar Wardrobe</a>
        <a class="btn" href="/district-ownership">District Ownership</a>
        <a class="btn" href="/vehicle-garage">Vehicle Garage</a>
        <a class="btn" href="/animal-behaviors">Animal Behaviors</a>
        <a class="btn" href="/vip-event-scheduler">VIP Event Scheduler</a>
        <a class="btn" href="/access-badge-scanner">Access Badge Scanner</a>
        <a class="btn" href="/inheritance-permissions">Inheritance Permissions</a>
        <a class="btn" href="/world-pass-wallet">World Pass Wallet</a>
        <a class="btn" href="/zone-economy-manager">Zone Economy Manager</a>
        <a class="btn" href="/face-avatar-intake">Face Avatar Intake</a>
        <a class="btn" href="/sabbath-mode">Sabbath Mode</a>
    </div>
    """
    return page("Living OASIS Center", body)

@app.route("/avatar-wardrobe", methods=["GET","POST"])
def avatar_wardrobe():
    rows = _lo_rows("avatar_wardrobe.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "avatar_name": request.form.get("avatar_name", "").strip() or "Untitled Avatar",
            "skin_type": request.form.get("skin_type", "").strip() or "creator",
            "wardrobe_notes": request.form.get("wardrobe_notes", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_lo_rows("avatar_wardrobe.json", rows)
        return redirect("/avatar-wardrobe")
    body = """
    <div class="card">
        <form method="post">
            <input name="avatar_name" placeholder="Avatar name">
            <input name="skin_type" placeholder="founder / heir / vip / creator / racer / fantasy">
            <textarea name="wardrobe_notes" placeholder="Wardrobe and skin notes"></textarea>
            <button class="btn btn2" type="submit">Save Wardrobe</button>
        </form>
    </div>
    """
    body += section("Wardrobe Records", [f"Saved wardrobe entries: {len(rows)}"])
    return page("Avatar Wardrobe", body)

@app.route("/district-ownership", methods=["GET","POST"])
def district_ownership():
    rows = _lo_rows("district_ownership.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "district_name": request.form.get("district_name", "").strip() or "Untitled District",
            "owner_role": request.form.get("owner_role", "").strip() or "founder",
            "lease_status": request.form.get("lease_status", "").strip() or "owned",
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_lo_rows("district_ownership.json", rows)
        return redirect("/district-ownership")
    body = """
    <div class="card">
        <form method="post">
            <input name="district_name" placeholder="District name">
            <input name="owner_role" placeholder="founder / heir / creator / vip / leaseholder">
            <input name="lease_status" placeholder="owned / leased / reserved / protected">
            <button class="btn btn2" type="submit">Save District Ownership</button>
        </form>
    </div>
    """
    body += section("District Ownership Records", [f"Saved district records: {len(rows)}"])
    return page("District Ownership", body)

@app.route("/vehicle-garage", methods=["GET","POST"])
def vehicle_garage():
    rows = _lo_rows("vehicle_garage.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "vehicle_name": request.form.get("vehicle_name", "").strip() or "Untitled Vehicle",
            "vehicle_type": request.form.get("vehicle_type", "").strip() or "sports_car",
            "tuning_notes": request.form.get("tuning_notes", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_lo_rows("vehicle_garage.json", rows)
        return redirect("/vehicle-garage")
    body = """
    <div class="card">
        <form method="post">
            <input name="vehicle_name" placeholder="Vehicle name">
            <input name="vehicle_type" placeholder="sports_car / delivery_van / luxury_vehicle / racing_vehicle">
            <textarea name="tuning_notes" placeholder="Garage and tuning notes"></textarea>
            <button class="btn btn2" type="submit">Save Vehicle</button>
        </form>
    </div>
    """
    body += section("Vehicle Garage", [f"Saved vehicles: {len(rows)}"])
    return page("Vehicle Garage", body)

@app.route("/animal-behaviors", methods=["GET","POST"])
def animal_behaviors():
    rows = _lo_rows("animal_behaviors.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "animal_name": request.form.get("animal_name", "").strip() or "Untitled Animal",
            "behavior_type": request.form.get("behavior_type", "").strip() or "wildlife",
            "notes": request.form.get("notes", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_lo_rows("animal_behaviors.json", rows)
        return redirect("/animal-behaviors")
    body = """
    <div class="card">
        <form method="post">
            <input name="animal_name" placeholder="Animal name">
            <input name="behavior_type" placeholder="wildlife / companion / sanctuary / fantasy">
            <textarea name="notes" placeholder="Behavior notes"></textarea>
            <button class="btn btn2" type="submit">Save Animal Behavior</button>
        </form>
    </div>
    """
    body += section("Animal Ecosystem Behaviors", [f"Saved animal records: {len(rows)}"])
    return page("Animal Behaviors", body)

@app.route("/vip-event-scheduler", methods=["GET","POST"])
def vip_event_scheduler():
    rows = _lo_rows("vip_event_schedule.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "event_name": request.form.get("event_name", "").strip() or "Untitled Event",
            "access_role": request.form.get("access_role", "").strip() or "vip_all_access",
            "notes": request.form.get("notes", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_lo_rows("vip_event_schedule.json", rows)
        return redirect("/vip-event-scheduler")
    body = """
    <div class="card">
        <form method="post">
            <input name="event_name" placeholder="Event name">
            <input name="access_role" placeholder="vip_all_access / founder / heir / backstage_pass / entourage_access">
            <textarea name="notes" placeholder="Event notes"></textarea>
            <button class="btn btn2" type="submit">Save VIP Event</button>
        </form>
    </div>
    """
    body += section("VIP Event Scheduler", [f"Saved VIP events: {len(rows)}"])
    return page("VIP Event Scheduler", body)

@app.route("/access-badge-scanner", methods=["GET","POST"])
def access_badge_scanner():
    rows = _lo_rows("access_badges.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "badge_name": request.form.get("badge_name", "").strip() or "Untitled Badge",
            "badge_type": request.form.get("badge_type", "").strip() or "vip_all_access",
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_lo_rows("access_badges.json", rows)
        return redirect("/access-badge-scanner")
    body = """
    <div class="card">
        <form method="post">
            <input name="badge_name" placeholder="Badge name">
            <input name="badge_type" placeholder="founder / heir / vip / backstage / ticketed / family_access">
            <button class="btn btn2" type="submit">Save Badge Rule</button>
        </form>
    </div>
    """
    body += section("Access Badge Scanner", [f"Saved badge rules: {len(rows)}"])
    return page("Access Badge Scanner", body)

@app.route("/inheritance-permissions", methods=["GET","POST"])
def inheritance_permissions():
    rows = _lo_rows("inheritance_permissions.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "asset_name": request.form.get("asset_name", "").strip() or "Untitled Asset",
            "granted_to": request.form.get("granted_to", "").strip() or "heir",
            "notes": request.form.get("notes", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_lo_rows("inheritance_permissions.json", rows)
        return redirect("/inheritance-permissions")
    body = """
    <div class="card">
        <form method="post">
            <input name="asset_name" placeholder="Asset or zone name">
            <input name="granted_to" placeholder="heir / family_access / founder_admin / legacy_kid">
            <textarea name="notes" placeholder="Inheritance permission notes"></textarea>
            <button class="btn btn2" type="submit">Save Inheritance Rule</button>
        </form>
    </div>
    """
    body += section("Founder / Family Inheritance Permissions", [f"Saved inheritance rules: {len(rows)}"])
    return page("Inheritance Permissions", body)

@app.route("/world-pass-wallet")
def world_pass_wallet():
    rows = _lo_rows("world_pass_wallet.json")
    body = ""
    body += section("World Pass Wallet", [
        f"Saved passes: {len(rows)}",
        "event passes",
        "district keys",
        "VIP credentials",
        "backstage access",
        "family access"
    ])
    return page("World Pass Wallet", body)

@app.route("/zone-economy-manager")
def zone_economy_manager():
    rows = _lo_rows("zone_economy.json")
    body = ""
    body += section("Zone Economy Manager", [
        f"Saved economy records: {len(rows)}",
        "rent and lease logic",
        "district value tracking",
        "event economy",
        "premium access economics",
        "creator commerce zones"
    ])
    return page("Zone Economy Manager", body)

@app.route("/face-avatar-intake", methods=["GET","POST"])
def face_avatar_intake():
    rows = _lo_rows("face_avatar_profiles.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "profile_name": request.form.get("profile_name", "").strip() or "Untitled Profile",
            "scan_type": request.form.get("scan_type", "").strip() or "face_reference",
            "notes": request.form.get("notes", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_lo_rows("face_avatar_profiles.json", rows)
        return redirect("/face-avatar-intake")
    body = """
    <div class="card">
        <form method="post">
            <input name="profile_name" placeholder="Profile name">
            <input name="scan_type" placeholder="face_reference / avatar_binding / rig_profile">
            <textarea name="notes" placeholder="Face/avatar intake notes"></textarea>
            <button class="btn btn2" type="submit">Save Face Avatar Intake</button>
        </form>
    </div>
    """
    body += section("Face Avatar Intake", [
        f"Saved face/avatar profiles: {len(rows)}",
        "This is the intake layer before full 3D rigging later"
    ])
    return page("Face Avatar Intake", body)

@app.route("/sabbath-mode")
def sabbath_mode():
    cfg = _living_oasis_cfg().get("living_oasis_governance", {})
    body = ""
    body += section("Sabbath Operating Mode", [
        "Metaverse, Middleverse, and Multiverse can close for Sabbath",
        "Only essential ecosystem services remain available"
    ])
    body += section("Closed Layers", cfg.get("sabbath_closed_layers", []))
    body += section("Essential Services", cfg.get("essential_services", []))
    body += section("What This Does", [
        "Creates a values-based operating mode",
        "Protects sacred/rest windows while keeping essential systems available"
    ])
    return page("Sabbath Mode", body)



# -------------------------
# Real-Time World Engine
# -------------------------

def _rt_cfg():
    try:
        return _cfg_load("realtime_world_engine.json", {})
    except Exception:
        return {"realtime_world_engine": {"layers": [], "render_modes": [], "animation_states": [], "streaming_modes": []}}

def _rt_rows(name):
    try:
        return _load(f"realtime_engine/{name}", [])
    except Exception:
        return []

def _save_rt_rows(name, rows):
    _save(f"realtime_engine/{name}", rows)

@app.route("/realtime-world-engine")
def realtime_world_engine():
    cfg = _rt_cfg().get("realtime_world_engine", {})
    body = ""
    body += section("Real-Time World Engine", cfg.get("layers", []))
    body += """
    <div class="card">
        <h3>Engine Navigation</h3>
        <a class="btn" href="/webgl-viewer">WebGL Viewer</a>
        <a class="btn" href="/multiplayer-network">Multiplayer Network</a>
        <a class="btn" href="/physics-lab">Physics Lab</a>
        <a class="btn" href="/avatar-animation-center">Avatar Animation</a>
        <a class="btn" href="/world-streaming-center">World Streaming</a>
    </div>
    """
    body += section("What This Does", [
        "Creates the real-time engine scaffold for immersive worlds",
        "Prepares the platform for interactive rendering, networking, physics, animation, and world loading"
    ])
    return page("Real-Time World Engine", body)

@app.route("/webgl-viewer", methods=["GET","POST"])
def webgl_viewer():
    rows = _rt_rows("render_scenes.json")
    cfg = _rt_cfg().get("realtime_world_engine", {})

    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "scene_name": request.form.get("scene_name", "").strip() or "Untitled Scene",
            "render_mode": request.form.get("render_mode", "").strip() or "draft_preview",
            "notes": request.form.get("notes", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_rt_rows("render_scenes.json", rows)
        return redirect("/webgl-viewer")

    render_options = "".join([f'<option value="{v}">{v}</option>' for v in cfg.get("render_modes", [])])

    body = f"""
    <div class="card">
        <form method="post">
            <input name="scene_name" placeholder="Scene name">
            <select name="render_mode">{render_options}</select>
            <textarea name="notes" placeholder="Render notes"></textarea>
            <button class="btn btn2" type="submit">Save Render Scene</button>
        </form>
    </div>
    <div class="card">
        <h3>Viewer Status</h3>
        <p id="world-viewer-status">Loading viewer scaffold...</p>
    </div>
    """
    body += section("Saved Render Scenes", [f"Scenes: {len(rows)}"])
    if rows:
        body += section("Recent Render Scenes", [
            f"{x.get('scene_name')} | {x.get('render_mode')}"
            for x in rows[-20:]
        ])
    return page("WebGL Viewer", body)

@app.route("/multiplayer-network", methods=["GET","POST"])
def multiplayer_network():
    rows = _rt_rows("multiplayer_sessions.json")

    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "session_name": request.form.get("session_name", "").strip() or "Untitled Session",
            "world_name": request.form.get("world_name", "").strip() or "default_world",
            "max_users": request.form.get("max_users", "").strip() or "10",
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_rt_rows("multiplayer_sessions.json", rows)
        return redirect("/multiplayer-network")

    body = """
    <div class="card">
        <form method="post">
            <input name="session_name" placeholder="Session name">
            <input name="world_name" placeholder="World name">
            <input name="max_users" placeholder="Max users">
            <button class="btn btn2" type="submit">Save Multiplayer Session</button>
        </form>
    </div>
    """
    body += section("Multiplayer Sessions", [f"Saved sessions: {len(rows)}"])
    if rows:
        body += section("Recent Sessions", [
            f"{x.get('session_name')} | {x.get('world_name')} | max={x.get('max_users')}"
            for x in rows[-20:]
        ])
    body += section("What This Does", [
        "Prepares multi-user world sessions and presence logic",
        "Supports future live world participation"
    ])
    return page("Multiplayer Network", body)

@app.route("/physics-lab", methods=["GET","POST"])
def physics_lab():
    rows = _rt_rows("physics_profiles.json")

    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "profile_name": request.form.get("profile_name", "").strip() or "default_physics",
            "use_case": request.form.get("use_case", "").strip() or "general_world",
            "notes": request.form.get("notes", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_rt_rows("physics_profiles.json", rows)
        return redirect("/physics-lab")

    body = """
    <div class="card">
        <form method="post">
            <input name="profile_name" placeholder="Physics profile name">
            <input name="use_case" placeholder="vehicles / avatars / objects / battles / general_world">
            <textarea name="notes" placeholder="Physics notes"></textarea>
            <button class="btn btn2" type="submit">Save Physics Profile</button>
        </form>
    </div>
    """
    body += section("Physics Profiles", [f"Saved profiles: {len(rows)}"])
    if rows:
        body += section("Recent Profiles", [
            f"{x.get('profile_name')} | {x.get('use_case')}"
            for x in rows[-20:]
        ])
    return page("Physics Lab", body)

@app.route("/avatar-animation-center", methods=["GET","POST"])
def avatar_animation_center():
    rows = _rt_rows("avatar_animations.json")
    cfg = _rt_cfg().get("realtime_world_engine", {})

    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "avatar_name": request.form.get("avatar_name", "").strip() or "Untitled Avatar",
            "animation_state": request.form.get("animation_state", "").strip() or "idle",
            "notes": request.form.get("notes", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_rt_rows("avatar_animations.json", rows)
        return redirect("/avatar-animation-center")

    state_options = "".join([f'<option value="{v}">{v}</option>' for v in cfg.get("animation_states", [])])

    body = f"""
    <div class="card">
        <form method="post">
            <input name="avatar_name" placeholder="Avatar name">
            <select name="animation_state">{state_options}</select>
            <textarea name="notes" placeholder="Animation notes"></textarea>
            <button class="btn btn2" type="submit">Save Animation State</button>
        </form>
    </div>
    """
    body += section("Avatar Animation Records", [f"Saved animation records: {len(rows)}"])
    if rows:
        body += section("Recent Animation Records", [
            f"{x.get('avatar_name')} | {x.get('animation_state')}"
            for x in rows[-20:]
        ])
    return page("Avatar Animation Center", body)

@app.route("/world-streaming-center", methods=["GET","POST"])
def world_streaming_center():
    rows = _rt_rows("world_streams.json")
    cfg = _rt_cfg().get("realtime_world_engine", {})

    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "world_name": request.form.get("world_name", "").strip() or "Untitled World",
            "stream_mode": request.form.get("stream_mode", "").strip() or "zone_streaming",
            "notes": request.form.get("notes", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_rt_rows("world_streams.json", rows)
        return redirect("/world-streaming-center")

    stream_options = "".join([f'<option value="{v}">{v}</option>' for v in cfg.get("streaming_modes", [])])

    body = f"""
    <div class="card">
        <form method="post">
            <input name="world_name" placeholder="World name">
            <select name="stream_mode">{stream_options}</select>
            <textarea name="notes" placeholder="Streaming notes"></textarea>
            <button class="btn btn2" type="submit">Save Streaming Profile</button>
        </form>
    </div>
    """
    body += section("World Streaming Profiles", [f"Saved streaming profiles: {len(rows)}"])
    if rows:
        body += section("Recent Streaming Profiles", [
            f"{x.get('world_name')} | {x.get('stream_mode')}"
            for x in rows[-20:]
        ])
    body += section("What This Does", [
        "Prepares worlds to load in segments instead of all at once",
        "Supports larger immersive environments and better device performance"
    ])
    return page("World Streaming Center", body)



# -------------------------
# Visible Real-Time Viewer + Transport Layer
# -------------------------

def _transport_cfg():
    try:
        return _cfg_load("transport_system.json", {})
    except Exception:
        return {"transport_system": {"types": [], "use_cases": []}}

def _load_rows_any(path):
    try:
        return _load(path, [])
    except Exception:
        return []

def _save_rows_any(path, rows):
    _save(path, rows)

@app.route("/webgl-canvas-viewer")
def webgl_canvas_viewer():
    body = """
    <div class="card">
        <h3>Real WebGL Canvas Viewer Scaffold</h3>
        <canvas id="aam-webgl-canvas" width="760" height="360" style="width:100%;max-width:100%;border-radius:12px;border:1px solid #334155;background:#111827;"></canvas>
    </div>
    """
    body += section("What This Does", [
        "Adds a visible real-time viewer scaffold",
        "Creates the first visual engine surface for future 3D/WebGL work",
        "Makes the world engine feel more real in the app"
    ])
    return page("WebGL Canvas Viewer", body)

@app.route("/live-avatar-preview")
def live_avatar_preview():
    avatars = _load_rows_any("oasis/avatar_registry.json")
    wardrobe = _load_rows_any("oasis/avatar_wardrobe.json")
    body = ""
    body += section("Avatar Preview Summary", [
        f"Avatar records: {len(avatars)}",
        f"Wardrobe records: {len(wardrobe)}"
    ])
    if avatars:
        cards = ""
        for x in avatars[-12:][::-1]:
            cards += f"""
            <div class="card">
                <h3>{x.get('avatar_name','Untitled Avatar')}</h3>
                <p><strong>Passport:</strong> {x.get('passport_id','UNBOUND')}</p>
                <p><strong>Role:</strong> {x.get('role','guest')}</p>
                <p><strong>Model Style:</strong> {x.get('model_style','standard')}</p>
                <div style="margin-top:12px;padding:18px;border-radius:12px;background:linear-gradient(135deg,#1d4ed8,#7c3aed,#0f766e);color:white;">
                    Live Avatar Preview Card
                </div>
            </div>
            """
        body += cards
    else:
        body += section("No Avatars Yet", ["Create avatars in /avatar-model-center"])
    return page("Live Avatar Preview", body)

@app.route("/world-zone-loading")
def world_zone_loading():
    body = """
    <div class="card">
        <h3>World Zone Loading UI</h3>
        <p>Zone streaming modes:</p>
        <ul>
            <li>District loading</li>
            <li>Event loading</li>
            <li>Transport hub loading</li>
            <li>Wildlife habitat loading</li>
        </ul>
        <div style="margin-top:12px;">
            <button onclick="document.getElementById('zone-status').innerText='Loading Creator District...'">Load Creator District</button>
            <button onclick="document.getElementById('zone-status').innerText='Loading VIP Event Zone...'">Load VIP Event Zone</button>
            <button onclick="document.getElementById('zone-status').innerText='Loading Wildlife Habitat...'">Load Wildlife Habitat</button>
        </div>
        <p id="zone-status" style="margin-top:12px;">No zone selected</p>
    </div>
    """
    body += section("What This Does", [
        "Creates a visible world streaming/zone loading interface",
        "Prepares larger worlds to load in manageable segments"
    ])
    return page("World Zone Loading", body)

@app.route("/multiplayer-presence")
def multiplayer_presence():
    rows = _load_rows_any("realtime_engine/presence_list.json")
    body = ""
    body += section("Multiplayer Presence List", [f"Presence records: {len(rows)}"])
    if rows:
        body += section("Active Presence", [
            f"{x.get('user_name','unknown')} | {x.get('world_name','default_world')} | {x.get('role','guest')}"
            for x in rows[-25:]
        ])
    else:
        body += section("Active Presence", ["No live presence records yet"])
    body += section("What This Does", [
        "Creates the beginning of live multiplayer session awareness",
        "Supports future shared world presence"
    ])
    return page("Multiplayer Presence", body)

@app.route("/heatmap-visualization")
def heatmap_visualization():
    rows = _load_rows_any("oasis/heatmap_records.json")
    body = """
    <div class="card">
        <h3>World Heatmap Visualization</h3>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
            <div style="height:70px;background:#1e3a8a;border-radius:8px;"></div>
            <div style="height:70px;background:#2563eb;border-radius:8px;"></div>
            <div style="height:70px;background:#7c3aed;border-radius:8px;"></div>
            <div style="height:70px;background:#22c55e;border-radius:8px;"></div>
            <div style="height:70px;background:#60a5fa;border-radius:8px;"></div>
            <div style="height:70px;background:#f59e0b;border-radius:8px;"></div>
            <div style="height:70px;background:#ef4444;border-radius:8px;"></div>
            <div style="height:70px;background:#0f766e;border-radius:8px;"></div>
        </div>
    </div>
    """
    body += section("Heatmap Records", [f"Tracked heatmap records: {len(rows)}"])
    body += section("What This Does", [
        "Creates a visible activity heatmap concept",
        "Prepares zone analytics, engagement, and sales tracking"
    ])
    return page("Heatmap Visualization", body)

@app.route("/object-ownership-inspector")
def object_ownership_inspector():
    rows = _load_rows_any("oasis/object_ownership.json")
    body = ""
    body += section("Object Ownership Inspector", [f"Ownership records: {len(rows)}"])
    if rows:
        body += section("Recent Ownership Records", [
            f"{x.get('object_name','unnamed_object')} | owner={x.get('owner','unknown')} | world={x.get('world_name','unknown_world')}"
            for x in rows[-25:]
        ])
    else:
        body += section("Recent Ownership Records", ["No object ownership records yet"])
    body += section("What This Does", [
        "Lets you inspect item and world object ownership",
        "Supports permissions, commerce sync, and creator asset control"
    ])
    return page("Object Ownership Inspector", body)

@app.route("/ticket-gate-validator")
def ticket_gate_validator():
    rows = _load_rows_any("oasis/ticket_validation.json")
    body = """
    <div class="card">
        <h3>Ticket Gate Validation UI</h3>
        <form>
            <input placeholder="Ticket code or badge ID">
            <button type="button">Validate</button>
        </form>
    </div>
    """
    body += section("Saved Validation Records", [f"Validation records: {len(rows)}"])
    body += section("What This Does", [
        "Creates a visible event gate and badge validation interface",
        "Supports VIP, founder, backstage, and ticketed access logic"
    ])
    return page("Ticket Gate Validator", body)

@app.route("/transport-hub", methods=["GET","POST"])
def transport_hub():
    rows = _load_rows_any("oasis/transport_registry.json")
    cfg = _transport_cfg().get("transport_system", {})

    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "transport_name": request.form.get("transport_name", "").strip() or "Untitled Transport",
            "transport_type": request.form.get("transport_type", "").strip() or "super_hydro_electric_car",
            "use_case": request.form.get("use_case", "").strip() or "vip_travel",
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_rows_any("oasis/transport_registry.json", rows)
        return redirect("/transport-hub")

    type_options = "".join([f'<option value="{v}">{v}</option>' for v in cfg.get("types", [])])
    use_options = "".join([f'<option value="{v}">{v}</option>' for v in cfg.get("use_cases", [])])

    body = f"""
    <div class="card">
        <form method="post">
            <input name="transport_name" placeholder="Transport name">
            <select name="transport_type">{type_options}</select>
            <select name="use_case">{use_options}</select>
            <button class="btn btn2" type="submit">Save Transport</button>
        </form>
    </div>
    """
    body += section("Transport Hub", [f"Saved transport records: {len(rows)}"])
    if rows:
        body += section("Recent Transport", [
            f"{x.get('transport_name')} | {x.get('transport_type')} | {x.get('use_case')}"
            for x in rows[-20:]
        ])
    body += section("What This Does", [
        "Adds premium transport systems including hydro-electric cars, flying cars, planes, and more",
        "Supports VIP travel, exploration, racing, delivery, and creator movement"
    ])
    return page("Transport Hub", body)

@app.route("/health")
def health():
    return "OK"

@app.route("/favicon.ico")
def fav():
    return Response(status=204)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
