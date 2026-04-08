from functools import wraps
from flask import Blueprint, request, redirect, url_for, flash, render_template_string, abort
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()
login_manager = LoginManager()

auth_bp = Blueprint("auth_system", __name__)

class User(db.Model, UserMixin):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    display_name = db.Column(db.String(120), nullable=False, default="User")
    role = db.Column(db.String(50), nullable=False, default="customer")
    is_active_user = db.Column(db.Boolean, default=True)

    def set_password(self, raw_password: str) -> None:
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password: str) -> bool:
        return check_password_hash(self.password_hash, raw_password)

    @property
    def is_active(self):
        return self.is_active_user

@login_manager.user_loader
def load_user(user_id):
    try:
        return User.query.get(int(user_id))
    except Exception:
        return None

def role_required(*roles):
    def decorator(fn):
        @wraps(fn)
        @login_required
        def wrapper(*args, **kwargs):
            if current_user.role not in roles:
                abort(403)
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def init_auth(app):
    login_manager.login_view = "auth_system.login"
    login_manager.init_app(app)
    db.init_app(app)
    app.register_blueprint(auth_bp)

@auth_bp.route("/auth/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        email = (request.form.get("email") or "").strip().lower()
        password = request.form.get("password") or ""
        display_name = (request.form.get("display_name") or "User").strip()
        role = (request.form.get("role") or "customer").strip()

        if not email or not password:
            flash("Email and password are required.")
            return redirect(url_for("auth_system.register"))

        if User.query.filter_by(email=email).first():
            flash("That email already exists.")
            return redirect(url_for("auth_system.register"))

        user = User(email=email, display_name=display_name, role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        login_user(user)
        return redirect("/profile-center")

    return render_template_string("""
    <html><body style="font-family:Arial;background:#0f172a;color:white;padding:20px">
      <h1>Register</h1>
      <form method="post">
        <input name="email" placeholder="Email"><br><br>
        <input name="display_name" placeholder="Display Name"><br><br>
        <input name="role" placeholder="customer / creator / operator"><br><br>
        <input type="password" name="password" placeholder="Password"><br><br>
        <button type="submit">Register</button>
      </form>
      <a href="/auth/login" style="color:#93c5fd">Login</a>
    </body></html>
    """)

@auth_bp.route("/auth/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = (request.form.get("email") or "").strip().lower()
        password = request.form.get("password") or ""
        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            flash("Invalid credentials.")
            return redirect(url_for("auth_system.login"))
        login_user(user, remember=True)
        return redirect("/profile-center")

    return render_template_string("""
    <html><body style="font-family:Arial;background:#0f172a;color:white;padding:20px">
      <h1>Login</h1>
      <form method="post">
        <input name="email" placeholder="Email"><br><br>
        <input type="password" name="password" placeholder="Password"><br><br>
        <button type="submit">Login</button>
      </form>
      <a href="/auth/register" style="color:#93c5fd">Register</a>
    </body></html>
    """)

@auth_bp.route("/auth/logout")
@login_required
def logout():
    logout_user()
    return redirect("/platform-home")

@auth_bp.route("/profile")
@login_required
def profile():
    return render_template_string("""
    <html><body style="font-family:Arial;background:#0f172a;color:white;padding:20px">
      <h1>Profile</h1>
      <p>Name: {{ user.display_name }}</p>
      <p>Email: {{ user.email }}</p>
      <p>Role: {{ user.role }}</p>
      <a href="/platform-home" style="color:#93c5fd">Platform Home</a>
    </body></html>
    """, user=current_user)
