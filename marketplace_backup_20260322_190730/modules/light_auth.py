import json
import uuid
import datetime

def _read(path, fallback):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return fallback

def _write(path, rows):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=2)

def _page(title, body):
    return f"""
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>{title}</title>
      <style>
        body {{ font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }}
        a, button {{ display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border:none; border-radius:8px; }}
        input, textarea {{ width:100%; max-width:760px; padding:10px; margin:8px 0; border-radius:8px; border:1px solid #334155; }}
        .card {{ background:#1e293b; padding:16px; border-radius:12px; margin:14px 0; }}
        .hero {{ background:linear-gradient(135deg,#1d4ed8,#7c3aed,#0f766e); padding:24px; border-radius:16px; margin:16px 0; }}
        ul {{ line-height:1.8; }}
      </style>
    </head>
    <body>{body}</body>
    </html>
    """

def register(app):
    from flask import request, redirect

    @app.route("/profile-center")
    def profile_center():
        body = """
        <h1>Profile Center</h1>
        <p>Light auth + profile shell.</p>
        <a href="/platform-home">Platform Home</a>
        <a href="/role-hub">Role Hub</a>
        <a href="/basic-profiles">Basic Profiles</a>
        <a href="/role-preferences">Role Preferences</a>
        <a href="/favorite-zones">Favorite Zones / Worlds</a>
        <a href="/private-dashboard-shell">Private Dashboard</a>
        <a href="/profile-db-center">Profile DB Center</a>
        <div class="hero">
          <h2>What This Does</h2>
          <p>Gives users basic profile pages, role preferences, favorites, and private dashboard behavior.</p>
        </div>
        """
        return _page("Profile Center", body)

    @app.route("/basic-profiles", methods=["GET","POST"])
    def basic_profiles():
        rows = _read("data/auth/profiles.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "display_name": request.form.get("display_name", "").strip() or "User",
                "role": request.form.get("role", "").strip() or "customer",
                "created_at": str(datetime.datetime.now())
            })
            _write("data/auth/profiles.json", rows)
            return redirect("/basic-profiles")

        items = "".join(f"<li>{x.get('display_name')} | {x.get('role')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Basic Profiles</h1>
        <a href="/profile-center">Profile Center</a>
        <div class="card">
          <form method="post">
            <input name="display_name" placeholder="Display name">
            <input name="role" placeholder="customer / creator / operator">
            <button type="submit">Save Profile</button>
          </form>
        </div>
        <div class="card"><p>Total profiles: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Basic Profiles", body)

    @app.route("/role-preferences", methods=["GET","POST"])
    def role_preferences():
        rows = _read("data/auth/preferences.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "display_name": request.form.get("display_name", "").strip() or "User",
                "preferred_role": request.form.get("preferred_role", "").strip() or "customer",
                "startup_page": request.form.get("startup_page", "").strip() or "/platform-home",
                "created_at": str(datetime.datetime.now())
            })
            _write("data/auth/preferences.json", rows)
            return redirect("/role-preferences")

        items = "".join(f"<li>{x.get('display_name')} | {x.get('preferred_role')} | {x.get('startup_page')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Role Preferences</h1>
        <a href="/profile-center">Profile Center</a>
        <div class="card">
          <form method="post">
            <input name="display_name" placeholder="Display name">
            <input name="preferred_role" placeholder="customer / creator / operator">
            <input name="startup_page" placeholder="/platform-home or another route">
            <button type="submit">Save Preferences</button>
          </form>
        </div>
        <div class="card"><p>Total preferences: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Role Preferences", body)

    @app.route("/favorite-zones", methods=["GET","POST"])
    def favorite_zones():
        rows = _read("data/auth/favorites.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "display_name": request.form.get("display_name", "").strip() or "User",
                "favorite_name": request.form.get("favorite_name", "").strip() or "Unknown Favorite",
                "favorite_route": request.form.get("favorite_route", "").strip() or "/platform-home",
                "created_at": str(datetime.datetime.now())
            })
            _write("data/auth/favorites.json", rows)
            return redirect("/favorite-zones")

        items = "".join(f"<li>{x.get('display_name')} | {x.get('favorite_name')} | {x.get('favorite_route')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Favorite Zones / Worlds</h1>
        <a href="/profile-center">Profile Center</a>
        <div class="card">
          <form method="post">
            <input name="display_name" placeholder="Display name">
            <input name="favorite_name" placeholder="Favorite name">
            <input name="favorite_route" placeholder="/route">
            <button type="submit">Save Favorite</button>
          </form>
        </div>
        <div class="card"><p>Total favorites: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Favorite Zones / Worlds", body)

    @app.route("/private-dashboard-shell", methods=["GET","POST"])
    def private_dashboard_shell():
        rows = _read("data/auth/private_dashboards.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "display_name": request.form.get("display_name", "").strip() or "User",
                "private_home": request.form.get("private_home", "").strip() or "/platform-home",
                "notes": request.form.get("notes", "").strip(),
                "created_at": str(datetime.datetime.now())
            })
            _write("data/auth/private_dashboards.json", rows)
            return redirect("/private-dashboard-shell")

        items = "".join(f"<li>{x.get('display_name')} | {x.get('private_home')} | {x.get('notes')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Private Dashboard Shell</h1>
        <a href="/profile-center">Profile Center</a>
        <div class="card">
          <form method="post">
            <input name="display_name" placeholder="Display name">
            <input name="private_home" placeholder="/route">
            <textarea name="notes" placeholder="Notes"></textarea>
            <button type="submit">Save Private Dashboard</button>
          </form>
        </div>
        <div class="card"><p>Total private dashboards: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Private Dashboard Shell", body)
