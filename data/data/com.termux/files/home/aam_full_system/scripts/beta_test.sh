#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system

echo "=== AAM BETA TEST ==="
echo

echo "[1] Core stability"
bash scripts/check_js.sh || exit 1
bash scripts/status.sh || exit 1
echo

echo "[2] Main platform health"
curl -s http://127.0.0.1:4900/health || exit 1
echo
curl -s http://127.0.0.1:5000/health || exit 1
echo
curl -s http://127.0.0.1:4902/health || echo "Life world not running"
echo
echo

echo "[3] Login flow"
LOGIN_HEADERS=$(mktemp)
curl -s -D "$LOGIN_HEADERS" -o /dev/null -X POST http://127.0.0.1:4900/login \
  -d "username=root&password=root123"

echo "Login response headers:"
cat "$LOGIN_HEADERS"
SID=$(grep -i '^Set-Cookie: sid=' "$LOGIN_HEADERS" | head -n 1 | sed 's/Set-Cookie: //I' | cut -d';' -f1)
echo
echo "Session cookie: $SID"
echo

if [ -z "$SID" ]; then
  echo "Login failed: no session cookie returned"
  rm -f "$LOGIN_HEADERS"
  exit 1
fi

echo "[4] Authenticated page checks"
for url in \
  http://127.0.0.1:4900/ \
  http://127.0.0.1:4900/archive \
  http://127.0.0.1:4900/marketplace \
  http://127.0.0.1:4900/university \
  http://127.0.0.1:4900/admin \
  http://127.0.0.1:4900/admin/db
do
  code=$(curl -s -o /dev/null -w "%{http_code}" -H "Cookie: $SID" "$url")
  echo "$url -> $code"
done
echo

echo "[5] Module files"
for f in \
  data/modules/artlist_ai.json \
  data/modules/avalanche_drip.json \
  data/modules/modules_index.json \
  data/world/life_of_yahuah_maschian/world_manifest.json \
  data/world/life_of_yahuah_maschian/scenes.json \
  data/world/life_of_yahuah_maschian/quests.json
do
  [ -f "$f" ] && echo "OK  $f" || echo "MISS $f"
done
echo

echo "[6] JSON validation"
python -m json.tool data/modules/modules_index.json >/dev/null || exit 1
python -m json.tool data/world/life_of_yahuah_maschian/world_manifest.json >/dev/null || exit 1
python -m json.tool data/world/life_of_yahuah_maschian/scenes.json >/dev/null || exit 1
python -m json.tool data/world/life_of_yahuah_maschian/quests.json >/dev/null || exit 1
echo "JSON valid"
echo

echo "[7] DB summary"
echo "People:"
sqlite3 db/aam.db "select count(*) from people;"
echo "Businesses:"
sqlite3 db/aam.db "select count(*) from businesses;"
echo "Archive notes:"
sqlite3 db/aam.db "select count(*) from archive_notes;"
echo "Users:"
sqlite3 db/aam.db "select count(*) from users;"
echo

echo "[8] Life world API"
curl -s http://127.0.0.1:4902/api/world | head -n 20 || true
echo
echo

rm -f "$LOGIN_HEADERS"
echo "BETA TEST PASSED"
