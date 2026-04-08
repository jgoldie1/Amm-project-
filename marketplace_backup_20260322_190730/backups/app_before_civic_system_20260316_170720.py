from flask import Flask, Response
import os

app = Flask(__name__)

def page(title, body):
    return f"""
    <html>
    <head>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>All American Marketplace</title>
        <style>
            body {{
                background:#0b1220;
                color:white;
                font-family:Arial,sans-serif;
                text-align:center;
                padding:16px;
                margin:0;
            }}
            .box {{
                background:#182235;
                border:2px solid #334155;
                border-radius:16px;
                padding:20px;
                margin:16px auto;
                max-width:920px;
            }}
            .btn {{
                display:block;
                background:#0284c7;
                color:white;
                text-decoration:none;
                padding:18px;
                margin:12px auto;
                border-radius:14px;
                max-width:520px;
                font-weight:bold;
                font-size:20px;
            }}
        </style>
    </head>
    <body>
        <div class="box">
            <h1>All American Marketplace</h1>
            <p>{title}</p>
        </div>
        {body}
        <div class="box">
            <a class="btn" href="/">Home</a>
            <a class="btn" href="/dashboard">Dashboard</a>
            <a class="btn" href="/modules">Module Inventory</a>
            <a class="btn" href="/health">Health</a>
        </div>
    </body>
    </html>
    """

@app.route("/")
def home():
    return page("Recovered Local Shell", """
    <div class="box">
        <p>Server is working.</p>
        <p>This is the stable checkpoint page.</p>
    </div>
    """)

@app.route("/dashboard")
def dashboard():
    return page("Dashboard", """
    <div class="box">
        <p>Marketplace</p>
        <p>Streaming Ecosystem</p>
        <p>Quantum Speed Accelerator</p>
        <p>Quantum Lag Buster</p>
        <p>Omniverse 360 Insurance</p>
        <p>Aniyah App</p>
        <p>Cross Border</p>
        <p>FinBank</p>
        <p>Holoverse</p>
        <p>Cyber Security</p>
        <p>Employment</p>
        <p>AI TV</p>
        <p>Metaverse / Middleverse / Multiverse</p>
    </div>
    """)

@app.route("/modules")
def modules():
    return page("Module Inventory", """
    <div class="box">
        <p>All American Marketplace</p>
        <p>Holographic Streaming Ecosystem</p>
        <p>Streaming Network Omni</p>
        <p>Quantum Speed Accelerator</p>
        <p>Quantum Lag Buster</p>
        <p>Omniverse 360 Insurance</p>
        <p>Jarvis</p>
        <p>Aniyah Vocal Training</p>
        <p>Aniyah Cross Border</p>
        <p>FinBank</p>
        <p>Jacobie Vision Holoverse</p>
        <p>Jacobie Cyber Security</p>
        <p>Jacobie Employment</p>
        <p>Isaiah Anyone Can Be a Star AI TV</p>
        <p>Metaverse</p>
        <p>Middleverse</p>
        <p>Multiverse</p>
    </div>
    """)



# -------------------------
# Build Status Page
# -------------------------

@app.route("/build-status")
def build_status():
    body = ""
    body += section("Build Status", [
        "App is running",
        "Base server is active",
        "Health route is active",
        "Current mode: recovered working build"
    ])
    body += section("Quick Links", [
        "/",
        "/health",
        "/build-status"
    ])
    body += section("What This Does", [
        "Confirms the live build is running",
        "Gives you a stable checkpoint page before the next feature patch"
    ])
    return page("Build Status", body)



# -------------------------
# City Control Patch
# -------------------------

def _safe_rows(path):
    try:
        return _load(path, [])
    except Exception:
        return []

@app.route("/progress")
def progress_page():
    users = _safe_rows("users_live.json")
    passports = _safe_rows("passport/passport_users.json")
    media = _safe_rows("media_assets.json")
    districts = _safe_rows("city/districts.json")
    traffic = _safe_rows("city/traffic_board.json")

    body = ""
    body += section("Progress", [
        f"Users: {len(users)}",
        f"Passport Users: {len(passports)}",
        f"Media Assets: {len(media)}",
        f"Districts: {len(districts)}",
        f"Traffic Routes: {len(traffic)}"
    ])
    body += section("What This Does", [
        "Shows a simple progress summary for the working build",
        "Gives you a stable visibility page"
    ])
    return page("Progress", body)

