from flask import Flask, request, redirect, session, send_from_directory
from werkzeug.utils import secure_filename
import os, json, hashlib, uuid

app = Flask(__name__)
app.secret_key = "aam-basic-key"

BASE = os.path.dirname(os.path.abspath(__file__))
UPLOADS = os.path.join(BASE, "uploads")
USERS_FILE = os.path.join(BASE, "users.json")
LISTINGS_FILE = os.path.join(BASE, "listings.json")

os.makedirs(UPLOADS, exist_ok=True)

ALLOWED = {"png", "jpg", "jpeg", "gif", "webp", "mp3", "wav", "mp4", "mov", "pdf", "txt"}

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

def hash_pw(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def allowed_file(name):
    return "." in name and name.rsplit(".", 1)[1].lower() in ALLOWED

def current_user():
    return session.get("username")

def nav():
    auth = ""
    if current_user():
        auth = f"""
        <p><strong>Signed in:</strong> {current_user()}</p>
        <p><a href="/logout" style="color:#7dd3fc;">Logout</a></p>
        """
    else:
        auth = """
        <p><a href="/signup" style="color:#7dd3fc;">Create Account</a></p>
        <p><a href="/login" style="color:#7dd3fc;">Login</a></p>
        """
    return f"""
    <div style="margin:20px auto;max-width:800px;background:#182235;padding:20px;border-radius:16px;">
        {auth}
        <p><a href="/" style="color:#7dd3fc;">Home</a></p>
        <p><a href="/instructions" style="color:#7dd3fc;">Instructions</a></p>
        <p><a href="/alton-security" style="color:#7dd3fc;">Alton Security</a></p>
        <p><a href="/kevon-shot-it" style="color:#7dd3fc;">Kevon Shot It</a></p>
        <p><a href="/ai-center" style="color:#7dd3fc;">AI Center</a></p>
        <p><a href="/listings" style="color:#7dd3fc;">Browse Listings</a></p>
        <p><a href="/listings/new" style="color:#7dd3fc;">Post Listing</a></p>
        <p><a href="/upload" style="color:#7dd3fc;">Upload Media</a></p>
        <p><a href="/media" style="color:#7dd3fc;">Media Hub</a></p>
        <p><a href="/health" style="color:#7dd3fc;">Health</a></p>
    </div>
    """

def page(title, body):
    return f"""
    <html>
    <body style="background:#0b1220;color:white;font-family:Arial;text-align:center;padding:30px;">
        <h1>All American Marketplace</h1>
        <h2>{title}</h2>
        <div style="margin:20px auto;max-width:800px;background:#182235;padding:20px;border-radius:16px;">
            {body}
        </div>
        {nav()}
    </body>
    </html>
    """

@app.route("/")
def home():
    return page("Platform Home", """
    <p>Alton + Kevon + AI are loaded into the platform.</p>
    <p>This version adds instructions, accounts, listings, and uploads.</p>
    """)

@app.route("/instructions")
def instructions():
    return page("How To Use The App", """
    <p>1. Create an account or log in.</p>
    <p>2. Open Alton Security, Kevon Shot It, or AI Center.</p>
    <p>3. Post listings in the marketplace.</p>
    <p>4. Upload media files.</p>
    <p>5. Use AI Center for guidance.</p>
    """)

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        users = load_json(USERS_FILE, [])
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()
        if not username or not password:
            return page("Create Account", "<p>Username and password are required.</p>")
        if any(u["username"] == username for u in users):
            return page("Create Account", "<p>That username already exists.</p>")
        users.append({
            "id": str(uuid.uuid4()),
            "username": username,
            "password_hash": hash_pw(password)
        })
        save_json(USERS_FILE, users)
        session["username"] = username
        return redirect("/")
    return page("Create Account", """
    <form method="post">
        <input name="username" placeholder="Username" style="width:90%;padding:14px;margin:10px;">
        <input name="password" type="password" placeholder="Password" style="width:90%;padding:14px;margin:10px;">
        <button type="submit" style="padding:14px 20px;">Create Account</button>
    </form>
    """)

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        users = load_json(USERS_FILE, [])
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()
        user = next((u for u in users if u["username"] == username and u["password_hash"] == hash_pw(password)), None)
        if not user:
            return page("Login", "<p>Invalid login.</p>")
        session["username"] = username
        return redirect("/")
    return page("Login", """
    <form method="post">
        <input name="username" placeholder="Username" style="width:90%;padding:14px;margin:10px;">
        <input name="password" type="password" placeholder="Password" style="width:90%;padding:14px;margin:10px;">
        <button type="submit" style="padding:14px 20px;">Login</button>
    </form>
    """)

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")

@app.route("/alton-security")
def alton_security():
    return page("Alton Security", """
    <p>Operations dashboard</p>
    <p>Training academy</p>
    <p>Compliance tracking</p>
    <p>Celebrity & special events</p>
    <p>Scheduling and patrol logs</p>
    """)

@app.route("/kevon-shot-it")
def kevon_shot_it():
    return page("Kevon Shot It", """
    <p>Movie production</p>
    <p>Video production</p>
    <p>Photography</p>
    <p>Editing services</p>
    <p>Trading education</p>
    <p>Stocks / forex / market hub</p>
    """)

@app.route("/ai-center")
def ai_center():
    return page("AI Center", """
    <p>Jarvis assistant</p>
    <p>AI business advisor</p>
    <p>AI education mentor</p>
    <p>AI trading assistant</p>
    <p>AI security assistant</p>
    <p>Instructions for how to use the app</p>
    """)

@app.route("/listings")
def listings():
    items = load_json(LISTINGS_FILE, [])
    if not items:
        return page("Listings", "<p>No listings yet.</p>")
    html = ""
    for item in reversed(items):
        media = f"<p><a href='/uploads/{item['media']}' style='color:#7dd3fc;'>Open media</a></p>" if item.get("media") else ""
        html += f"""
        <div style="background:#243247;padding:15px;margin:15px;border-radius:12px;text-align:left;">
            <h3>{item['title']}</h3>
            <p><strong>Category:</strong> {item['category']}</p>
            <p><strong>Price:</strong> {item['price']}</p>
            <p>{item['description']}</p>
            <p><strong>Owner:</strong> {item['owner']}</p>
            {media}
        </div>
        """
    return page("Listings", html)

@app.route("/listings/new", methods=["GET", "POST"])
def new_listing():
    if not current_user():
        return redirect("/login")
    if request.method == "POST":
        items = load_json(LISTINGS_FILE, [])
        title = request.form.get("title", "").strip() or "Untitled"
        category = request.form.get("category", "").strip() or "General"
        price = request.form.get("price", "").strip() or "Not set"
        description = request.form.get("description", "").strip() or "No description"
        filename = ""
        media = request.files.get("media")
        if media and media.filename and allowed_file(media.filename):
            filename = secure_filename(f"{uuid.uuid4().hex}_{media.filename}")
            media.save(os.path.join(UPLOADS, filename))
        items.append({
            "id": str(uuid.uuid4()),
            "title": title,
            "category": category,
            "price": price,
            "description": description,
            "owner": current_user(),
            "media": filename
        })
        save_json(LISTINGS_FILE, items)
        return redirect("/listings")
    return page("Post Listing", """
    <form method="post" enctype="multipart/form-data">
        <input name="title" placeholder="Title" style="width:90%;padding:14px;margin:10px;">
        <input name="category" placeholder="Category" style="width:90%;padding:14px;margin:10px;">
        <input name="price" placeholder="Price" style="width:90%;padding:14px;margin:10px;">
        <textarea name="description" placeholder="Description" style="width:90%;padding:14px;margin:10px;min-height:120px;"></textarea>
        <input type="file" name="media" style="width:90%;padding:14px;margin:10px;">
        <button type="submit" style="padding:14px 20px;">Post Listing</button>
    </form>
    """)

@app.route("/upload", methods=["GET", "POST"])
def upload():
    if not current_user():
        return redirect("/login")
    msg = ""
    if request.method == "POST":
        media = request.files.get("media")
        if media and media.filename and allowed_file(media.filename):
            filename = secure_filename(f"{uuid.uuid4().hex}_{media.filename}")
            media.save(os.path.join(UPLOADS, filename))
            msg = f"<p>Uploaded: {filename}</p>"
        else:
            msg = "<p>Choose a supported file.</p>"
    return page("Upload Media", f"""
    {msg}
    <form method="post" enctype="multipart/form-data">
        <input type="file" name="media" style="width:90%;padding:14px;margin:10px;">
        <button type="submit" style="padding:14px 20px;">Upload</button>
    </form>
    """)

@app.route("/media")
def media():
    return page("Media Hub", media_links())

@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOADS, filename)

@app.route("/health")
def health():
    return "OK"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
