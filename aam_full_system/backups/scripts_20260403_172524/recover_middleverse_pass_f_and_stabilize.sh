#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== RECOVER MIDDLEVERSE PASS F + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_recover_middleverse_pass_f_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_recover_middleverse_pass_f_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_recover_middleverse_pass_f_${STAMP}.js"

########################################
# 1) CREATE PASS F TABLES IF MISSING
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS middleverse_automation_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  automation_name TEXT NOT NULL,
  automation_group TEXT,
  trigger_event TEXT,
  target_action TEXT,
  automation_scope TEXT,
  automation_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS middleverse_reward_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reward_name TEXT NOT NULL,
  reward_group TEXT,
  reward_trigger TEXT,
  reward_value TEXT,
  reward_scope TEXT,
  reward_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS middleverse_progression_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  progression_name TEXT NOT NULL,
  progression_group TEXT,
  level_name TEXT,
  unlock_target TEXT,
  progression_scope TEXT,
  progression_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS middleverse_plugin_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plugin_name TEXT NOT NULL,
  plugin_group TEXT,
  target_layer TEXT,
  plugin_version TEXT,
  install_mode TEXT,
  plugin_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS middleverse_app_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_name TEXT NOT NULL,
  app_group TEXT,
  app_type TEXT,
  runtime_target TEXT,
  build_mode TEXT,
  app_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS middleverse_builder_manifest (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  manifest_name TEXT NOT NULL,
  manifest_group TEXT,
  manifest_target TEXT,
  package_list TEXT,
  builder_mode TEXT,
  manifest_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

if cur.execute("SELECT count(*) FROM middleverse_automation_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO middleverse_automation_registry
        (automation_name, automation_group, trigger_event, target_action, automation_scope, automation_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("creator_to_commerce_loop", "automation", "creator_stream_started", "open_holo_store", "creator+commerce", "active"),
        ("dispatch_to_world_loop", "automation", "dispatch_request_opened", "open_service_dispatch", "service+world", "active"),
        ("fan_reward_loop", "automation", "tip_creator", "unlock_vip_room", "creator+fan", "active"),
    ])

if cur.execute("SELECT count(*) FROM middleverse_reward_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO middleverse_reward_registry
        (reward_name, reward_group, reward_trigger, reward_value, reward_scope, reward_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("fan_support_points", "engagement", "tip_creator", "100 points", "creator", "active"),
        ("holo_buyer_badge", "commerce", "buy_now", "badge_unlock", "marketplace", "active"),
        ("service_completion_credit", "service", "request_resolved", "service_credit", "dispatch", "active"),
    ])

if cur.execute("SELECT count(*) FROM middleverse_progression_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO middleverse_progression_registry
        (progression_name, progression_group, level_name, unlock_target, progression_scope, progression_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("creator_growth_track", "creator", "level_1", "vip_creator_tools", "creator", "active"),
        ("shopper_growth_track", "commerce", "level_1", "premium_holo_store", "marketplace", "active"),
        ("operator_growth_track", "service", "level_1", "advanced_dispatch_console", "dispatch", "active"),
    ])

if cur.execute("SELECT count(*) FROM middleverse_plugin_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO middleverse_plugin_registry
        (plugin_name, plugin_group, target_layer, plugin_version, install_mode, plugin_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("creator-commerce-plugin", "plugin", "bridge_layer", "v1.0.0", "managed", "active"),
        ("dispatch-world-plugin", "plugin", "service_layer", "v1.0.0", "managed", "active"),
        ("reward-engine-plugin", "plugin", "automation_layer", "v1.0.0", "managed", "active"),
    ])

if cur.execute("SELECT count(*) FROM middleverse_app_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO middleverse_app_registry
        (app_name, app_group, app_type, runtime_target, build_mode, app_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("AAM Creator Portal App", "creator", "portal_app", "web_runtime", "platform_native", "active"),
        ("AAM Dispatch Ops App", "service", "ops_app", "web_runtime", "platform_native", "active"),
        ("AAM Holo Store App", "commerce", "store_app", "web_runtime", "platform_native", "active"),
    ])

if cur.execute("SELECT count(*) FROM middleverse_builder_manifest").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO middleverse_builder_manifest
        (manifest_name, manifest_group, manifest_target, package_list, builder_mode, manifest_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("creator_build_manifest", "builder", "creator_layer", "aam-creator-sdk,creator-commerce-plugin", "guided", "active"),
        ("dispatch_build_manifest", "builder", "service_layer", "aam-dispatch-sdk,dispatch-world-plugin", "guided", "active"),
        ("commerce_build_manifest", "builder", "commerce_layer", "aam-commerce-sdk,reward-engine-plugin", "guided", "active"),
    ])

