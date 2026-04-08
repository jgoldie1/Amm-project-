#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

echo "=== BUILD MISSING 24 HOLLYWOOD + MUSIC TABLES START ==="
cp db/aam.db "backups/aam_build_missing_24_${STAMP}.db"

sqlite3 db/aam.db <<'SQL'
CREATE TABLE IF NOT EXISTS hollywood_budget_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  budget_name TEXT,
  project_name TEXT,
  budget_scope TEXT,
  funding_stage TEXT,
  budget_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS hollywood_schedule_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  schedule_name TEXT,
  project_name TEXT,
  phase_name TEXT,
  schedule_scope TEXT,
  schedule_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS hollywood_callsheet_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  callsheet_name TEXT,
  project_name TEXT,
  shoot_day TEXT,
  department_scope TEXT,
  callsheet_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS hollywood_castcrew_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_name TEXT,
  project_name TEXT,
  person_role TEXT,
  department_name TEXT,
  record_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS hollywood_location_permit_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  permit_name TEXT,
  project_name TEXT,
  location_name TEXT,
  permit_scope TEXT,
  permit_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS hollywood_union_compliance_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  compliance_name TEXT,
  project_name TEXT,
  compliance_scope TEXT,
  compliance_mode TEXT,
  compliance_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS hollywood_music_clearance_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clearance_name TEXT,
  project_name TEXT,
  asset_scope TEXT,
  clearance_mode TEXT,
  clearance_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS hollywood_distribution_deal_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_name TEXT,
  project_name TEXT,
  distribution_scope TEXT,
  deal_stage TEXT,
  deal_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS hollywood_publicity_campaign_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_name TEXT,
  project_name TEXT,
  campaign_scope TEXT,
  release_window TEXT,
  campaign_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS hollywood_festival_awards_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_name TEXT,
  project_name TEXT,
  target_festival TEXT,
  awards_scope TEXT,
  record_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS hollywood_delivery_qc_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  qc_name TEXT,
  project_name TEXT,
  delivery_format TEXT,
  qc_scope TEXT,
  qc_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS hollywood_franchise_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  franchise_name TEXT,
  root_project TEXT,
  expansion_type TEXT,
  franchise_scope TEXT,
  franchise_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS music_project_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_name TEXT,
  artist_name TEXT,
  project_type TEXT,
  genre_scope TEXT,
  project_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS songwriting_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  song_name TEXT,
  project_name TEXT,
  writer_scope TEXT,
  composition_mode TEXT,
  song_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS beat_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  beat_name TEXT,
  project_name TEXT,
  producer_name TEXT,
  beat_mode TEXT,
  beat_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS recording_session_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_name TEXT,
  project_name TEXT,
  studio_name TEXT,
  session_scope TEXT,
  session_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS vocal_production_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_name TEXT,
  project_name TEXT,
  vocal_scope TEXT,
  tuning_mode TEXT,
  record_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS mixing_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mix_name TEXT,
  project_name TEXT,
  mix_scope TEXT,
  mix_engineer TEXT,
  mix_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS mastering_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  master_name TEXT,
  project_name TEXT,
  master_scope TEXT,
  loudness_mode TEXT,
  master_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS producer_split_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  split_name TEXT,
  project_name TEXT,
  split_scope TEXT,
  split_mode TEXT,
  split_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_publishing_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  publishing_name TEXT,
  project_name TEXT,
  rights_scope TEXT,
  pro_mode TEXT,
  publishing_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS release_rollout_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rollout_name TEXT,
  project_name TEXT,
  rollout_scope TEXT,
  release_window TEXT,
  rollout_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS playlist_radio_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_name TEXT,
  project_name TEXT,
  campaign_scope TEXT,
  outlet_mode TEXT,
  campaign_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS music_video_sync_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sync_name TEXT,
  project_name TEXT,
  linked_video TEXT,
  sync_scope TEXT,
  sync_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO hollywood_budget_registry (budget_name, project_name, budget_scope, funding_stage, budget_status)
SELECT 'Primary Film Budget','Primary Movie Project','feature_film','development','active'
WHERE NOT EXISTS (SELECT 1 FROM hollywood_budget_registry WHERE budget_name='Primary Film Budget');

INSERT INTO hollywood_schedule_registry (schedule_name, project_name, phase_name, schedule_scope, schedule_status)
SELECT 'Primary Film Schedule','Primary Movie Project','production','full_schedule','active'
WHERE NOT EXISTS (SELECT 1 FROM hollywood_schedule_registry WHERE schedule_name='Primary Film Schedule');

INSERT INTO hollywood_callsheet_registry (callsheet_name, project_name, shoot_day, department_scope, callsheet_status)
SELECT 'Primary Call Sheet','Primary Movie Project','day_1','all_departments','active'
WHERE NOT EXISTS (SELECT 1 FROM hollywood_callsheet_registry WHERE callsheet_name='Primary Call Sheet');

