#!/usr/bin/env bash
set -e
BASE="${1:-http://127.0.0.1:4000}"
TMP_DIR="$HOME/aam_super_app/tmp"
mkdir -p "$TMP_DIR"

echo "== unauthorized user profile should fail =="
curl -s -o "$TMP_DIR/aam_sec_1.out" -w "%{http_code}" "$BASE/identity/test-user" > "$TMP_DIR/aam_sec_1.code" || true
cat "$TMP_DIR/aam_sec_1.out"; echo
echo "HTTP $(cat "$TMP_DIR/aam_sec_1.code")"

echo "== unauthorized wallet should fail =="
curl -s -o "$TMP_DIR/aam_sec_2.out" -w "%{http_code}" "$BASE/wallet/test-user" > "$TMP_DIR/aam_sec_2.code" || true
cat "$TMP_DIR/aam_sec_2.out"; echo
echo "HTTP $(cat "$TMP_DIR/aam_sec_2.code")"

echo "== unauthorized admin users should fail =="
curl -s -o "$TMP_DIR/aam_sec_3.out" -w "%{http_code}" "$BASE/admin/users" > "$TMP_DIR/aam_sec_3.code" || true
cat "$TMP_DIR/aam_sec_3.out"; echo
echo "HTTP $(cat "$TMP_DIR/aam_sec_3.code")"

echo "== bad admin token should fail =="
curl -s -o "$TMP_DIR/aam_sec_4.out" -w "%{http_code}" "$BASE/admin/users" -H "x-admin-token: BAD_TOKEN" > "$TMP_DIR/aam_sec_4.code" || true
cat "$TMP_DIR/aam_sec_4.out"; echo
echo "HTTP $(cat "$TMP_DIR/aam_sec_4.code")"

echo "== done =="
