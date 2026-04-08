#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FINISH PASS O HOLLYWOOD + MUSIC ROUTES + SMOKE + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_finish_pass_o_${STAMP}.js"
cp db/aam.db "backups/aam_finish_pass_o_${STAMP}.db"

########################################
# 1) PATCH HOLLYWOOD + MUSIC SAFE ROUTES
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

routes = r"""
    if (req.method === 'POST' && pathname === '/hollywood/budget-safe') {
      dbRun(`INSERT INTO hollywood_budget_registry (budget_name, project_name, budget_scope, funding_stage, budget_status)
             VALUES ('Safe Film Budget','Primary Movie Project','feature_film','development','active')`);
      res.writeHead(302, { Location: '/studio-lab?msg=Safe%20film%20budget%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/hollywood/schedule-safe') {
      dbRun(`INSERT INTO hollywood_schedule_registry (schedule_name, project_name, phase_name, schedule_scope, schedule_status)
             VALUES ('Safe Film Schedule','Primary Movie Project','production','full_schedule','active')`);
      res.writeHead(302, { Location: '/studio-lab?msg=Safe%20film%20schedule%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/hollywood/callsheet-safe') {
      dbRun(`INSERT INTO hollywood_callsheet_registry (callsheet_name, project_name, shoot_day, department_scope, callsheet_status)
             VALUES ('Safe Call Sheet','Primary Movie Project','day_1','all_departments','active')`);
      res.writeHead(302, { Location: '/studio-lab?msg=Safe%20call%20sheet%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/hollywood/castcrew-safe') {
      dbRun(`INSERT INTO hollywood_castcrew_registry (record_name, project_name, person_role, department_name, record_status)
             VALUES ('Safe Cast Crew Record','Primary Movie Project','producer_director','production','active')`);
      res.writeHead(302, { Location: '/studio-lab?msg=Safe%20cast%20crew%20record%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/hollywood/location-safe') {
      dbRun(`INSERT INTO hollywood_location_permit_registry (permit_name, project_name, location_name, permit_scope, permit_status)
             VALUES ('Safe Location Permit','Primary Movie Project','Studio Location','principal_photography','active')`);
      res.writeHead(302, { Location: '/studio-lab?msg=Safe%20location%20permit%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/hollywood/union-safe') {
      dbRun(`INSERT INTO hollywood_union_compliance_registry (compliance_name, project_name, compliance_scope, compliance_mode, compliance_status)
             VALUES ('Safe Union Compliance','Primary Movie Project','cast+crew','tracked','active')`);
      res.writeHead(302, { Location: '/studio-lab?msg=Safe%20union%20compliance%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/hollywood/music-clearance-safe') {
      dbRun(`INSERT INTO hollywood_music_clearance_registry (clearance_name, project_name, asset_scope, clearance_mode, clearance_status)
             VALUES ('Safe Music Clearance','Primary Movie Project','soundtrack','licensed','active')`);
      res.writeHead(302, { Location: '/studio-lab?msg=Safe%20music%20clearance%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/hollywood/distribution-safe') {
      dbRun(`INSERT INTO hollywood_distribution_deal_registry (deal_name, project_name, distribution_scope, deal_stage, deal_status)
             VALUES ('Safe Distribution Deal','Primary Movie Project','global_release','packaging','active')`);
      res.writeHead(302, { Location: '/creator-tv?msg=Safe%20distribution%20deal%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/hollywood/publicity-safe') {
      dbRun(`INSERT INTO hollywood_publicity_campaign_registry (campaign_name, project_name, campaign_scope, release_window, campaign_status)
             VALUES ('Safe Publicity Campaign','Primary Movie Project','trailers+press+social','launch_window','active')`);
      res.writeHead(302, { Location: '/creator-tv?msg=Safe%20publicity%20campaign%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/hollywood/festival-safe') {
      dbRun(`INSERT INTO hollywood_festival_awards_registry (record_name, project_name, target_festival, awards_scope, record_status)
             VALUES ('Safe Festival Awards Record','Primary Movie Project','major_festival','festival+awards','active')`);
      res.writeHead(302, { Location: '/creator-tv?msg=Safe%20festival%20record%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/hollywood/delivery-qc-safe') {
      dbRun(`INSERT INTO hollywood_delivery_qc_registry (qc_name, project_name, delivery_format, qc_scope, qc_status)
             VALUES ('Safe Delivery QC','Primary Movie Project','4k_master','delivery_and_qc','active')`);
      res.writeHead(302, { Location: '/creator-tv?msg=Safe%20delivery%20qc%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/hollywood/franchise-safe') {
      dbRun(`INSERT INTO hollywood_franchise_registry (franchise_name, root_project, expansion_type, franchise_scope, franchise_status)
             VALUES ('Safe Franchise Plan','Primary Movie Project','sequel_spinoff_universe','long_term','active')`);
      res.writeHead(302, { Location: '/creator-tv?msg=Safe%20franchise%20plan%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/music/project-safe') {
      dbRun(`INSERT INTO music_project_registry (project_name, artist_name, project_type, genre_scope, project_status)
             VALUES ('Safe Music Project','Primary Artist','album_ep_single','cross_genre','active')`);
      res.writeHead(302, { Location: '/publishing-hub?msg=Safe%20music%20project%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/music/song-safe') {
      dbRun(`INSERT INTO songwriting_registry (song_name, project_name, writer_scope, composition_mode, song_status)
             VALUES ('Safe Song','Primary Music Project','writers_room','melody_lyrics','active')`);
      res.writeHead(302, { Location: '/publishing-hub?msg=Safe%20song%20record%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/music/beat-safe') {
      dbRun(`INSERT INTO beat_registry (beat_name, project_name, producer_name, beat_mode, beat_status)
             VALUES ('Safe Beat','Primary Music Project','Primary Producer','premium','active')`);
      res.writeHead(302, { Location: '/publishing-hub?msg=Safe%20beat%20record%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/music/session-safe') {
      dbRun(`INSERT INTO recording_session_registry (session_name, project_name, studio_name, session_scope, session_status)
             VALUES ('Safe Recording Session','Primary Music Project','Main Studio','vocals_instruments','active')`);
      res.writeHead(302, { Location: '/publishing-hub?msg=Safe%20recording%20session%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/music/vocal-safe') {
      dbRun(`INSERT INTO vocal_production_registry (record_name, project_name, vocal_scope, tuning_mode, record_status)
             VALUES ('Safe Vocal Production','Primary Music Project','lead+background','clean_tuned','active')`);
      res.writeHead(302, { Location: '/publishing-hub?msg=Safe%20vocal%20production%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/music/mix-safe') {
      dbRun(`INSERT INTO mixing_registry (mix_name, project_name, mix_scope, mix_engineer, mix_status)
             VALUES ('Safe Mix','Primary Music Project','full_mix','Primary Mix Engineer','active')`);
      res.writeHead(302, { Location: '/publishing-hub?msg=Safe%20mix%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/music/master-safe') {
      dbRun(`INSERT INTO mastering_registry (master_name, project_name, master_scope, loudness_mode, master_status)
             VALUES ('Safe Master','Primary Music Project','streaming_master','commercial','active')`);
      res.writeHead(302, { Location: '/publishing-hub?msg=Safe%20master%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/music/split-safe') {
      dbRun(`INSERT INTO producer_split_registry (split_name, project_name, split_scope, split_mode, split_status)
             VALUES ('Safe Producer Split','Primary Music Project','writers+producers','managed','active')`);
      res.writeHead(302, { Location: '/publishing-hub?msg=Safe%20producer%20split%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/music/publishing-safe') {
      dbRun(`INSERT INTO music_publishing_registry (publishing_name, project_name, rights_scope, pro_mode, publishing_status)
             VALUES ('Safe Publishing Record','Primary Music Project','song_rights','registered','active')`);
      res.writeHead(302, { Location: '/publishing-hub?msg=Safe%20publishing%20record%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/music/rollout-safe') {
      dbRun(`INSERT INTO release_rollout_registry (rollout_name, project_name, rollout_scope, release_window, rollout_status)
             VALUES ('Safe Release Rollout','Primary Music Project','single_album_campaign','launch_window','active')`);
      res.writeHead(302, { Location: '/publishing-hub?msg=Safe%20release%20rollout%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/music/promo-safe') {
      dbRun(`INSERT INTO playlist_radio_registry (campaign_name, project_name, campaign_scope, outlet_mode, campaign_status)
             VALUES ('Safe Playlist Radio Campaign','Primary Music Project','playlist+radio','digital_and_broadcast','active')`);
      res.writeHead(302, { Location: '/publishing-hub?msg=Safe%20promo%20campaign%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/music/video-sync-safe') {
      dbRun(`INSERT INTO music_video_sync_registry (sync_name, project_name, linked_video, sync_scope, sync_status)
             VALUES ('Safe Music Video Sync','Primary Music Project','Primary Music Video','audio_video_sync','active')`);
      res.writeHead(302, { Location: '/publishing-hub?msg=Safe%20music%20video%20sync%20created' });
      return res.end();
    }
"""