@app.route("/command-center")
def command_center_page():
    body = ""
    body += section("Command Center", [
        "Build Status",
        "Progress",
        "City Minimap",
        "District Dashboard",
        "Traffic and Transport Board"
    ])
    body += """
    <div class="card">
        <h3>Main Controls</h3>
        <a class="btn" href="/build-status">Build Status</a>
        <a class="btn" href="/progress">Progress</a>
        <a class="btn" href="/city-minimap">City Minimap</a>
        <a class="btn" href="/district-dashboard">District Dashboard</a>
        <a class="btn" href="/traffic-transport-board">Traffic / Transport Board</a>
        <a class="btn" href="/health">Health</a>
    </div>
    """
    body += section("What This Does", [
        "Creates a simple control room for the live app",
        "Makes navigation easier while keeping the patch small and safe"
    ])
    return page("Command Center", body)

@app.route("/city-minimap")
def city_minimap():
    body = """
    <div class="card">
        <h3>Live City Minimap</h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
            <div style="background:#2563eb;padding:18px;border-radius:10px;">Creator District</div>
            <div style="background:#16a34a;padding:18px;border-radius:10px;">Marketplace District</div>
            <div style="background:#7c3aed;padding:18px;border-radius:10px;">VIP Event Zone</div>
            <div style="background:#f59e0b;padding:18px;border-radius:10px;">Transport Hub</div>
            <div style="background:#0f766e;padding:18px;border-radius:10px;">Wildlife Zone</div>
            <div style="background:#dc2626;padding:18px;border-radius:10px;">Future Expansion</div>
        </div>
    </div>
    """
    body += section("What This Does", [
        "Creates a visible world/city overview",
        "Makes districts easier to understand and navigate"
    ])
    return page("City Minimap", body)

@app.route("/district-dashboard")
def district_dashboard():
    districts = _safe_rows("city/districts.json")
    body = ""
    body += section("District Dashboard", [f"District count: {len(districts)}"])
    if districts:
        body += section("Districts", [
            f"{x.get('name')} | {x.get('type')} | {x.get('status')}"
            for x in districts
        ])
    body += section("What This Does", [
        "Creates a simple district operations view",
        "Prepares the city/world layer for growth"
    ])
    return page("District Dashboard", body)

@app.route("/traffic-transport-board")
def traffic_transport_board():
    routes = _safe_rows("city/traffic_board.json")
    body = ""
    body += section("Traffic / Transport Board", [f"Tracked routes: {len(routes)}"])
    if routes:
        body += section("Routes", [
            f"{x.get('route')} | {x.get('mode')} | {x.get('status')}"
            for x in routes
        ])
    body += section("What This Does", [
        "Creates a transport and route status board",
        "Prepares the app for richer traffic and travel systems later"
    ])
    return page("Traffic / Transport Board", body)



# -------------------------
# Property Development + Rental + Interior Layer
# -------------------------

def _property_cfg():
    try:
        return _cfg_load("property_system.json", {})
    except Exception:
        return {"property_system": {"building_types": [], "space_types": [], "furniture_types": [], "media_modes": []}}

def _property_rows(name):
    try:
        return _load(f"property/{name}", [])
    except Exception:
        return []

def _save_property_rows(name, rows):
    _save(f"property/{name}", rows)

@app.route("/property-center")
def property_center():
    cfg = _property_cfg().get("property_system", {})
    body = ""
    body += section("Property Development Layer", [
        "building development",
        "floor plans",
        "elevator access",
        "rental spaces",
        "interior design",
        "music and media spaces",
        "profitability tracking"
    ])
    body += """
    <div class="card">
        <h3>Property Navigation</h3>
        <a class="btn" href="/building-registry">Building Registry</a>
        <a class="btn" href="/floor-plan-center">Floor Plans</a>
        <a class="btn" href="/elevator-access-center">Elevator Access</a>
        <a class="btn" href="/rental-center">Rental Center</a>
        <a class="btn" href="/interior-studio">Interior Studio</a>
        <a class="btn" href="/media-space-center">Media Spaces</a>
        <a class="btn" href="/property-profitability">Property Profitability</a>
    </div>
    """
    body += section("Building Types", cfg.get("building_types", []))
    body += section("What This Does", [
        "Turns districts into rentable physical property systems",
        "Supports apartments, business suites, studios, and premium spaces"
    ])
    return page("Property Center", body)

