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

    @app.route("/device-center")
    def device_center():
        body = """
        <h1>Device Center</h1>
        <a href="/command-center">Command Center</a>
        <a href="/bluetooth-center">Bluetooth</a>
        <a href="/device-trust-center">Device Trust</a>
        <a href="/accessibility-center">Accessibility</a>
        """
        return _page("Device Center", body)

    @app.route("/bluetooth-center", methods=["GET","POST"])
    def bluetooth_center():
        rows = _read("data/devices/bluetooth.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "device_name": request.form.get("device_name","Unknown Device").strip() or "Unknown Device",
                "device_type": request.form.get("device_type","controller").strip() or "controller",
                "status": request.form.get("status","paired").strip() or "paired",
                "created_at": str(datetime.datetime.now())
            })
            _write("data/devices/bluetooth.json", rows)
            return redirect("/bluetooth-center")
        items = "".join(f"<li>{x.get('device_name')} | {x.get('device_type')} | {x.get('status')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Bluetooth Center</h1>
        <a href="/device-center">Device Center</a>
        <div class="card">
          <form method="post">
            <input name="device_name" placeholder="Device name">
            <input name="device_type" placeholder="headphones / controller / switch / wearable / haptic">
            <input name="status" placeholder="paired / pending / failed / removed">
            <button type="submit">Save Bluetooth Pairing</button>
          </form>
        </div>
        <div class="card"><p>Total bluetooth records: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Bluetooth Center", body)

    @app.route("/device-trust-center", methods=["GET","POST"])
    def device_trust_center():
        rows = _read("data/devices/trust.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "subject": request.form.get("subject","Unknown").strip() or "Unknown",
                "level": request.form.get("level","unverified").strip() or "unverified",
                "notes": request.form.get("notes","").strip(),
                "created_at": str(datetime.datetime.now())
            })
            _write("data/devices/trust.json", rows)
            return redirect("/device-trust-center")
        items = "".join(f"<li>{x.get('subject')} | {x.get('level')} | {x.get('notes')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Device Trust Center</h1>
        <a href="/device-center">Device Center</a>
        <div class="card">
          <form method="post">
            <input name="subject" placeholder="Device or user">
            <input name="level" placeholder="unverified / paired / trusted / restricted / blocked">
            <textarea name="notes" placeholder="Trust notes"></textarea>
            <button type="submit">Save Trust Record</button>
          </form>
        </div>
        <div class="card"><p>Total trust records: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Device Trust Center", body)

    @app.route("/accessibility-center", methods=["GET","POST"])
    def accessibility_center():
        rows = _read("data/devices/accessibility.json", [])
        if request.method == "POST":
            rows.append({
                "id": str(uuid.uuid4()),
                "profile": request.form.get("profile","Default").strip() or "Default",
                "mode": request.form.get("mode","one_hand_mode").strip() or "one_hand_mode",
                "notes": request.form.get("notes","").strip(),
                "created_at": str(datetime.datetime.now())
            })
            _write("data/devices/accessibility.json", rows)
            return redirect("/accessibility-center")
        items = "".join(f"<li>{x.get('profile')} | {x.get('mode')} | {x.get('notes')}</li>" for x in rows[-25:])
        body = f"""
        <h1>Accessibility Center</h1>
        <a href="/device-center">Device Center</a>
        <div class="card">
          <form method="post">
            <input name="profile" placeholder="Profile name">
            <input name="mode" placeholder="voice_navigation / one_hand_mode / screen_reader / captions / simplified_mode">
            <textarea name="notes" placeholder="Accessibility notes"></textarea>
            <button type="submit">Save Accessibility Profile</button>
          </form>
        </div>
        <div class="card"><p>Total accessibility profiles: {len(rows)}</p><ul>{items}</ul></div>
        """
        return _page("Accessibility Center", body)
