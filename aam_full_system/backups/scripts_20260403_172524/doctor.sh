#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system

echo "=== AAM DOCTOR ==="
echo

echo "[1] File validation"
bash scripts/validate.sh || exit 1
echo

echo "[2] JavaScript syntax"
bash scripts/check_js.sh || exit 1
echo

echo "[3] Port check"
bash scripts/ports.sh
echo

echo "[4] Health check"
bash scripts/status.sh
echo

echo "[5] JSON preview"
python -m json.tool data/family.json | head -n 40
echo
echo "Doctor check complete"