INSERT INTO hollywood_castcrew_registry (record_name, project_name, person_role, department_name, record_status)
SELECT 'Primary Cast Crew Record','Primary Movie Project','producer_director','production','active'
WHERE NOT EXISTS (SELECT 1 FROM hollywood_castcrew_registry WHERE record_name='Primary Cast Crew Record');

INSERT INTO hollywood_location_permit_registry (permit_name, project_name, location_name, permit_scope, permit_status)
SELECT 'Primary Location Permit','Primary Movie Project','Studio Location','principal_photography','active'
WHERE NOT EXISTS (SELECT 1 FROM hollywood_location_permit_registry WHERE permit_name='Primary Location Permit');

INSERT INTO hollywood_union_compliance_registry (compliance_name, project_name, compliance_scope, compliance_mode, compliance_status)
SELECT 'Primary Union Compliance','Primary Movie Project','cast+crew','tracked','active'
WHERE NOT EXISTS (SELECT 1 FROM hollywood_union_compliance_registry WHERE compliance_name='Primary Union Compliance');

INSERT INTO hollywood_music_clearance_registry (clearance_name, project_name, asset_scope, clearance_mode, clearance_status)
SELECT 'Primary Music Clearance','Primary Movie Project','soundtrack','licensed','active'
WHERE NOT EXISTS (SELECT 1 FROM hollywood_music_clearance_registry WHERE clearance_name='Primary Music Clearance');

INSERT INTO hollywood_distribution_deal_registry (deal_name, project_name, distribution_scope, deal_stage, deal_status)
SELECT 'Primary Distribution Deal','Primary Movie Project','global_release','packaging','active'
WHERE NOT EXISTS (SELECT 1 FROM hollywood_distribution_deal_registry WHERE deal_name='Primary Distribution Deal');

INSERT INTO hollywood_publicity_campaign_registry (campaign_name, project_name, campaign_scope, release_window, campaign_status)
SELECT 'Primary Publicity Campaign','Primary Movie Project','trailers+press+social','launch_window','active'
WHERE NOT EXISTS (SELECT 1 FROM hollywood_publicity_campaign_registry WHERE campaign_name='Primary Publicity Campaign');

INSERT INTO hollywood_festival_awards_registry (record_name, project_name, target_festival, awards_scope, record_status)
SELECT 'Primary Festival Awards Record','Primary Movie Project','major_festival','festival+awards','active'
WHERE NOT EXISTS (SELECT 1 FROM hollywood_festival_awards_registry WHERE record_name='Primary Festival Awards Record');

INSERT INTO hollywood_delivery_qc_registry (qc_name, project_name, delivery_format, qc_scope, qc_status)
SELECT 'Primary Delivery QC','Primary Movie Project','4k_master','delivery_and_qc','active'
WHERE NOT EXISTS (SELECT 1 FROM hollywood_delivery_qc_registry WHERE qc_name='Primary Delivery QC');

INSERT INTO hollywood_franchise_registry (franchise_name, root_project, expansion_type, franchise_scope, franchise_status)
SELECT 'Primary Franchise Plan','Primary Movie Project','sequel_spinoff_universe','long_term','active'
WHERE NOT EXISTS (SELECT 1 FROM hollywood_franchise_registry WHERE franchise_name='Primary Franchise Plan');

INSERT INTO music_project_registry (project_name, artist_name, project_type, genre_scope, project_status)
SELECT 'Primary Music Project','Primary Artist','album_ep_single','cross_genre','active'
WHERE NOT EXISTS (SELECT 1 FROM music_project_registry WHERE project_name='Primary Music Project');

INSERT INTO songwriting_registry (song_name, project_name, writer_scope, composition_mode, song_status)
SELECT 'Primary Song','Primary Music Project','writers_room','melody_lyrics','active'
WHERE NOT EXISTS (SELECT 1 FROM songwriting_registry WHERE song_name='Primary Song');

INSERT INTO beat_registry (beat_name, project_name, producer_name, beat_mode, beat_status)
SELECT 'Primary Beat','Primary Music Project','Primary Producer','premium','active'
WHERE NOT EXISTS (SELECT 1 FROM beat_registry WHERE beat_name='Primary Beat');

INSERT INTO recording_session_registry (session_name, project_name, studio_name, session_scope, session_status)
SELECT 'Primary Recording Session','Primary Music Project','Main Studio','vocals_instruments','active'
WHERE NOT EXISTS (SELECT 1 FROM recording_session_registry WHERE session_name='Primary Recording Session');

INSERT INTO vocal_production_registry (record_name, project_name, vocal_scope, tuning_mode, record_status)
SELECT 'Primary Vocal Production','Primary Music Project','lead+background','clean_tuned','active'
WHERE NOT EXISTS (SELECT 1 FROM vocal_production_registry WHERE record_name='Primary Vocal Production');

INSERT INTO mixing_registry (mix_name, project_name, mix_scope, mix_engineer, mix_status)
SELECT 'Primary Mix','Primary Music Project','full_mix','Primary Mix Engineer','active'
WHERE NOT EXISTS (SELECT 1 FROM mixing_registry WHERE mix_name='Primary Mix');

