#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

cd ~/marketplace

APP="$HOME/marketplace/app.py"
DATA_DIR="$HOME/marketplace/data"
BACKUP_DIR="$HOME/marketplace/backups"
STAMP="$(date +%Y%m%d_%H%M%S)"

mkdir -p "$DATA_DIR" "$BACKUP_DIR"
cp "$APP" "$BACKUP_DIR/app_rights_culture_${STAMP}.py"
echo "Backup saved: $BACKUP_DIR/app_rights_culture_${STAMP}.py"

for f in creator_rights_records.json cast_consent_records.json release_control_records.json indigenous_protection_records.json cultural_review_queue.json; do
  [ -f "$DATA_DIR/$f" ] || echo "[]" > "$DATA_DIR/$f"
done

python3 <<'PY'
from pathlib import Path
import json
import re

app_path = Path.home() / "marketplace" / "app.py"
src = app_path.read_text(encoding="utf-8")

marker = "# === GIGA_RIGHTS_CULTURE_STABILIZER_20260318 ==="
if marker in src:
    print("Rights/culture stabilizer already installed.")
    raise SystemExit(0)

block = r'''
# === GIGA_RIGHTS_CULTURE_STABILIZER_20260318 ===

def giga_rights_safe_read_20260318(filename):
    try:
        import json
        from pathlib import Path
        fp = Path.home() / "marketplace" / "data" / filename
        if not fp.exists():
            return []
        return json.loads(fp.read_text(encoding="utf-8"))
    except Exception:
        return []

def giga_rights_safe_write_20260318(filename, payload):
    try:
        import json
        from pathlib import Path
        fp = Path.home() / "marketplace" / "data" / filename
        fp.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    except Exception:
        pass

def giga_rights_next_id_20260318(items, prefix):
    return f"{prefix}_{len(items)+1}"

def giga_rights_shell_20260318(title, body):
    return f"""
    <html>
    <head>
      <meta name='viewport' content='width=device-width,initial-scale=1'>
      <title>{title}</title>
      <style>
        body {{
          font-family: Arial, sans-serif;
          background: linear-gradient(180deg,#020617 0%,#0f172a 100%);
          color: white;
          padding: 20px;
        }}
        a, button {{
          display:inline-block;
          margin:6px 8px 6px 0;
          padding:10px 14px;
          background:#2563eb;
          color:white;
          text-decoration:none;
          border:none;
          border-radius:10px;
        }}
        input, textarea, select {{
          width:100%;
          max-width:760px;
          padding:10px;
          margin:8px 0;
          border-radius:8px;
          border:1px solid #334155;
          background:#0f172a;
          color:white;
        }}
        .card {{
          background:#1e293b;
          padding:16px;
          border-radius:14px;
          margin:14px 0;
          border:1px solid #334155;
        }}
        .grid {{
          display:grid;
          grid-template-columns: repeat(auto-fit,minmax(280px,1fr));
          gap:14px;
        }}
        .muted {{ color:#94a3b8; }}
        .warn {{ color:#fca5a5; }}
        .good {{ color:#86efac; }}
      </style>
    </head>
    <body>
      <h1>{title}</h1>
      <a href="/platform-home">Platform Home</a>
      <a href="/creator-studio">Creator Studio</a>
      <a href="/world-map-v5">World Map V5</a>
      <a href="/omni-cinema-v5">Omni Cinema V5</a>
      {body}
    </body>
    </html>
    """

@app.route("/creator-governance-v1")
def giga_creator_governance_v1_20260318():
    rights = giga_rights_safe_read_20260318("creator_rights_records.json")
    releases = giga_rights_safe_read_20260318("release_control_records.json")
    reviews = giga_rights_safe_read_20260318("cultural_review_queue.json")
    body = f"""
    <div class='grid'>
      <div class='card'>
        <h3>Rights + Release Control</h3>
        <p>Creator rights records: <strong>{len(rights)}</strong></p>
        <p>Release control records: <strong>{len(releases)}</strong></p>
        <p>Cultural review queue: <strong>{len(reviews)}</strong></p>
      </div>
      <div class='card'>
        <h3>Actions</h3>
        <a href='/rights-intake-v1'>Rights Intake</a>
        <a href='/cast-consent-v1'>Cast Consent</a>
        <a href='/release-control-v1'>Release Control</a>
        <a href='/indigenous-protection-v1'>Indigenous Protection</a>
      </div>
    </div>
    """
    return giga_rights_shell_20260318("Creator Governance V1", body)

@app.route("/rights-intake-v1", methods=["GET", "POST"])
def giga_rights_intake_v1_20260318():
    from flask import request, redirect
    if request.method == "POST":
        rows = giga_rights_safe_read_20260318("creator_rights_records.json")
        row = {
            "id": giga_rights_next_id_20260318(rows, "rights"),
            "project_title": request.form.get("project_title", ""),
            "owner_name": request.form.get("owner_name", ""),
            "content_type": request.form.get("content_type", ""),
            "language_plan": request.form.get("language_plan", ""),
            "music_rights_status": request.form.get("music_rights_status", "pending"),
            "voice_rights_status": request.form.get("voice_rights_status", "pending"),
            "likeness_rights_status": request.form.get("likeness_rights_status", "pending"),
            "created_at": __import__("datetime").datetime.utcnow().isoformat()
        }
        rows.append(row)
        giga_rights_safe_write_20260318("creator_rights_records.json", rows)
        return redirect("/creator-governance-v1")

    body = """
    <div class='card'>
      <h3>Rights Intake</h3>
      <form method='post'>
        <input name='project_title' placeholder='Project title'>
        <input name='owner_name' placeholder='Owner / producer name'>
        <input name='content_type' placeholder='Movie, series, short, reel'>
        <input name='language_plan' placeholder='Languages / dubbing plan'>
        <select name='music_rights_status'>
          <option value='pending'>Music rights pending</option>
          <option value='cleared'>Music rights cleared</option>
        </select>
        <select name='voice_rights_status'>
          <option value='pending'>Voice rights pending</option>
          <option value='cleared'>Voice rights cleared</option>
        </select>
        <select name='likeness_rights_status'>
          <option value='pending'>Likeness rights pending</option>
          <option value='cleared'>Likeness rights cleared</option>
        </select>
        <button type='submit'>Save Rights Intake</button>
      </form>
    </div>
    """
    return giga_rights_shell_20260318("Rights Intake V1", body)

@app.route("/cast-consent-v1", methods=["GET", "POST"])
def giga_cast_consent_v1_20260318():
    from flask import request, redirect
    if request.method == "POST":
        rows = giga_rights_safe_read_20260318("cast_consent_records.json")
        row = {
            "id": giga_rights_next_id_20260318(rows, "consent"),
            "project_title": request.form.get("project_title", ""),
            "performer_name": request.form.get("performer_name", ""),
            "role_name": request.form.get("role_name", ""),
            "voice_clone_allowed": request.form.get("voice_clone_allowed", "no"),
            "translation_dub_allowed": request.form.get("translation_dub_allowed", "no"),
            "likeness_use_allowed": request.form.get("likeness_use_allowed", "no"),
            "minor_protection_flag": request.form.get("minor_protection_flag", "no"),
            "created_at": __import__("datetime").datetime.utcnow().isoformat()
        }
        rows.append(row)
        giga_rights_safe_write_20260318("cast_consent_records.json", rows)
        return redirect("/creator-governance-v1")

    body = """
    <div class='card'>
      <h3>Cast / Voice / Likeness Consent</h3>
      <form method='post'>
        <input name='project_title' placeholder='Project title'>
        <input name='performer_name' placeholder='Performer name'>
        <input name='role_name' placeholder='Role name'>
        <select name='voice_clone_allowed'>
          <option value='no'>No voice clone</option>
          <option value='yes'>Voice clone allowed</option>
        </select>
        <select name='translation_dub_allowed'>
          <option value='no'>No translation dub</option>
          <option value='yes'>Translation dub allowed</option>
        </select>
        <select name='likeness_use_allowed'>
          <option value='no'>No likeness use</option>
          <option value='yes'>Likeness use allowed</option>
        </select>
        <select name='minor_protection_flag'>
          <option value='no'>Adult performer</option>
          <option value='yes'>Minor protection required</option>
        </select>
        <button type='submit'>Save Consent Record</button>
      </form>
    </div>
    """
    return giga_rights_shell_20260318("Cast Consent V1", body)

@app.route("/release-control-v1", methods=["GET", "POST"])
def giga_release_control_v1_20260318():
    from flask import request, redirect
    if request.method == "POST":
        rows = giga_rights_safe_read_20260318("release_control_records.json")
        row = {
            "id": giga_rights_next_id_20260318(rows, "release"),
            "project_title": request.form.get("project_title", ""),
            "rating": request.form.get("rating", "G"),
            "release_region": request.form.get("release_region", ""),
            "kyc_status": request.form.get("kyc_status", "pending"),
            "consent_status": request.form.get("consent_status", "pending"),
            "cultural_review_status": request.form.get("cultural_review_status", "pending"),
            "publish_status": request.form.get("publish_status", "hold"),
            "created_at": __import__("datetime").datetime.utcnow().isoformat()
        }
        rows.append(row)
        giga_rights_safe_write_20260318("release_control_records.json", rows)
        return redirect("/creator-governance-v1")

    body = """
    <div class='card'>
      <h3>Release Control</h3>
      <form method='post'>
        <input name='project_title' placeholder='Project title'>
        <input name='release_region' placeholder='Country / state / city / region'>
        <select name='rating'>
          <option value='G'>G</option>
          <option value='PG'>PG</option>
          <option value='PG-13'>PG-13</option>
          <option value='R'>R</option>
          <option value='18+'>18+</option>
        </select>
        <select name='kyc_status'>
          <option value='pending'>KYC pending</option>
          <option value='verified'>KYC verified</option>
        </select>
        <select name='consent_status'>
          <option value='pending'>Consent pending</option>
          <option value='cleared'>Consent cleared</option>
        </select>
        <select name='cultural_review_status'>
          <option value='pending'>Cultural review pending</option>
          <option value='cleared'>Cultural review cleared</option>
          <option value='restricted'>Cultural review restricted</option>
        </select>
        <select name='publish_status'>
          <option value='hold'>Hold release</option>
          <option value='approved'>Approved for release</option>
        </select>
        <button type='submit'>Save Release Control</button>
      </form>
    </div>
    """
    return giga_rights_shell_20260318("Release Control V1", body)

@app.route("/indigenous-protection-v1", methods=["GET", "POST"])
def giga_indigenous_protection_v1_20260318():
    from flask import request, redirect
    if request.method == "POST":
        rows = giga_rights_safe_read_20260318("indigenous_protection_records.json")
        queue = giga_rights_safe_read_20260318("cultural_review_queue.json")
        row = {
            "id": giga_rights_next_id_20260318(rows, "indigenous"),
            "project_title": request.form.get("project_title", ""),
            "nation_or_community": request.form.get("nation_or_community", ""),
            "protected_element_type": request.form.get("protected_element_type", ""),
            "community_permission_status": request.form.get("community_permission_status", "pending"),
            "sacred_or_restricted_flag": request.form.get("sacred_or_restricted_flag", "yes"),
            "revenue_share_note": request.form.get("revenue_share_note", ""),
            "review_note": request.form.get("review_note", ""),
            "created_at": __import__("datetime").datetime.utcnow().isoformat()
        }
        rows.append(row)
        queue.append({
            "id": giga_rights_next_id_20260318(queue, "review"),
            "project_title": row["project_title"],
            "review_type": "indigenous_protection",
            "status": "pending",
            "linked_id": row["id"],
            "created_at": row["created_at"]
        })
        giga_rights_safe_write_20260318("indigenous_protection_records.json", rows)
        giga_rights_safe_write_20260318("cultural_review_queue.json", queue)
        return redirect("/creator-governance-v1")

    body = """
    <div class='card'>
      <h3>Indigenous / Native Protection</h3>
      <p class='warn'>Use this whenever content references Native American, Indigenous, First Nations, tribal, sacred, ceremonial, or culturally protected material.</p>
      <form method='post'>
        <input name='project_title' placeholder='Project title'>
        <input name='nation_or_community' placeholder='Nation / tribe / community'>
        <input name='protected_element_type' placeholder='Story, symbol, ceremony, regalia, language, music, location, likeness'>
        <select name='community_permission_status'>
          <option value='pending'>Community permission pending</option>
          <option value='granted'>Community permission granted</option>
          <option value='denied'>Community permission denied</option>
        </select>
        <select name='sacred_or_restricted_flag'>
          <option value='yes'>Sacred / restricted</option>
          <option value='no'>Not sacred / restricted</option>
        </select>
        <input name='revenue_share_note' placeholder='Revenue share / benefit note'>
        <textarea name='review_note' placeholder='Review notes / protection notes'></textarea>
        <button type='submit'>Save Indigenous Protection Record</button>
      </form>
    </div>
    <div class='card'>
      <h3>Protection Rules</h3>
      <ul>
        <li>No sacred material without permission.</li>
        <li>No AI voice/likeness cloning without direct consent.</li>
        <li>No cultural symbols used only for shock value or exploitation.</li>
        <li>Use cultural review before release.</li>
        <li>Document benefit-sharing where appropriate.</li>
      </ul>
    </div>
    """
    return giga_rights_shell_20260318("Indigenous Protection V1", body)

# === END_GIGA_RIGHTS_CULTURE_STABILIZER_20260318 ===
'''

m = re.search(r'if __name__ == ["\\\']__main__["\\\']:\s*\n(?:[ \t]+.*\n)+', src)
if m:
    insert_pos = m.start()
else:
    m2 = re.search(r'app\.run\s*\([^\n]*\)\s*\n', src)
    insert_pos = m2.start() if m2 else len(src)

new_src = src[:insert_pos].rstrip() + "\n\n" + block + "\n\n" + src[insert_pos:].lstrip()
app_path.write_text(new_src, encoding="utf-8")
print("Rights/culture stabilizer installed above app.run.")
PY

./recovery/start_giga_locked.sh

echo
echo "Testing rights/culture pages..."
curl -s http://127.0.0.1:8080/creator-governance-v1 | head -20
echo
curl -s http://127.0.0.1:8080/indigenous-protection-v1 | head -20
echo
