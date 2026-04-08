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

def _now():
    return str(datetime.datetime.now())

def register(app):
    from flask import request, redirect

    @app.route("/continuity-center")
    def continuity_center():
        body = """
        <h1>Continuity Center</h1>
        <p>Notifications, activity, recent pages, sessions, quick launch, and crash continuity.</p>
        <a href="/master-dashboard">Master Dashboard</a>
        <a href="/notifications-center">Notifications</a>
        <a href="/activity-feed">Activity Feed</a>
        <a href="/recent-pages">Recent Pages</a>
        <a href="/light-session-shell">Light Session Shell</a>
        <a href="/quick-launch-dashboard">Quick Launch Dashboard</a>
        <a href="/stability-center">Stability Center</a>
        <div class="hero">
          <h2>What This Does</h2>
          <p>Improves continuity, personalization, and recovery while reducing the chance of losing the live shell again.</p>
        </div>
        """
        return _page("Continuity Center", body)

    @app.route("/notifications-center", methods=["GET","POST"])
    def notifications_center():
        rows = _read("data/notifications/notifications.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "title": request.form.get("title","Untitled Notification").strip() or "Untitled Notification",
                "level": request.form.get("level","info").strip() or "info",
                "created_at": _now()
            })
            _write("data/notifications/notifications.json", rows)
            return redirect("/notifications-center")
        items = "".join(f"<li>{x.get('title')} | {x.get('level')} | {x.get('created_at')}</li>" for x in rows[-30:])
        body = f"""
        <h1>Notifications Center</h1>
        <a href="/continuity-center">Continuity Center</a>
        <div class="card">
          <form method="post">
            <input name="title" placeholder="Notification title">
            <input name="level" placeholder="info / warning / priority / system">
            <button type="submit">Save Notification</button>
          </form>
        </div>
        <div class="card"><p>Total notifications: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Notifications Center", body)

    @app.route("/activity-feed", methods=["GET","POST"])
    def activity_feed():
        rows = _read("data/activity/activity_feed.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "entry": request.form.get("entry","Activity").strip() or "Activity",
                "actor": request.form.get("actor","system").strip() or "system",
                "created_at": _now()
            })
            _write("data/activity/activity_feed.json", rows)
            return redirect("/activity-feed")
        items = "".join(f"<li>{x.get('actor')} | {x.get('entry')} | {x.get('created_at')}</li>" for x in rows[-40:])
        body = f"""
        <h1>Activity Feed</h1>
        <a href="/continuity-center">Continuity Center</a>
        <div class="card">
          <form method="post">
            <input name="actor" placeholder="Actor">
            <input name="entry" placeholder="Activity entry">
            <button type="submit">Save Activity</button>
          </form>
        </div>
        <div class="card"><p>Total activity items: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Activity Feed", body)

    @app.route("/recent-pages", methods=["GET","POST"])
    def recent_pages():
        rows = _read("data/session/recent_pages.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "label": request.form.get("label","Recent Page").strip() or "Recent Page",
                "route": request.form.get("route","/platform-home").strip() or "/platform-home",
                "created_at": _now()
            })
            _write("data/session/recent_pages.json", rows)
            return redirect("/recent-pages")
        items = "".join(f"<li>{x.get('label')} → {x.get('route')} | {x.get('created_at')}</li>" for x in rows[-30:])
        body = f"""
        <h1>Recent Pages</h1>
        <a href="/continuity-center">Continuity Center</a>
        <div class="card">
          <form method="post">
            <input name="label" placeholder="Page label">
            <input name="route" placeholder="/route">
            <button type="submit">Save Recent Page</button>
          </form>
        </div>
        <div class="card"><p>Total recent pages: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Recent Pages", body)

    @app.route("/light-session-shell", methods=["GET","POST"])
    def light_session_shell():
        rows = _read("data/session/light_sessions.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "display_name": request.form.get("display_name","User").strip() or "User",
                "role": request.form.get("role","customer").strip() or "customer",
                "home_route": request.form.get("home_route","/platform-home").strip() or "/platform-home",
                "created_at": _now()
            })
            _write("data/session/light_sessions.json", rows)
            return redirect("/light-session-shell")
        items = "".join(f"<li>{x.get('display_name')} | {x.get('role')} | {x.get('home_route')}</li>" for x in rows[-30:])
        body = f"""
        <h1>Light Session Shell</h1>
        <a href="/continuity-center">Continuity Center</a>
        <div class="card">
          <form method="post">
            <input name="display_name" placeholder="Display name">
            <input name="role" placeholder="customer / creator / operator">
            <input name="home_route" placeholder="/route">
            <button type="submit">Save Session Shell</button>
          </form>
        </div>
        <div class="card"><p>Total light sessions: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Light Session Shell", body)

    @app.route("/quick-launch-dashboard", methods=["GET","POST"])
    def quick_launch_dashboard():
        rows = _read("data/session/quick_launch.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "label": request.form.get("label","Quick Launch").strip() or "Quick Launch",
                "route": request.form.get("route","/platform-home").strip() or "/platform-home",
                "group": request.form.get("group","general").strip() or "general",
                "created_at": _now()
            })
            _write("data/session/quick_launch.json", rows)
            return redirect("/quick-launch-dashboard")
        items = "".join(f"<li>{x.get('label')} | {x.get('group')} | {x.get('route')}</li>" for x in rows[-40:])
        body = f"""
        <h1>Quick Launch Dashboard</h1>
        <a href="/continuity-center">Continuity Center</a>
        <a href="/platform-home">Platform Home</a>
        <div class="card">
          <form method="post">
            <input name="label" placeholder="Launch label">
            <input name="route" placeholder="/route">
            <input name="group" placeholder="general / city / creator / operator / holo">
            <button type="submit">Save Quick Launch</button>
          </form>
        </div>
        <div class="card"><p>Total quick launch items: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Quick Launch Dashboard", body)

    @app.route("/stability-center")
    def stability_center():
        body = """
        <h1>Stability Center</h1>
        <a href="/continuity-center">Continuity Center</a>
        <a href="/performance-center">Performance Center</a>
        <a href="/route-audit">Route Audit</a>
        <a href="/project-inventory">Project Inventory</a>
        <div class="card">
          <h3>Crash Prevention</h3>
          <ul>
            <li>Safe module loader keeps app alive even if optional modules fail</li>
            <li>Backups are created before major changes</li>
            <li>Route audit verifies major routes after restart</li>
            <li>Recovery shell preserves a stable navigation base</li>
            <li>Continuity layer stores recent pages and quick launches</li>
          </ul>
        </div>
        </body>
        """
        return _page("Stability Center", body)
