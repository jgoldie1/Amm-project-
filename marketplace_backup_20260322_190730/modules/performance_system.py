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
        .hero {{ background:linear-gradient(135deg,#06b6d4,#7c3aed,#22c55e); padding:24px; border-radius:16px; margin:16px 0; }}
        ul {{ line-height:1.8; }}
      </style>
    </head>
    <body>{body}</body>
    </html>
    """

def register(app):
    from flask import request, redirect

    @app.route("/performance-center")
    def performance_center():
        body = """
        <h1>Performance Center</h1>
        <p>Quantum Speed Accelerator + Quantum Speed Engine + Quantum Lag Buster.</p>
        <a href="/command-center">Command Center</a>
        <a href="/master-dashboard">Master Dashboard</a>
        <a href="/speed-accelerator">Speed Accelerator</a>
        <a href="/speed-engine">Speed Engine</a>
        <a href="/lag-buster">Lag Buster</a>
        <div class="hero">
          <h2>What This Does</h2>
          <p>Creates a performance control shell for speed modes, lag reporting, and route/module optimization.</p>
        </div>
        """
        return _page("Performance Center", body)

    @app.route("/speed-accelerator", methods=["GET","POST"])
    def speed_accelerator():
        rows = _read("data/performance/speed_profiles.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "profile_name": request.form.get("profile_name", "").strip() or "default_fast",
                "priority_mode": request.form.get("priority_mode", "").strip() or "fast_access",
                "notes": request.form.get("notes", "").strip(),
                "created_at": str(datetime.datetime.now())
            })
            _write("data/performance/speed_profiles.json", rows)
            return redirect("/speed-accelerator")

        items = "".join(f"<li>{x.get('profile_name')} | {x.get('priority_mode')} | {x.get('notes')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Quantum Speed Accelerator</h1>
        <a href="/performance-center">Performance Center</a>
        <div class="card">
          <form method="post">
            <input name="profile_name" placeholder="Profile name">
            <input name="priority_mode" placeholder="fast_access / light_mode / startup_priority / stream_priority">
            <textarea name="notes" placeholder="Notes"></textarea>
            <button type="submit">Save Speed Profile</button>
          </form>
        </div>
        <div class="card"><p>Total speed profiles: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Quantum Speed Accelerator", body)

    @app.route("/speed-engine", methods=["GET","POST"])
    def speed_engine():
        rows = _read("data/performance/engine_modes.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "mode_name": request.form.get("mode_name", "").strip() or "normal_mode",
                "engine_state": request.form.get("engine_state", "").strip() or "active",
                "notes": request.form.get("notes", "").strip(),
                "created_at": str(datetime.datetime.now())
            })
            _write("data/performance/engine_modes.json", rows)
            return redirect("/speed-engine")

        items = "".join(f"<li>{x.get('mode_name')} | {x.get('engine_state')} | {x.get('notes')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Quantum Speed Engine</h1>
        <a href="/performance-center">Performance Center</a>
        <div class="card">
          <form method="post">
            <input name="mode_name" placeholder="Mode name">
            <input name="engine_state" placeholder="active / recovery / fast / balanced / low_load">
            <textarea name="notes" placeholder="Notes"></textarea>
            <button type="submit">Save Engine Mode</button>
          </form>
        </div>
        <div class="card"><p>Total engine modes: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Quantum Speed Engine", body)

    @app.route("/lag-buster", methods=["GET","POST"])
    def lag_buster():
        rows = _read("data/performance/lag_reports.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "target": request.form.get("target", "").strip() or "unknown_route",
                "severity": request.form.get("severity", "").strip() or "medium",
                "status": request.form.get("status", "").strip() or "open",
                "created_at": str(datetime.datetime.now())
            })
            _write("data/performance/lag_reports.json", rows)
            return redirect("/lag-buster")

        items = "".join(f"<li>{x.get('target')} | {x.get('severity')} | {x.get('status')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Quantum Lag Buster</h1>
        <a href="/performance-center">Performance Center</a>
        <div class="card">
          <form method="post">
            <input name="target" placeholder="Route, module, or feature">
            <input name="severity" placeholder="low / medium / high / critical">
            <input name="status" placeholder="open / review / mitigated / closed">
            <button type="submit">Save Lag Report</button>
          </form>
        </div>
        <div class="card"><p>Total lag reports: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Quantum Lag Buster", body)
