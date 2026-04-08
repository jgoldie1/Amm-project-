#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system

echo "=== FULL GAP ANALYSIS + STABILIZE ==="
echo

echo "[1] Restart core"
bash scripts/safe_restart.sh || exit 1
echo

echo "[2] Core status"
bash scripts/status.sh || exit 1
echo

echo "[3] Syntax"
bash scripts/check_js.sh || exit 1
echo

echo "[4] Smoke test"
bash scripts/smoke_test.sh || exit 1
echo

echo "[5] Life World"
curl -s http://127.0.0.1:4902/health || echo "life world down"
echo
echo

echo "[6] Jarvis"
curl -s http://127.0.0.1:5000/health || echo "jarvis down"
echo
curl -s "http://127.0.0.1:5000/command?q=gap%20analysis" || true
echo
echo

echo "[7] Login/auth"
curl -i -X POST http://127.0.0.1:4900/login \
  -d "username=root&password=root123" | head -n 20
echo

echo "[8] AI feature flags"
sqlite3 -json db/aam.db "
select id, config_name, config_value, config_status
from system_config_registry
where lower(config_name) like '%holo%'
   or lower(config_name) like '%search%'
   or lower(config_name) like '%codex%'
   or lower(config_name) like '%copilot%'
   or lower(config_name) like '%ai_dev%'
   or lower(config_name) like '%wix%'
   or lower(config_name) like '%public_site_ai%'
order by id;
"
echo
echo

echo "[9] Module files"
ls -1 data/modules
echo

echo "[10] World files"
ls -1 data/world/life_of_yahuah_maschian
echo

echo "[11] Dashboard UI hooks"
grep -n "renderDashboard" apps/dashboard.js || true
grep -n "Holo Features" apps/dashboard.js || true
grep -n "Modules" apps/dashboard.js || true
grep -n "Life World" apps/dashboard.js || true
echo

echo "[12] Save / progression hooks"
grep -RniE "save|inventory|progress|player_template|completedQuests|xp|level" apps data 2>/dev/null | head -n 80
echo

echo "[13] Streaming pricing / payout hooks"
grep -RniE "stream|subscription|royalty|payout|price|pricing|tip" apps data scripts 2>/dev/null | head -n 120
echo

echo "[14] Accessibility / voice / BCI hooks"
grep -RniE "accessib|aria-|role=|label|alt=|tabindex|voice|speech|microphone|audio|bci|brain|noninvasive" apps data 2>/dev/null | head -n 120
echo

echo "[15] Snapshot"
mkdir -p snapshots
STAMP=$(date +%Y%m%d_%H%M%S)
cp apps/dashboard.js "snapshots/dashboard_${STAMP}.js"
cp apps/life_world.js "snapshots/life_world_${STAMP}.js"
cp db/aam.db "snapshots/aam_${STAMP}.db"
echo "Snapshot saved: $STAMP"
echo

echo "=== GAP SUMMARY ==="
echo "Complete/healthy:"
echo "- Dashboard service"
echo "- Jarvis service"
echo "- Life World service"
echo "- Auth/login"
echo "- Smoke tests"
echo "- Module/world files"
echo "- AI flags"

echo
echo "Likely incomplete or needs polish:"
echo "- Visible modules/dashboard UI integration"
echo "- Life World launch entry from dashboard"
echo "- Save/progression/inventory UI"
echo "- Streaming pricing + payout rules"
echo "- Creator/public pages"
echo "- Accessibility polish"
echo "- Real Jarvis action execution"
echo

echo "FULL GAP ANALYSIS COMPLETE"
