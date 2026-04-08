#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system

echo "=== STABILIZE BETA ==="
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

echo "[6] Holo features"
sqlite3 -json db/aam.db "
select id, config_name, config_value, config_status
from system_config_registry
where lower(config_name) like '%holo%'
   or lower(config_name) like '%search%'
order by id;
"
echo
echo

echo "[7] Module files"
ls -1 data/modules
echo
echo "STABILIZE BETA COMPLETE"
