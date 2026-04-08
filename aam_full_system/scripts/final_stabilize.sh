#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system

echo "=== FINAL STABILIZE ==="
echo

echo "[1] Restart core"
bash scripts/safe_restart.sh || exit 1
echo

echo "[2] Core status"
bash scripts/status.sh || exit 1
echo

echo "[3] JS syntax"
bash scripts/check_js.sh || exit 1
echo

echo "[4] Core smoke test"
bash scripts/smoke_test.sh || exit 1
echo

echo "[5] Life World health"
curl -s http://127.0.0.1:4902/health || echo "life world down"
echo
echo

echo "[6] Login/auth check"
curl -i -X POST http://127.0.0.1:4900/login \
  -d "username=root&password=root123" | head -n 20
echo

echo "[7] Holo features"
sqlite3 -json db/aam.db "
select id, config_name, config_value, config_status
from system_config_registry
where lower(config_name) like '%holo%'
   or lower(config_name) like '%search%'
order by id;
"
echo
echo

echo "[8] Modules"
ls -1 data/modules
echo

echo "FINAL STABILIZE COMPLETE"