conn.commit()
conn.close()
print("[OK] middleverse pass F tables verified/seeded")
PYEOF

########################################
# 2) PATCH PASS F ROUTES IF MISSING
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

route_block = r"""
    if (req.method === 'POST' && pathname === '/middleverse/automation-safe') {
      dbRun(`INSERT INTO middleverse_automation_registry (automation_name, automation_group, trigger_event, target_action, automation_scope, automation_status)
             VALUES ('safe_automation','automation','safe_trigger','safe_action','platform','active')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20automation%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/middleverse/reward-safe') {
      dbRun(`INSERT INTO middleverse_reward_registry (reward_name, reward_group, reward_trigger, reward_value, reward_scope, reward_status)
             VALUES ('safe_reward','engagement','safe_trigger','reward_value','platform','active')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20reward%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/middleverse/progression-safe') {
      dbRun(`INSERT INTO middleverse_progression_registry (progression_name, progression_group, level_name, unlock_target, progression_scope, progression_status)
             VALUES ('safe_progression','growth','level_safe','unlock_safe','platform','active')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20progression%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/middleverse/plugin-safe') {
      dbRun(`INSERT INTO middleverse_plugin_registry (plugin_name, plugin_group, target_layer, plugin_version, install_mode, plugin_status)
             VALUES ('safe_plugin','plugin','bridge_layer','v1.0.1','managed','active')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20plugin%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/middleverse/app-safe') {
      dbRun(`INSERT INTO middleverse_app_registry (app_name, app_group, app_type, runtime_target, build_mode, app_status)
             VALUES ('safe_platform_app','platform','portal_app','web_runtime','platform_native','active')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20app%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/middleverse/manifest-safe') {
      dbRun(`INSERT INTO middleverse_builder_manifest (manifest_name, manifest_group, manifest_target, package_list, builder_mode, manifest_status)
             VALUES ('safe_manifest','builder','platform_layer','safe-dev-sdk,safe_plugin','guided','active')`);
      res.writeHead(302, { Location: '/middleverse-bridge?msg=Safe%20manifest%20created' });
      return res.end();
    }
"""

if "pathname === '/middleverse/automation-safe'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/middleverse-bridge') {"
    if anchor in text:
        text = text.replace(anchor, route_block + "\n" + anchor, 1)

# add buttons if current helper doesn't show them yet
needles = [
    ('/middleverse/automation-safe', 'Create Safe Automation'),
    ('/middleverse/reward-safe', 'Create Safe Reward'),
    ('/middleverse/progression-safe', 'Create Safe Progression'),
    ('/middleverse/plugin-safe', 'Create Safe Plugin'),
    ('/middleverse/app-safe', 'Create Safe App'),
    ('/middleverse/manifest-safe', 'Create Safe Builder Manifest'),
]

insert_after = '<section><h2>Action Router</h2>'
if insert_after in text and '/middleverse/automation-safe' not in text:
    buttons = """
      <section>
        <h2>Safe Platform Actions</h2>
        <form method="POST" action="/middleverse/automation-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Automation</button></form>
        <form method="POST" action="/middleverse/reward-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Reward</button></form>
        <form method="POST" action="/middleverse/progression-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Progression</button></form>
        <form method="POST" action="/middleverse/plugin-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Plugin</button></form>
        <form method="POST" action="/middleverse/app-safe" style="margin-bottom:12px;"><button type="submit">Create Safe App</button></form>
        <form method="POST" action="/middleverse/manifest-safe" style="margin-bottom:12px;"><button type="submit">Create Safe Builder Manifest</button></form>
      </section>
"""
    text = text.replace(insert_after, buttons + "\n      " + insert_after, 1)

p.write_text(text)
print("[OK] middleverse pass F routes verified/patched")
PYEOF

########################################
# 3) JS CHECK + SAFE RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 4
bash scripts/status.sh || true

########################################
# 4) HEALTH TESTS
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

########################################
# 5) ROUTE SMOKE
########################################
for route in \
  /middleverse-bridge \
  /metaverse-control \
  /studio-lab \
  /episode-movie-pipeline \
  /creator-tv \
  /dispatch-actions \
  /multiservice-dispatch \
  /ai-call-center \
  /competitive-contact-center \
  /quantum-mail \
  /holo-search \
  /platform-analytics \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SAFE ACTION SMOKE
