from flask import Flask, Response
import os

app = Flask(__name__)
app.secret_key = "aam_verified_private_key"

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
            <a class="btn" href="/login-private">Private Login</a>
        <a class="btn btn5" href="/logout-private">Logout Private</a>
        <a class="btn btn3" href="/health">Health</a>
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
# Verified Merge Block 2: Private Access
# -------------------------

from flask import session, redirect

def _private_cfg_verified():
    try:
        return _cfg_load("private_access.json", {})
    except Exception:
        return {"private_mode": True, "access_key": "AAM_PRIVATE_KEY"}

@app.before_request
def verified_private_access_gate():
    cfg = _private_cfg_verified()
    if not cfg.get("private_mode", True):
        return

    allowed_exact = {"/login-private", "/health"}
    allowed_prefix = ("/static",)

    if request.path in allowed_exact:
        return
    if any(request.path.startswith(x) for x in allowed_prefix):
        return
    if session.get("private_access_ok"):
        return

    return redirect("/login-private")

@app.route("/login-private", methods=["GET", "POST"])
def login_private_verified():
    cfg = _private_cfg_verified()

    if request.method == "POST":
        key = request.form.get("key", "").strip()
        if key == cfg.get("access_key", "AAM_PRIVATE_KEY"):
            session["private_access_ok"] = True
            return redirect("/update-hub" if "update_hub_verified" in globals() else "/")
        return page("Private Access", section("Access Error", [
            "Invalid private access key"
        ]))

    body = """
    <div class="card">
        <form method="post">
            <input name="key" placeholder="Private access key">
            <button class="btn btn2" type="submit">Enter Private Site</button>
        </form>
    </div>
    """
    body += section("Private Platform Mode", [
        "This site is private",
        "Only people with your access key can enter"
    ])
    return page("Private Access", body)

@app.route("/logout-private")
def logout_private_verified():
    session.pop("private_access_ok", None)
    return redirect("/login-private")

@app.route("/health")
def health():
    return "OK"

@app.route("/favicon.ico")
def fav():
    return Response(status=204)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
