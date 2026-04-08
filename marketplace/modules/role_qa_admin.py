import json
import uuid
import datetime
from functools import wraps
from flask import abort, request, redirect

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
        .grid {{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:14px;
        }}
      </style>
    </head>
    <body>{body}</body>
    </html>
    """

def _current_role():
    try:
        from flask_login import current_user
        if getattr(current_user, "is_authenticated", False):
            return getattr(current_user, "role", "customer")
    except Exception:
        pass
    return "guest"

def role_gate(*roles):
    def deco(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            role = _current_role()
            if role not in roles:
                abort(403)
            return fn(*args, **kwargs)
        return wrapper
    return deco

def register(app):
    @app.route("/admin-center")
    @role_gate("operator")
    def admin_center():
        body = """
        <h1>Admin Center</h1>
        <a href="/master-dashboard">Master Dashboard</a>
        <a href="/qa-dashboard">QA Dashboard</a>
        <a href="/deployment-dashboard">Deployment Dashboard</a>
        <a href="/admin-notes">Admin Notes</a>
        <div class="grid">
          <div class="card">
            <h3>System</h3>
            <a href="/boot-status">Boot Status</a>
            <a href="/boot-logs">Boot Logs</a>
            <a href="/route-audit">Route Audit</a>
          </div>
          <div class="card">
            <h3>Governance</h3>
            <a href="/module-status-board">Module Status</a>
            <a href="/completion-board">Completion Board</a>
            <a href="/production-readiness">Production Readiness</a>
          </div>
          <div class="card">
            <h3>Ops</h3>
            <a href="/system-registry">System Registry</a>
            <a href="/platform-summary">Platform Summary</a>
            <a href="/stabilize-toolkit">Stabilize Toolkit</a>
          </div>
        </div>
        """
        return _page("Admin Center", body)

    @app.route("/qa-dashboard", methods=["GET","POST"])
    @role_gate("operator")
    def qa_dashboard():
        rows = _read("data/qa/checks.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "area": request.form.get("area","unknown").strip() or "unknown",
                "status": request.form.get("status","pass").strip() or "pass",
                "notes": request.form.get("notes","").strip(),
                "created_at": str(datetime.datetime.now())
            })
            _write("data/qa/checks.json", rows)
            return redirect("/qa-dashboard")

        items = "".join(f"<li>{x.get('area')} | {x.get('status')} | {x.get('notes')}</li>" for x in rows[-50:])
        body = f"""
        <h1>QA Dashboard</h1>
        <a href="/admin-center">Admin Center</a>
        <a href="/test-summary">Test Summary</a>
        <div class="card">
          <form method="post">
            <input name="area" placeholder="Area tested">
            <input name="status" placeholder="pass / partial / fail / blocked">
            <textarea name="notes" placeholder="Notes"></textarea>
            <button type="submit">Save QA Check</button>
          </form>
        </div>
        <div class="card"><ul>{items}</ul></div>
        """
        return _page("QA Dashboard", body)

    @app.route("/test-summary")
    @role_gate("operator")
    def test_summary():
        rows = _read("data/qa/checks.json", [])
        total = len(rows)
        passed = len([x for x in rows if x.get("status") == "pass"])
        partial = len([x for x in rows if x.get("status") == "partial"])
        failed = len([x for x in rows if x.get("status") == "fail"])
        blocked = len([x for x in rows if x.get("status") == "blocked"])
        body = f"""
        <h1>Test Summary</h1>
        <a href="/qa-dashboard">QA Dashboard</a>
        <div class="card">
          <p>Total: {total}</p>
          <p>Pass: {passed}</p>
          <p>Partial: {partial}</p>
          <p>Fail: {failed}</p>
          <p>Blocked: {blocked}</p>
        </div>
        """
        return _page("Test Summary", body)

    @app.route("/deployment-dashboard")
    @role_gate("operator")
    def deployment_dashboard():
        data = _read("reports/deployment_readiness.json", {})
        items = "".join(f"<li>{k}: {v}</li>" for k, v in data.items())
        body = f"""
        <h1>Deployment Dashboard</h1>
        <a href="/admin-center">Admin Center</a>
        <div class="card"><ul>{items}</ul></div>
        """
        return _page("Deployment Dashboard", body)

    @app.route("/admin-notes", methods=["GET","POST"])
    @role_gate("operator")
    def admin_notes():
        rows = _read("data/admin/admin_notes.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "title": request.form.get("title","Admin Note").strip() or "Admin Note",
                "notes": request.form.get("notes","").strip(),
                "created_at": str(datetime.datetime.now())
            })
            _write("data/admin/admin_notes.json", rows)
            return redirect("/admin-notes")
        items = "".join(f"<li>{x.get('title')} | {x.get('notes')}</li>" for x in rows[-40:])
        body = f"""
        <h1>Admin Notes</h1>
        <a href="/admin-center">Admin Center</a>
        <div class="card">
          <form method="post">
            <input name="title" placeholder="Title">
            <textarea name="notes" placeholder="Notes"></textarea>
            <button type="submit">Save Note</button>
          </form>
        </div>
        <div class="card"><ul>{items}</ul></div>
        """
        return _page("Admin Notes", body)

    @app.route("/creator-workspace")
    @role_gate("creator", "operator")
    def creator_workspace():
        body = """
        <h1>Creator Workspace</h1>
        <a href="/creator-home">Creator Home</a>
        <a href="/studio-registry">Studios</a>
        <a href="/marketplace-center">Marketplace</a>
        <a href="/holoverse-showcases">Showcases</a>
        <a href="/premium-events">Premium Events</a>
        """
        return _page("Creator Workspace", body)