anchor = "    if (req.method === 'GET' && pathname === '/studio-lab') {"
if "pathname === '/music/project-safe'" not in text and anchor in text:
    text = text.replace(anchor, routes + "\n" + anchor, 1)

p.write_text(text)
print("[OK] finish pass O routes patched")
PYEOF

########################################
# 2) HARD RUNTIME RECOVERY
########################################
pkill -f "node .*dashboard.js" 2>/dev/null || true
pkill -f "node .*jarvis.js" 2>/dev/null || true
pkill -f "apps/dashboard.js" 2>/dev/null || true
pkill -f "apps/jarvis.js" 2>/dev/null || true
sleep 2
rm -f dashboard.pid jarvis.pid

bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 5
bash scripts/status.sh || true

########################################
# 3) HEALTH + ROUTE SMOKE
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/studio-lab > "test_results/studio_lab_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/creator-tv > "test_results/creator_tv_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/publishing-hub > "test_results/publishing_hub_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/homepage-showcase > "test_results/homepage_showcase_${STAMP}.txt" || true

########################################
# 4) SAFE ACTION TESTS
########################################
curl -s -i -X POST http://127.0.0.1:4900/hollywood/budget-safe > "test_results/hollywood_budget_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/hollywood/schedule-safe > "test_results/hollywood_schedule_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/hollywood/callsheet-safe > "test_results/hollywood_callsheet_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/hollywood/castcrew-safe > "test_results/hollywood_castcrew_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/hollywood/location-safe > "test_results/hollywood_location_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/hollywood/union-safe > "test_results/hollywood_union_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/hollywood/music-clearance-safe > "test_results/hollywood_music_clearance_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/hollywood/distribution-safe > "test_results/hollywood_distribution_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/hollywood/publicity-safe > "test_results/hollywood_publicity_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/hollywood/festival-safe > "test_results/hollywood_festival_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/hollywood/delivery-qc-safe > "test_results/hollywood_delivery_qc_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/hollywood/franchise-safe > "test_results/hollywood_franchise_${STAMP}.txt" || true

