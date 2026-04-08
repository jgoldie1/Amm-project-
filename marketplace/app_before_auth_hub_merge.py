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

@app.route("/health")
def health():
    return "OK"

@app.route("/favicon.ico")
def fav():
    return Response(status=204)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
