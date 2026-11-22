"""Run repository-owned Node checks in their package directories and export evidence."""
import json
import subprocess
import sys
import time
from collections import Counter
from pathlib import Path

root = Path(__file__).resolve().parents[2]
output = Path(sys.argv[1]).resolve()
output.parent.mkdir(parents=True, exist_ok=True)
revision = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=root, text=True).strip()
results = []
for package in [root, root / "amm-omniverse"]:
    for folder in ["test", "tests"]:
        for path in sorted((package / folder).glob("*")):
            if not path.name.endswith((".test.js", ".test.mjs", "-contract.mjs")):
                continue
            started = time.monotonic()
            try:
                run = subprocess.run(["node", "--test", str(path)], cwd=package,
                                     capture_output=True, text=True, timeout=60)
                status = "passed" if run.returncode == 0 else "failed"
                detail = (run.stdout + run.stderr)[-6000:] if run.returncode else ""
            except subprocess.TimeoutExpired:
                status, detail = "blocked", "60 second time limit"
            results.append(dict(file=str(path.relative_to(root)), result=status, detail=detail,
                                seconds=round(time.monotonic()-started, 3)))
            temporary = output.with_suffix(".partial")
            temporary.write_text(json.dumps(dict(revision=revision, results=results,
                                                  totals=dict(Counter(r["result"] for r in results))), indent=2))
            temporary.replace(output)
print(Counter(r["result"] for r in results))
sys.exit(int(any(r["result"] != "passed" for r in results) or not results))
