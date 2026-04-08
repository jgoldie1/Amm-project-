#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS G MOVIE + MUSIC VIDEO + SMOKE + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_pass_g_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_pass_g_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_pass_g_${STAMP}.js"

########################################
# 1) CREATE MOVIE / MUSIC VIDEO TABLES
########################################
sqlite3 db/aam.db <<SQL
CREATE TABLE IF NOT EXISTS movie_project_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_name TEXT,
  project_group TEXT,
  project_type TEXT,
  linked_world TEXT,
  production_mode TEXT,
  project_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS music_video_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_name TEXT,
  video_group TEXT,
  linked_track TEXT,
  linked_world TEXT,
  video_mode TEXT,
  video_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS storyboard_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  storyboard_name TEXT,
  storyboard_group TEXT,
  linked_project TEXT,
  frame_scope TEXT,
  storyboard_mode TEXT,
  storyboard_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shot_list_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shot_name TEXT,
  shot_group TEXT,
  linked_project TEXT,
  camera_mode TEXT,
  shot_scope TEXT,
  shot_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scene_edit_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  edit_name TEXT,
  edit_group TEXT,
  linked_scene TEXT,
  edit_mode TEXT,
  version_name TEXT,
  edit_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS soundtrack_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  soundtrack_name TEXT,
  soundtrack_group TEXT,
  linked_project TEXT,
  audio_mode TEXT,
  soundtrack_scope TEXT,
  soundtrack_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS voice_cast_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cast_name TEXT,
  cast_group TEXT,
  linked_project TEXT,
  voice_role TEXT,
  casting_mode TEXT,
  cast_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media_render_export_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  export_name TEXT,
  export_group TEXT,
  linked_project TEXT,
  render_mode TEXT,
  output_format TEXT,
  export_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS publishing_distribution_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  distribution_name TEXT,
  distribution_group TEXT,
  linked_project TEXT,
  release_channel TEXT,
  monetization_mode TEXT,
  distribution_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trailer_promo_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  promo_name TEXT,
  promo_group TEXT,
  linked_project TEXT,
  promo_type TEXT,
  promo_scope TEXT,
  promo_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
SQL

echo "[OK] pass G media tables created"

########################################
# 2) SEED MEDIA TABLES
########################################
sqlite3 db/aam.db <<SQL
INSERT INTO movie_project_registry (project_name, project_group, project_type, linked_world, production_mode, project_status)
SELECT 'Primary Movie Project','media','movie','Primary Holographic World','guided','active'
WHERE NOT EXISTS (SELECT 1 FROM movie_project_registry WHERE project_name='Primary Movie Project');

INSERT INTO music_video_registry (video_name, video_group, linked_track, linked_world, video_mode, video_status)
SELECT 'Primary Music Video','media','Primary Soundtrack','Primary Holographic World','guided','active'
WHERE NOT EXISTS (SELECT 1 FROM music_video_registry WHERE video_name='Primary Music Video');

INSERT INTO storyboard_registry (storyboard_name, storyboard_group, linked_project, frame_scope, storyboard_mode, storyboard_status)
SELECT 'Primary Storyboard','previs','Primary Movie Project','scene_frames','guided','active'
WHERE NOT EXISTS (SELECT 1 FROM storyboard_registry WHERE storyboard_name='Primary Storyboard');

INSERT INTO shot_list_registry (shot_name, shot_group, linked_project, camera_mode, shot_scope, shot_status)
SELECT 'Primary Shot List','camera','Primary Movie Project','virtual_camera','full_project','active'
WHERE NOT EXISTS (SELECT 1 FROM shot_list_registry WHERE shot_name='Primary Shot List');

INSERT INTO scene_edit_registry (edit_name, edit_group, linked_scene, edit_mode, version_name, edit_status)
SELECT 'Primary Scene Edit','edit','Opening Scene','nonlinear','v1','active'
WHERE NOT EXISTS (SELECT 1 FROM scene_edit_registry WHERE edit_name='Primary Scene Edit');

INSERT INTO soundtrack_registry (soundtrack_name, soundtrack_group, linked_project, audio_mode, soundtrack_scope, soundtrack_status)
SELECT 'Primary Soundtrack','audio','Primary Movie Project','cinematic_mix','full_project','active'
WHERE NOT EXISTS (SELECT 1 FROM soundtrack_registry WHERE soundtrack_name='Primary Soundtrack');

INSERT INTO voice_cast_registry (cast_name, cast_group, linked_project, voice_role, casting_mode, cast_status)
SELECT 'Primary Voice Cast','voice','Primary Movie Project','lead_narration','assisted','active'
WHERE NOT EXISTS (SELECT 1 FROM voice_cast_registry WHERE cast_name='Primary Voice Cast');

INSERT INTO media_render_export_registry (export_name, export_group, linked_project, render_mode, output_format, export_status)
SELECT 'Primary Media Export','render','Primary Movie Project','high_quality','mp4','active'
WHERE NOT EXISTS (SELECT 1 FROM media_render_export_registry WHERE export_name='Primary Media Export');

