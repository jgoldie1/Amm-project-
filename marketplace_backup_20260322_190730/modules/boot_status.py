import json
from pathlib import Path

def _read_json(path, fallback):
    p = Path(path)
    if not p.exists():
        return fallback
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return fallback

def _tail(path, limit=40):
    p = Path(path)
    if not p.exists():
        return []
    try:
        lines = p.read_text(encoding="utf-8", errors="ignore").splitlines()
        return lines[-limit:]
    except Exception:
        return []

def _page(title, body):
    return f"""
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>{title}</title>
      <style>
        body {{ font-family: Arial, sans-serif; background:#0f172a; color:white; padding:20px; }}
        a {{ display:inline-block; margin:6px 6px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; }}
        .card {{ background:#1e293b; padding:16px; border-radius:12px; margin:14px 0; }}
        pre {{ white-space:pre-wrap; word-wrap:break-word; }}
        ul {{ line-height:1.8; }}
      </style>
    </head>
    <body>{body}</body>
    </html>
    """

def register(app):
    @app.route("/boot-status")
    def boot_status():
        status = _read_json("data/system/boot_status.json", {
            "boot_mode": "unknown",
            "last_boot": None,
            "loaded_modules": [],
            "failed_modules": [],
            "disabled_modules": [],
        })

        loaded = "".join(f"<li>{x}</li>" for x in status.get("loaded_modules", []))
        failed = "".join(f"<li>{x}</li>" for x in status.get("failed_modules", []))
        disabled = "".join(f"<li>{x}</li>" for x in status.get("disabled_modules", []))

        body = f"""
        <h1>Boot Status</h1>
        <a href="/master-dashboard">Master Dashboard</a>
        <a href="/stability-center">Stability Center</a>
        <a href="/boot-logs">Boot Logs</a>
        <div class="card">
          <p><strong>Boot mode:</strong> {status.get("boot_mode")}</p>
          <p><strong>Last boot:</strong> {status.get("last_boot")}</p>
        </div>
        <div class="card"><h3>Loaded Modules</h3><ul>{loaded}</ul></div>
        <div class="card"><h3>Failed Modules</h3><ul>{failed}</ul></div>
        <div class="card"><h3>Disabled Modules</h3><ul>{disabled}</ul></div>
        """
        return _page("Boot Status", body)

    @app.route("/boot-logs")
    def boot_logs():
        module_logs = "\n".join(_tail("logs/module_failures.log", 80))
        startup_logs = "\n".join(_tail("logs/startup_failures.log", 80))
        body = f"""
        <h1>Boot Logs</h1>
        <a href="/boot-status">Boot Status</a>
        <div class="card"><h3>Module Failures</h3><pre>{module_logs}</pre></div>
        <div class="card"><h3>Startup Failures</h3><pre>{startup_logs}</pre></div>
        """
        return _page("Boot Logs", body)
