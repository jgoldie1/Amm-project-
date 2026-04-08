from pathlib import Path
import importlib.util
import json
import datetime
import os

def _log(path, msg):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "a", encoding="utf-8") as f:
        f.write(f"[{datetime.datetime.now()}] {msg}\n")

def _read_disabled():
    p = Path("config/disabled_modules.json")
    if not p.exists():
        return []
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return []

def _write_boot_status(status):
    p = Path("data/system/boot_status.json")
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(status, indent=2), encoding="utf-8")

def load_optional_modules(app):
    modules_dir = Path("modules")
    disabled = set(_read_disabled())
    boot_mode = os.getenv("PLATFORM_BOOT_MODE", "normal").strip().lower() or "normal"

    status = {
        "boot_mode": boot_mode,
        "last_boot": str(datetime.datetime.now()),
        "loaded_modules": [],
        "failed_modules": [],
        "disabled_modules": sorted(disabled),
    }

    # In safe mode, only load the most important stable modules.
    safe_allow = {
        "recovery_core.py",
        "final_stabilizer.py",
        "front_shell.py",
        "master_dashboard.py",
        "continuity_system.py",
    }

    for path in sorted(modules_dir.glob("*.py")):
        if path.name in {"recovery_core.py", "module_loader.py", "__init__.py"}:
            continue

        if path.name in disabled:
            _log("logs/module_failures.log", f"SKIPPED disabled module: {path.name}")
            continue

        if boot_mode == "safe" and path.name not in safe_allow:
            _log("logs/module_failures.log", f"SKIPPED by safe mode: {path.name}")
            continue

        try:
            spec = importlib.util.spec_from_file_location(path.stem, str(path))
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            if hasattr(mod, "register"):
                mod.register(app)
                status["loaded_modules"].append(path.name)
            else:
                _log("logs/module_failures.log", f"NO register(app): {path.name}")
        except Exception as e:
            msg = f"FAILED {path.name}: {e.__class__.__name__}: {e}"
            status["failed_modules"].append(msg)
            _log("logs/module_failures.log", msg)

    _write_boot_status(status)
