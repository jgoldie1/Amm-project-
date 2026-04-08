from flask import Flask, Response, request, redirect, session
import os, json, uuid, datetime
import os, json, hashlib, uuid, datetime

app = Flask(__name__)
app.secret_key = "aam-admin-studio-key"

BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
USERS_FILE = os.path.join(DATA, "users.json")
FEATURES_FILE = os.path.join(DATA, "features.json")
CONTENT_FILE = os.path.join(DATA, "content.json")
CHANGELOG_FILE = os.path.join(DATA, "changelog.json")
AUTH_CFG_FILE = os.path.join(DATA, "auth_providers.json")

os.makedirs(DATA, exist_ok=True)

def load_json(path, default):
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return default
    return default

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def now():
    return str(datetime.datetime.now())

def hash_pw(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def current_user():
    return session.get("username")

def get_user():
    users = load_json(USERS_FILE, [])
    return next((u for u in users if u["username"] == current_user()), None)

def is_admin():
    u = get_user()
    return bool(u and u.get("role") in ["admin", "owner", "operator"])

def section(title, items):
    rows = "".join(f"<li>{item}</li>" for item in items)
    return f'<div class="card"><h3>{title}</h3><ul>{rows}</ul></div>'

def button(label, link, cls="btn"):
    return f'<a class="{cls}" href="{link}">{label}</a>'

def add_log(entry):
    logs = load_json(CHANGELOG_FILE, [])
    logs.append({"time": now(), "entry": entry})
    save_json(CHANGELOG_FILE, logs[-300:])

def page(title, body):
    if current_user():
        u = get_user()
        role = u["role"] if u else "member"
        user_box = f'''
        <div class="navbox">
            <p><strong>Signed in:</strong> {current_user()} | <strong>Role:</strong> {role}</p>
            <a class="btn btn2" href="/profile">My Profile</a>
            <a class="btn btn3" href="/logout">Logout</a>
        </div>
        '''
    else:
        user_box = '''
        <div class="navbox">
            <a class="btn btn2" href="/signup">Create Account</a>
            <a class="btn btn3" href="/login">Login</a>
        </div>
        '''

    nav_links = [
        ("Home", "/", "btn"),
        ("Dashboard", "/dashboard", "btn btn2"),
        ("Admin Studio", "/admin-studio", "btn btn3"),
        ("Feature Builder", "/feature-builder", "btn btn4"),
        ("Content Editor", "/content-editor", "btn btn5"),
        ("Module Notes", "/module-notes", "btn btn6"),
        ("Change Log", "/change-log", "btn"),
        ("Beta Intake", "/beta-intake", "btn btn2"),
        ("Vision", "/vision", "btn btn4"),
    ("Status", "/status", "btn btn4"),
    ("Help", "/help", "btn btn5"),
    ("Legal", "/legal", "btn btn4"),
    ("Privacy", "/privacy", "btn btn5"),
    ("Terms", "/terms", "btn btn6"),
    ("Accessibility Statement", "/accessibility-statement", "btn btn2"),
    ("Onboarding", "/onboarding", "btn btn4"),
    ("Join Free", "/join-free", "btn btn5"),
    ("Creator Setup", "/creator-setup", "btn btn6"),
    ("Upgrade", "/upgrade", "btn btn2"),
    ("Verification Apply", "/verification-apply", "btn btn3"),
    ("Founder Access", "/founder-access", "btn btn4"),
    ("Contact + Support", "/contact-support", "btn btn5"),
    ("Sign Up", "/signup-live", "btn btn4"),
    ("Login", "/login-live", "btn btn5"),
    ("Account", "/account", "btn btn6"),
    ("Media Upload", "/media-upload", "btn btn2"),
    ("Support Payment", "/support-payment", "btn btn3"),
    ("Admin Live", "/admin-live", "btn btn4"),
    ("Dashboard Live", "/dashboard-live", "btn btn4"),
    ("Payments Center", "/payments-center", "btn btn5"),
    ("Checkout Scaffold", "/checkout-scaffold", "btn btn6"),
    ("My Media", "/my-media", "btn btn2"),
    ("Flag Content", "/flag-content", "btn btn3"),
    ("Moderation Queue", "/moderation-queue", "btn btn4"),
    ("Notifications Center", "/notifications-center", "btn btn4"),
    ("Verification Review", "/verification-review", "btn btn5"),
    ("PG Bridge", "/pg-bridge", "btn btn6"),
    ("Notifications Center", "/notifications-center", "btn btn4"),
    ("Verification Review", "/verification-review", "btn btn5"),
    ("PG Bridge", "/pg-bridge", "btn btn6"),
    ("Holographic Coupons", "/holographic-coupons", "btn btn4"),
    ("Food Delivery Intelligence", "/food-delivery-intelligence", "btn btn5"),
    ("Satellite Tracking", "/satellite-tracking", "btn btn6"),
    ("Mobile App Stack", "/mobile-app-stack", "btn btn2"),
    ("Distributed Cloud", "/distributed-cloud", "btn btn3"),
    ("Global Streaming CDN", "/global-streaming-cdn", "btn btn4"),
    ("AI Recommendation Engine", "/ai-recommendation-engine", "btn btn5"),
    ("Autonomous Logistics", "/autonomous-logistics", "btn btn6"),
    ("Quantum Cloud", "/quantum-cloud", "btn btn4"),
    ("Quantum Speed Accelerator", "/quantum-speed-accelerator", "btn btn5"),
    ("Workflow Automation", "/workflow-automation", "btn btn6"),
    ("Task Orchestration", "/task-orchestration", "btn btn2"),
    ("Distributed Cache", "/distributed-cache", "btn btn3"),
    ("Autoscaling", "/autoscaling", "btn btn4"),
    ("Acceleration Impact", "/acceleration-impact", "btn btn5"),
    ("Automation Events", "/automation-events", "btn btn4"),
    ("Automation Runner", "/automation-runner", "btn btn5"),
    ("Tax Center", "/tax-center", "btn btn4"),
    ("Tax Profile", "/tax-profile", "btn btn5"),
    ("Payout Ledger", "/payout-ledger", "btn btn6"),
    ("1099 Review", "/1099-review", "btn btn2"),
    ("Tax Export", "/tax-export", "btn btn3"),
    ("Postgres Center", "/postgres-center", "btn btn4"),
    ("Payments Live", "/payments-live", "btn btn5"),
    ("Cloud Center", "/cloud-center", "btn btn6"),
    ("Communications Center", "/communications-center", "btn btn2"),
    ("Progress", "/progress", "btn btn4"),
    ("Assistant Center", "/assistant-center", "btn btn4"),
    ("Assistant Chat", "/assistant-chat", "btn btn5"),
    ("Assistant Settings", "/assistant-settings", "btn btn6"),
    ("Logout Private", "/logout-private", "btn btn2"),
    ("Health", "/health", "btn btn3"),
    ]
    nav = '<div class="navbox"><h3>Main Navigation</h3>' + "".join(button(a,b,c) for a,b,c in nav_links) + '</div>'

    return f"""
    <html>
    <head><link rel='stylesheet' href='/static/css/platform.css'>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>All American Marketplace</title>
        <style>
            body {{ background:#0b1220; color:white; font-family:Arial,sans-serif; text-align:center; padding:16px; margin:0; }}
            .hero {{ background:#182235; border:2px solid #334155; border-radius:18px; padding:24px; margin:16px auto; max-width:1120px; }}
            .card,.navbox {{ background:#182235; border:2px solid #334155; border-radius:16px; padding:20px; margin:16px auto; max-width:1120px; text-align:left; }}
            .btn {{ display:block; background:#0284c7; color:white; text-decoration:none; padding:16px; margin:10px auto; border-radius:14px; max-width:860px; font-weight:bold; font-size:18px; text-align:center; }}
            .btn2 {{ background:#16a34a; }} .btn3 {{ background:#7c3aed; }} .btn4 {{ background:#d97706; }} .btn5 {{ background:#dc2626; }} .btn6 {{ background:#0891b2; }}
            input,textarea,select {{ width:90%; max-width:780px; padding:16px; margin:10px auto; display:block; border-radius:12px; border:1px solid #64748b; font-size:18px; }}
            textarea {{ min-height:140px; }}
            h1 {{ font-size:36px; margin:0 0 8px 0; }} h2,h3 {{ font-size:26px; }} p,li {{ font-size:19px; }} ul {{ padding-left:24px; margin:0; }}
            a {{ color:white; }}
        </style>
    </head>
    <body><header>All American Marketplace Platform</header>
        <div class="hero"><h1>All American Marketplace</h1><h2>{title}</h2></div>
        {body}
        {user_box}
        {nav}
    <footer>All American Marketplace Ecosystem</footer></body>
    </html>
    """

@app.route("/")
def home():
    content = load_json(CONTENT_FILE, {
        "home_headline": "All American Marketplace Platform",
        "home_text": "This build adds a real admin editing layer so you can update and grow the site from inside the platform."
    })
    return page("Visible Upgrade + Admin Editing", f"""
    <div class="card">
        <h3>{content.get('home_headline','All American Marketplace Platform')}</h3>
        <p>{content.get('home_text','')}</p>
    </div>
    """ + section("What Changed", [
        "Admin Studio added",
        "Feature Builder added",
        "Content Editor added",
        "Module Notes added",
        "Change Log added",
        "Beta Intake added"
    ]))

@app.route("/dashboard")
def dashboard():
    features = load_json(FEATURES_FILE, [])
    logs = load_json(CHANGELOG_FILE, [])
    content = load_json(CONTENT_FILE, {})
    return page("Dashboard", (
        section("Live Counts", [
            f"Feature requests: {len(features)}",
            f"Content entries: {len(content)}",
            f"Change log entries: {len(logs)}"
        ]) +
        section("What This Platform Can Do Now", [
            "Let admins update visible site content",
            "Track feature requests",
            "Record changes",
            "Organize module notes",
            "Support beta requests"
        ])
    ))

@app.route("/admin-studio")
def admin_studio():
    return page("Admin Studio", (
        section("Admin Studio", [
            "Platform editing hub",
            "Feature management",
            "Content updates",
            "Module note management",
            "Change tracking",
            "Beta intake review"
        ]) +
        section("What This Does", [
            "Gives you a real update center inside the app",
            "Makes the platform feel more alive",
            "Lets admins evolve the system faster"
        ])
    ))

@app.route("/feature-builder", methods=["GET","POST"])
def feature_builder():
    if request.method == "POST":
        features = load_json(FEATURES_FILE, [])
        item = {
            "id": str(uuid.uuid4()),
            "title": request.form.get("title","").strip() or "Untitled Feature",
            "category": request.form.get("category","").strip() or "General",
            "description": request.form.get("description","").strip() or "No description",
            "status": request.form.get("status","").strip() or "idea",
            "time": now()
        }
        features.append(item)
        save_json(FEATURES_FILE, features)
        add_log(f"Feature added: {item['title']}")
        return redirect("/feature-builder")
    features = load_json(FEATURES_FILE, [])
    html = """
    <div class="card">
        <form method="post">
            <input name="title" placeholder="Feature title">
            <input name="category" placeholder="Category">
            <select name="status">
                <option value="idea">Idea</option>
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
            </select>
            <textarea name="description" placeholder="Describe the feature"></textarea>
            <button class="btn btn2" type="submit">Add Feature</button>
        </form>
    </div>
    """
    for f in reversed(features[-100:]):
        html += f"<div class='card'><p><strong>{f['title']}</strong> — {f['category']} — {f['status']}</p><p>{f['description']}</p><p><small>{f['time']}</small></p></div>"
    return page("Feature Builder", html)

@app.route("/content-editor", methods=["GET","POST"])
def content_editor():
    if request.method == "POST":
        content = load_json(CONTENT_FILE, {})
        key = request.form.get("key","").strip()
        value = request.form.get("value","").strip()
        if key:
            content[key] = value
            save_json(CONTENT_FILE, content)
            add_log(f"Content updated: {key}")
        return redirect("/content-editor")
    content = load_json(CONTENT_FILE, {})
    html = """
    <div class="card">
        <form method="post">
            <input name="key" placeholder="Content key, example: home_headline">
            <textarea name="value" placeholder="New content value"></textarea>
            <button class="btn btn2" type="submit">Save Content</button>
        </form>
    </div>
    """
    for k, v in content.items():
        html += f"<div class='card'><p><strong>{k}</strong></p><p>{v}</p></div>"
    return page("Content Editor", html)

@app.route("/module-notes", methods=["GET","POST"])
def module_notes():
    notes_file = os.path.join(DATA, "module_notes.json")
    if request.method == "POST":
        notes = load_json(notes_file, [])
        item = {
            "id": str(uuid.uuid4()),
            "module": request.form.get("module","").strip() or "General",
            "note": request.form.get("note","").strip() or "No note",
            "time": now()
        }
        notes.append(item)
        save_json(notes_file, notes)
        add_log(f"Module note added: {item['module']}")
        return redirect("/module-notes")
    notes = load_json(notes_file, [])
    html = """
    <div class="card">
        <form method="post">
            <input name="module" placeholder="Module name">
            <textarea name="note" placeholder="Write module note"></textarea>
            <button class="btn btn2" type="submit">Save Note</button>
        </form>
    </div>
    """
    for n in reversed(notes[-100:]):
        html += f"<div class='card'><p><strong>{n['module']}</strong></p><p>{n['note']}</p><p><small>{n['time']}</small></p></div>"
    return page("Module Notes", html)

@app.route("/change-log")
def change_log():
    logs = load_json(CHANGELOG_FILE, [])
    html = ""
    for item in reversed(logs[-200:]):
        html += f"<div class='card'><p>{item['entry']}</p><p><small>{item['time']}</small></p></div>"
    if not html:
        html = "<div class='card'><p>No changes logged yet.</p></div>"
    return page("Change Log", html)

@app.route("/beta-intake", methods=["GET","POST"])
def beta_intake():
    beta_file = os.path.join(DATA, "beta_intake.json")
    if request.method == "POST":
        items = load_json(beta_file, [])
        item = {
            "id": str(uuid.uuid4()),
            "name": request.form.get("name","").strip() or "Anonymous",
            "email": request.form.get("email","").strip() or "No email",
            "interest": request.form.get("interest","").strip() or "General",
            "notes": request.form.get("notes","").strip() or "",
            "time": now()
        }
        items.append(item)
        save_json(beta_file, items)
        add_log(f"Beta request submitted by {item['name']}")
        return redirect("/beta-intake")
    items = load_json(beta_file, [])
    html = """
    <div class="card">
        <form method="post">
            <input name="name" placeholder="Name">
            <input name="email" placeholder="Email">
            <input name="interest" placeholder="Area of interest">
            <textarea name="notes" placeholder="Notes"></textarea>
            <button class="btn btn2" type="submit">Submit Beta Request</button>
        </form>
    </div>
    """
    for i in reversed(items[-100:]):
        html += f"<div class='card'><p><strong>{i['name']}</strong> — {i['interest']}</p><p>{i['email']}</p><p>{i['notes']}</p><p><small>{i['time']}</small></p></div>"
    return page("Beta Intake", html)

@app.route("/signup", methods=["GET","POST"])
def signup():
    if request.method == "POST":
        users = load_json(USERS_FILE, [])
        username = request.form.get("username","").strip()
        password = request.form.get("password","").strip()
        role = request.form.get("role","member").strip()
        if not username or not password:
            return page("Create Account", "<div class='card'><p>Username and password are required.</p></div>")
        if any(u["username"] == username for u in users):
            return page("Create Account", "<div class='card'><p>Username already exists.</p></div>")
        users.append({
            "id": str(uuid.uuid4()),
            "username": username,
            "password_hash": hash_pw(password),
            "role": role
        })
        save_json(USERS_FILE, users)
        session["username"] = username
        add_log(f"Account created: {username}")
        return redirect("/profile")
    return page("Create Account", """
    <div class="card">
        <form method="post">
            <input name="username" placeholder="Username">
            <input name="password" type="password" placeholder="Password">
            <select name="role">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
                <option value="operator">Operator</option>
            </select>
            <button class="btn btn2" type="submit">Create Account</button>
        </form>
    </div>
    """)

@app.route("/login", methods=["GET","POST"])
def login():
    if request.method == "POST":
        users = load_json(USERS_FILE, [])
        username = request.form.get("username","").strip()
        password = request.form.get("password","").strip()
        user = next((u for u in users if u["username"] == username and u["password_hash"] == hash_pw(password)), None)
        if user:
            session["username"] = username
            add_log(f"Login: {username}")
            return redirect("/profile")
        return page("Login", "<div class='card'><p>Invalid login.</p></div>")
    return page("Login", """
    <div class="card">
        <form method="post">
            <input name="username" placeholder="Username">
            <input name="password" type="password" placeholder="Password">
            <button class="btn btn2" type="submit">Login</button>
        </form>
    </div>
    """)

@app.route("/logout")
def logout():
    name = current_user()
    session.clear()
    if name:
        add_log(f"Logout: {name}")
    return redirect("/")

@app.route("/profile")
def profile():
    if not current_user():
        return redirect("/login")
    u = get_user()
    return page("Profile", section("My Profile", [
        f"Username: {u['username']}",
        f"Role: {u.get('role','member')}"
    ]))



@app.route("/auth-hub")
def auth_hub():
    providers = load_json(AUTH_CFG_FILE, {})
    items = []
    for name, meta in providers.items():
        items.append(f"{name} | enabled={meta.get('enabled')} | {meta.get('status')} | {meta.get('notes','')}")
    return page("Authentication Hub", (
        section("Authentication Hub", [
            "Apple Sign In",
            "Google / Gmail Sign In",
            "Microsoft / Hotmail / Outlook Sign In",
            "Yahoo Sign In",
            "Phone Login",
            "Android-friendly device login"
        ]) +
        section("Provider Status", items) +
        section("What This Does", [
            "Creates a visible multi-provider login system",
            "Makes onboarding faster and more trusted",
            "Prepares the platform for production authentication later",
            "Supports future wallet identity and universal sign-in"
        ])
    ))

@app.route("/login/apple", methods=["GET","POST"])
def login_apple():
    if request.method == "POST":
        add_log("Apple login placeholder used")
        return page("Apple Login", "<div class='card'><p>Apple login placeholder is active. Add real Apple credentials later.</p></div>")
    return page("Apple Login", """
    <div class="card">
        <p>Apple Sign In placeholder.</p>
        <p>This becomes real after you add Apple developer credentials.</p>
        <form method="post">
            <button class="btn btn2" type="submit">Use Apple Login Placeholder</button>
        </form>
    </div>
    """)

@app.route("/login/google", methods=["GET","POST"])
def login_google():
    if request.method == "POST":
        add_log("Google login placeholder used")
        return page("Google Login", "<div class='card'><p>Google / Gmail login placeholder is active. Add real Google OAuth credentials later.</p></div>")
    return page("Google Login", """
    <div class="card">
        <p>Google / Gmail Sign In placeholder.</p>
        <p>This becomes real after you add Google OAuth credentials.</p>
        <form method="post">
            <button class="btn btn2" type="submit">Use Google Login Placeholder</button>
        </form>
    </div>
    """)

@app.route("/login/microsoft", methods=["GET","POST"])
def login_microsoft():
    if request.method == "POST":
        add_log("Microsoft login placeholder used")
        return page("Microsoft Login", "<div class='card'><p>Microsoft / Hotmail / Outlook login placeholder is active. Add real Microsoft app credentials later.</p></div>")
    return page("Microsoft Login", """
    <div class="card">
        <p>Microsoft / Hotmail / Outlook Sign In placeholder.</p>
        <p>This becomes real after you add Microsoft app credentials.</p>
        <form method="post">
            <button class="btn btn2" type="submit">Use Microsoft Login Placeholder</button>
        </form>
    </div>
    """)

@app.route("/login/yahoo", methods=["GET","POST"])
def login_yahoo():
    if request.method == "POST":
        add_log("Yahoo login placeholder used")
        return page("Yahoo Login", "<div class='card'><p>Yahoo login placeholder is active. Add real Yahoo developer credentials later.</p></div>")
    return page("Yahoo Login", """
    <div class="card">
        <p>Yahoo Sign In placeholder.</p>
        <p>This becomes real after you add Yahoo developer credentials.</p>
        <form method="post">
            <button class="btn btn2" type="submit">Use Yahoo Login Placeholder</button>
        </form>
    </div>
    """)

@app.route("/login/phone", methods=["GET","POST"])
def login_phone():
    if request.method == "POST":
        phone = request.form.get("phone","").strip()
        code = request.form.get("code","").strip()
        if phone and not code:
            add_log(f"Phone login code requested for {phone}")
            return page("Phone Login", f"<div class='card'><p>OTP placeholder requested for {phone}. Add real SMS provider later.</p><p>For now this is a visible placeholder flow only.</p></div>")
        if phone and code:
            add_log(f"Phone login placeholder verified for {phone}")
            return page("Phone Login", f"<div class='card'><p>Phone login placeholder completed for {phone}. Add real OTP verification later.</p></div>")
    return page("Phone Login", """
    <div class="card">
        <p>Phone login placeholder.</p>
        <p>This becomes real after you connect an SMS/OTP provider.</p>
        <form method="post">
            <input name="phone" placeholder="Phone number">
            <input name="code" placeholder="OTP code (optional for placeholder)">
            <button class="btn btn2" type="submit">Use Phone Login Placeholder</button>
        </form>
    </div>
    """)

@app.route("/auth-settings", methods=["GET","POST"])
def auth_settings():
    if not is_admin():
        return redirect("/login")
    providers = load_json(AUTH_CFG_FILE, {})
    if request.method == "POST":
        name = request.form.get("name","").strip()
        enabled = request.form.get("enabled","true").strip().lower() == "true"
        status = request.form.get("status","placeholder").strip()
        notes = request.form.get("notes","").strip()
        if name:
            providers[name] = {
                "enabled": enabled,
                "status": status,
                "notes": notes
            }
            save_json(AUTH_CFG_FILE, providers)
            add_log(f"Auth provider updated: {name}")
        return redirect("/auth-settings")
    html = """
    <div class="card">
        <form method="post">
            <input name="name" placeholder="Provider name: apple / google / microsoft / yahoo / phone">
            <select name="enabled">
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
            </select>
            <input name="status" placeholder="Status: placeholder / testing / live">
            <textarea name="notes" placeholder="Notes"></textarea>
            <button class="btn btn2" type="submit">Save Auth Provider</button>
        </form>
    </div>
    """
    for k, v in providers.items():
        html += f"<div class='card'><p><strong>{k}</strong></p><p>enabled={v.get('enabled')} | {v.get('status')}</p><p>{v.get('notes','')}</p></div>"
    return page("Auth Settings", html)




# -------------------------
# Next-Level + Accessibility Live Merge
# -------------------------

import os, json

_NL_BASE = os.path.dirname(os.path.abspath(__file__))

def _nl_load_json(relpath, default):
    try:
        with open(os.path.join(_NL_BASE, relpath), "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default

def _nl_section(title, items):
    if "section" in globals():
        try:
            return section(title, items)
        except Exception:
            pass
    rows = "".join(f"<li>{item}</li>" for item in items)
    return f'<div class="card"><h3>{title}</h3><ul>{rows}</ul></div>'

def _nl_page(title, body):
    if "page" in globals():
        try:
            return page(title, body)
        except Exception:
            pass
    return f"""
    <html>
    <head><link rel='stylesheet' href='/static/css/platform.css'>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>{title}</title>
        <style>
            body {{ background:#0b1220; color:white; font-family:Arial,sans-serif; text-align:center; padding:16px; margin:0; }}
            .hero {{ background:#182235; border:2px solid #334155; border-radius:18px; padding:24px; margin:16px auto; max-width:1100px; }}
            .card {{ background:#182235; border:2px solid #334155; border-radius:16px; padding:20px; margin:16px auto; max-width:1100px; text-align:left; }}
            h1 {{ font-size:36px; }} h2,h3 {{ font-size:26px; }} p,li {{ font-size:19px; }}
        </style>
    </head>
    <body><header>All American Marketplace Platform</header>
        <div class="hero"><h1>All American Marketplace</h1><h2>{title}</h2></div>
        {body}
    <footer>All American Marketplace Ecosystem</footer></body>
    </html>
    """

@app.route("/next-level")
def next_level_live():
    creator_os = _nl_load_json("next_level/creator_os/creator_os.json", {})
    ai_brain = _nl_load_json("next_level/ai_brain/intelligent_creator_engine.json", {})
    fan = _nl_load_json("next_level/fan_engagement/unified_fan_engagement.json", {})
    revenue = _nl_load_json("next_level/revenue_network/creator_revenue_network.json", {})
    discovery = _nl_load_json("next_level/discovery_engine/discovery_engine.json", {})
    governance = _nl_load_json("next_level/governance/platform_governance.json", {})
    battles = _nl_load_json("next_level/battles/pk_battle_modes.json", {})
    collectibles = _nl_load_json("next_level/collectibles/holographic_collectibles.json", {})
    streaming = _nl_load_json("next_level/streaming_economy/music_streaming_payout_models.json", {})
    social = _nl_load_json("next_level/social_models/golden_era_social_stack.json", {})
    events = _nl_load_json("next_level/events/creator_ecosystem_events.json", {})

    body = ""
    body += _nl_section("Creator OS", creator_os.get("creator_os", {}).get("workspace_modules", []))
    body += _nl_section("Intelligent Creator Engine", ai_brain.get("intelligent_creator_engine", {}).get("features", []))
    body += _nl_section("Unified Fan Engagement", fan.get("fan_engagement", {}).get("features", []))
    body += _nl_section("Creator Revenue Network", revenue.get("creator_revenue_network", {}).get("income_streams", []))
    body += _nl_section("Discovery Engine", discovery.get("discovery_engine", {}).get("features", []))
    body += _nl_section("Governance", governance.get("governance", {}).get("features", []))
    body += _nl_section("PK Battle Modes", battles.get("battle_modes", []))

    c = collectibles.get("collectibles", {})
    body += _nl_section("Holographic Collectibles", c.get("types", []) + c.get("features", []))

    body += _nl_section("Music Streaming Payout Models", streaming.get("payout_models", {}).get("models", []))
    body += _nl_section("Golden Era Social Stack", social.get("golden_era_social_stack", {}).get("borrowed_patterns", []))
    body += _nl_section("Creator Ecosystem Events", events.get("event_types", []))
    body += _nl_section("What This Does", [
        "Makes the next-level creator ecosystem part of the live app",
        "Brings creator tools, fan engagement, battles, collectibles, payouts, discovery, and governance together",
        "Turns the platform more into a creator entertainment operating system"
    ])
    return _nl_page("Next-Level Creator Ecosystem", body)

@app.route("/accessibility-center")
def accessibility_center():
    profiles = _nl_load_json("accessibility/profiles/accessibility_profiles.json", {"profiles":[]})
    ui = _nl_load_json("accessibility/ui/accessibility_ui.json", {"ui_features":[]})
    voice = _nl_load_json("accessibility/voice/voice_access.json", {"voice_access":[]})
    media = _nl_load_json("accessibility/media/media_accessibility.json", {"media_accessibility":[]})
    controls = _nl_load_json("accessibility/controls/alternate_controls.json", {"alternate_controls":[]})
    ai = _nl_load_json("accessibility/ai_assist/accessibility_ai_assistant.json", {"accessibility_ai_assistant":{"features":[]}})

    body = ""
    for profile in profiles.get("profiles", []):
        body += _nl_section(profile.get("name", "profile"), profile.get("features", []))
    body += _nl_section("UI Accessibility", ui.get("ui_features", []))
    body += _nl_section("Voice Access", voice.get("voice_access", []))
    body += _nl_section("Media Accessibility", media.get("media_accessibility", []))
    body += _nl_section("Alternate Controls", controls.get("alternate_controls", []))
    body += _nl_section("Accessibility AI Assistant", ai.get("accessibility_ai_assistant", {}).get("features", []))
    body += _nl_section("What This Does", [
        "Makes accessibility part of the live app",
        "Supports mobility, vision, hearing, cognitive, and fatigue-related needs",
        "Strengthens voice-first and low-effort usage across the platform"
    ])
    return _nl_page("Accessibility Center", body)

@app.route("/accessible-creator-mode")
def accessible_creator_mode():
    return _nl_page("Accessible Creator Mode",
        _nl_section("Accessible Creator Mode", [
            "voice navigation for creator workflows",
            "large buttons and one-hand mode",
            "simplified creator dashboard layout",
            "caption and transcript access",
            "guided publishing and release steps",
            "low-effort music and streaming workflows"
        ]) +
        _nl_section("What This Does", [
            "Makes creator tools easier to use across disabilities",
            "Supports artists, streamers, and producers with lower effort and clearer workflows"
        ])
    )

@app.route("/accessible-battle-mode")
def accessible_battle_mode():
    return _nl_page("Accessible Battle Mode",
        _nl_section("Accessible Battle Mode", [
            "simplified battle controls",
            "keyboard-only and switch access support",
            "voice-guided battle actions",
            "reduced motion battle display",
            "clear contrast for stats and card states",
            "caption and visual cue support"
        ]) +
        _nl_section("What This Does", [
            "Makes PK battles and card systems more usable for more players",
            "Improves accessibility without removing the battle experience"
        ])
    )

@app.route("/accessible-music-studio")
def accessible_music_studio():
    return _nl_page("Accessible Music Studio",
        _nl_section("Accessible Music Studio", [
            "voice-first recording workflow",
            "large control transport buttons",
            "screen-reader-friendly studio structure",
            "captioned and transcribed session notes",
            "reduced-clutter arrangement view",
            "save-progress-everywhere mode"
        ]) +
        _nl_section("What This Does", [
            "Makes the music studio more usable with less typing and less strain",
            "Supports professional creator workflows across disability needs"
        ])
    )

@app.route("/accessibility-settings")
def accessibility_settings():
    profiles = _nl_load_json("accessibility/profiles/accessibility_profiles.json", {"profiles":[]})
    names = [p.get("name", "profile") for p in profiles.get("profiles", [])]
    return _nl_page("Accessibility Settings",
        _nl_section("Available Accessibility Profiles", names) +
        _nl_section("Recommended Saved Settings", [
            "high contrast mode",
            "large text",
            "voice navigation",
            "captions on",
            "reduced motion",
            "one-hand mode",
            "simplified layout"
        ]) +
        _nl_section("What This Does", [
            "Prepares the platform for user-specific accessibility preferences later",
            "Creates a foundation for personalized accessible experiences"
        ])
    )



# --------------------------------
# Monetization + Beta Access Layer
# --------------------------------

@app.route("/pricing")
def pricing():

    body = ""

    body += section("Free Tier",[
        "Join marketplace",
        "Upload music",
        "Stream content",
        "Join battles",
        "Basic AI creator tools",
        "Basic analytics",
        "Basic university access",
        "Accessibility features"
    ])

    body += section("Creator Pro - $10/month",[
        "Advanced analytics",
        "AI growth assistant",
        "AI artwork generator",
        "Creator store",
        "Battle tournaments",
        "Advanced streaming tools"
    ])

    body += section("Creator Elite - $30/month",[
        "AI production studio",
        "Advanced music mastering",
        "Holographic collectibles",
        "Exclusive battle arenas",
        "Advanced monetization",
        "Fan club memberships"
    ])

    body += section("Enterprise - $100+/month",[
        "Organization dashboards",
        "University systems",
        "Workforce automation",
        "Logistics tools",
        "AI automation"
    ])

    body += section("Marketplace Fees",[
        "5–8% transaction fee",
        "Creator keeps majority revenue"
    ])

    body += section("Streaming Revenue Model",[
        "Creators keep 80–90%",
        "Platform keeps 10–20%"
    ])

    body += section("NFT / Holographic Collectibles",[
        "Mint fee $1-$5",
        "Marketplace fee 5%",
        "Resale royalties"
    ])

    return page("Platform Pricing",body)


@app.route("/beta-access")
def beta():

    body = ""

    body += section("Early Beta Access",[
        "Join before public launch",
        "Access creator tools early",
        "Help shape the ecosystem",
        "Support platform development"
    ])

    body += section("Beta Founder Tier",[
        "Lifetime founder badge",
        "Early creator verification",
        "Priority feature access",
        "Reduced future platform fees"
    ])

    body += section("Why Beta Matters",[
        "Funds security audits",
        "Supports blockchain mainnet",
        "Builds the creator community",
        "Strengthens the ecosystem"
    ])

    return page("Beta Access",body)




# -------------------------
# Ultimate Vision Center Live Route
# -------------------------
import os, json

_VISION_BASE = os.path.dirname(os.path.abspath(__file__))

def _vision_load_json(relpath, default):
    try:
        with open(os.path.join(_VISION_BASE, relpath), "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default

def _vision_section(title, items):
    if "section" in globals():
        try:
            return section(title, items)
        except Exception:
            pass
    rows = "".join(f"<li>{item}</li>" for item in items)
    return f'<div class="card"><h3>{title}</h3><ul>{rows}</ul></div>'

def _vision_page(title, body):
    if "page" in globals():
        try:
            return page(title, body)
        except Exception:
            pass
    return f"""
    <html>
    <head><link rel='stylesheet' href='/static/css/platform.css'>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>{title}</title>
        <style>
            body {{ margin:0; padding:18px; font-family:Arial,sans-serif; background:linear-gradient(135deg,#060b16,#0b1220,#111827); color:white; text-align:center; }}
            .hero {{ max-width:1180px; margin:16px auto; padding:30px; border-radius:24px; border:2px solid rgba(96,165,250,0.8); background:linear-gradient(135deg,rgba(17,24,39,0.95),rgba(30,41,59,0.92)); }}
            .card {{ max-width:1180px; margin:16px auto; padding:22px; text-align:left; border-radius:22px; border:1px solid rgba(148,163,184,0.35); background:linear-gradient(180deg,rgba(15,23,42,0.92),rgba(30,41,59,0.90)); }}
            h1 {{ font-size:40px; }} h2,h3 {{ font-size:28px; }} p,li {{ font-size:19px; line-height:1.5; }} ul {{ padding-left:24px; }}
            .badge {{ display:inline-block; margin:6px; padding:10px 16px; border-radius:999px; border:1px solid #60a5fa; background:rgba(8,15,30,0.9); font-weight:bold; }}
        </style>
    </head>
    <body><header>All American Marketplace Platform</header>
        <div class="hero">
            <h1>All American Marketplace</h1>
            <h2>{title}</h2>
            <span class="badge">Level 20</span>
            <span class="badge">Creator OS</span>
            <span class="badge">Accessibility</span>
            <span class="badge">Holographic Ads</span>
            <span class="badge">Verification</span>
            <span class="badge">Monetization</span>
        </div>
        {body}
    <footer>All American Marketplace Ecosystem</footer></body>
    </html>
    """

@app.route("/vision")
def vision():
    data = _vision_load_json("ultimate_vision/config/ultimate_manifest.json", {})
    sections = data.get("sections", {})
    ordered = [
        "creator_os",
        "ai_creator_engine",
        "fan_engagement",
        "revenue_network",
        "discovery_engine",
        "governance",
        "battle_modes",
        "collectibles",
        "streaming_payout_models",
        "social_stack",
        "accessibility",
        "level20_visual_system",
        "holographic_ad_network",
        "verification_system",
        "pricing",
        "music_lab",
        "event_core",
        "network_and_scaling"
    ]
    labels = {
        "creator_os":"Creator OS",
        "ai_creator_engine":"Intelligent Creator Engine",
        "fan_engagement":"Unified Fan Engagement",
        "revenue_network":"Creator Revenue Network",
        "discovery_engine":"Discovery Engine",
        "governance":"Governance + Trust + Compliance",
        "battle_modes":"PK + Battle Modes",
        "collectibles":"Holographic Collectibles + Printable Decks",
        "streaming_payout_models":"Music Streaming Payout Models",
        "social_stack":"Golden Era Social Stack",
        "accessibility":"Accessibility + Disability Support",
        "level20_visual_system":"Level 20 Visual System",
        "holographic_ad_network":"Holographic Ad Network",
        "verification_system":"Verification System",
        "pricing":"Pricing + Beta Access",
        "music_lab":"Music Lab",
        "event_core":"Event Core",
        "network_and_scaling":"Network + Blockchain Scaling"
    }
    body = ""
    for key in ordered:
        body += _vision_section(labels.get(key, key), sections.get(key, []))
    body += _vision_section("What This Does", [
        "Makes the full ecosystem visible in the live app",
        "Creates one flagship route for presentation and onboarding",
        "Unifies the monetization, creator, accessibility, ad, verification, and infrastructure story"
    ])
    return _vision_page("Ultimate Vision Center", body)



# -------------------------
# Live Status + Help Center
# -------------------------

@app.route("/status")
def platform_status():
    body = ""
    body += section("Platform Status", [
        "Main app: operational",
        "Creator ecosystem: scaffolded",
        "Accessibility center: available",
        "Vision center: available",
        "Pricing and beta layer: available"
    ])
    body += section("Service Health", [
        "Payments: scaffold / testing phase",
        "AI systems: scaffold / integration phase",
        "Search and research: scaffold / integration phase",
        "Streaming systems: prototype / expansion phase",
        "Event core: scaffolded",
        "Network and scaling layer: planned + documented"
    ])
    body += section("What This Does", [
        "Creates a public trust and readiness view",
        "Helps users and partners understand platform status",
        "Supports launch readiness and operations transparency"
    ])
    return page("Platform Status", body)

@app.route("/help")
def help_center():
    body = ""
    body += section("Help Center", [
        "Getting started",
        "Creator onboarding",
        "Music lab help",
        "Streaming help",
        "Marketplace help",
        "Accessibility help",
        "Payments and support help",
        "Battles and collectibles help",
        "Safety and reporting help"
    ])
    body += section("Creator Help", [
        "Set up your creator workspace",
        "Upload tracks and media",
        "Use AI creator tools",
        "Schedule releases",
        "Manage support and memberships"
    ])
    body += section("Accessibility Help", [
        "Voice-first navigation support",
        "High contrast and text scaling support",
        "Caption and transcript support",
        "Accessible creator mode",
        "Accessible battle mode",
        "Accessible music studio mode"
    ])
    body += section("Support Flows", [
        "Report a problem",
        "Request creator verification",
        "Get payment help",
        "Appeal moderation actions",
        "Ask for accessibility assistance"
    ])
    body += section("What This Does", [
        "Adds a user-facing support and onboarding center",
        "Improves trust, retention, and usability",
        "Prepares the platform for real users at scale"
    ])
    return page("Help Center", body)



# -------------------------
# Legal + Trust Pages
# -------------------------

@app.route("/legal")
def legal_center():
    body = ""
    body += section("Legal Center", [
        "Privacy Policy",
        "Terms of Service",
        "Accessibility Statement",
        "Acceptable Use",
        "Creator Terms",
        "Marketplace Terms",
        "Support and Refund Policy",
        "Moderation and Reporting Policy"
    ])
    body += section("What This Does", [
        "Creates a central legal and trust hub",
        "Supports transparency for users, creators, partners, and supporters",
        "Improves launch readiness and platform credibility"
    ])
    return page("Legal Center", body)

@app.route("/privacy")
def privacy_policy():
    body = ""
    body += section("Privacy Policy", [
        "We collect only the information needed to operate the platform",
        "We use platform data to improve services, security, and user experience",
        "We protect account and transaction information with security controls",
        "We aim to support user control, transparency, and responsible data handling",
        "Sensitive systems should be reviewed before production launch"
    ])
    body += section("What This Does", [
        "Explains how platform data is handled",
        "Improves user trust and compliance readiness"
    ])
    return page("Privacy Policy", body)

@app.route("/terms")
def terms_of_service():
    body = ""
    body += section("Terms of Service", [
        "Users must follow platform rules and community standards",
        "Creators are responsible for content they upload and publish",
        "Marketplace participants must provide lawful products and services",
        "Payments, support, and memberships may be subject to platform policies",
        "Accounts may be limited or removed for abuse, fraud, or policy violations"
    ])
    body += section("What This Does", [
        "Defines platform rules and expectations",
        "Protects the ecosystem as it grows"
    ])
    return page("Terms of Service", body)

@app.route("/accessibility-statement")
def accessibility_statement():
    body = ""
    body += section("Accessibility Statement", [
        "This platform aims to support users across disability needs",
        "Voice-first, low-effort, visual, hearing, mobility, and cognitive support features are part of the roadmap",
        "Accessibility improvements are treated as a core platform priority",
        "Feedback on accessibility barriers should be welcomed and reviewed",
        "The goal is broad usability across creator, streaming, marketplace, education, and ministry systems"
    ])
    body += section("What This Does", [
        "Shows accessibility is part of the platform mission",
        "Improves trust, inclusion, and public readiness"
    ])
    return page("Accessibility Statement", body)



# -------------------------
# Live Onboarding + Conversion Funnel
# -------------------------

@app.route("/onboarding")
def onboarding():
    body = ""
    body += section("Start Here", [
        "Join Free",
        "Set up your creator workspace",
        "Explore pricing and upgrades",
        "Apply for verification",
        "Join beta founder access",
        "Get help if needed"
    ])
    body += section("What This Does", [
        "Creates a real entry point into the ecosystem",
        "Guides people from interest to action",
        "Makes the platform more launch-ready"
    ])
    return page("Onboarding", body)

@app.route("/join-free")
def join_free():
    body = ""
    body += section("Join Free", [
        "Create an account",
        "Access core creator and fan features",
        "Explore streaming, marketplace, music, and community tools",
        "Start with accessibility options if needed"
    ])
    body += section("Included In Free", [
        "Basic streaming access",
        "Basic creator access",
        "Basic music and profile tools",
        "Basic accessibility support",
        "Basic fan engagement"
    ])
    return page("Join Free", body)

@app.route("/creator-setup")
def creator_setup():
    body = ""
    body += section("Creator Setup", [
        "Choose creator type",
        "Set up your creator profile",
        "Connect your music, streaming, or business focus",
        "Configure fan support and monetization options",
        "Set accessibility and workflow preferences"
    ])
    body += section("Creator Types", [
        "Artist",
        "Streamer",
        "Ministry",
        "Educator",
        "Business",
        "Marketplace Seller"
    ])
    return page("Creator Setup", body)

@app.route("/upgrade")
def upgrade():
    body = ""
    body += section("Upgrade Options", [
        "Creator Pro - $10/month",
        "Creator Elite - $30/month",
        "Enterprise - $100+/month",
        "Founder and premium badge pathways",
        "Verification and premium visibility options"
    ])
    body += section("Why Upgrade", [
        "Advanced analytics",
        "Creator growth tools",
        "Music lab expansion",
        "Battle and collectible features",
        "Premium discovery and monetization"
    ])
    return page("Upgrade", body)

@app.route("/verification-apply")
def verification_apply():
    body = ""
    body += section("Verification Apply", [
        "Creator Verified",
        "Artist Verified",
        "Ministry Verified",
        "Business Verified",
        "Gold Founder Verified",
        "Elite Verified"
    ])
    body += section("What Verification Does", [
        "Builds trust",
        "Improves discoverability",
        "Supports identity and brand protection",
        "Creates premium status options"
    ])
    return page("Verification Apply", body)

@app.route("/founder-access")
def founder_access():
    body = ""
    body += section("Founder Access", [
        "Early supporter status",
        "Priority beta access",
        "Founder recognition",
        "Early ecosystem positioning",
        "Potential reduced future platform fees"
    ])
    body += section("Why It Matters", [
        "Helps fund development",
        "Supports audits and launch",
        "Builds a core community early"
    ])
    return page("Founder Access", body)

@app.route("/contact-support")
def contact_support():
    body = ""
    body += section("Contact + Support", [
        "General help",
        "Creator support",
        "Accessibility help",
        "Payment and billing support",
        "Verification support",
        "Safety and reporting support"
    ])
    body += section("What This Does", [
        "Gives users a clearer help path",
        "Improves trust and reduces confusion during onboarding"
    ])
    return page("Contact + Support", body)



# -------------------------
# Lightweight Data Helpers
# -------------------------

_DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

def _ensure_data_dir():
    os.makedirs(_DATA_DIR, exist_ok=True)

def _data_path(name):
    _ensure_data_dir()
    return os.path.join(_DATA_DIR, name)

def _load_json_file(name, default):
    path = _data_path(name)
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default

def _save_json_file(name, data):
    path = _data_path(name)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def _now_iso():
    return str(datetime.datetime.now())

def _submit_record(filename, payload):
    rows = _load_json_file(filename, [])
    payload["id"] = str(uuid.uuid4())
    payload["created_at"] = _now_iso()
    rows.append(payload)
    _save_json_file(filename, rows)
    return payload



# -------------------------
# Database-Backed Funnel (JSON-backed for now)
# -------------------------

@app.route("/join-free", methods=["GET", "POST"])
def join_free():
    if request.method == "POST":
        rec = _submit_record("join_free_submissions.json", {
            "name": request.form.get("name", "").strip(),
            "email": request.form.get("email", "").strip(),
            "role_interest": request.form.get("role_interest", "").strip(),
            "notes": request.form.get("notes", "").strip()
        })
        _emit_event("user.join_free.submitted", "join_free", rec)
        body = ""
        body += section("Join Free Submitted", [
            f"Name: {rec.get('name') or 'Not provided'}",
            f"Email: {rec.get('email') or 'Not provided'}",
            f"Role Interest: {rec.get('role_interest') or 'General'}",
            "Your free-entry request has been saved"
        ])
        body += section("What Happens Next", [
            "You can continue into creator setup",
            "You can review upgrade options",
            "You can apply for verification later"
        ])
        return page("Join Free Submitted", body)

    body = """
    <div class="card">
        <form method="post">
            <input name="name" placeholder="Your name">
            <input name="email" placeholder="Your email">
            <input name="role_interest" placeholder="Artist / Streamer / Ministry / Business / Fan">
            <textarea name="notes" placeholder="What do you want to do on the platform?"></textarea>
            <button class="btn btn2" type="submit">Submit Join Free</button>
        </form>
    </div>
    """
    body += section("Join Free", [
        "Create an account path",
        "Access core platform features",
        "Start with creator, fan, or business tools"
    ])
    return page("Join Free", body)

@app.route("/creator-setup", methods=["GET", "POST"])
def creator_setup():
    if request.method == "POST":
        rec = _submit_record("creator_setup_submissions.json", {
            "creator_name": request.form.get("creator_name", "").strip(),
            "email": request.form.get("email", "").strip(),
            "creator_type": request.form.get("creator_type", "").strip(),
            "focus": request.form.get("focus", "").strip(),
            "monetization_interest": request.form.get("monetization_interest", "").strip(),
            "notes": request.form.get("notes", "").strip()
        })
        _emit_event("creator.setup.saved", "creator_setup", rec)
        body = ""
        body += section("Creator Setup Saved", [
            f"Creator Name: {rec.get('creator_name') or 'Not provided'}",
            f"Type: {rec.get('creator_type') or 'Creator'}",
            f"Focus: {rec.get('focus') or 'General'}",
            "Your creator setup has been saved"
        ])
        return page("Creator Setup Saved", body)

    body = """
    <div class="card">
        <form method="post">
            <input name="creator_name" placeholder="Creator / brand name">
            <input name="email" placeholder="Email">
            <input name="creator_type" placeholder="Artist / Streamer / Ministry / Educator / Business">
            <input name="focus" placeholder="Music / Live / Teaching / Marketplace / Community">
            <input name="monetization_interest" placeholder="Tips / Memberships / Streaming / Collectibles">
            <textarea name="notes" placeholder="Tell us about your creator goals"></textarea>
            <button class="btn btn2" type="submit">Save Creator Setup</button>
        </form>
    </div>
    """
    body += section("Creator Setup", [
        "Configure your creator pathway",
        "Prepare monetization and visibility options",
        "Set the base for verification and upgrades"
    ])
    return page("Creator Setup", body)

@app.route("/upgrade", methods=["GET", "POST"])
def upgrade():
    if request.method == "POST":
        rec = _submit_record("upgrade_interest.json", {
            "name": request.form.get("name", "").strip(),
            "email": request.form.get("email", "").strip(),
            "plan": request.form.get("plan", "").strip(),
            "notes": request.form.get("notes", "").strip()
        })
        _emit_event("upgrade.interest.saved", "upgrade", rec)
        body = ""
        body += section("Upgrade Interest Saved", [
            f"Name: {rec.get('name') or 'Not provided'}",
            f"Plan: {rec.get('plan') or 'Not provided'}",
            "Your upgrade interest has been saved"
        ])
        return page("Upgrade Interest Saved", body)

    body = """
    <div class="card">
        <form method="post">
            <input name="name" placeholder="Your name">
            <input name="email" placeholder="Email">
            <input name="plan" placeholder="Creator Pro / Creator Elite / Enterprise">
            <textarea name="notes" placeholder="What upgrade features matter most to you?"></textarea>
            <button class="btn btn2" type="submit">Save Upgrade Interest</button>
        </form>
    </div>
    """
    body += section("Upgrade Options", [
        "Creator Pro - $10/month",
        "Creator Elite - $30/month",
        "Enterprise - $100+/month"
    ])
    return page("Upgrade", body)

@app.route("/verification-apply", methods=["GET", "POST"])
def verification_apply():
    if request.method == "POST":
        rec = _submit_record("verification_applications.json", {
            "name": request.form.get("name", "").strip(),
            "email": request.form.get("email", "").strip(),
            "verification_type": request.form.get("verification_type", "").strip(),
            "brand_or_creator": request.form.get("brand_or_creator", "").strip(),
            "notes": request.form.get("notes", "").strip()
        })
        body = ""
        body += section("Verification Application Saved", [
            f"Name: {rec.get('name') or 'Not provided'}",
            f"Verification Type: {rec.get('verification_type') or 'Not provided'}",
            "Your verification request has been saved"
        ])
        return page("Verification Application Saved", body)

    body = """
    <div class="card">
        <form method="post">
            <input name="name" placeholder="Your name">
            <input name="email" placeholder="Email">
            <input name="verification_type" placeholder="Creator / Artist / Ministry / Business / Founder / Elite">
            <input name="brand_or_creator" placeholder="Brand or creator name">
            <textarea name="notes" placeholder="Why should this account be verified?"></textarea>
            <button class="btn btn2" type="submit">Apply for Verification</button>
        </form>
    </div>
    """
    body += section("Verification", [
        "Creator Verified",
        "Artist Verified",
        "Ministry Verified",
        "Business Verified",
        "Gold Founder Verified",
        "Elite Verified"
    ])
    return page("Verification Apply", body)

@app.route("/founder-access", methods=["GET", "POST"])
def founder_access():
    if request.method == "POST":
        rec = _submit_record("founder_access_requests.json", {
            "name": request.form.get("name", "").strip(),
            "email": request.form.get("email", "").strip(),
            "interest_level": request.form.get("interest_level", "").strip(),
            "notes": request.form.get("notes", "").strip()
        })
        _emit_event("founder.access.saved", "founder_access", rec)
        body = ""
        body += section("Founder Access Saved", [
            f"Name: {rec.get('name') or 'Not provided'}",
            f"Interest Level: {rec.get('interest_level') or 'Founder'}",
            "Your founder access request has been saved"
        ])
        return page("Founder Access Saved", body)

    body = """
    <div class="card">
        <form method="post">
            <input name="name" placeholder="Your name">
            <input name="email" placeholder="Email">
            <input name="interest_level" placeholder="Founder / Early Supporter / Partner / Investor">
            <textarea name="notes" placeholder="How do you want to support or participate?"></textarea>
            <button class="btn btn2" type="submit">Save Founder Access Request</button>
        </form>
    </div>
    """
    body += section("Founder Access", [
        "Early platform positioning",
        "Priority access",
        "Founder recognition",
        "Potential reduced platform fees later"
    ])
    return page("Founder Access", body)

@app.route("/admin-intake")
def admin_intake():
    join_free_rows = _load_json_file("join_free_submissions.json", [])
    creator_rows = _load_json_file("creator_setup_submissions.json", [])
    upgrade_rows = _load_json_file("upgrade_interest.json", [])
    verify_rows = _load_json_file("verification_applications.json", [])
    founder_rows = _load_json_file("founder_access_requests.json", [])

    body = ""
    body += section("Intake Summary", [
        f"Join Free submissions: {len(join_free_rows)}",
        f"Creator Setup submissions: {len(creator_rows)}",
        f"Upgrade Interest submissions: {len(upgrade_rows)}",
        f"Verification applications: {len(verify_rows)}",
        f"Founder access requests: {len(founder_rows)}"
    ])
    body += section("What This Does", [
        "Creates a simple admin intake dashboard",
        "Lets you track growth and demand",
        "Prepares the platform for lead management and onboarding operations"
    ])
    return page("Admin Intake", body)



# -------------------------
# Accounts + Media + Support Payments
# -------------------------

_DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
_ALLOWED_EXT = {"png","jpg","jpeg","gif","webp","mp3","wav","mp4","mov","pdf","txt"}

def _ensure_dirs():
    os.makedirs(_DATA_DIR, exist_ok=True)
    os.makedirs(_UPLOAD_DIR, exist_ok=True)

def _path(name):
    _ensure_dirs()
    return os.path.join(_DATA_DIR, name)

def _load(name, default):
    try:
        with open(_path(name), "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default

def _save(name, data):
    with open(_path(name), "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def _now():
    return str(datetime.datetime.now())

def _hash_pw(pw):
    return hashlib.sha256(pw.encode("utf-8")).hexdigest()

def _allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in _ALLOWED_EXT

def _current_user():
    return session.get("username")

def _users():
    rows = _load("users_live.json", [])
    if not rows:
        rows = [{
            "id": str(uuid.uuid4()),
            "username": "owner",
            "email": "owner@local",
            "password_hash": _hash_pw("owner123"),
            "role": "owner",
            "created_at": _now()
        }]
        _save("users_live.json", rows)
    return rows

def _find_user(username):
    for u in _users():
        if u.get("username") == username:
            return u
    return None



@app.route("/signup-live", methods=["GET","POST"])
def signup_live():
    if request.method == "POST":
        users = _users()
        username = request.form.get("username","").strip()
        email = request.form.get("email","").strip()
        password = request.form.get("password","").strip()
        role = request.form.get("role","member").strip() or "member"

        if not username or not password:
            return page("Sign Up", section("Error", ["Username and password are required"]))

        if _find_user(username):
            return page("Sign Up", section("Error", ["That username already exists"]))

        users.append({
            "id": str(uuid.uuid4()),
            "username": username,
            "email": email,
            "password_hash": _hash_pw(password),
            "role": role,
            "created_at": _now()
        })
        _save("users_live.json", users)
        session["username"] = username
        return redirect("/account")

    body = """
    <div class="card">
        <form method="post">
            <input name="username" placeholder="Username">
            <input name="email" placeholder="Email">
            <input name="password" type="password" placeholder="Password">
            <input name="role" placeholder="member / creator / business / ministry">
            <button class="btn btn2" type="submit">Create Account</button>
        </form>
    </div>
    """
    body += section("Default Owner", ["username: owner", "password: owner123"])
    return page("Sign Up", body)

@app.route("/login-live", methods=["GET","POST"])
def login_live():
    if request.method == "POST":
        username = request.form.get("username","").strip()
        password = request.form.get("password","").strip()
        user = _find_user(username)
        if user and user.get("password_hash") == _hash_pw(password):
            session["username"] = username
            return redirect("/account")
        return page("Login", section("Login Failed", ["Invalid username or password"]))

    body = """
    <div class="card">
        <form method="post">
            <input name="username" placeholder="Username">
            <input name="password" type="password" placeholder="Password">
            <button class="btn btn2" type="submit">Login</button>
        </form>
    </div>
    """
    body += section("Default Owner", ["username: owner", "password: owner123"])
    return page("Login", body)

@app.route("/logout-live")
def logout_live():
    session.pop("username", None)
    return redirect("/login-live")

@app.route("/account")
def account():
    username = _current_user()
    if not username:
        return redirect("/login-live")
    user = _find_user(username)
    body = ""
    body += section("Account", [
        f"Username: {user.get('username')}",
        f"Email: {user.get('email')}",
        f"Role: {user.get('role')}",
        f"Created: {user.get('created_at')}"
    ])
    body += section("Next Actions", [
        "Upload media",
        "Submit support/payment intake",
        "Continue creator setup",
        "Apply for verification"
    ])
    return page("My Account", body)

@app.route("/media-upload", methods=["GET","POST"])
def media_upload():
    username = _current_user()
    if not username:
        return redirect("/login-live")

    if request.method == "POST":
        media = request.files.get("media")
        title = request.form.get("title","").strip() or "Untitled Upload"
        media_rows = _load("media_assets.json", [])

        if media and media.filename and _allowed_file(media.filename):
            filename = secure_filename(f"{uuid.uuid4().hex}_{media.filename}")
            media.save(os.path.join(_UPLOAD_DIR, filename))
            media_rows.append({
                "id": str(uuid.uuid4()),
                "owner": username,
                "title": title,
                "filename": filename,
                "created_at": _now()
            })
            _save("media_assets.json", media_rows)
            _emit_event("media.uploaded", "media_upload", media_rows[-1])
            return page("Media Upload", section("Upload Saved", [
                f"Title: {title}",
                f"File: {filename}",
                "Your upload was saved"
            ]))

        return page("Media Upload", section("Upload Error", ["Choose a supported file"]))

    body = """
    <div class="card">
        <form method="post" enctype="multipart/form-data">
            <input name="title" placeholder="Upload title">
            <input type="file" name="media">
            <button class="btn btn2" type="submit">Upload Media</button>
        </form>
    </div>
    """
    body += section("Supported Types", ["images", "audio", "video", "pdf", "text"])
    return page("Media Upload", body)

@app.route("/uploads/<path:filename>")
def uploads_file(filename):
    return send_from_directory(_UPLOAD_DIR, filename)

@app.route("/support-payment", methods=["GET","POST"])
def support_payment():
    if request.method == "POST":
        rows = _load("support_payments_live.json", [])
        rows.append({
            "id": str(uuid.uuid4()),
            "name": request.form.get("name","").strip() or "Anonymous",
            "email": request.form.get("email","").strip(),
            "support_type": request.form.get("support_type","").strip() or "general",
            "amount": request.form.get("amount","").strip() or "0",
            "message": request.form.get("message","").strip(),
            "created_at": _now()
        })
        _save("support_payments_live.json", rows)
        _emit_event("payment.support.saved", "support_payment", rows[-1])
        return page("Support Payment", section("Support Saved", [
            "Your support/payment intent has been saved",
            "This is the bridge before live processor integration"
        ]))

    body = """
    <div class="card">
        <form method="post">
            <input name="name" placeholder="Your name">
            <input name="email" placeholder="Email">
            <input name="support_type" placeholder="creator / ministry / holographic gift / founder">
            <input name="amount" placeholder="Amount">
            <textarea name="message" placeholder="Message"></textarea>
            <button class="btn btn2" type="submit">Save Support Payment</button>
        </form>
    </div>
    """
    body += section("Purpose", [
        "Track real support/payment intent",
        "Prepare for Stripe or processor integration",
        "Fund beta, audit, and launch"
    ])
    return page("Support Payment", body)

@app.route("/admin-live")
def admin_live():
    users = _load("users_live.json", [])
    media = _load("media_assets.json", [])
    payments = _load("support_payments_live.json", [])
    body = ""
    body += section("Live Admin Summary", [
        f"Users: {len(users)}",
        f"Media uploads: {len(media)}",
        f"Support payments: {len(payments)}"
    ])
    if users:
        body += section("Recent Users", [f"{u.get('username')} ({u.get('role')})" for u in users[-10:]])
    if media:
        body += section("Recent Media", [f"{m.get('title')} by {m.get('owner')}" for m in media[-10:]])
    if payments:
        body += section("Recent Support Payments", [f"{x.get('name')} - {x.get('support_type')} - {x.get('amount')}" for x in payments[-10:]])
    return page("Admin Live", body)



# -------------------------
# Stripe Scaffold + Dashboards + Moderation
# -------------------------

def _cfg_path(name):
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), "config", name)

def _load_cfg(name, default):
    try:
        with open(_cfg_path(name), "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default

def _role():
    username = session.get("username")
    if not username:
        return "guest"
    users = _load("users_live.json", [])
    for u in users:
        if u.get("username") == username:
            return u.get("role", "member")
    return "member"

def _is_admin():
    return _role() in {"owner","admin"}

def _is_creator():
    return _role() in {"owner","admin","creator","artist","ministry","business"}

def _submit_mod(payload):
    rows = _load("moderation_queue.json", [])
    payload["id"] = str(uuid.uuid4())
    payload["status"] = payload.get("status", "queued")
    payload["created_at"] = str(datetime.datetime.now())
    rows.append(payload)
    _save("moderation_queue.json", rows)
    return payload



@app.route("/payments-center")
def payments_center():
    cfg = _load_cfg("stripe_config.json", {"products":[],"mode":"scaffold"})
    products = [f"{x.get('name')} - ${x.get('price_monthly')}/month" for x in cfg.get("products", [])]
    body = ""
    body += section("Payments Center", [
        f"Provider: {cfg.get('provider','stripe')}",
        f"Mode: {cfg.get('mode','scaffold')}",
        "Ready for future live Stripe integration",
        "Supports subscriptions, support payments, and upgrades"
    ])
    body += section("Subscription Products", products or ["No products configured"])
    body += section("What This Does", [
        "Creates a real payments structure",
        "Prepares the platform for live checkout later",
        "Supports beta funding and creator subscriptions"
    ])
    return page("Payments Center", body)

@app.route("/checkout-scaffold", methods=["GET","POST"])
def checkout_scaffold():
    if request.method == "POST":
        rows = _load("checkout_requests.json", [])
        rows.append({
            "id": str(uuid.uuid4()),
            "name": request.form.get("name","").strip() or "Anonymous",
            "email": request.form.get("email","").strip(),
            "product": request.form.get("product","").strip() or "Unknown",
            "amount": request.form.get("amount","").strip() or "0",
            "created_at": str(datetime.datetime.now())
        })
        _save("checkout_requests.json", rows)
        return page("Checkout Request Saved", section("Saved", [
            "Your checkout request was saved",
            "This is the bridge before live processor integration"
        ]))

    cfg = _load_cfg("stripe_config.json", {"products":[]})
    options = "".join(f'<option value="{x.get("name")}">{x.get("name")} - ${x.get("price_monthly")}/month</option>' for x in cfg.get("products", []))
    body = f"""
    <div class="card">
        <form method="post">
            <input name="name" placeholder="Your name">
            <input name="email" placeholder="Email">
            <select name="product">{options}</select>
            <input name="amount" placeholder="Amount">
            <button class="btn btn2" type="submit">Save Checkout Request</button>
        </form>
    </div>
    """
    return page("Checkout Scaffold", body)

@app.route("/dashboard-live")
def dashboard_live():
    role = _role()
    body = ""
    body += section("Dashboard Overview", [
        f"Current role: {role}",
        "This dashboard changes by role",
        "Owner/admin see platform controls",
        "Creators see creator tools",
        "Members see account and onboarding paths"
    ])

    if role in {"owner","admin"}:
        body += section("Admin Tools", [
            "Admin Live",
            "Moderation Queue",
            "Payments Center",
            "Verification requests",
            "Founder access requests",
            "Platform status"
        ])
    elif role in {"creator","artist","ministry","business"}:
        body += section("Creator Tools", [
            "Creator Setup",
            "Media Upload",
            "My Media Library",
            "Upgrade",
            "Support Payment",
            "Verification Apply"
        ])
    else:
        body += section("Member Tools", [
            "Join Free",
            "Creator Setup",
            "Upgrade",
            "Founder Access",
            "Contact Support"
        ])

    return page("Live Dashboard", body)

@app.route("/my-media")
def my_media():
    username = session.get("username")
    if not username:
        return redirect("/login-live")
    media = _load("media_assets.json", [])
    mine = [m for m in media if m.get("owner") == username]
    body = ""
    body += section("My Media Library", [f"{m.get('title')} - {m.get('filename')}" for m in mine] or ["No uploads yet"])
    body += section("What This Does", [
        "Gives creators a real media library view",
        "Lets uploads feel like part of a real platform"
    ])
    return page("My Media Library", body)

@app.route("/flag-content", methods=["GET","POST"])
def flag_content():
    if request.method == "POST":
        rec = _submit_mod({
            "reported_by": request.form.get("reported_by","").strip() or session.get("username") or "anonymous",
            "content_type": request.form.get("content_type","").strip() or "general",
            "target": request.form.get("target","").strip() or "unknown",
            "reason": request.form.get("reason","").strip() or "unspecified"
        })
        return page("Report Saved", section("Moderation Report Saved", [
            f"Target: {rec.get('target')}",
            f"Reason: {rec.get('reason')}",
            "This report was added to the moderation queue"
        ]))

    body = """
    <div class="card">
        <form method="post">
            <input name="reported_by" placeholder="Your name or username">
            <input name="content_type" placeholder="stream / post / collectible / creator / marketplace item">
            <input name="target" placeholder="Target content or account">
            <textarea name="reason" placeholder="Reason for report"></textarea>
            <button class="btn btn2" type="submit">Submit Report</button>
        </form>
    </div>
    """
    return page("Flag Content", body)

@app.route("/moderation-queue")
def moderation_queue():
    if not _is_admin():
        return redirect("/login-live")
    rows = _load("moderation_queue.json", [])
    body = ""
    body += section("Moderation Queue Summary", [f"Total queued items: {len(rows)}"])
    if rows:
        body += section("Recent Reports", [
            f"{x.get('content_type')} | {x.get('target')} | {x.get('reason')} | {x.get('status')}"
            for x in rows[-20:]
        ])
    else:
        body += section("Recent Reports", ["No reports yet"])
    return page("Moderation Queue", body)



# -------------------------
# Notifications + Verification Review + PG Scaffold
# -------------------------

def _cfg_load(name, default):
    try:
        with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "config", name), "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default

def _notify(recipient, channel, subject, message, status="queued"):
    rows = _load("notifications_live.json", [])
    rec = {
        "id": str(uuid.uuid4()),
        "recipient": recipient,
        "channel": channel,
        "subject": subject,
        "message": message,
        "status": status,
        "created_at": str(datetime.datetime.now())
    }
    rows.append(rec)
    _save("notifications_live.json", rows)
    return rec

def _verification_rows():
    return _load("verification_applications.json", [])

def _save_verification_rows(rows):
    _save("verification_applications.json", rows)

def _can_review():
    return _role() in {"owner","admin"}



@app.route("/notifications-center")
def notifications_center():
    cfg = _cfg_load("notifications_config.json", {})
    rows = _load("notifications_live.json", [])
    body = ""
    body += section("Notification Center", [
        f"Email provider: {cfg.get('email_provider','scaffold')}",
        f"SMS provider: {cfg.get('sms_provider','scaffold')}",
        f"In-app notifications: {cfg.get('in_app_notifications', True)}",
        f"Email enabled: {cfg.get('email_enabled', False)}",
        f"SMS enabled: {cfg.get('sms_enabled', False)}"
    ])
    body += section("Templates", cfg.get("templates", []))
    body += section("Recent Notifications", [
        f"{x.get('channel')} | {x.get('recipient')} | {x.get('subject')} | {x.get('status')}"
        for x in rows[-20:]
    ] or ["No notifications yet"])
    body += section("What This Does", [
        "Prepares email, SMS, and in-app messaging",
        "Creates a real notification record layer",
        "Improves onboarding and creator follow-through"
    ])
    return page("Notifications Center", body)

@app.route("/verification-apply", methods=["GET", "POST"])
def verification_apply():
    if request.method == "POST":
        rows = _load("verification_applications.json", [])
        rec = {
            "id": str(uuid.uuid4()),
            "name": request.form.get("name","").strip(),
            "email": request.form.get("email","").strip(),
            "verification_type": request.form.get("verification_type","").strip(),
            "brand_or_creator": request.form.get("brand_or_creator","").strip(),
            "notes": request.form.get("notes","").strip(),
            "status": "pending",
            "reviewer_note": "",
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save("verification_applications.json", rows)
        _emit_event("verification.application.saved", "verification_apply", rec)
        _notify(rec.get("email") or "unknown", "in_app", "Verification received", "Your verification application was received.", "queued")
        return page("Verification Application Saved", section("Verification Saved", [
            f"Name: {rec.get('name') or 'Not provided'}",
            f"Type: {rec.get('verification_type') or 'Not provided'}",
            "Your verification request has been saved and queued for review"
        ]))

    body = """
    <div class="card">
        <form method="post">
            <input name="name" placeholder="Your name">
            <input name="email" placeholder="Email">
            <input name="verification_type" placeholder="Creator / Artist / Ministry / Business / Founder / Elite">
            <input name="brand_or_creator" placeholder="Brand or creator name">
            <textarea name="notes" placeholder="Why should this account be verified?"></textarea>
            <button class="btn btn2" type="submit">Apply for Verification</button>
        </form>
    </div>
    """
    body += section("Verification", [
        "Creator Verified",
        "Artist Verified",
        "Ministry Verified",
        "Business Verified",
        "Gold Founder Verified",
        "Elite Verified"
    ])
    return page("Verification Apply", body)

@app.route("/verification-review")
def verification_review():
    if not _can_review():
        return redirect("/login-live")
    rows = _load("verification_applications.json", [])
    body = ""
    body += section("Verification Queue Summary", [
        f"Total requests: {len(rows)}",
        f"Pending: {len([x for x in rows if x.get('status') == 'pending'])}",
        f"Approved: {len([x for x in rows if x.get('status') == 'approved'])}",
        f"Rejected: {len([x for x in rows if x.get('status') == 'rejected'])}"
    ])
    body += section("Recent Verification Requests", [
        f"{x.get('name')} | {x.get('verification_type')} | {x.get('brand_or_creator')} | {x.get('status')}"
        for x in rows[-25:]
    ] or ["No verification requests yet"])
    body += section("Review Actions", [
        "Use /verification-review-action?id=<ID>&decision=approved",
        "Use /verification-review-action?id=<ID>&decision=rejected",
        "Optional reviewer_note query parameter supported"
    ])
    return page("Verification Review", body)

@app.route("/verification-review-action")
def verification_review_action():
    if not _can_review():
        return redirect("/login-live")
    req_id = request.args.get("id","").strip()
    decision = request.args.get("decision","").strip().lower()
    reviewer_note = request.args.get("reviewer_note","").strip()

    if decision not in {"approved","rejected"}:
        return page("Verification Review Action", section("Error", ["decision must be approved or rejected"]))

    rows = _load("verification_applications.json", [])
    updated = None
    for row in rows:
        if row.get("id") == req_id:
            row["status"] = decision
            row["reviewer_note"] = reviewer_note
            updated = row
            break

    if not updated:
        return page("Verification Review Action", section("Error", ["verification request not found"]))

    _save("verification_applications.json", rows)
    _notify(updated.get("email") or "unknown", "in_app", f"Verification {decision}", f"Your verification request was {decision}.", "queued")

    return page("Verification Review Action", section("Updated", [
        f"Name: {updated.get('name')}",
        f"Decision: {updated.get('status')}",
        f"Reviewer note: {updated.get('reviewer_note') or 'None'}"
    ]))

@app.route("/pg-bridge")
def pg_bridge():
    body = ""
    body += section("PostgreSQL Bridge Scaffold", [
        "Schema file created: db/postgres_bridge.sql",
        "Notifications table planned",
        "Verification requests table planned",
        "Current app still runs on JSON-backed state"
    ])
    body += section("What This Does", [
        "Prepares migration from JSON files to a real database",
        "Supports scale, auditing, and better reliability later"
    ])
    return page("PostgreSQL Bridge", body)


@app.route("/marketplace")
def marketplace():
    body=""
    body+=section("All American Marketplace",[
    "American Made product promotion",
    "Creator storefront commerce",
    "Global supplier bridge",
    "AI product intelligence"
    ])
    body+=section("Commerce Features",[
    "Live product selling",
    "AI pricing optimization",
    "Inventory prediction",
    "Marketplace analytics"
    ])
    return page("Marketplace",body)

@app.route("/supplier-network")
def supplier_network():
    body=""
    body+=section("Global Supplier Bridge",[
    "USA manufacturers",
    "Japan electronics",
    "Taiwan semiconductors",
    "Korea technology",
    "China bulk manufacturing"
    ])
    return page("Supplier Network",body)

@app.route("/quantum-shipping")
def quantum_shipping():
    body=""
    body+=section("Quantum Shipping Engine",[
    "AI route optimization",
    "Delivery prediction",
    "Tariff estimator",
    "Carrier comparison"
    ])
    return page("Quantum Shipping",body)

@app.route("/live-commerce")
def live_commerce():
    body=""
    body+=section("Live Commerce",[
    "Creator product streams",
    "QVC style live sales",
    "Instant checkout",
    "Countdown offers"
    ])
    return page("Live Commerce",body)

@app.route("/ai-product-lab")
def ai_product_lab():
    body=""
    body+=section("AI Product Lab",[
    "Product description generator",
    "Demand prediction",
    "Pricing optimization",
    "Competitor analysis"
    ])
    return page("AI Product Lab",body)


@app.route("/global-commerce")
def global_commerce():
    body=""
    body+=section("Global Commerce Network",[
    "American manufacturing promotion",
    "UK luxury and finance products",
    "African artisan and natural goods",
    "Russian industrial suppliers",
    "Asian electronics manufacturing"
    ])
    return page("Global Commerce",body)

@app.route("/tariff-engine")
def tariff_engine():
    body=""
    body+=section("Quantum Tariff Engine",[
    "AI customs calculation",
    "trade agreement detection",
    "automatic tax prediction",
    "cross-border commerce intelligence"
    ])
    return page("Tariff Engine",body)

@app.route("/market-ai")
def market_ai():
    body=""
    body+=section("Marketplace AI Brain",[
    "demand prediction",
    "pricing optimization",
    "supply chain routing",
    "seller analytics"
    ])
    return page("Marketplace AI",body)


@app.route("/creator/<name>")
def creator_profile(name):
    body=""
    body+=section("Creator Profile",[
    "banner",
    "bio",
    "storefront",
    "livestream",
    "membership tiers"
    ])
    return page(f"Creator {name}",body)

@app.route("/creator-membership")
def creator_membership():
    body=""
    body+=section("Creator Membership System",[
    "fan tier subscriptions",
    "VIP community access",
    "exclusive creator content",
    "monthly recurring support"
    ])
    return page("Creator Membership",body)

@app.route("/creator-affiliate")
def creator_affiliate():
    body=""
    body+=section("Creator Affiliate Network",[
    "promote marketplace products",
    "earn commission on sales",
    "AI product recommendations"
    ])
    return page("Creator Affiliate",body)

@app.route("/creator-dashboard")
def creator_dashboard():
    body=""
    body+=section("Creator Dashboard",[
    "earnings analytics",
    "subscriber counts",
    "product sales",
    "affiliate commissions"
    ])
    return page("Creator Dashboard",body)

@app.route("/ai-creator-assistant")
def ai_creator_assistant():
    body=""
    body+=section("AI Creator Assistant",[
    "content ideas",
    "title generation",
    "audience analytics",
    "marketing suggestions"
    ])
    return page("AI Creator Assistant",body)


@app.route("/global-network")
def global_network():
    body=""
    body+=section("Global Marketplace Network",[
    "North America suppliers",
    "European manufacturing",
    "Asian electronics manufacturing",
    "African natural products",
    "Latin American agriculture",
    "Middle East logistics hubs"
    ])
    return page("Global Network",body)

@app.route("/supply-chain-ai")
def supply_chain_ai():
    body=""
    body+=section("AI Supply Chain Engine",[
    "global supplier optimization",
    "tariff prediction",
    "shipping cost estimation",
    "demand forecasting"
    ])
    return page("Supply Chain AI",body)

@app.route("/vendor-trust")
def vendor_trust():
    body=""
    body+=section("Vendor Trust System",[
    "seller verification",
    "delivery ratings",
    "fraud detection",
    "product authenticity scoring"
    ])
    return page("Vendor Trust",body)


@app.route("/ai-operating-system")
def ai_os():
    body=""
    body+=section("Platform AI Operating System",[
    "marketplace intelligence",
    "creator growth engine",
    "supply chain optimizer",
    "fraud detection",
    "customer support automation"
    ])
    return page("AI Operating System",body)

@app.route("/ai-command-center")
def ai_command_center():
    body=""
    body+=section("Platform Command Center",[
    "platform revenue analytics",
    "creator performance",
    "marketplace sales trends",
    "fraud alerts",
    "AI system recommendations"
    ])
    return page("AI Command Center",body)

@app.route("/ai-growth-engine")
def ai_growth():
    body=""
    body+=section("Creator Growth Engine",[
    "content strategy suggestions",
    "product collaboration recommendations",
    "audience growth analytics",
    "marketing automation"
    ])
    return page("Creator Growth Engine",body)

@app.route("/ai-fraud-protection")
def ai_fraud():
    body=""
    body+=section("AI Fraud Protection",[
    "transaction anomaly detection",
    "seller reliability scoring",
    "counterfeit detection",
    "risk monitoring"
    ])
    return page("AI Fraud Protection",body)


@app.route("/fraud-protection")
def fraud_protection():
    body=""
    body+=section("Platform Fraud Protection",[
    "chargeback shield",
    "escrow payment system",
    "delivery confirmation tracking",
    "creator stream purchase logs",
    "AI fraud risk scoring"
    ])
    return page("Fraud Protection",body)

@app.route("/chargeback-defense")
def chargeback_defense():
    body=""
    body+=section("Chargeback Defense",[
    "transaction evidence storage",
    "device fingerprint logging",
    "purchase history validation",
    "delivery verification records"
    ])
    return page("Chargeback Defense",body)

@app.route("/vendor-verification")
def vendor_verification():
    body=""
    body+=section("Vendor Verification System",[
    "seller identity verification",
    "payment method verification",
    "shipping address validation",
    "trusted vendor badges"
    ])
    return page("Vendor Verification",body)

@app.route("/fraud-risk-score")
def fraud_risk_score():
    body=""
    body+=section("Fraud Risk Scoring",[
    "low risk trusted users",
    "medium risk monitored accounts",
    "high risk restricted users",
    "AI anomaly detection"
    ])
    return page("Fraud Risk Score",body)


@app.route("/rideshare")
def rideshare():
    body=""
    body+=section("Ride Share Network",[
    "driver onboarding",
    "ride booking",
    "AI route optimization",
    "real-time GPS tracking"
    ])
    return page("Ride Share",body)

@app.route("/food-delivery")
def food_delivery():
    body=""
    body+=section("Food Delivery System",[
    "restaurant onboarding",
    "menu browsing",
    "order tracking",
    "delivery drivers"
    ])
    return page("Food Delivery",body)

@app.route("/delivery-tracking")
def delivery_tracking():
    body=""
    body+=section("Delivery Tracking System",[
    "pickup confirmation",
    "driver route tracking",
    "delivery verification",
    "customer notification"
    ])
    return page("Delivery Tracking",body)

@app.route("/logistics-network")
def logistics_network():
    body=""
    body+=section("Logistics Network",[
    "box truck freight",
    "drone delivery",
    "medical transport",
    "warehouse distribution"
    ])
    return page("Logistics Network",body)



# -------------------------
# Final Superstack Routes
# -------------------------
@app.route("/holographic-coupons")
def holographic_coupons():
    body = ""
    body += section("Holographic Coupons", [
        "interactive discount cards",
        "creator flash offers",
        "food delivery promotions",
        "battle reward coupons",
        "livestream coupon drops",
        "premium brand coupon panels"
    ])
    body += section("What This Does", [
        "Boosts conversions and repeat orders",
        "Connects creators, commerce, and promotions in one offer system"
    ])
    return page("Holographic Coupons", body)

@app.route("/food-delivery-intelligence")
def food_delivery_intelligence():
    body = ""
    body += section("Food Delivery Intelligence", [
        "restaurant recommendations",
        "smart dispatch",
        "ETA prediction",
        "delivery risk scoring",
        "coupon targeting",
        "order batching"
    ])
    return page("Food Delivery Intelligence", body)

@app.route("/satellite-tracking")
def satellite_tracking():
    body = ""
    body += section("Satellite Tracking", [
        "delivery visibility layer",
        "fleet position monitoring",
        "route awareness",
        "delivery verification support",
        "regional logistics mapping"
    ])
    return page("Satellite Tracking", body)

@app.route("/mobile-app-stack")
def mobile_app_stack():
    body = ""
    body += section("Mobile App Stack", [
        "creator app",
        "fan app",
        "marketplace app",
        "driver app",
        "restaurant app",
        "admin app"
    ])
    body += section("What This Does", [
        "Moves the ecosystem into everyday mobile use",
        "Improves retention, notifications, streaming, shopping, and delivery"
    ])
    return page("Mobile App Stack", body)

@app.route("/distributed-cloud")
def distributed_cloud():
    body = ""
    body += section("Distributed Cloud Infrastructure", [
        "multi-region deployment",
        "service redundancy",
        "regional failover",
        "object storage",
        "backup and recovery",
        "staging and production separation"
    ])
    return page("Distributed Cloud", body)

@app.route("/global-streaming-cdn")
def global_streaming_cdn():
    body = ""
    body += section("Global Video Streaming CDN", [
        "video edge delivery",
        "live stream distribution",
        "adaptive bitrate streaming",
        "regional media cache",
        "replay delivery optimization",
        "global creator reach"
    ])
    return page("Global Streaming CDN", body)

@app.route("/ai-recommendation-engine")
def ai_recommendation_engine():
    body = ""
    body += section("Advanced AI Recommendation Engine", [
        "creator recommendations",
        "product recommendations",
        "music recommendations",
        "stream recommendations",
        "restaurant recommendations",
        "coupon recommendations",
        "battle event recommendations",
        "discovery feed optimization"
    ])
    return page("AI Recommendation Engine", body)

@app.route("/autonomous-logistics")
def autonomous_logistics():
    body = ""
    body += section("Autonomous Logistics Optimization", [
        "driver assignment automation",
        "route batch optimization",
        "fleet coordination",
        "freight scheduling",
        "medical transport priority logic",
        "warehouse distribution planning",
        "drone delivery path planning"
    ])
    return page("Autonomous Logistics", body)



# -------------------------
# Quantum Acceleration Routes
# -------------------------
@app.route("/quantum-cloud")
def quantum_cloud():
    body = ""
    body += section("Quantum Cloud Computing", [
        "high-scale compute",
        "multi-region processing",
        "AI workload distribution",
        "creator render jobs",
        "search and research processing",
        "stream transcoding support",
        "logistics optimization compute"
    ])
    body += section("What This Does", [
        "Adds scalable compute power across the ecosystem",
        "Improves the platform's ability to handle more work at once"
    ])
    return page("Quantum Cloud Computing", body)

@app.route("/quantum-speed-accelerator")
def quantum_speed_accelerator():
    body = ""
    body += section("Quantum Speed Accelerator", [
        "parallel job execution",
        "priority task scheduling",
        "batch processing",
        "smart queue routing",
        "accelerated AI inference",
        "fast analytics processing",
        "streamlined media workflows"
    ])
    body += section("What This Does", [
        "Cuts delays by organizing tasks more efficiently",
        "Helps reduce some workflows from days to hours and some from hours to minutes"
    ])
    return page("Quantum Speed Accelerator", body)

@app.route("/workflow-automation")
def workflow_automation():
    body = ""
    body += section("Workflow Automation", [
        "creator release automation",
        "product listing automation",
        "support and notification automation",
        "delivery status automation",
        "verification workflow automation",
        "moderation queue automation",
        "recommendation refresh jobs"
    ])
    return page("Workflow Automation", body)

@app.route("/task-orchestration")
def task_orchestration():
    body = ""
    body += section("Task Orchestration", [
        "job priority engine",
        "task dependency management",
        "workflow routing",
        "service load balancing",
        "AI and media job coordination",
        "event-triggered execution"
    ])
    return page("Task Orchestration", body)

@app.route("/distributed-cache")
def distributed_cache():
    body = ""
    body += section("Distributed Cache", [
        "hot data cache",
        "recommendation cache",
        "product query cache",
        "stream metadata cache",
        "creator dashboard cache",
        "region-aware cache"
    ])
    return page("Distributed Cache", body)

@app.route("/autoscaling")
def autoscaling():
    body = ""
    body += section("Autoscaling Policy", [
        "traffic-based scaling",
        "stream load scaling",
        "AI job scaling",
        "marketplace peak scaling",
        "delivery demand scaling",
        "cost-aware scaling"
    ])
    return page("Autoscaling", body)

@app.route("/acceleration-impact")
def acceleration_impact():
    body = ""
    body += section("Acceleration Impact", [
        "days to hours for many multi-step workflows",
        "hours to minutes for many automated jobs",
        "seconds-level response for cached operations"
    ])
    body += section("Important Limits", [
        "not every workflow can be reduced to minutes",
        "human review and heavy compute still take time",
        "real speed depends on infrastructure and integration"
    ])
    return page("Acceleration Impact", body)



# -------------------------
# Event Automation Wiring
# -------------------------

def _event_rows():
    return _load("automation_events.json", [])

def _save_event_rows(rows):
    _save("automation_events.json", rows)

def _emit_event(event_type, source_service, payload):
    rows = _event_rows()
    rec = {
        "id": str(uuid.uuid4()),
        "event_type": event_type,
        "source_service": source_service,
        "payload": payload,
        "created_at": str(datetime.datetime.now())
    }
    rows.append(rec)
    _save_event_rows(rows)
    return rec



@app.route("/automation-events")
def automation_events():
    rows = _load("automation_events.json", [])
    body = ""
    body += section("Automation Event Queue", [f"Total events: {len(rows)}"])
    if rows:
        body += section("Recent Events", [
            f"{x.get('event_type')} | {x.get('source_service')} | {x.get('created_at')}"
            for x in rows[-25:]
        ])
    else:
        body += section("Recent Events", ["No events yet"])
    body += section("What This Does", [
        "Creates a platform event log for real actions",
        "Prepares notifications, analytics, moderation, and workflow automation"
    ])
    return page("Automation Events", body)

@app.route("/automation-runner")
def automation_runner():
    rows = _load("automation_events.json", [])
    body = ""
    body += section("Automation Runner", [
        "support payments can trigger notifications and analytics",
        "media uploads can trigger moderation and creator library updates",
        "creator setup can trigger onboarding progression",
        "upgrade requests can trigger sales follow-up",
        "verification applications can trigger review queue notices"
    ])
    body += section("Queued Event Count", [f"{len(rows)} events currently logged"])
    return page("Automation Runner", body)



# -------------------------
# 1099 / Tax Compliance Layer
# -------------------------

def _tax_cfg():
    return _cfg_load("tax_reporting_config.json", {"tax_reporting": {}})

def _tax_profiles():
    return _load("tax/payee_tax_profiles.json", [])

def _save_tax_profiles(rows):
    _save("tax/payee_tax_profiles.json", rows)

def _tax_ledger():
    return _load("tax/payout_ledger.json", [])

def _save_tax_ledger(rows):
    _save("tax/payout_ledger.json", rows)

def _tax_review_rows():
    return _load("tax/1099_review_queue.json", [])

def _save_tax_review_rows(rows):
    _save("tax/1099_review_queue.json", rows)

@app.route("/tax-center")
def tax_center():
    cfg = _tax_cfg().get("tax_reporting", {})
    body = ""
    body += section("Tax Compliance Center", [
        f"1099-NEC threshold scaffold: ${cfg.get('nonemployee_1099_nec_threshold', 600)}",
        f"1099-K threshold scaffold: over ${cfg.get('tps_1099_k_threshold_amount', 20000)} and more than {cfg.get('tps_1099_k_threshold_transactions', 200)} transactions",
        f"E-file threshold scaffold: {cfg.get('e_file_required_if_returns_at_least', 10)} or more returns",
        f"Filing system target: {cfg.get('filing_system', 'IRIS')}",
        "Collect W-9 before payout when appropriate",
        "Use manual review before filing"
    ])
    body += section("What This Does", [
        "Creates a platform tax-compliance layer",
        "Prepares year-end creator, seller, contractor, and celebrity payout reporting",
        "Reduces payout and reporting confusion at scale"
    ])
    return page("Tax Center", body)

@app.route("/tax-profile", methods=["GET","POST"])
def tax_profile():
    if request.method == "POST":
        rows = _tax_profiles()
        rec = {
            "id": str(uuid.uuid4()),
            "legal_name": request.form.get("legal_name","").strip(),
            "email": request.form.get("email","").strip(),
            "payee_type": request.form.get("payee_type","").strip() or "creator",
            "business_name": request.form.get("business_name","").strip(),
            "tin_status": request.form.get("tin_status","").strip() or "not_collected",
            "w9_status": request.form.get("w9_status","").strip() or "pending",
            "notes": request.form.get("notes","").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_tax_profiles(rows)
        return page("Tax Profile Saved", section("Saved", [
            f"Legal Name: {rec.get('legal_name') or 'Not provided'}",
            f"Payee Type: {rec.get('payee_type')}",
            f"W-9 Status: {rec.get('w9_status')}",
            "Tax profile saved"
        ]))

    body = """
    <div class="card">
        <form method="post">
            <input name="legal_name" placeholder="Legal name">
            <input name="business_name" placeholder="Business name (optional)">
            <input name="email" placeholder="Email">
            <input name="payee_type" placeholder="creator / seller / contractor / performer / celebrity / business">
            <input name="tin_status" placeholder="not_collected / collected / review_needed">
            <input name="w9_status" placeholder="pending / received / review_needed">
            <textarea name="notes" placeholder="Notes"></textarea>
            <button class="btn btn2" type="submit">Save Tax Profile</button>
        </form>
    </div>
    """
    body += section("Purpose", [
        "Collect payee reporting details before payout",
        "Track W-9 and tax-profile readiness",
        "Prepare year-end reporting"
    ])
    return page("Tax Profile", body)

@app.route("/payout-ledger", methods=["GET","POST"])
def payout_ledger():
    if request.method == "POST":
        rows = _tax_ledger()
        rec = {
            "id": str(uuid.uuid4()),
            "payee_name": request.form.get("payee_name","").strip(),
            "email": request.form.get("email","").strip(),
            "payout_type": request.form.get("payout_type","").strip() or "creator_payout",
            "amount": float(request.form.get("amount","0") or 0),
            "payment_flow": request.form.get("payment_flow","").strip() or "platform_direct",
            "notes": request.form.get("notes","").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_tax_ledger(rows)

        cfg = _tax_cfg().get("tax_reporting", {})
        nec_threshold = float(cfg.get("nonemployee_1099_nec_threshold", 600))
        payee_total = sum(float(x.get("amount",0) or 0) for x in rows if x.get("email") == rec.get("email") and x.get("payment_flow") == "platform_direct")
        if payee_total >= nec_threshold:
            queue = _tax_review_rows()
            queue.append({
                "id": str(uuid.uuid4()),
                "email": rec.get("email"),
                "payee_name": rec.get("payee_name"),
                "candidate_form": "1099-NEC review",
                "year_to_date_total": payee_total,
                "status": "pending_review",
                "created_at": str(datetime.datetime.now())
            })
            _save_tax_review_rows(queue)

        return page("Payout Ledger Saved", section("Saved", [
            f"Payee: {rec.get('payee_name') or 'Unknown'}",
            f"Amount: ${rec.get('amount')}",
            f"Payment Flow: {rec.get('payment_flow')}",
            "Payout entry saved and reviewed against threshold scaffold"
        ]))

    body = """
    <div class="card">
        <form method="post">
            <input name="payee_name" placeholder="Payee name">
            <input name="email" placeholder="Payee email">
            <input name="payout_type" placeholder="creator_payout / affiliate / contractor / appearance_fee / seller_payout">
            <input name="amount" placeholder="Amount">
            <input name="payment_flow" placeholder="platform_direct / third_party_network / other">
            <textarea name="notes" placeholder="Notes"></textarea>
            <button class="btn btn2" type="submit">Save Payout Entry</button>
        </form>
    </div>
    """
    body += section("Purpose", [
        "Track direct platform payouts",
        "Prepare year-end totals",
        "Flag 1099 candidates for review"
    ])
    return page("Payout Ledger", body)

@app.route("/1099-review")
def form_1099_review():
    cfg = _tax_cfg().get("tax_reporting", {})
    rows = _tax_review_rows()
    body = ""
    body += section("1099 Review Queue", [f"Pending items: {len(rows)}"])
    if rows:
        body += section("Recent Items", [
            f"{x.get('payee_name')} | {x.get('email')} | {x.get('candidate_form')} | ${x.get('year_to_date_total')} | {x.get('status')}"
            for x in rows[-25:]
        ])
    else:
        body += section("Recent Items", ["No 1099 review items yet"])
    body += section("Important Notes", [
        "This queue is a compliance scaffold",
        "Manual review is required before filing",
        f"Current 1099-NEC threshold scaffold: ${cfg.get('nonemployee_1099_nec_threshold', 600)}",
        "Separate direct platform payouts from third-party settlement reporting flows"
    ])
    return page("1099 Review", body)

@app.route("/tax-export")
def tax_export():
    profiles = _tax_profiles()
    ledger = _tax_ledger()
    queue = _tax_review_rows()
    body = ""
    body += section("Tax Export Readiness", [
        f"Tax profiles: {len(profiles)}",
        f"Payout ledger entries: {len(ledger)}",
        f"1099 review items: {len(queue)}",
        "Prepare CSV/export for accountant or IRIS workflow",
        "Use final tax/legal review before filing"
    ])
    body += section("What This Does", [
        "Creates year-end reporting readiness",
        "Helps organize income records for creators, contractors, sellers, and celebrity talent"
    ])
    return page("Tax Export", body)



# -------------------------
# Real PG + Payments + Cloud + Email/SMS Scaffold
# -------------------------
import smtplib
from email.message import EmailMessage

try:
    import psycopg2
except Exception:
    psycopg2 = None

try:
    import stripe
except Exception:
    stripe = None

def _runtime_cfg():
    return _cfg_load("platform_runtime.json", {})

def _pg_enabled():
    cfg = _runtime_cfg()
    return cfg.get("database", {}).get("mode") == "postgres_ready"

def _pg_connect():
    cfg = _runtime_cfg()
    db_url = cfg.get("database", {}).get("url", "")
    if not psycopg2 or not db_url:
        return None
    try:
        return psycopg2.connect(db_url)
    except Exception:
        return None

def _send_email_scaffold(to_email, subject, body_text):
    cfg = _runtime_cfg().get("email", {})
    host = cfg.get("host", "")
    username = cfg.get("username", "")
    password = cfg.get("password", "")
    from_email = cfg.get("from_email", "no-reply@example.com")
    if not host or not username or not password:
        _notify(to_email, "email_scaffold", subject, body_text, "provider_not_configured")
        return False
    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = from_email
        msg["To"] = to_email
        msg.set_content(body_text)
        with smtplib.SMTP(host, cfg.get("port", 587)) as server:
            server.starttls()
            server.login(username, password)
            server.send_message(msg)
        _notify(to_email, "email", subject, body_text, "sent")
        return True
    except Exception:
        _notify(to_email, "email", subject, body_text, "failed")
        return False

def _send_sms_scaffold(to_number, body_text):
    cfg = _runtime_cfg().get("sms", {})
    if not cfg.get("account_sid") or not cfg.get("auth_token") or not cfg.get("from_number"):
        _notify(to_number, "sms_scaffold", "SMS Scaffold", body_text, "provider_not_configured")
        return False
    try:
        from twilio.rest import Client
        client = Client(cfg["account_sid"], cfg["auth_token"])
        client.messages.create(
            body=body_text,
            from_=cfg["from_number"],
            to=to_number
        )
        _notify(to_number, "sms", "SMS", body_text, "sent")
        return True
    except Exception:
        _notify(to_number, "sms", "SMS", body_text, "failed")
        return False

@app.route("/postgres-center")
def postgres_center():
    body = ""
    body += section("PostgreSQL Persistence", [
        "schema file created: db/schema_live.sql",
        "runtime config added",
        "database connection scaffold added",
        "ready to migrate from JSON-backed state"
    ])
    body += section("What This Does", [
        "Prepares the platform for real persistence",
        "Supports stronger scale, reporting, and reliability"
    ])
    return page("PostgreSQL Center", body)

@app.route("/payments-live", methods=["GET","POST"])
def payments_live():
    cfg = _runtime_cfg().get("payments", {})
    if request.method == "POST":
        name = request.form.get("name","").strip() or "Anonymous"
        email = request.form.get("email","").strip()
        product = request.form.get("product","").strip() or "Unknown"
        amount = request.form.get("amount","").strip() or "0"

        rows = _load("checkout_requests.json", [])
        rec = {
            "id": str(uuid.uuid4()),
            "name": name,
            "email": email,
            "product": product,
            "amount": amount,
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save("checkout_requests.json", rows)
        _emit_event("payment.checkout.saved", "payments_live", rec)
        if email:
            _send_email_scaffold(email, "Payment request received", f"We recorded your request for {product}.")

        return page("Payments Live", section("Saved", [
            f"Provider: {cfg.get('provider','stripe_ready')}",
            f"Product: {product}",
            f"Amount: {amount}",
            "Checkout request saved and ready for live processor integration"
        ]))

    body = """
    <div class="card">
        <form method="post">
            <input name="name" placeholder="Your name">
            <input name="email" placeholder="Email">
            <input name="product" placeholder="Creator Pro / Creator Elite / Enterprise / Support">
            <input name="amount" placeholder="Amount">
            <button class="btn btn2" type="submit">Submit Payment Request</button>
        </form>
    </div>
    """
    body += section("Payments Provider", [
        f"Current mode: {cfg.get('provider','stripe_ready')}",
        "Ready for live Stripe integration when keys are added"
    ])
    return page("Payments Live", body)

@app.route("/cloud-center")
def cloud_center():
    cfg = _runtime_cfg().get("deployment", {})
    body = ""
    body += section("Cloud Deployment", [
        f"Environment scaffold: {cfg.get('environment','staging_ready')}",
        f"Base URL scaffold: {cfg.get('base_url','https://your-domain.com')}",
        "Dockerfile created",
        "Production docker compose created",
        "Ready for staging / production split"
    ])
    body += section("What This Does", [
        "Prepares the platform for real hosted deployment",
        "Supports uptime, scaling, and public access"
    ])
    return page("Cloud Center", body)

@app.route("/communications-center", methods=["GET","POST"])
def communications_center():
    if request.method == "POST":
        recipient = request.form.get("recipient","").strip()
        channel = request.form.get("channel","").strip() or "email"
        subject = request.form.get("subject","").strip() or "Platform message"
        message = request.form.get("message","").strip() or "Hello from the platform."

        if channel == "email":
            ok = _send_email_scaffold(recipient, subject, message)
        else:
            ok = _send_sms_scaffold(recipient, message)

        return page("Communications Center", section("Send Result", [
            f"Channel: {channel}",
            f"Recipient: {recipient}",
            f"Status: {'sent_or_queued' if ok else 'queued_or_failed'}"
        ]))

    body = """
    <div class="card">
        <form method="post">
            <input name="recipient" placeholder="Email address or phone number">
            <input name="channel" placeholder="email or sms">
            <input name="subject" placeholder="Subject (email only)">
            <textarea name="message" placeholder="Message"></textarea>
            <button class="btn btn2" type="submit">Send Communication</button>
        </form>
    </div>
    """
    body += section("What This Does", [
        "Creates the real email/SMS delivery bridge",
        "Supports onboarding, verification, support, and delivery updates"
    ])
    return page("Communications Center", body)



# -------------------------
# Live Progress Dashboard
# -------------------------

@app.route("/progress")
def progress_dashboard():
    users = _load("users_live.json", [])
    creator_setup = _load("creator_setup_submissions.json", [])
    join_free = _load("join_free_submissions.json", [])
    upgrades = _load("upgrade_interest.json", [])
    verification = _load("verification_applications.json", [])
    founder = _load("founder_access_requests.json", [])
    media = _load("media_assets.json", [])
    support = _load("support_payments_live.json", [])
    automation = _load("automation_events.json", [])
    moderation = _load("moderation_queue.json", [])
    notifications = _load("notifications_live.json", [])
    checkout = _load("checkout_requests.json", [])

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
        f"Notifications: {len(notifications)}"
    ])

    if users:
        body += section("Recent Users", [
            f"{u.get('username')} | {u.get('role')} | {u.get('created_at')}"
            for u in users[-10:]
        ])

    if media:
        body += section("Recent Media Uploads", [
            f"{m.get('title')} | {m.get('owner')} | {m.get('created_at')}"
            for m in media[-10:]
        ])

    if support:
        body += section("Recent Support Payments", [
            f"{s.get('name')} | {s.get('support_type')} | {s.get('amount')} | {s.get('created_at')}"
            for s in support[-10:]
        ])

    body += section("What This Does", [
        "Shows saved platform progress in one place",
        "Reduces confusion about what has been recorded",
        "Makes the platform feel more real and measurable"
    ])

    return page("Progress Dashboard", body)


from flask import session, redirect

def _private_cfg():
    return _cfg_load("private_access.json",{})

@app.before_request
def check_private_access():
    cfg=_private_cfg()
    if not cfg.get("private_mode"):
        return
    allowed_paths=["/login","/static"]
    if request.path in allowed_paths:
        return
    if not session.get("private_access"):
        return redirect("/login")

@app.route("/login",methods=["GET","POST"])
def private_login():
    cfg=_private_cfg()
    if request.method=="POST":
        key=request.form.get("key","")
        if key==cfg.get("access_key"):
            session["private_access"]=True
            return redirect("/")
        return page("Access Denied",section("Error",["Invalid key"]))

    body="""
    <div class="card">
        <form method="post">
        <input name="key" placeholder="Private Access Key">
        <button class="btn btn2">Enter</button>
        </form>
    </div>
    """
    return page("Private Access",body)



# -------------------------
# Private Access + Voice Assistant
# -------------------------

def _private_cfg():
    return _cfg_load("private_access.json", {})

def _assistant_cfg():
    return _cfg_load("voice_assistant.json", {"assistant": {}})

def _chat_rows():
    return _load("assistant/chat_history.json", [])

def _save_chat_rows(rows):
    _save("assistant/chat_history.json", rows)

@app.before_request
def check_private_access():
    cfg = _private_cfg()
    if not cfg.get("private_mode"):
        return
    allowed_prefixes = ["/static"]
    allowed_exact = ["/login-private", "/health"]
    if request.path in allowed_exact:
        return
    if any(request.path.startswith(x) for x in allowed_prefixes):
        return
    if not session.get("private_access"):
        return redirect("/login-private")

@app.route("/login-private", methods=["GET","POST"])
def login_private():
    cfg = _private_cfg()
    if request.method == "POST":
        key = request.form.get("key","").strip()
        if key == cfg.get("access_key"):
            session["private_access"] = True
            return redirect("/")
        return page("Access Denied", section("Private Access Error", [
            "Invalid access key"
        ]))
    body = """
    <div class="card">
        <form method="post">
            <input name="key" placeholder="Private access key">
            <button class="btn btn2" type="submit">Enter Private Site</button>
        </form>
    </div>
    """
    body += section("Private Platform", [
        "This platform is currently private",
        "Only approved viewers with the access key can enter"
    ])
    return page("Private Access", body)

@app.route("/logout-private")
def logout_private():
    session.pop("private_access", None)
    return redirect("/login-private")

@app.route("/assistant-center")
def assistant_center():
    cfg = _assistant_cfg().get("assistant", {})
    body = ""
    body += section("Voice Assistant Center", [
        f"Assistant Name: {cfg.get('name','AAM Voice Assistant')}",
        f"Speech Enabled: {cfg.get('speech_enabled', True)}",
        f"Speech Mode: {cfg.get('speech_mode','assist')}",
        f"Default Voice: {cfg.get('default_voice','warm_assistant')}",
        f"Talk If Needed: {cfg.get('talk_if_needed', True)}",
        f"TTS Provider: {cfg.get('tts_provider','scaffold')}",
        f"STT Provider: {cfg.get('stt_provider','scaffold')}"
    ])
    body += section("Available Voices", cfg.get("voices", []))
    body += section("Modes", [
        "silent = text only",
        "assist = text first, voice optional",
        "hands_free = voice response prioritized",
        "accessibility = guided voice support"
    ])
    body += section("What This Does", [
        "Adds a private talking chatbot layer",
        "Lets you change voice settings later",
        "Supports voice-first accessibility and low-effort navigation"
    ])
    return page("Assistant Center", body)

@app.route("/assistant-chat", methods=["GET","POST"])
def assistant_chat():
    rows = _chat_rows()
    cfg = _assistant_cfg().get("assistant", {})

    if request.method == "POST":
        user_message = request.form.get("message","").strip()
        selected_voice = request.form.get("voice","").strip() or cfg.get("default_voice","warm_assistant")
        reply_mode = request.form.get("reply_mode","").strip() or cfg.get("speech_mode","assist")

        if user_message:
            rows.append({
                "id": str(uuid.uuid4()),
                "role": "user",
                "message": user_message,
                "voice": selected_voice,
                "mode": reply_mode,
                "created_at": str(datetime.datetime.now())
            })

            simulated_reply = f"Assistant received: {user_message}"
            rows.append({
                "id": str(uuid.uuid4()),
                "role": "assistant",
                "message": simulated_reply,
                "voice": selected_voice,
                "mode": reply_mode,
                "created_at": str(datetime.datetime.now())
            })
            _save_chat_rows(rows)

        return redirect("/assistant-chat")

    voice_options = "".join([
        f'<option value="{v}">{v}</option>' for v in cfg.get("voices", [])
    ])

    body = f"""
    <div class="card">
        <form method="post">
            <input name="message" placeholder="Type a message to the assistant">
            <select name="voice">{voice_options}</select>
            <select name="reply_mode">
                <option value="silent">silent</option>
                <option value="assist">assist</option>
                <option value="hands_free">hands_free</option>
                <option value="accessibility">accessibility</option>
            </select>
            <button class="btn btn2" type="submit">Send To Assistant</button>
        </form>
    </div>
    """

    recent = rows[-20:]
    if recent:
        body += section("Recent Chat Activity", [
            f"{x.get('role')}: {x.get('message')} | voice={x.get('voice')} | mode={x.get('mode')}"
            for x in recent
        ])
    else:
        body += section("Recent Chat Activity", ["No chat messages yet"])

    body += section("Important Note", [
        "This is a voice/chat scaffold inside your private platform",
        "Real speech output requires a TTS provider later",
        "Real voice input requires STT integration later"
    ])

    return page("Assistant Chat", body)

@app.route("/assistant-settings", methods=["GET","POST"])
def assistant_settings():
    cfg = _assistant_cfg()
    assistant = cfg.get("assistant", {})

    if request.method == "POST":
        assistant["default_voice"] = request.form.get("default_voice","").strip() or assistant.get("default_voice","warm_assistant")
        assistant["speech_mode"] = request.form.get("speech_mode","").strip() or assistant.get("speech_mode","assist")
        assistant["talk_if_needed"] = request.form.get("talk_if_needed","off") == "on"
        assistant["speech_enabled"] = request.form.get("speech_enabled","off") == "on"
        cfg["assistant"] = assistant
        with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "config", "voice_assistant.json"), "w", encoding="utf-8") as f:
            json.dump(cfg, f, indent=2)
        return redirect("/assistant-settings")

    checked_talk = "checked" if assistant.get("talk_if_needed", True) else ""
    checked_speech = "checked" if assistant.get("speech_enabled", True) else ""
    voice_options = "".join([
        f'<option value="{v}" {"selected" if v == assistant.get("default_voice") else ""}>{v}</option>'
        for v in assistant.get("voices", [])
    ])

    body = f"""
    <div class="card">
        <form method="post">
            <select name="default_voice">{voice_options}</select>
            <select name="speech_mode">
                <option value="silent" {"selected" if assistant.get("speech_mode")=="silent" else ""}>silent</option>
                <option value="assist" {"selected" if assistant.get("speech_mode")=="assist" else ""}>assist</option>
                <option value="hands_free" {"selected" if assistant.get("speech_mode")=="hands_free" else ""}>hands_free</option>
                <option value="accessibility" {"selected" if assistant.get("speech_mode")=="accessibility" else ""}>accessibility</option>
            </select>
            <label><input type="checkbox" name="talk_if_needed" {checked_talk}> Talk if needed</label><br><br>
            <label><input type="checkbox" name="speech_enabled" {checked_speech}> Speech enabled</label><br><br>
            <button class="btn btn2" type="submit">Save Assistant Settings</button>
        </form>
    </div>
    """
    body += section("What This Does", [
        "Lets you change voice and talking behavior any time",
        "Supports private voice-first workflows",
        "Creates the base for a real talking chatbot later"
    ])
    return page("Assistant Settings", body)

@app.route("/health")
def health():
    return "OK"

@app.route("/favicon.ico")
def fav():
    return Response(status=204)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)