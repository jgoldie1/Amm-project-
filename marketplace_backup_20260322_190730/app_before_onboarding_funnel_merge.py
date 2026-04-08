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
        ("Vision", "/vision", "btn btn4"),
    ("Status", "/status", "btn btn4"),
    ("Help", "/help", "btn btn5"),
    ("Legal", "/legal", "btn btn4"),
    ("Privacy", "/privacy", "btn btn5"),
    ("Terms", "/terms", "btn btn6"),
    ("Accessibility Statement", "/accessibility-statement", "btn btn2"),
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
    <head>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>{title}</title>
        <style>
            body {{ background:#0b1220; color:white; font-family:Arial,sans-serif; text-align:center; padding:16px; margin:0; }}
            .hero {{ background:#182235; border:2px solid #334155; border-radius:18px; padding:24px; margin:16px auto; max-width:1100px; }}
            .card {{ background:#182235; border:2px solid #334155; border-radius:16px; padding:20px; margin:16px auto; max-width:1100px; text-align:left; }}
            h1 {{ font-size:36px; }} h2,h3 {{ font-size:26px; }} p,li {{ font-size:19px; }}
        </style>
    </head>
    <body>
        <div class="hero"><h1>All American Marketplace</h1><h2>{title}</h2></div>
        {body}
    </body>
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
    <head>
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
    <body>
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
    </body>
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

@app.route("/health")
def health():
    return "OK"

@app.route("/favicon.ico")
def fav():
    return Response(status=204)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
