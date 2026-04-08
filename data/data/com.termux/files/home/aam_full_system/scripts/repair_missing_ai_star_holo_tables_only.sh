#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
STAMP="$(date +%Y%m%d_%H%M%S)"
echo "=== REPAIR MISSING AI + STAR + HOLO TABLES ONLY START ==="

cp db/aam.db "backups/aam_repair_missing_ai_star_holo_${STAMP}.db"

sqlite3 db/aam.db <<'SQL'
CREATE TABLE IF NOT EXISTS royalty_ledger_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ledger_name TEXT,
  project_name TEXT,
  royalty_scope TEXT,
  ledger_mode TEXT,
  ledger_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS royalty_statement_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  statement_name TEXT,
  project_name TEXT,
  statement_scope TEXT,
  payout_window TEXT,
  statement_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artist_dashboard_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dashboard_name TEXT,
  artist_name TEXT,
  dashboard_scope TEXT,
  dashboard_mode TEXT,
  dashboard_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS executive_studio_dashboard_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dashboard_name TEXT,
  studio_name TEXT,
  dashboard_scope TEXT,
  dashboard_mode TEXT,
  dashboard_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sample_clearance_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clearance_name TEXT,
  project_name TEXT,
  sample_scope TEXT,
  clearance_mode TEXT,
  clearance_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cue_sheet_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cue_name TEXT,
  project_name TEXT,
  cue_scope TEXT,
  delivery_mode TEXT,
  cue_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sync_licensing_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sync_name TEXT,
  project_name TEXT,
  sync_target TEXT,
  licensing_mode TEXT,
  sync_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_assistance_chat_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assistant_name TEXT,
  assistance_scope TEXT,
  target_platform TEXT,
  conversation_mode TEXT,
  assistant_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS star_creator_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_name TEXT,
  creator_scope TEXT,
  growth_mode TEXT,
  audience_path TEXT,
  profile_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS holo_journey_streaming_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  journey_name TEXT,
  project_name TEXT,
  streaming_scope TEXT,
  immersion_mode TEXT,
  journey_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO royalty_ledger_registry (ledger_name, project_name, royalty_scope, ledger_mode, ledger_status)
SELECT 'Primary Royalty Ledger','Primary Music Project','master+publishing','tracked','active'
WHERE NOT EXISTS (SELECT 1 FROM royalty_ledger_registry WHERE ledger_name='Primary Royalty Ledger');

INSERT INTO royalty_statement_registry (statement_name, project_name, statement_scope, payout_window, statement_status)
SELECT 'Primary Royalty Statement','Primary Music Project','artist+producer','quarterly','active'
WHERE NOT EXISTS (SELECT 1 FROM royalty_statement_registry WHERE statement_name='Primary Royalty Statement');

INSERT INTO artist_dashboard_registry (dashboard_name, artist_name, dashboard_scope, dashboard_mode, dashboard_status)
SELECT 'Primary Artist Dashboard','Primary Artist','music_career','premium','active'
WHERE NOT EXISTS (SELECT 1 FROM artist_dashboard_registry WHERE dashboard_name='Primary Artist Dashboard');

INSERT INTO executive_studio_dashboard_registry (dashboard_name, studio_name, dashboard_scope, dashboard_mode, dashboard_status)
SELECT 'Primary Executive Studio Dashboard','Primary Studio','hollywood+music','executive','active'
WHERE NOT EXISTS (SELECT 1 FROM executive_studio_dashboard_registry WHERE dashboard_name='Primary Executive Studio Dashboard');

INSERT INTO sample_clearance_registry (clearance_name, project_name, sample_scope, clearance_mode, clearance_status)
SELECT 'Primary Sample Clearance','Primary Music Project','sample_use','licensed','active'
WHERE NOT EXISTS (SELECT 1 FROM sample_clearance_registry WHERE clearance_name='Primary Sample Clearance');

INSERT INTO cue_sheet_registry (cue_name, project_name, cue_scope, delivery_mode, cue_status)
SELECT 'Primary Cue Sheet','Primary Movie Project','music_cues','network_delivery','active'
WHERE NOT EXISTS (SELECT 1 FROM cue_sheet_registry WHERE cue_name='Primary Cue Sheet');

INSERT INTO sync_licensing_registry (sync_name, project_name, sync_target, licensing_mode, sync_status)
SELECT 'Primary Sync License','Primary Music Project','film_tv_ads_games','executed','active'
WHERE NOT EXISTS (SELECT 1 FROM sync_licensing_registry WHERE sync_name='Primary Sync License');