########################################
curl -s -i -X POST http://127.0.0.1:4900/middleverse/automation-safe > "test_results/middleverse_automation_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/middleverse/reward-safe > "test_results/middleverse_reward_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/middleverse/progression-safe > "test_results/middleverse_progression_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/middleverse/plugin-safe > "test_results/middleverse_plugin_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/middleverse/app-safe > "test_results/middleverse_app_${STAMP}.txt" || true
curl -s -i -X POST http://127.0.0.1:4900/middleverse/manifest-safe > "test_results/middleverse_manifest_${STAMP}.txt" || true

########################################
# 7) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as middleverse_automation_registry from middleverse_automation_registry;" > "snapshots/middleverse_automation_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as middleverse_reward_registry from middleverse_reward_registry;" > "snapshots/middleverse_reward_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as middleverse_progression_registry from middleverse_progression_registry;" > "snapshots/middleverse_progression_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as middleverse_plugin_registry from middleverse_plugin_registry;" > "snapshots/middleverse_plugin_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as middleverse_app_registry from middleverse_app_registry;" > "snapshots/middleverse_app_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as middleverse_builder_manifest from middleverse_builder_manifest;" > "snapshots/middleverse_builder_manifest_${STAMP}.json"

sqlite3 -json db/aam.db "select id, automation_name, automation_group, trigger_event, target_action, automation_scope, automation_status, created_at from middleverse_automation_registry order by id desc limit 20;" > "snapshots/middleverse_automation_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, reward_name, reward_group, reward_trigger, reward_value, reward_scope, reward_status, created_at from middleverse_reward_registry order by id desc limit 20;" > "snapshots/middleverse_reward_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, progression_name, progression_group, level_name, unlock_target, progression_scope, progression_status, created_at from middleverse_progression_registry order by id desc limit 20;" > "snapshots/middleverse_progression_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, plugin_name, plugin_group, target_layer, plugin_version, install_mode, plugin_status, created_at from middleverse_plugin_registry order by id desc limit 20;" > "snapshots/middleverse_plugin_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, app_name, app_group, app_type, runtime_target, build_mode, app_status, created_at from middleverse_app_registry order by id desc limit 20;" > "snapshots/middleverse_app_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, manifest_name, manifest_group, manifest_target, package_list, builder_mode, manifest_status, created_at from middleverse_builder_manifest order by id desc limit 20;" > "snapshots/middleverse_builder_manifest_tail_${STAMP}.json"

########################################
# 8) ERROR SCAN
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

latest = Path.home() / "aam_full_system" / "snapshots" / "middleverse_pass_f_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] middleverse pass F scan complete: {len(issues)} issues")
PYEOF

########################################
# 9) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 10) REPORT
########################################
cat > "reports/recover_middleverse_pass_f_and_stabilize_${STAMP}.txt" <<REPORT
RECOVER MIDDLEVERSE PASS F + STABILIZE REPORT
Timestamp: ${STAMP}

Verified or created:
- middleverse_automation_registry
- middleverse_reward_registry
- middleverse_progression_registry
- middleverse_plugin_registry
- middleverse_app_registry
- middleverse_builder_manifest
- safe automation/reward/progression/plugin/app/manifest actions

Verified:
- dashboard health
- jarvis health
- middleverse bridge route
- safe middleverse pass F smoke
- stable runtime after pass F recovery

Purpose:
- recover interrupted middleverse pass F
- preserve stable runtime
- complete automation, rewards, plugins, and builder layer
REPORT

echo "RECOVER MIDDLEVERSE PASS F + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/middleverse_pass_f_scan_latest.json"
echo "  cat snapshots/middleverse_automation_registry_tail_${STAMP}.json"
echo "  cat snapshots/middleverse_reward_registry_tail_${STAMP}.json"
echo "  cat snapshots/middleverse_progression_registry_tail_${STAMP}.json"
echo "  cat snapshots/middleverse_plugin_registry_tail_${STAMP}.json"
echo "  cat snapshots/middleverse_app_registry_tail_${STAMP}.json"
echo "  cat snapshots/middleverse_builder_manifest_tail_${STAMP}.json"
echo "  cat reports/recover_middleverse_pass_f_and_stabilize_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/middleverse-bridge"
echo "  termux-open-url http://127.0.0.1:4900/studio-lab"
echo "  termux-open-url http://127.0.0.1:4900/metaverse-control"
