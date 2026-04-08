import datetime
from flask import request, redirect, abort

try:
    from flask_login import current_user, login_required
except Exception:
    current_user = None
    def login_required(fn):
        return fn

from modules.auth_system import db, User

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
        ul {{ line-height:1.8; }}
      </style>
    </head>
    <body>{body}</body>
    </html>
    """

class UserPreference(db.Model):
    __tablename__ = "user_preferences"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    preferred_role = db.Column(db.String(50), nullable=False, default="customer")
    startup_page = db.Column(db.String(255), nullable=False, default="/platform-home")
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class UserFavorite(db.Model):
    __tablename__ = "user_favorites"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    favorite_name = db.Column(db.String(255), nullable=False)
    favorite_route = db.Column(db.String(255), nullable=False, default="/platform-home")
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class UserRecentPage(db.Model):
    __tablename__ = "user_recent_pages"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    label = db.Column(db.String(255), nullable=False)
    route = db.Column(db.String(255), nullable=False, default="/platform-home")
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class UserQuickLaunch(db.Model):
    __tablename__ = "user_quick_launch"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    label = db.Column(db.String(255), nullable=False)
    route = db.Column(db.String(255), nullable=False, default="/platform-home")
    group_name = db.Column(db.String(100), nullable=False, default="general")
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class UserPrivateDashboard(db.Model):
    __tablename__ = "user_private_dashboards"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    private_home = db.Column(db.String(255), nullable=False, default="/platform-home")
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

def _auth_required():
    if current_user is None or not getattr(current_user, "is_authenticated", False):
        abort(403)

def _uid():
    return int(current_user.id)

def register(app):
    @app.route("/profile-db-center")
    @login_required
    def profile_db_center():
        _auth_required()
        body = """
        <h1>Profile DB Center</h1>
        <a href="/profile">Profile</a>
        <a href="/db-role-preferences">DB Role Preferences</a>
        <a href="/db-favorites">DB Favorites</a>
        <a href="/db-recent-pages">DB Recent Pages</a>
        <a href="/db-quick-launch">DB Quick Launch</a>
        <a href="/db-private-dashboard">DB Private Dashboard</a>
        """
        return _page("Profile DB Center", body)

    @app.route("/db-role-preferences", methods=["GET","POST"])
    @login_required
    def db_role_preferences():
        _auth_required()
        if request.method == "POST":
            pref = UserPreference.query.filter_by(user_id=_uid()).order_by(UserPreference.id.desc()).first()
            if not pref:
                pref = UserPreference(user_id=_uid())
                db.session.add(pref)
            pref.preferred_role = (request.form.get("preferred_role") or "customer").strip() or "customer"
            pref.startup_page = (request.form.get("startup_page") or "/platform-home").strip() or "/platform-home"
            db.session.commit()
            return redirect("/db-role-preferences")

        pref = UserPreference.query.filter_by(user_id=_uid()).order_by(UserPreference.id.desc()).first()
        current_role = pref.preferred_role if pref else "customer"
        current_page = pref.startup_page if pref else "/platform-home"
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
        _auth_required()
        if request.method == "POST":
            row = UserFavorite(
                user_id=_uid(),
                favorite_name=(request.form.get("favorite_name") or "Favorite").strip() or "Favorite",
                favorite_route=(request.form.get("favorite_route") or "/platform-home").strip() or "/platform-home",
            )
            db.session.add(row)
            db.session.commit()
            return redirect("/db-favorites")

        rows = UserFavorite.query.filter_by(user_id=_uid()).order_by(UserFavorite.id.desc()).limit(50).all()
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

    @app.route("/db-recent-pages", methods=["GET","POST"])
    @login_required
    def db_recent_pages():
        _auth_required()
        if request.method == "POST":
            row = UserRecentPage(
                user_id=_uid(),
                label=(request.form.get("label") or "Recent Page").strip() or "Recent Page",
                route=(request.form.get("route") or "/platform-home").strip() or "/platform-home",
            )
            db.session.add(row)
            db.session.commit()
            return redirect("/db-recent-pages")

        rows = UserRecentPage.query.filter_by(user_id=_uid()).order_by(UserRecentPage.id.desc()).limit(50).all()
        items = "".join(f"<li>{x.label} | {x.route}</li>" for x in rows)
        body = f"""
        <h1>DB Recent Pages</h1>
        <a href="/profile-db-center">Profile DB Center</a>
        <div class="card">
          <form method="post">
            <input name="label" placeholder="Page label">
            <input name="route" placeholder="/route">
            <button type="submit">Save Recent Page</button>
          </form>
        </div>
        <div class="card"><ul>{items}</ul></div>
        """
        return _page("DB Recent Pages", body)

    @app.route("/db-quick-launch", methods=["GET","POST"])
    @login_required
    def db_quick_launch():
        _auth_required()
        if request.method == "POST":
            row = UserQuickLaunch(
                user_id=_uid(),
                label=(request.form.get("label") or "Quick Launch").strip() or "Quick Launch",
                route=(request.form.get("route") or "/platform-home").strip() or "/platform-home",
                group_name=(request.form.get("group_name") or "general").strip() or "general",
            )
            db.session.add(row)
            db.session.commit()
            return redirect("/db-quick-launch")

        rows = UserQuickLaunch.query.filter_by(user_id=_uid()).order_by(UserQuickLaunch.id.desc()).limit(50).all()
        items = "".join(f"<li>{x.label} | {x.group_name} | {x.route}</li>" for x in rows)
        body = f"""
        <h1>DB Quick Launch</h1>
        <a href="/profile-db-center">Profile DB Center</a>
        <div class="card">
          <form method="post">
            <input name="label" placeholder="Launch label">
            <input name="route" placeholder="/route">
            <input name="group_name" placeholder="general / city / creator / operator / holo">
            <button type="submit">Save Quick Launch</button>
          </form>
        </div>
        <div class="card"><ul>{items}</ul></div>
        """
        return _page("DB Quick Launch", body)

    @app.route("/db-private-dashboard", methods=["GET","POST"])
    @login_required
    def db_private_dashboard():
        _auth_required()
        if request.method == "POST":
            row = UserPrivateDashboard.query.filter_by(user_id=_uid()).order_by(UserPrivateDashboard.id.desc()).first()
            if not row:
                row = UserPrivateDashboard(user_id=_uid())
                db.session.add(row)
            row.private_home = (request.form.get("private_home") or "/platform-home").strip() or "/platform-home"
            row.notes = (request.form.get("notes") or "").strip()
            db.session.commit()
            return redirect("/db-private-dashboard")

        row = UserPrivateDashboard.query.filter_by(user_id=_uid()).order_by(UserPrivateDashboard.id.desc()).first()
        private_home = row.private_home if row else "/platform-home"
        notes = row.notes if row and row.notes else ""
        body = f"""
        <h1>DB Private Dashboard</h1>
        <a href="/profile-db-center">Profile DB Center</a>
        <div class="card">
          <form method="post">
            <input name="private_home" value="{private_home}" placeholder="/route">
            <textarea name="notes" placeholder="Notes">{notes}</textarea>
            <button type="submit">Save Private Dashboard</button>
          </form>
        </div>
        """
        return _page("DB Private Dashboard", body)
