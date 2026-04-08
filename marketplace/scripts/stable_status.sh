#!/data/data/com.termux/files/usr/bin/bash
echo "=== PORT STATUS ==="
ss -tulpen 2>/dev/null | grep -E ':8080 |:8081 |:8082 ' || echo "No marketplace port detected"
echo
echo "=== LAST LOG ==="
tail -n 30 ~/marketplace/logs/app.log 2>/dev/null || true
