#!/data/data/com.termux/files/usr/bin/bash
echo "=== PORT CHECK ==="
curl -s http://127.0.0.1:4900/health >/dev/null && echo "4900 OK" || echo "4900 DOWN"
curl -s http://127.0.0.1:5000/health >/dev/null && echo "5000 OK" || echo "5000 DOWN"
