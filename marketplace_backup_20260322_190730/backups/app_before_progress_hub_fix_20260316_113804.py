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

@app.route("/health")
def health():
    return "OK"

@app.route("/favicon.ico")
def fav():
    return Response(status=204)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
