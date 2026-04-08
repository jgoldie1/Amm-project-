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
    <html><head>
    <meta name='viewport' content='width=device-width,initial-scale=1'>
    <title>{title}</title>
    <style>
      body {{ font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }}
      a, button {{ display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border:none; border-radius:8px; }}
      input, textarea {{ width:100%; max-width:720px; padding:10px; margin:8px 0; border-radius:8px; border:1px solid #334155; }}
      .card {{ background:#1e293b; padding:16px; border-radius:12px; margin:14px 0; }}
      ul {{ line-height:1.8; }}
    </style></head><body>{body}</body></html>
    """

def register(app):
    from flask import request, redirect

    @app.route("/civic-center")
    def civic_center():
        body = """
        <h1>Civic Center</h1>
        <a href="/command-center">Command Center</a>
        <a href="/court-cases">Court Cases</a>
        <a href="/jail-registry">Jail Registry</a>
        <a href="/workforce-registry">Workforce Registry</a>
        """
        return _page("Civic Center", body)

    @app.route("/court-cases", methods=["GET","POST"])
    def court_cases():
        rows = _read("data/civic/cases.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "case_name": request.form.get("case_name","Untitled Case").strip() or "Untitled Case",
                "role": request.form.get("role","judge").strip() or "judge",
                "status": request.form.get("status","open").strip() or "open",
                "created_at": str(datetime.datetime.now())
            })
            _write("data/civic/cases.json", rows)
            return redirect("/court-cases")
        items = "".join(f"<li>{x.get('case_name')} | {x.get('role')} | {x.get('status')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Court Cases</h1>
        <a href="/civic-center">Civic Center</a>
        <div class="card">
          <form method="post">
            <input name="case_name" placeholder="Case name">
            <input name="role" placeholder="judge / lawyer / prosecutor / defender">
            <input name="status" placeholder="open / review / closed">
            <button type="submit">Save Case</button>
          </form>
        </div>
        <div class="card"><p>Total cases: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Court Cases", body)

    @app.route("/jail-registry", methods=["GET","POST"])
    def jail_registry():
        rows = _read("data/civic/jail.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "name": request.form.get("name","Unknown").strip() or "Unknown",
                "status": request.form.get("status","held").strip() or "held",
                "notes": request.form.get("notes","").strip(),
                "created_at": str(datetime.datetime.now())
            })
            _write("data/civic/jail.json", rows)
            return redirect("/jail-registry")
        items = "".join(f"<li>{x.get('name')} | {x.get('status')} | {x.get('notes')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Jail Registry</h1>
        <a href="/civic-center">Civic Center</a>
        <div class="card">
          <form method="post">
            <input name="name" placeholder="Person name">
            <input name="status" placeholder="held / released / reviewed">
            <textarea name="notes" placeholder="Notes"></textarea>
            <button type="submit">Save Jail Record</button>
          </form>
        </div>
        <div class="card"><p>Total jail records: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Jail Registry", body)

    @app.route("/workforce-registry", methods=["GET","POST"])
    def workforce_registry():
        rows = _read("data/civic/workforce.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "name": request.form.get("name","Unknown Worker").strip() or "Unknown Worker",
                "job": request.form.get("job","city_worker").strip() or "city_worker",
                "zone": request.form.get("zone","general").strip() or "general",
                "created_at": str(datetime.datetime.now())
            })
            _write("data/civic/workforce.json", rows)
            return redirect("/workforce-registry")
        items = "".join(f"<li>{x.get('name')} | {x.get('job')} | {x.get('zone')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Workforce Registry</h1>
        <a href="/civic-center">Civic Center</a>
        <div class="card">
          <form method="post">
            <input name="name" placeholder="Worker name">
            <input name="job" placeholder="judge / lawyer / police / medic / teacher / planner">
            <input name="zone" placeholder="Zone">
            <button type="submit">Save Worker</button>
          </form>
        </div>
        <div class="card"><p>Total workforce records: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Workforce Registry", body)