INSERT INTO mastering_registry (master_name, project_name, master_scope, loudness_mode, master_status)
SELECT 'Primary Master','Primary Music Project','streaming_master','commercial','active'
WHERE NOT EXISTS (SELECT 1 FROM mastering_registry WHERE master_name='Primary Master');

INSERT INTO producer_split_registry (split_name, project_name, split_scope, split_mode, split_status)
SELECT 'Primary Producer Split','Primary Music Project','writers+producers','managed','active'
WHERE NOT EXISTS (SELECT 1 FROM producer_split_registry WHERE split_name='Primary Producer Split');

INSERT INTO music_publishing_registry (publishing_name, project_name, rights_scope, pro_mode, publishing_status)
SELECT 'Primary Publishing Record','Primary Music Project','song_rights','registered','active'
WHERE NOT EXISTS (SELECT 1 FROM music_publishing_registry WHERE publishing_name='Primary Publishing Record');

INSERT INTO release_rollout_registry (rollout_name, project_name, rollout_scope, release_window, rollout_status)
SELECT 'Primary Release Rollout','Primary Music Project','single_album_campaign','launch_window','active'
WHERE NOT EXISTS (SELECT 1 FROM release_rollout_registry WHERE rollout_name='Primary Release Rollout');

INSERT INTO playlist_radio_registry (campaign_name, project_name, campaign_scope, outlet_mode, campaign_status)
SELECT 'Primary Playlist Radio Campaign','Primary Music Project','playlist+radio','digital_and_broadcast','active'
WHERE NOT EXISTS (SELECT 1 FROM playlist_radio_registry WHERE campaign_name='Primary Playlist Radio Campaign');

INSERT INTO music_video_sync_registry (sync_name, project_name, linked_video, sync_scope, sync_status)
SELECT 'Primary Music Video Sync','Primary Music Project','Primary Music Video','audio_video_sync','active'
WHERE NOT EXISTS (SELECT 1 FROM music_video_sync_registry WHERE sync_name='Primary Music Video Sync');
SQL

echo "[OK] missing 24 tables created and seeded"

python3 <<'PYEOF'
from pathlib import Path
import json, sqlite3
db = Path.home() / "aam_full_system" / "db" / "aam.db"
con = sqlite3.connect(db)
cur = con.cursor()
required = [
    "hollywood_budget_registry","hollywood_schedule_registry","hollywood_callsheet_registry","hollywood_castcrew_registry",
    "hollywood_location_permit_registry","hollywood_union_compliance_registry","hollywood_music_clearance_registry",
    "hollywood_distribution_deal_registry","hollywood_publicity_campaign_registry","hollywood_festival_awards_registry",
    "hollywood_delivery_qc_registry","hollywood_franchise_registry","music_project_registry","songwriting_registry",
    "beat_registry","recording_session_registry","vocal_production_registry","mixing_registry","mastering_registry",
    "producer_split_registry","music_publishing_registry","release_rollout_registry","playlist_radio_registry",
    "music_video_sync_registry"
]
missing = [t for t in required if not cur.execute("select name from sqlite_master where type='table' and name=?", (t,)).fetchone()]
summary = {
    "required_count": len(required),
    "missing_count": len(missing),
    "missing_tables": missing,
    "build_missing_24_status": "stable" if not missing else "needs_attention"
}
Path.home().joinpath("aam_full_system","snapshots","build_missing_24_hollywood_music_tables_summary_latest.json").write_text(json.dumps(summary, indent=2))
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

curl -s -i http://127.0.0.1:4900/health > "test_results/build_missing_24_dashboard_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/studio-lab > "test_results/build_missing_24_studio_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/creator-tv > "test_results/build_missing_24_creator_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/publishing-hub > "test_results/build_missing_24_publishing_${STAMP}.txt" || true

python3 <<PYEOF
from pathlib import Path
import json
stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []
for f in sorted(root.glob(f"build_missing_24_*_{stamp}.txt")):
    txt = f.read_text(errors="ignore").lower()
    if "cannot get" in txt or "not found" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "dashboard" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
Path.home().joinpath("aam_full_system","snapshots","build_missing_24_hollywood_music_tables_scan_latest.json").write_text(json.dumps(issues, indent=2))
print(f"[OK] build-missing-24 scan complete: {len(issues)} issues")
PYEOF

bash scripts/status.sh || true

cat > "reports/build_missing_24_hollywood_music_tables_${STAMP}.txt" <<REPORT
BUILD MISSING 24 HOLLYWOOD MUSIC TABLES REPORT
Timestamp: ${STAMP}

Purpose:
- create the remaining Hollywood and music production tables
- seed the missing production stack
- preserve stable runtime
REPORT

echo "=== BUILD MISSING 24 HOLLYWOOD + MUSIC TABLES COMPLETE ==="
echo "Check:"
echo "  cat snapshots/build_missing_24_hollywood_music_tables_summary_latest.json"
echo "  cat snapshots/build_missing_24_hollywood_music_tables_scan_latest.json"
echo "  cat reports/build_missing_24_hollywood_music_tables_${STAMP}.txt"
echo "  bash scripts/status.sh"
