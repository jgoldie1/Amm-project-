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
    </body>
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
        </body>
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

@app.route("/health")
def health():
    return "OK"

@app.route("/favicon.ico")
def fav():
    return Response(status=204)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