INSERT INTO ai_assistance_chat_registry (assistant_name, assistance_scope, target_platform, conversation_mode, assistant_status)
SELECT 'AI Star Assistant','movie+music+streaming','full_platform','chat_help','active'
WHERE NOT EXISTS (SELECT 1 FROM ai_assistance_chat_registry WHERE assistant_name='AI Star Assistant');

INSERT INTO star_creator_registry (profile_name, creator_scope, growth_mode, audience_path, profile_status)
SELECT 'Anyone Can Be a Star','movie+music+streaming','guided_growth','global_creator_path','active'
WHERE NOT EXISTS (SELECT 1 FROM star_creator_registry WHERE profile_name='Anyone Can Be a Star');

INSERT INTO holo_journey_streaming_registry (journey_name, project_name, streaming_scope, immersion_mode, journey_status)
SELECT 'Primary Holo Journey','Primary Streaming Journey','immersive_streaming','holographic','active'
WHERE NOT EXISTS (SELECT 1 FROM holo_journey_streaming_registry WHERE journey_name='Primary Holo Journey');
SQL

echo "[OK] missing tables created and seeded"

python3 <<'PYEOF'
from pathlib import Path
import json, sqlite3

db = Path.home() / "aam_full_system" / "db" / "aam.db"
con = sqlite3.connect(db)
cur = con.cursor()

required = [
    "royalty_ledger_registry",
    "royalty_statement_registry",
    "artist_dashboard_registry",
    "executive_studio_dashboard_registry",
    "sample_clearance_registry",
    "cue_sheet_registry",
    "sync_licensing_registry",
    "ai_assistance_chat_registry",
    "star_creator_registry",
    "holo_journey_streaming_registry"
]

missing = [t for t in required if not cur.execute(
    "select name from sqlite_master where type='table' and name=?", (t,)
).fetchone()]

summary = {
    "required_count": len(required),
    "missing_count": len(missing),
    "missing_tables": missing,
    "repair_status": "stable" if not missing else "needs_attention"
}

Path.home().joinpath(
    "aam_full_system","snapshots","repair_missing_ai_star_holo_tables_summary_latest.json"
).write_text(json.dumps(summary, indent=2))

print(json.dumps(summary, indent=2))
con.close()
PYEOF

pkill -f "node .*dashboard.js" 2>/dev/null || true
pkill -f "apps/dashboard.js" 2>/dev/null || true
sleep 2
rm -f dashboard.pid

bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 5

curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_repair_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/command-center > "test_results/command_center_repair_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/streaming-hub > "test_results/streaming_hub_repair_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/support/ai-chat-safe > "test_results/ai_chat_repair_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/creator/star-safe > "test_results/star_creator_repair_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/streaming/holojourney-safe > "test_results/holo_journey_repair_${STAMP}.txt" || true

python3 <<PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*repair_{stamp}.txt")):
    txt = f.read_text(errors="ignore").lower()
    if "cannot get" in txt or "not found" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})

Path.home().joinpath(
    "aam_full_system","snapshots","repair_missing_ai_star_holo_tables_scan_latest.json"
).write_text(json.dumps(issues, indent=2))

print(f"[OK] repair scan complete: {len(issues)} issues")
PYEOF

bash scripts/status.sh || true

cat > "reports/repair_missing_ai_star_holo_tables_only_${STAMP}.txt" <<REPORT
REPAIR MISSING AI STAR HOLO TABLES ONLY REPORT
Timestamp: ${STAMP}

Fixed:
- royalty ledger registry
- royalty statement registry
- artist dashboard registry
- executive studio dashboard registry
- sample clearance registry
- cue sheet registry
- sync licensing registry
- ai assistance chat registry
- star creator registry
- holo journey streaming registry

Purpose:
- create the missing tables that were crashing the dashboard
- preserve current route wiring
- restore runtime safely
REPORT

echo "=== REPAIR MISSING AI + STAR + HOLO TABLES ONLY COMPLETE ==="
echo "Check:"
echo "  cat snapshots/repair_missing_ai_star_holo_tables_summary_latest.json"
echo "  cat snapshots/repair_missing_ai_star_holo_tables_scan_latest.json"
echo "  cat reports/repair_missing_ai_star_holo_tables_only_${STAMP}.txt"
echo "  bash scripts/status.sh"
