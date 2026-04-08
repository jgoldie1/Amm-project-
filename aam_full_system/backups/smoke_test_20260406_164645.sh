#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system

echo "=== AAM SMOKE TEST ==="
echo

echo "[1] JS syntax"
bash scripts/check_js.sh || exit 1
echo

echo "[2] Services"
printf "Dashboard: "
curl -s http://127.0.0.1:4900/health || { echo "DOWN"; exit 1; }
echo
printf "Jarvis:    "
curl -s http://127.0.0.1:5000/health || { echo "DOWN"; exit 1; }
echo
echo

echo "[3] Core pages"
for url in \
  http://127.0.0.1:4900/ \
  http://127.0.0.1:4900/archive \
  http://127.0.0.1:4900/marketplace \
  http://127.0.0.1:4900/university
do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  echo "$url -> $code"
done
echo

echo "[4] Files"
test -f apps/dashboard.js
test -f apps/jarvis.js
test -f data/family.json
test -f data/rules.json
test -f data/modules/artlist_ai.json
echo "Required files OK"
echo

echo "[5] JSON validation"
python -m json.tool data/family.json >/dev/null
python -m json.tool data/rules.json >/dev/null
python -m json.tool data/modules/artlist_ai.json >/dev/null
echo "JSON OK"
echo
echo "SMOKE TEST PASSED"
