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
      input, textarea, select {{ width:100%; max-width:720px; padding:10px; margin:8px 0; border-radius:8px; border:1px solid #334155; }}
      .card {{ background:#1e293b; padding:16px; border-radius:12px; margin:14px 0; }}
      ul {{ line-height:1.8; }}
    </style></head><body>{body}</body></html>
    """

def register(app):
    from flask import request, redirect

    @app.route("/living-city-center")
    def living_city_center():
        body = """
        <h1>Living City Center</h1>
        <p>Modular living city system.</p>
        <a href="/command-center">Command Center</a>
        <a href="/population-ai">Population AI</a>
        <a href="/job-system">Jobs</a>
        <a href="/economy-demand-board">Economy Demand</a>
        <a href="/housing-demand-board">Housing Demand</a>
        <a href="/presence-board">Presence Board</a>
        <a href="/world-streaming-center">World Streaming</a>
        """
        return _page("Living City Center", body)

    @app.route("/population-ai", methods=["GET","POST"])
    def population_ai():
        rows = _read("data/living_city/population.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "name": request.form.get("name","Unknown Citizen").strip() or "Unknown Citizen",
                "role": request.form.get("role","resident").strip() or "resident",
                "home": request.form.get("home","general_housing").strip() or "general_housing",
                "created_at": str(datetime.datetime.now())
            })
            _write("data/living_city/population.json", rows)
            return redirect("/population-ai")
        items = "".join(f"<li>{x.get('name')} | {x.get('role')} | {x.get('home')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Population AI</h1>
        <a href="/living-city-center">Living City Center</a>
        <div class="card">
          <form method="post">
            <input name="name" placeholder="Citizen name">
            <input name="role" placeholder="resident / creator / worker / visitor / owner">
            <input name="home" placeholder="Home zone">
            <button type="submit">Add Citizen</button>
          </form>
        </div>
        <div class="card"><p>Total citizens: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Population AI", body)

    @app.route("/job-system", methods=["GET","POST"])
    def job_system():
        rows = _read("data/living_city/jobs.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "name": request.form.get("name","Unknown Citizen").strip() or "Unknown Citizen",
                "job": request.form.get("job","creator").strip() or "creator",
                "district": request.form.get("district","Creator District").strip() or "Creator District",
                "created_at": str(datetime.datetime.now())
            })
            _write("data/living_city/jobs.json", rows)
            return redirect("/job-system")
        items = "".join(f"<li>{x.get('name')} | {x.get('job')} | {x.get('district')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Job System</h1>
        <a href="/living-city-center">Living City Center</a>
        <div class="card">
          <form method="post">
            <input name="name" placeholder="Citizen name">
            <input name="job" placeholder="creator / driver / judge / lawyer / police / teacher">
            <input name="district" placeholder="District">
            <button type="submit">Assign Job</button>
          </form>
        </div>
        <div class="card"><p>Total job records: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Job System", body)

    @app.route("/economy-demand-board", methods=["GET","POST"])
    def economy_demand_board():
        rows = _read("data/living_city/economy_demand.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "demand": request.form.get("demand","food_demand").strip() or "food_demand",
                "level": request.form.get("level","medium").strip() or "medium",
                "district": request.form.get("district","Marketplace District").strip() or "Marketplace District",
                "created_at": str(datetime.datetime.now())
            })
            _write("data/living_city/economy_demand.json", rows)
            return redirect("/economy-demand-board")
        items = "".join(f"<li>{x.get('demand')} | {x.get('level')} | {x.get('district')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Economy Demand Board</h1>
        <a href="/living-city-center">Living City Center</a>
        <div class="card">
          <form method="post">
            <input name="demand" placeholder="food_demand / transport_demand / event_demand / creator_demand">
            <input name="level" placeholder="low / medium / high / critical">
            <input name="district" placeholder="District">
            <button type="submit">Save Demand</button>
          </form>
        </div>
        <div class="card"><p>Total demand records: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Economy Demand Board", body)

    @app.route("/housing-demand-board", methods=["GET","POST"])
    def housing_demand_board():
        rows = _read("data/living_city/housing_demand.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "zone": request.form.get("zone","general_housing").strip() or "general_housing",
                "level": request.form.get("level","medium").strip() or "medium",
                "housing_type": request.form.get("housing_type","apartment").strip() or "apartment",
                "created_at": str(datetime.datetime.now())
            })
            _write("data/living_city/housing_demand.json", rows)
            return redirect("/housing-demand-board")
        items = "".join(f"<li>{x.get('zone')} | {x.get('housing_type')} | {x.get('level')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Housing Demand Board</h1>
        <a href="/living-city-center">Living City Center</a>
        <div class="card">
          <form method="post">
            <input name="zone" placeholder="Zone">
            <input name="level" placeholder="low / medium / high / critical">
            <input name="housing_type" placeholder="apartment / studio / penthouse / family_unit">
            <button type="submit">Save Housing Demand</button>
          </form>
        </div>
        <div class="card"><p>Total housing records: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Housing Demand Board", body)

    @app.route("/presence-board", methods=["GET","POST"])
    def presence_board():
        rows = _read("data/living_city/presence.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "name": request.form.get("name","unknown_user").strip() or "unknown_user",
                "zone": request.form.get("zone","Creator District").strip() or "Creator District",
                "mode": request.form.get("mode","shared").strip() or "shared",
                "created_at": str(datetime.datetime.now())
            })
            _write("data/living_city/presence.json", rows)
            return redirect("/presence-board")
        items = "".join(f"<li>{x.get('name')} | {x.get('zone')} | {x.get('mode')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Presence Board</h1>
        <a href="/living-city-center">Living City Center</a>
        <div class="card">
          <form method="post">
            <input name="name" placeholder="User name">
            <input name="zone" placeholder="Zone">
            <input name="mode" placeholder="solo / shared / vip / event">
            <button type="submit">Save Presence</button>
          </form>
        </div>
        <div class="card"><p>Total presence records: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Presence Board", body)