@app.route("/building-registry", methods=["GET","POST"])
def building_registry():
    rows = _property_rows("buildings.json")
    cfg = _property_cfg().get("property_system", {})
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "building_name": request.form.get("building_name", "").strip() or "Untitled Building",
            "building_type": request.form.get("building_type", "").strip() or "mixed_use_building",
            "floors": request.form.get("floors", "").strip() or "1",
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_property_rows("buildings.json", rows)
        return redirect("/building-registry")

    opts = "".join([f'<option value="{v}">{v}</option>' for v in cfg.get("building_types", [])])
    body = f"""
    <div class="card">
        <form method="post">
            <input name="building_name" placeholder="Building name">
            <select name="building_type">{opts}</select>
            <input name="floors" placeholder="Number of floors">
            <button class="btn btn2" type="submit">Save Building</button>
        </form>
    </div>
    """
    body += section("Buildings", [f"Saved buildings: {len(rows)}"])
    if rows:
        body += section("Recent Buildings", [
            f"{x.get('building_name')} | {x.get('building_type')} | floors={x.get('floors')}"
            for x in rows[-20:]
        ])
    return page("Building Registry", body)

@app.route("/floor-plan-center", methods=["GET","POST"])
def floor_plan_center():
    rows = _property_rows("floor_plans.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "building_name": request.form.get("building_name", "").strip() or "Untitled Building",
            "floor_name": request.form.get("floor_name", "").strip() or "Floor 1",
            "layout_notes": request.form.get("layout_notes", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_property_rows("floor_plans.json", rows)
        return redirect("/floor-plan-center")

    body = """
    <div class="card">
        <form method="post">
            <input name="building_name" placeholder="Building name">
            <input name="floor_name" placeholder="Floor name or number">
            <textarea name="layout_notes" placeholder="Rooms, layouts, square footage, access points"></textarea>
            <button class="btn btn2" type="submit">Save Floor Plan</button>
        </form>
    </div>
    """
    body += section("Floor Plans", [f"Saved floor plans: {len(rows)}"])
    if rows:
        body += section("Recent Floor Plans", [
            f"{x.get('building_name')} | {x.get('floor_name')}"
            for x in rows[-20:]
        ])
    return page("Floor Plan Center", body)

@app.route("/elevator-access-center", methods=["GET","POST"])
def elevator_access_center():
    rows = _property_rows("elevator_access.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "building_name": request.form.get("building_name", "").strip() or "Untitled Building",
            "access_type": request.form.get("access_type", "").strip() or "general_access",
            "floor_scope": request.form.get("floor_scope", "").strip() or "all",
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_property_rows("elevator_access.json", rows)
        return redirect("/elevator-access-center")

    body = """
    <div class="card">
        <form method="post">
            <input name="building_name" placeholder="Building name">
            <input name="access_type" placeholder="general_access / vip_access / founder_access / accessibility_priority">
            <input name="floor_scope" placeholder="all / selected floors / penthouse / business floors">
            <button class="btn btn2" type="submit">Save Elevator Access Rule</button>
        </form>
    </div>
    """
    body += section("Elevator Access Rules", [f"Saved access rules: {len(rows)}"])
    return page("Elevator Access Center", body)

@app.route("/rental-center", methods=["GET","POST"])
def rental_center():
    rows = _property_rows("rental_spaces.json")
    cfg = _property_cfg().get("property_system", {})
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "space_name": request.form.get("space_name", "").strip() or "Untitled Space",
            "space_type": request.form.get("space_type", "").strip() or "apartment",
            "rate": request.form.get("rate", "").strip() or "0",
            "availability": request.form.get("availability", "").strip() or "available",
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_property_rows("rental_spaces.json", rows)
        return redirect("/rental-center")

    opts = "".join([f'<option value="{v}">{v}</option>' for v in cfg.get("space_types", [])])
    body = f"""
    <div class="card">
        <form method="post">
            <input name="space_name" placeholder="Space name">
            <select name="space_type">{opts}</select>
            <input name="rate" placeholder="Rental rate">
            <input name="availability" placeholder="available / occupied / vip_only / reserved">
            <button class="btn btn2" type="submit">Save Rental Space</button>
        </form>
    </div>
    """
    body += section("Rental Spaces", [f"Saved rental spaces: {len(rows)}"])
    if rows:
        body += section("Recent Rental Spaces", [
            f"{x.get('space_name')} | {x.get('space_type')} | rate={x.get('rate')} | {x.get('availability')}"
            for x in rows[-20:]
        ])
    return page("Rental Center", body)

@app.route("/interior-studio", methods=["GET","POST"])
def interior_studio():
    rows = _property_rows("interior_design.json")
    cfg = _property_cfg().get("property_system", {})
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "space_name": request.form.get("space_name", "").strip() or "Untitled Space",
            "furniture_type": request.form.get("furniture_type", "").strip() or "sofa",
            "design_notes": request.form.get("design_notes", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_property_rows("interior_design.json", rows)
        return redirect("/interior-studio")

    opts = "".join([f'<option value="{v}">{v}</option>' for v in cfg.get("furniture_types", [])])
    body = f"""
    <div class="card">
        <form method="post">
            <input name="space_name" placeholder="Apartment or business name">
            <select name="furniture_type">{opts}</select>
            <textarea name="design_notes" placeholder="Decor, furniture layout, branding, room style"></textarea>
            <button class="btn btn2" type="submit">Save Interior Design</button>
        </form>
    </div>
    """
    body += section("Interior Design Records", [f"Saved interior records: {len(rows)}"])
    return page("Interior Studio", body)

@app.route("/media-space-center", methods=["GET","POST"])
def media_space_center():
    rows = _property_rows("media_spaces.json")
    cfg = _property_cfg().get("property_system", {})
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "space_name": request.form.get("space_name", "").strip() or "Untitled Space",
            "media_mode": request.form.get("media_mode", "").strip() or "music_playback",
            "notes": request.form.get("notes", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_property_rows("media_spaces.json", rows)
        return redirect("/media-space-center")

    opts = "".join([f'<option value="{v}">{v}</option>' for v in cfg.get("media_modes", [])])
    body = f"""
    <div class="card">
        <form method="post">
            <input name="space_name" placeholder="Apartment or business name">
            <select name="media_mode">{opts}</select>
            <textarea name="notes" placeholder="Playlist, media lounge, creator stream setup, licensed media notes"></textarea>
            <button class="btn btn2" type="submit">Save Media Space</button>
        </form>
    </div>
    """
    body += section("Media Space Records", [f"Saved media spaces: {len(rows)}"])
    body += section("Important Note", [
        "Use licensed or platform-owned media sources",
        "This layer prepares in-space music and media experiences"
    ])
    return page("Media Space Center", body)

@app.route("/property-profitability", methods=["GET","POST"])
def property_profitability():
    rows = _property_rows("property_profitability.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "property_name": request.form.get("property_name", "").strip() or "Untitled Property",
            "income": request.form.get("income", "").strip() or "0",
            "expense": request.form.get("expense", "").strip() or "0",
            "notes": request.form.get("notes", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_property_rows("property_profitability.json", rows)
        return redirect("/property-profitability")

    body = """
    <div class="card">
        <form method="post">
            <input name="property_name" placeholder="Property name">
            <input name="income" placeholder="Income">
            <input name="expense" placeholder="Expense">
            <textarea name="notes" placeholder="Profitability notes"></textarea>
            <button class="btn btn2" type="submit">Save Profitability Record</button>
        </form>
    </div>
    """
    body += section("Profitability Records", [f"Saved records: {len(rows)}"])
    if rows:
        body += section("Recent Records", [
            f"{x.get('property_name')} | income={x.get('income')} | expense={x.get('expense')}"
            for x in rows[-20:]
        ])
    body += section("What This Does", [
        "Tracks revenue potential and operating cost by property",
        "Makes the property layer part of the platform economy"
    ])
    return page("Property Profitability", body)



# -------------------------
# Property Operations + Access Control Layer
# -------------------------

def _prop_ops_cfg():
    try:
        return _cfg_load("property_operations.json", {})
    except Exception:
        return {"property_operations": {"studio_presets": [], "room_types": [], "access_types": []}}

def _prop_ops_rows(name):
    try:
        return _load(f"property/{name}", [])
    except Exception:
        return []

def _save_prop_ops_rows(name, rows):
    _save(f"property/{name}", rows)

@app.route("/property-operations-center")
def property_operations_center():
    cfg = _prop_ops_cfg().get("property_operations", {})
    body = ""
    body += section("Property Operations Layer", [
        "lease agreement manager",
        "occupancy dashboard",
        "property maintenance tracker",
        "apartment keycard/pass system",
        "interior room-by-room editor",
        "property value estimator",
        "creator studio rental presets",
        "penthouse/VIP suite controls",
        "building security desk",
        "lobby/reception system"
    ])
    body += """
    <div class="card">
        <h3>Operations Navigation</h3>
        <a class="btn" href="/lease-agreements">Lease Agreements</a>
        <a class="btn" href="/occupancy-dashboard">Occupancy Dashboard</a>
        <a class="btn" href="/maintenance-tracker">Maintenance Tracker</a>
        <a class="btn" href="/keycard-center">Keycard Center</a>
        <a class="btn" href="/room-editor">Room Editor</a>
        <a class="btn" href="/property-value-estimator">Value Estimator</a>
        <a class="btn" href="/studio-rental-presets">Studio Presets</a>
        <a class="btn" href="/vip-suite-controls">VIP Suite Controls</a>
        <a class="btn" href="/security-desk">Security Desk</a>
        <a class="btn" href="/lobby-reception">Lobby Reception</a>
    </div>
    """
    body += section("Studio Presets", cfg.get("studio_presets", []))
    return page("Property Operations Center", body)

@app.route("/lease-agreements", methods=["GET","POST"])
def lease_agreements():
    rows = _prop_ops_rows("lease_agreements.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "tenant_name": request.form.get("tenant_name", "").strip() or "Unknown Tenant",
            "unit_name": request.form.get("unit_name", "").strip() or "Unknown Unit",
            "lease_type": request.form.get("lease_type", "").strip() or "standard",
            "lease_status": request.form.get("lease_status", "").strip() or "active",
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_prop_ops_rows("lease_agreements.json", rows)
        return redirect("/lease-agreements")

    body = """
    <div class="card">
        <form method="post">
            <input name="tenant_name" placeholder="Tenant name">
            <input name="unit_name" placeholder="Unit name">
            <input name="lease_type" placeholder="standard / vip / creator_suite / business_suite">
            <input name="lease_status" placeholder="active / pending / expired / reserved">
            <button class="btn btn2" type="submit">Save Lease Agreement</button>
        </form>
    </div>
    """
    body += section("Lease Agreements", [f"Saved lease agreements: {len(rows)}"])
    return page("Lease Agreements", body)

@app.route("/occupancy-dashboard", methods=["GET","POST"])
def occupancy_dashboard():
    rows = _prop_ops_rows("occupancy_records.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "space_name": request.form.get("space_name", "").strip() or "Unknown Space",
            "occupancy_status": request.form.get("occupancy_status", "").strip() or "vacant",
            "occupant_type": request.form.get("occupant_type", "").strip() or "resident",
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_prop_ops_rows("occupancy_records.json", rows)
        return redirect("/occupancy-dashboard")

    body = """
    <div class="card">
        <form method="post">
            <input name="space_name" placeholder="Space name">
            <input name="occupancy_status" placeholder="vacant / occupied / reserved / vip_only">
            <input name="occupant_type" placeholder="resident / creator / business / vip">
            <button class="btn btn2" type="submit">Save Occupancy Record</button>
        </form>
    </div>
    """
    body += section("Occupancy Records", [f"Saved occupancy records: {len(rows)}"])
    if rows:
        body += section("Recent Occupancy", [
            f"{x.get('space_name')} | {x.get('occupancy_status')} | {x.get('occupant_type')}"
            for x in rows[-20:]
        ])
    return page("Occupancy Dashboard", body)

@app.route("/maintenance-tracker", methods=["GET","POST"])
def maintenance_tracker():
    rows = _prop_ops_rows("maintenance_records.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "property_name": request.form.get("property_name", "").strip() or "Unknown Property",
            "issue_type": request.form.get("issue_type", "").strip() or "general_maintenance",
            "status": request.form.get("status", "").strip() or "open",
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_prop_ops_rows("maintenance_records.json", rows)
        return redirect("/maintenance-tracker")

    body = """
    <div class="card">
        <form method="post">
            <input name="property_name" placeholder="Property or unit name">
            <input name="issue_type" placeholder="cleaning / repair / inspection / upgrade / security">
            <input name="status" placeholder="open / in_progress / resolved">
            <button class="btn btn2" type="submit">Save Maintenance Record</button>
        </form>
    </div>
    """
    body += section("Maintenance Records", [f"Saved maintenance records: {len(rows)}"])
    return page("Maintenance Tracker", body)

@app.route("/keycard-center", methods=["GET","POST"])
def keycard_center():
    rows = _prop_ops_rows("keycard_passes.json")
    cfg = _prop_ops_cfg().get("property_operations", {})
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "holder_name": request.form.get("holder_name", "").strip() or "Unknown Holder",
            "access_type": request.form.get("access_type", "").strip() or "resident",
            "zone_scope": request.form.get("zone_scope", "").strip() or "general_access",
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_prop_ops_rows("keycard_passes.json", rows)
        return redirect("/keycard-center")

    body = """
    <div class="card">
        <form method="post">
            <input name="holder_name" placeholder="Holder name">
            <input name="access_type" placeholder="resident / guest / creator / vip / founder / security">
            <input name="zone_scope" placeholder="building / floor / penthouse / lobby / studio">
            <button class="btn btn2" type="submit">Save Keycard/Pass</button>
        </form>
    </div>
    """
    body += section("Access Types", cfg.get("access_types", []))
    body += section("Keycard / Pass Records", [f"Saved passes: {len(rows)}"])
    return page("Keycard Center", body)

@app.route("/room-editor", methods=["GET","POST"])
def room_editor():
    rows = _prop_ops_rows("room_editor.json")
    cfg = _prop_ops_cfg().get("property_operations", {})
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "space_name": request.form.get("space_name", "").strip() or "Unknown Space",
            "room_type": request.form.get("room_type", "").strip() or "living_room",
            "room_notes": request.form.get("room_notes", "").strip(),
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_prop_ops_rows("room_editor.json", rows)
        return redirect("/room-editor")

    body = """
    <div class="card">
        <form method="post">
            <input name="space_name" placeholder="Apartment/business name">
            <input name="room_type" placeholder="bedroom / kitchen / office / studio_room / lobby">
            <textarea name="room_notes" placeholder="Room-by-room design and layout notes"></textarea>
            <button class="btn btn2" type="submit">Save Room Design</button>
        </form>
    </div>
    """
    body += section("Room Types", cfg.get("room_types", []))
    body += section("Room Editor Records", [f"Saved room records: {len(rows)}"])
    return page("Room Editor", body)

@app.route("/property-value-estimator", methods=["GET","POST"])
def property_value_estimator():
    rows = _prop_ops_rows("property_values.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "property_name": request.form.get("property_name", "").strip() or "Unknown Property",
            "estimated_value": request.form.get("estimated_value", "").strip() or "0",
            "value_basis": request.form.get("value_basis", "").strip() or "rental_income",
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_prop_ops_rows("property_values.json", rows)
        return redirect("/property-value-estimator")

    body = """
    <div class="card">
        <form method="post">
            <input name="property_name" placeholder="Property name">
            <input name="estimated_value" placeholder="Estimated value">
            <input name="value_basis" placeholder="rental_income / premium_design / vip_access / mixed_use">
            <button class="btn btn2" type="submit">Save Property Value</button>
        </form>
    </div>
    """
    body += section("Property Value Records", [f"Saved value records: {len(rows)}"])
    return page("Property Value Estimator", body)

@app.route("/studio-rental-presets", methods=["GET","POST"])
def studio_rental_presets():
    rows = _prop_ops_rows("studio_presets.json")
    cfg = _prop_ops_cfg().get("property_operations", {})
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "preset_name": request.form.get("preset_name", "").strip() or "Unnamed Preset",
            "preset_type": request.form.get("preset_type", "").strip() or "podcast_room",
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_prop_ops_rows("studio_presets.json", rows)
        return redirect("/studio-rental-presets")

    body = """
    <div class="card">
        <form method="post">
            <input name="preset_name" placeholder="Preset name">
            <input name="preset_type" placeholder="podcast_room / music_room / streaming_suite / editing_room">
            <button class="btn btn2" type="submit">Save Studio Preset</button>
        </form>
    </div>
    """
    body += section("Studio Presets", cfg.get("studio_presets", []))
    body += section("Saved Presets", [f"Saved preset records: {len(rows)}"])
    return page("Studio Rental Presets", body)

@app.route("/vip-suite-controls", methods=["GET","POST"])
def vip_suite_controls():
    rows = _prop_ops_rows("vip_suites.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "suite_name": request.form.get("suite_name", "").strip() or "Untitled Suite",
            "control_type": request.form.get("control_type", "").strip() or "vip_access",
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_prop_ops_rows("vip_suites.json", rows)
        return redirect("/vip-suite-controls")

    body = """
    <div class="card">
        <form method="post">
            <input name="suite_name" placeholder="Suite name">
            <input name="control_type" placeholder="vip_access / founder_access / penthouse_only / entourage_access">
            <button class="btn btn2" type="submit">Save VIP Suite Control</button>
        </form>
    </div>
    """
    body += section("VIP / Penthouse Suite Controls", [f"Saved VIP suite controls: {len(rows)}"])
    return page("VIP Suite Controls", body)

@app.route("/security-desk", methods=["GET","POST"])
def security_desk():
    rows = _prop_ops_rows("security_desk.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "entry_name": request.form.get("entry_name", "").strip() or "Unknown Entry",
            "security_note": request.form.get("security_note", "").strip(),
            "status": request.form.get("status", "").strip() or "logged",
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_prop_ops_rows("security_desk.json", rows)
        return redirect("/security-desk")

    body = """
    <div class="card">
        <form method="post">
            <input name="entry_name" placeholder="Visitor, event, or issue name">
            <textarea name="security_note" placeholder="Security note"></textarea>
            <input name="status" placeholder="logged / review / cleared / blocked">
            <button class="btn btn2" type="submit">Save Security Record</button>
        </form>
    </div>
    """
    body += section("Security Desk Records", [f"Saved security records: {len(rows)}"])
    return page("Security Desk", body)

@app.route("/lobby-reception", methods=["GET","POST"])
def lobby_reception():
    rows = _prop_ops_rows("lobby_reception.json")
    if request.method == "POST":
        rec = {
            "id": str(uuid.uuid4()),
            "guest_name": request.form.get("guest_name", "").strip() or "Unknown Guest",
            "destination": request.form.get("destination", "").strip() or "Lobby",
            "checkin_status": request.form.get("checkin_status", "").strip() or "arrived",
            "created_at": str(datetime.datetime.now())
        }
        rows.append(rec)
        _save_prop_ops_rows("lobby_reception.json", rows)
        return redirect("/lobby-reception")

    body = """
    <div class="card">
        <form method="post">
            <input name="guest_name" placeholder="Guest name">
            <input name="destination" placeholder="Unit, suite, event, or lobby destination">
            <input name="checkin_status" placeholder="arrived / waiting / routed / completed">
            <button class="btn btn2" type="submit">Save Lobby Check-In</button>
        </form>
    </div>
    """
    body += section("Lobby / Reception Records", [f"Saved lobby records: {len(rows)}"])
    return page("Lobby Reception", body)

@app.route("/health")
def health():
    return "OK"

@app.route("/favicon.ico")
def fav():
    return Response(status=204)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
