from flask import Flask, Response, request, redirect, session
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
        ("Health", "/health", "btn btn3"),
    ]
    nav = '<div class="navbox"><h3>Main Navigation</h3>' + "".join(button(a,b,c) for a,b,c in nav_links) + '</div>'

    return f"""
    <html>
    <head>
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
    <body>
        <div class="hero"><h1>All American Marketplace</h1><h2>{title}</h2></div>
        {body}
        {user_box}
        {nav}
    </body>
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


@app.route("/health")
def health():
    return "OK"

@app.route("/favicon.ico")
def fav():
    return Response(status=204)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)

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
