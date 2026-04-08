#!/data/data/com.termux/files/usr/bin/bash
set -u

echo "=== OMNICARE SMOKE TEST ==="

echo
echo "[1] Status"
bash scripts/status.sh

echo
echo "[2] OmniCare hub"
curl -s -i http://127.0.0.1:4900/omnicare-hub | head -40

echo
echo "[3] Surety"
curl -s -i -X POST http://127.0.0.1:4900/omnicare/surety-safe | head -20

echo
echo "[4] Factoring"
curl -s -i -X POST http://127.0.0.1:4900/omnicare/factoring-safe | head -20

echo
echo "[5] Automan"
curl -s -i -X POST http://127.0.0.1:4900/omnicare/automan-safe | head -20

echo
echo "[6] Light Tech"
curl -s -i -X POST http://127.0.0.1:4900/omnicare/light-safe | head -20

echo
echo "[7] Recent DB rows"
sqlite3 db/aam.db "SELECT id,bond_name,bond_status,created_at FROM surety_registry ORDER BY id DESC LIMIT 1;"
sqlite3 db/aam.db "SELECT id,account_name,factoring_status,created_at FROM factoring_registry ORDER BY id DESC LIMIT 1;"
sqlite3 db/aam.db "SELECT id,system_name,system_status,created_at FROM automan_tech_registry ORDER BY id DESC LIMIT 1;"
sqlite3 db/aam.db "SELECT id,system_name,system_status,created_at FROM lyons_light_tech_registry ORDER BY id DESC LIMIT 1;"
