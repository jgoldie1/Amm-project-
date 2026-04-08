import datetime
from flask import request, redirect

from modules.auth_system import db

try:
    from flask_login import current_user, login_required
except Exception:
    current_user = None
    def login_required(fn):
        return fn

def _page(title, body):
    return f"""
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>{title}</title>
      <style>
        body {{
          font-family: Arial, sans-serif;
          background: linear-gradient(180deg, #0f172a, #111827);
          color: white;
          margin: 0;
          padding: 24px;
        }}
        a, button {{
          display:inline-block;
          margin:6px 8px 6px 0;
          padding:10px 14px;
          background:#2563eb;
          color:white;
          text-decoration:none;
          border:none;
          border-radius:10px;
        }}
        input, textarea {{
          width:100%;
          max-width:760px;
          padding:10px;
          margin:8px 0;
          border-radius:8px;
          border:1px solid #334155;
        }}
        .card {{
          background:#1e293b;
          padding:16px;
          border-radius:14px;
          margin:14px 0;
        }}
      </style>
    </head>
    <body>{body}</body>
    </html>
    """

def _user_id():
    try:
        if getattr(current_user, "is_authenticated", False):
            return int(current_user.id)
    except Exception:
        pass
    return None

class SafeUserPreference(db.Model):
    __tablename__ = "safe_user_preferences"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, index=True)
    preferred_role = db.Column(db.String(50), nullable=False, default="customer")
    startup_page = db.Column(db.String(255), nullable=False, default="/platform-home")
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class SafeUserFavorite(db.Model):
    __tablename__ = "safe_user_favorites"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, index=True)
    favorite_name = db.Column(db.String(255), nullable=False)
    favorite_route = db.Column(db.String(255), nullable=False, default="/platform-home")
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

def register(app):
    with app.app_context():
        db.create_all()

    @app.route("/profile-db-center")
    @login_required
    def profile_db_center():
        uid = _user_id()
        if uid is None:
            return redirect("/auth/login")
        body = """
        <h1>Profile DB Center</h1>
        <a href="/profile">Profile</a>
        <a href="/db-role-preferences">DB Role Preferences</a>
        <a href="/db-favorites">DB Favorites</a>
        """
        return _page("Profile DB Center", body)

    @app.route("/db-role-preferences", methods=["GET","POST"])
    @login_required
    def db_role_preferences():
        uid = _user_id()
        if uid is None:
            return redirect("/auth/login")

        if request.method == "POST":
            row = SafeUserPreference.query.filter_by(user_id=uid).order_by(SafeUserPreference.id.desc()).first()
            if not row:
                row = SafeUserPreference(user_id=uid)
                db.session.add(row)
            row.preferred_role = (request.form.get("preferred_role") or "customer").strip() or "customer"
            row.startup_page = (request.form.get("startup_page") or "/platform-home").strip() or "/platform-home"
            db.session.commit()
            return redirect("/db-role-preferences")

        row = SafeUserPreference.query.filter_by(user_id=uid).order_by(SafeUserPreference.id.desc()).first()
        current_role = row.preferred_role if row else "customer"
        current_page = row.startup_page if row else "/platform-home"
        body = f"""
        <h1>DB Role Preferences</h1>
        <a href="/profile-db-center">Profile DB Center</a>
        <div class="card">
          <form method="post">
            <input name="preferred_role" value="{current_role}" placeholder="customer / creator / operator">
            <input name="startup_page" value="{current_page}" placeholder="/platform-home">
            <button type="submit">Save Preferences</button>
          </form>
        </div>
        """
        return _page("DB Role Preferences", body)

    @app.route("/db-favorites", methods=["GET","POST"])
    @login_required
    def db_favorites():
        uid = _user_id()
        if uid is None:
            return redirect("/auth/login")

        if request.method == "POST":
            row = SafeUserFavorite(
                user_id=uid,
                favorite_name=(request.form.get("favorite_name") or "Favorite").strip() or "Favorite",
                favorite_route=(request.form.get("favorite_route") or "/platform-home").strip() or "/platform-home",
            )
            db.session.add(row)
            db.session.commit()
            return redirect("/db-favorites")

        rows = SafeUserFavorite.query.filter_by(user_id=uid).order_by(SafeUserFavorite.id.desc()).limit(50).all()
        items = "".join(f"<li>{x.favorite_name} | {x.favorite_route}</li>" for x in rows)
        body = f"""
        <h1>DB Favorites</h1>
        <a href="/profile-db-center">Profile DB Center</a>
        <div class="card">
          <form method="post">
            <input name="favorite_name" placeholder="Favorite name">
            <input name="favorite_route" placeholder="/route">
            <button type="submit">Save Favorite</button>
          </form>
        </div>
        <div class="card"><ul>{items}</ul></div>
        """
        return _page("DB Favorites", body)