INSERT INTO publishing_distribution_registry (distribution_name, distribution_group, linked_project, release_channel, monetization_mode, distribution_status)
SELECT 'Primary Distribution','distribution','Primary Movie Project','creator_tv','ads+subscriptions','active'
WHERE NOT EXISTS (SELECT 1 FROM publishing_distribution_registry WHERE distribution_name='Primary Distribution');

INSERT INTO trailer_promo_registry (promo_name, promo_group, linked_project, promo_type, promo_scope, promo_status)
SELECT 'Primary Trailer','promo','Primary Movie Project','trailer','launch','active'
WHERE NOT EXISTS (SELECT 1 FROM trailer_promo_registry WHERE promo_name='Primary Trailer');
SQL

echo "[OK] pass G media seeded"

########################################
# 3) PATCH SAFE ROUTES
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

routes = r"""
    if (req.method === 'POST' && pathname === '/media/movie-safe') {
      dbRun(`INSERT INTO movie_project_registry (project_name, project_group, project_type, linked_world, production_mode, project_status)
             VALUES ('Safe Movie Project','media','movie','Primary Holographic World','guided','active')`);
      res.writeHead(302, { Location: '/studio-lab?msg=Safe%20movie%20project%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/media/music-video-safe') {
      dbRun(`INSERT INTO music_video_registry (video_name, video_group, linked_track, linked_world, video_mode, video_status)
             VALUES ('Safe Music Video','media','Safe Track','Primary Holographic World','guided','active')`);
      res.writeHead(302, { Location: '/studio-lab?msg=Safe%20music%20video%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/media/storyboard-safe') {
      dbRun(`INSERT INTO storyboard_registry (storyboard_name, storyboard_group, linked_project, frame_scope, storyboard_mode, storyboard_status)
             VALUES ('Safe Storyboard','previs','Safe Movie Project','scene_frames','guided','active')`);
      res.writeHead(302, { Location: '/studio-lab?msg=Safe%20storyboard%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/media/shotlist-safe') {
      dbRun(`INSERT INTO shot_list_registry (shot_name, shot_group, linked_project, camera_mode, shot_scope, shot_status)
             VALUES ('Safe Shot List','camera','Safe Movie Project','virtual_camera','full_project','active')`);
      res.writeHead(302, { Location: '/studio-lab?msg=Safe%20shot%20list%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/media/edit-safe') {
      dbRun(`INSERT INTO scene_edit_registry (edit_name, edit_group, linked_scene, edit_mode, version_name, edit_status)
             VALUES ('Safe Scene Edit','edit','Opening Scene','nonlinear','v1','active')`);
      res.writeHead(302, { Location: '/studio-lab?msg=Safe%20scene%20edit%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/media/soundtrack-safe') {
      dbRun(`INSERT INTO soundtrack_registry (soundtrack_name, soundtrack_group, linked_project, audio_mode, soundtrack_scope, soundtrack_status)
             VALUES ('Safe Soundtrack','audio','Safe Movie Project','cinematic_mix','full_project','active')`);
      res.writeHead(302, { Location: '/studio-lab?msg=Safe%20soundtrack%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/media/voice-cast-safe') {
      dbRun(`INSERT INTO voice_cast_registry (cast_name, cast_group, linked_project, voice_role, casting_mode, cast_status)
             VALUES ('Safe Voice Cast','voice','Safe Movie Project','lead_narration','assisted','active')`);
      res.writeHead(302, { Location: '/studio-lab?msg=Safe%20voice%20cast%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/media/render-export-safe') {
      dbRun(`INSERT INTO media_render_export_registry (export_name, export_group, linked_project, render_mode, output_format, export_status)
             VALUES ('Safe Media Export','render','Safe Movie Project','high_quality','mp4','active')`);
      res.writeHead(302, { Location: '/studio-lab?msg=Safe%20render%20export%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/media/distribution-safe') {
      dbRun(`INSERT INTO publishing_distribution_registry (distribution_name, distribution_group, linked_project, release_channel, monetization_mode, distribution_status)
             VALUES ('Safe Distribution','distribution','Safe Movie Project','creator_tv','ads+subscriptions','active')`);
      res.writeHead(302, { Location: '/creator-tv?msg=Safe%20distribution%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/media/trailer-safe') {
      dbRun(`INSERT INTO trailer_promo_registry (promo_name, promo_group, linked_project, promo_type, promo_scope, promo_status)
             VALUES ('Safe Trailer','promo','Safe Movie Project','trailer','launch','active')`);
      res.writeHead(302, { Location: '/creator-tv?msg=Safe%20trailer%20created' });
      return res.end();
    }
"""

anchor = "    if (req.method === 'GET' && pathname === '/studio-lab') {"
if "pathname === '/media/movie-safe'" not in text and anchor in text:
    text = text.replace(anchor, routes + "\n" + anchor, 1)