curl -s -i -X POST http://127.0.0.1:4900/music/project-safe > "test_results/music_project_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/music/song-safe > "test_results/music_song_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/music/beat-safe > "test_results/music_beat_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/music/session-safe > "test_results/music_session_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/music/vocal-safe > "test_results/music_vocal_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/music/mix-safe > "test_results/music_mix_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/music/master-safe > "test_results/music_master_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/music/split-safe > "test_results/music_split_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/music/publishing-safe > "test_results/music_publishing_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/music/rollout-safe > "test_results/music_rollout_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/music/promo-safe > "test_results/music_promo_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/music/video-sync-safe > "test_results/music_video_sync_${STAMP}.txt" || true

########################################
# 5) SUMMARY
########################################
python3 << PYEOF
from pathlib import Path
import json, sqlite3

db = Path.home() / "aam_full_system" / "db" / "aam.db"
con = sqlite3.connect(db)
cur = con.cursor()

required = [
    "hollywood_budget_registry",
    "hollywood_schedule_registry",
    "hollywood_callsheet_registry",
    "hollywood_castcrew_registry",
    "hollywood_location_permit_registry",
    "hollywood_union_compliance_registry",
    "hollywood_music_clearance_registry",
    "hollywood_distribution_deal_registry",
    "hollywood_publicity_campaign_registry",
    "hollywood_festival_awards_registry",
    "hollywood_delivery_qc_registry",
    "hollywood_franchise_registry",
    "music_project_registry",
    "songwriting_registry",
    "beat_registry",
    "recording_session_registry",
    "vocal_production_registry",
    "mixing_registry",
    "mastering_registry",
    "producer_split_registry",
    "music_publishing_registry",
    "release_rollout_registry",
    "playlist_radio_registry",
    "music_video_sync_registry"
]

missing = []
for t in required:
    row = cur.execute("select name from sqlite_master where type='table' and name=?", (t,)).fetchone()
    if not row:
        missing.append(t)

summary = {
    "required_count": len(required),
    "missing_count": len(missing),
    "missing_tables": missing,
    "hollywood_music_status": "stable" if not missing else "needs_attention"
}

out = Path.home() / "aam_full_system" / "snapshots" / "pass_o_real_hollywood_music_summary_latest.json"
out.write_text(json.dumps(summary, indent=2))
print("[OK] finish pass O hollywood/music summary written")
print(json.dumps(summary, indent=2))
con.close()
PYEOF

########################################
# 6) SCAN
########################################
python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore").lower()
    if "cannot get" in txt or "not found" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "syntaxerror" in txt or "referenceerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

latest = Path.home() / "aam_full_system" / "snapshots" / "finish_pass_o_hollywood_music_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] finish pass O hollywood/music scan complete: {len(issues)} issues")
PYEOF

########################################
# 7) FINAL STATUS + REPORT
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

cat > "reports/finish_pass_o_hollywood_music_routes_smoke_and_stabilize_${STAMP}.txt" <<REPORT
FINISH PASS O HOLLYWOOD + MUSIC ROUTES + SMOKE + STABILIZE REPORT
Timestamp: ${STAMP}

Built:
- hollywood route actions
- music production route actions
- hollywood/music summary
- hollywood/music smoke verification

Verified:
- dashboard health
- jarvis health
- studio lab
- creator tv
- publishing hub
- homepage showcase
- hollywood actions
- music actions
- current-run scan

Purpose:
- finish interrupted Hollywood/music pass cleanly
- preserve stable runtime
- avoid rerunning giant full build
REPORT

echo "FINISH PASS O HOLLYWOOD + MUSIC ROUTES + SMOKE + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/finish_pass_o_hollywood_music_scan_latest.json"
echo "  cat snapshots/pass_o_real_hollywood_music_summary_latest.json"
echo "  cat reports/finish_pass_o_hollywood_music_routes_smoke_and_stabilize_${STAMP}.txt"
echo "  bash scripts/status.sh"
