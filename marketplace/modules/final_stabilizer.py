import json
import uuid
import datetime
from pathlib import Path

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
        input, textarea, select {{ width:100%; max-width:760px; padding:10px; margin:8px 0; border-radius:8px; border:1px solid #334155; }}
        .card {{ background:#1e293b; padding:16px; border-radius:12px; margin:14px 0; }}
        .hero {{ background:linear-gradient(135deg,#1d4ed8,#7c3aed,#0f766e); padding:24px; border-radius:16px; margin:16px 0; }}
        .grid {{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }}
        .tile {{ background:#1e293b; padding:16px; border-radius:12px; }}
        ul {{ line-height:1.8; }}
      </style>
    </head>
    <body>{body}</body>
    </html>
    """

def _count_json(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return len(data) if isinstance(data, list) else 0
    except Exception:
        return 0

def register(app):
    from flask import request, redirect

    @app.route("/system-registry")
    def system_registry():
        rows = [
            ("Platform Home", "/platform-home"),
            ("Master Dashboard", "/master-dashboard"),
            ("Command Center", "/command-center"),
            ("Living City Center", "/living-city-center"),
            ("Property Center", "/property-center"),
            ("Property Operations Center", "/property-operations-center"),
            ("Safety Center", "/safety-center"),
            ("OASIS Center", "/oasis-center"),
            ("Verse Center", "/verse-center"),
            ("Creator Center", "/creator-center"),
            ("Engine Center", "/engine-center"),
            ("Holoverse Center", "/holoverse-center"),
            ("Holo Commerce Center", "/holo-commerce-center"),
            ("Performance Center", "/performance-center"),
            ("Profile Center", "/profile-center"),
            ("Continuity Center", "/continuity-center"),
            ("Project Inventory", "/project-inventory"),
            ("Route Audit", "/route-audit")
        ]
        items = "".join(f'<li><a href="{route}">{name}</a></li>' for name, route in rows)
        body = f"""
        <h1>System Registry</h1>
        <a href="/master-dashboard">Master Dashboard</a>
        <a href="/completion-board">Completion Board</a>
        <a href="/module-status-board">Module Status</a>
        <ul>{items}</ul>
        """
        return _page("System Registry", body)

    @app.route("/module-status-board", methods=["GET","POST"])
    def module_status_board():
        rows = _read("data/system/module_status.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "module_name": request.form.get("module_name","unknown_module").strip() or "unknown_module",
                "status": request.form.get("status","partial").strip() or "partial",
                "notes": request.form.get("notes","").strip(),
                "created_at": str(datetime.datetime.now())
            })
            _write("data/system/module_status.json", rows)
            return redirect("/module-status-board")

        items = "".join(f"<li>{x.get('module_name')} | {x.get('status')} | {x.get('notes')}</li>" for x in rows[-50:])
        body = f"""
        <h1>Module Status Board</h1>
        <a href="/system-registry">System Registry</a>
        <div class="card">
          <form method="post">
            <input name="module_name" placeholder="Module name">
            <input name="status" placeholder="done / partial / todo / blocked">
            <textarea name="notes" placeholder="Notes"></textarea>
            <button type="submit">Save Module Status</button>
          </form>
        </div>
        <div class="card"><p>Total module status rows: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Module Status Board", body)

    @app.route("/completion-board", methods=["GET","POST"])
    def completion_board():
        rows = _read("data/system/completion_board.json", [])
        checklist = _read("data/system/production_checklist.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "area": request.form.get("area","unknown_area").strip() or "unknown_area",
                "progress": request.form.get("progress","partial").strip() or "partial",
                "notes": request.form.get("notes","").strip(),
                "created_at": str(datetime.datetime.now())
            })
            _write("data/system/completion_board.json", rows)
            return redirect("/completion-board")

        row_items = "".join(f"<li>{x.get('area')} | {x.get('progress')} | {x.get('notes')}</li>" for x in rows[-50:])
        checklist_items = "".join(f"<li>{x.get('area')} | {x.get('status')}</li>" for x in checklist)
        body = f"""
        <h1>Completion Board</h1>
        <a href="/system-registry">System Registry</a>
        <a href="/production-readiness">Production Readiness</a>
        <div class="card">
          <form method="post">
            <input name="area" placeholder="Area">
            <input name="progress" placeholder="done / partial / todo / blocked">
            <textarea name="notes" placeholder="Notes"></textarea>
            <button type="submit">Save Completion Row</button>
          </form>
        </div>
        <div class="card"><h3>Completion Rows</h3><ul>{row_items}</ul></div>
        <div class="card"><h3>Production Checklist</h3><ul>{checklist_items}</ul></div>
        """
        return _page("Completion Board", body)

    @app.route("/production-readiness")
    def production_readiness():
        checklist = _read("data/system/production_checklist.json", [])
        items = "".join(f"<li>{x.get('area')} | {x.get('status')}</li>" for x in checklist)
        body = f"""
        <h1>Production Readiness</h1>
        <a href="/completion-board">Completion Board</a>
        <div class="hero">
          <h2>What This Does</h2>
          <p>Tracks what is finished, partial, and still needed before true production launch.</p>
        </div>
        <div class="card"><ul>{items}</ul></div>
        """
        return _page("Production Readiness", body)

    @app.route("/stabilize-toolkit")
    def stabilize_toolkit():
        body = """
        <h1>Stabilize Toolkit</h1>
        <a href="/system-registry">System Registry</a>
        <a href="/route-audit">Route Audit</a>
        <a href="/project-inventory">Project Inventory</a>
        <a href="/stability-center">Stability Center</a>
        <div class="card">
          <ul>
            <li>Use recovery/restart_hardened.sh for safer restarts</li>
            <li>Use route audit after major changes</li>
            <li>Keep module changes isolated</li>
            <li>Back up app.py before major edits</li>
            <li>Prefer modules over giant inline patches</li>
          </ul>
        </div>
        """
        return _page("Stabilize Toolkit", body)

    @app.route("/platform-summary")
    def platform_summary():
        counts = {
            "profiles": _count_json("data/auth/profiles.json"),
            "favorites": _count_json("data/auth/favorites.json"),
            "citizens": _count_json("data/living_city/population.json"),
            "jobs": _count_json("data/living_city/jobs.json"),
            "buildings": _count_json("data/property/buildings.json"),
            "rentals": _count_json("data/property/rentals.json"),
            "incidents": _count_json("data/safety/incidents.json"),
            "holo_worlds": _count_json("data/holoverse/worlds.json"),
            "products": _count_json("data/holo_commerce/products.json"),
            "events": _count_json("data/holo_commerce/events.json"),
        }
        items = "".join(f"<li>{k}: {v}</li>" for k, v in counts.items())
        body = f"""
        <h1>Platform Summary</h1>
        <a href="/master-dashboard">Master Dashboard</a>
        <a href="/system-registry">System Registry</a>
        <div class="card"><ul>{items}</ul></div>
        """
        return _page("Platform Summary", body)
