#!/data/data/com.termux/files/usr/bin/bash
set -e
echo "Gateway:"; curl -s "http://127.0.0.1:4000/" ; echo
echo "System health:"; curl -s "http://127.0.0.1:4000/system/health" ; echo
echo "Features:"; curl -s "http://127.0.0.1:4000/features" ; echo
echo
echo "Direct service tests:"
for port in 4100 4200 4300 4400 4500 4600 4700 4800 4900 5000 5100 5200 5300 5400; do
  curl -s "http://127.0.0.1:${port}/health" ; echo
done
