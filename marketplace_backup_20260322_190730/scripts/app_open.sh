#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
if [ -f config/active_port.txt ]; then
  PORT="$(cat config/active_port.txt)"
else
  PORT="8080"
fi
echo "http://127.0.0.1:$PORT/app-home"