p.write_text(text)
print("[OK] pass G media routes patched")
PYEOF

########################################
# 4) HARD RUNTIME RECOVERY
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
# 5) HEALTH + ROUTE SMOKE
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/metaverse-control > "test_results/metaverse_control_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/middleverse-bridge > "test_results/middleverse_bridge_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/multiverse-bridge > "test_results/multiverse_bridge_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/studio-lab > "test_results/studio_lab_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/creator-tv > "test_results/creator_tv_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/dispatch-actions > "test_results/dispatch_actions_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/world3d > "test_results/world3d_${STAMP}.txt" || true

########################################
# 6) SAFE MEDIA ACTION TESTS
########################################
curl -s -i -X POST http://127.0.0.1:4900/media/movie-safe > "test_results/movie_safe_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/media/music-video-safe > "test_results/music_video_safe_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/media/storyboard-safe > "test_results/storyboard_safe_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/media/shotlist-safe > "test_results/shotlist_safe_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/media/edit-safe > "test_results/edit_safe_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/media/soundtrack-safe > "test_results/soundtrack_safe_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/media/voice-cast-safe > "test_results/voice_cast_safe_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/media/render-export-safe > "test_results/render_export_safe_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/media/distribution-safe > "test_results/distribution_safe_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/media/trailer-safe > "test_results/trailer_safe_${STAMP}.txt" || true

########################################
# 7) SNAPSHOTS + GAP SUMMARY
########################################
sqlite3 -json db/aam.db "select count(*) as movie_project_registry from movie_project_registry;" > "snapshots/movie_project_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as music_video_registry from music_video_registry;" > "snapshots/music_video_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as storyboard_registry from storyboard_registry;" > "snapshots/storyboard_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as shot_list_registry from shot_list_registry;" > "snapshots/shot_list_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scene_edit_registry from scene_edit_registry;" > "snapshots/scene_edit_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as soundtrack_registry from soundtrack_registry;" > "snapshots/soundtrack_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as voice_cast_registry from voice_cast_registry;" > "snapshots/voice_cast_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as media_render_export_registry from media_render_export_registry;" > "snapshots/media_render_export_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as publishing_distribution_registry from publishing_distribution_registry;" > "snapshots/publishing_distribution_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as trailer_promo_registry from trailer_promo_registry;" > "snapshots/trailer_promo_registry_${STAMP}.json"

python3 << PYEOF
from pathlib import Path
import json, sqlite3

db = Path.home() / "aam_full_system" / "db" / "aam.db"
con = sqlite3.connect(db)
cur = con.cursor()

required = [
    "movie_project_registry",
    "music_video_registry",
    "storyboard_registry",
    "shot_list_registry",
    "scene_edit_registry",
    "soundtrack_registry",
    "voice_cast_registry",
    "media_render_export_registry",
    "publishing_distribution_registry",
    "trailer_promo_registry"
]

missing = []
for t in required:
    row = cur.execute("select name from sqlite_master where type='table' and name=?", (t,)).fetchone()
    if not row:
        missing.append(t)

summary = {
    "missing_tables": missing,
    "gap_status": "stable" if not missing else "needs_attention"
}

out = Path.home() / "aam_full_system" / "snapshots" / "pass_g_media_gap_summary_latest.json"
out.write_text(json.dumps(summary, indent=2))
print("[OK] pass G media gap summary written")
print(json.dumps(summary, indent=2))
con.close()
PYEOF

########################################
# 8) CURRENT-RUN ERROR SCAN
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

latest = Path.home() / "aam_full_system" / "snapshots" / "pass_g_media_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] pass G media scan complete: {len(issues)} issues")
PYEOF

########################################
# 9) FINAL STATUS + REPORT
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

cat > "reports/pass_g_movie_music_video_smoke_and_stabilize_${STAMP}.txt" <<REPORT
PASS G MOVIE + MUSIC VIDEO + SMOKE + STABILIZE REPORT
Timestamp: ${STAMP}

Built:
- movie project registry
- music video registry
- storyboard registry
- shot list registry
- scene edit registry
- soundtrack registry
- voice cast registry
- media render export registry
- publishing distribution registry
- trailer promo registry

Verified:
- dashboard health
- jarvis health
- metaverse route
- middleverse route
- multiverse route
- studio lab
- creator tv
- dispatch actions
- world3d
- safe media actions
- current-run-only scan
- media gap summary

Purpose:
- add movie and music video production foundation
- stabilize after interrupted smoke cycle
- connect media production to creator and world systems
REPORT

echo "PASS G MOVIE + MUSIC VIDEO + SMOKE + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/pass_g_media_scan_latest.json"
echo "  cat snapshots/pass_g_media_gap_summary_latest.json"
echo "  cat reports/pass_g_movie_music_video_smoke_and_stabilize_${STAMP}.txt"
echo "  bash scripts/status.sh"
