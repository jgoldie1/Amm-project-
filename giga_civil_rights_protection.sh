#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

cd ~/marketplace

APP="$HOME/marketplace/app.py"
DATA_DIR="$HOME/marketplace/data"
BACKUP_DIR="$HOME/marketplace/backups"
STAMP="$(date +%Y%m%d_%H%M%S)"

mkdir -p "$DATA_DIR" "$BACKUP_DIR"
cp "$APP" "$BACKUP_DIR/app_civil_rights_${STAMP}.py"
echo "Backup saved: $BACKUP_DIR/app_civil_rights_${STAMP}.py"

for f in african_american_protection_records.json civil_rights_review_queue.json; do
  [ -f "$DATA_DIR/$f" ] || echo "[]" > "$DATA_DIR/$f"
done

python3 <<'PY'
from pathlib import Path
import re

app_path = Path.home() / "marketplace" / "app.py"
src = app_path.read_text(encoding="utf-8")

marker = "# === GIGA_CIVIL_RIGHTS_PROTECTION_20260318 ==="
if marker in src:
    print("Civil rights protection already installed.")
    raise SystemExit(0)

block = r'''
# === GIGA_CIVIL_RIGHTS_PROTECTION_20260318 ===

def giga_cr_safe_read_20260318(filename):
    try:
        import json
        from pathlib import Path
        fp = Path.home() / "marketplace" / "data" / filename
        if not fp.exists():
            return []
        return json.loads(fp.read_text(encoding="utf-8"))
    except Exception:
        return []

def giga_cr_safe_write_20260318(filename, payload):
    try:
        import json
        from pathlib import Path
        fp = Path.home() / "marketplace" / "data" / filename
        fp.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    except Exception:
        pass

def giga_cr_next_id_20260318(items, prefix):
    return f"{prefix}_{len(items)+1}"

@app.route("/african-american-protection-v1", methods=["GET","POST"])
def giga_african_american_protection_v1_20260318():
    from flask import request, redirect
    if request.method == "POST":
        rows = giga_cr_safe_read_20260318("african_american_protection_records.json")
        queue = giga_cr_safe_read_20260318("civil_rights_review_queue.json")

        row = {
            "id": giga_cr_next_id_20260318(rows, "blackhistory"),
            "project_title": request.form.get("project_title", ""),
            "historical_scope": request.form.get("historical_scope", ""),
            "protected_topic_type": request.form.get("protected_topic_type", ""),
            "community_review_status": request.form.get("community_review_status", "pending"),
            "historical_accuracy_status": request.form.get("historical_accuracy_status", "pending"),
            "harm_or_exploitation_flag": request.form.get("harm_or_exploitation_flag", "review"),
            "benefit_sharing_note": request.form.get("benefit_sharing_note", ""),
            "review_note": request.form.get("review_note", ""),
            "created_at": __import__("datetime").datetime.utcnow().isoformat()
        }

        rows.append(row)
        queue.append({
            "id": giga_cr_next_id_20260318(queue, "crreview"),
            "project_title": row["project_title"],
            "review_type": "african_american_civil_rights",
            "status": "pending",
            "linked_id": row["id"],
            "created_at": row["created_at"]
        })

        giga_cr_safe_write_20260318("african_american_protection_records.json", rows)
        giga_cr_safe_write_20260318("civil_rights_review_queue.json", queue)
        return redirect("/creator-governance-v1")

    return """
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>African American + Civil Rights Protection V1</title>
      <style>
        body { font-family: Arial, sans-serif; background: linear-gradient(180deg,#020617 0%,#0f172a 100%); color:white; padding:20px; }
        a, button { display:inline-block; margin:6px 8px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border:none; border-radius:10px; }
        input, textarea, select { width:100%; max-width:760px; padding:10px; margin:8px 0; border-radius:8px; border:1px solid #334155; background:#0f172a; color:white; }
        .card { background:#1e293b; padding:16px; border-radius:14px; margin:14px 0; border:1px solid #334155; }
        .warn { color:#fca5a5; }
      </style>
    </head>
    <body>
      <h1>African American + Civil Rights Protection V1</h1>
      <a href="/platform-home">Platform Home</a>
      <a href="/creator-governance-v1">Creator Governance</a>
      <div class="card">
        <p class="warn">Use this for content involving African American history, civil rights, racial trauma, community struggle, liberation movements, Black cultural heritage, protest movements, or historically sensitive stories.</p>
        <form method='post'>
          <input name='project_title' placeholder='Project title'>
          <input name='historical_scope' placeholder='Era / historical scope'>
          <input name='protected_topic_type' placeholder='Civil rights, Black history, protest, family legacy, cultural heritage, faith, education'>
          <select name='community_review_status'>
            <option value='pending'>Community review pending</option>
            <option value='cleared'>Community review cleared</option>
            <option value='restricted'>Community review restricted</option>
          </select>
          <select name='historical_accuracy_status'>
            <option value='pending'>Historical accuracy pending</option>
            <option value='reviewed'>Historically reviewed</option>
          </select>
          <select name='harm_or_exploitation_flag'>
            <option value='review'>Needs harm review</option>
            <option value='low'>Low exploitation risk</option>
            <option value='high'>High exploitation risk</option>
          </select>
          <input name='benefit_sharing_note' placeholder='Benefit sharing / community support note'>
          <textarea name='review_note' placeholder='Review notes'></textarea>
          <button type='submit'>Save Protection Record</button>
        </form>
      </div>
      <div class="card">
        <h3>Protection Rules</h3>
        <ul>
          <li>No trauma exploitation just for clicks.</li>
          <li>No false historical claims without review.</li>
          <li>No misuse of Black cultural identity markers as decoration only.</li>
          <li>Use review before release for historically sensitive productions.</li>
          <li>Document benefit-sharing, education, or community value where appropriate.</li>
        </ul>
      </div>
    </body>
    </html>
    """

@app.route("/civil-rights-dashboard-v1")
def giga_civil_rights_dashboard_v1_20260318():
    records = giga_cr_safe_read_20260318("african_american_protection_records.json")
    queue = giga_cr_safe_read_20260318("civil_rights_review_queue.json")
    return f"""
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>Civil Rights Dashboard V1</title>
      <style>
        body {{ font-family: Arial, sans-serif; background: linear-gradient(180deg,#020617 0%,#0f172a 100%); color:white; padding:20px; }}
        a, button {{ display:inline-block; margin:6px 8px 6px 0; padding:10px 14px; background:#2563eb; color:white; text-decoration:none; border:none; border-radius:10px; }}
        .card {{ background:#1e293b; padding:16px; border-radius:14px; margin:14px 0; border:1px solid #334155; }}
      </style>
    </head>
    <body>
      <h1>Civil Rights Dashboard V1</h1>
      <a href="/platform-home">Platform Home</a>
      <a href="/creator-governance-v1">Creator Governance</a>
      <a href="/african-american-protection-v1">Protection Intake</a>
      <div class="card">
        <h3>Status</h3>
        <p>Protection records: <strong>{len(records)}</strong></p>
        <p>Review queue items: <strong>{len(queue)}</strong></p>
      </div>
    </body>
    </html>
    """

# === END_GIGA_CIVIL_RIGHTS_PROTECTION_20260318 ===
'''

# also add links into creator governance if present
anchor = '<a href="/indigenous-protection-v1">Indigenous Protection</a>'
if anchor in src and '/african-american-protection-v1' not in src:
    src = src.replace(
        anchor,
        anchor + '\n        <a href="/african-american-protection-v1">African American + Civil Rights Protection</a>\n        <a href="/civil-rights-dashboard-v1">Civil Rights Dashboard</a>'
    )

m = re.search(r'if __name__ == ["\\\']__main__["\\\']:\s*\n(?:[ \t]+.*\n)+', src)
if m:
    insert_pos = m.start()
else:
    m2 = re.search(r'app\.run\s*\([^\n]*\)\s*\n', src)
    insert_pos = m2.start() if m2 else len(src)

new_src = src[:insert_pos].rstrip() + "\n\n" + block + "\n\n" + src[insert_pos:].lstrip()
app_path.write_text(new_src, encoding="utf-8")
print("Civil rights protection installed above app.run.")
PY

./recovery/start_giga_locked.sh

echo
echo "Testing civil rights pages..."
curl -s http://127.0.0.1:8080/african-american-protection-v1 | head -20
echo
curl -s http://127.0.0.1:8080/civil-rights-dashboard-v1 | head -20
echo
