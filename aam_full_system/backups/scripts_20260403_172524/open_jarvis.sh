#!/data/data/com.termux/files/usr/bin/bash
if command -v termux-open-url >/dev/null 2>&1; then
  termux-open-url http://127.0.0.1:5000
else
  echo "Open this in your browser:"
  echo "http://127.0.0.1:5000"
fi
