#!/data/data/com.termux/files/usr/bin/bash

case "$1" in
  start)
    pkill -f "python3 aame_api.py" 2>/dev/null || true
    nohup python3 aame_api.py > aame_api.log 2>&1 &
    sleep 2
    echo "AAME started"
    curl -s http://127.0.0.1:5050/healthz
    echo
    ;;
  stop)
    pkill -f "python3 aame_api.py" 2>/dev/null || true
    echo "AAME stopped"
    ;;
  status)
    curl -s http://127.0.0.1:5050/status/all
    echo
    ;;
  health)
    curl -s http://127.0.0.1:5050/healthz
    echo
    ;;
  links)
    curl -s http://127.0.0.1:5050/pay-links
    echo
    ;;
  log)
    tail -80 aame_api.log
    ;;
  *)
    echo "Usage: ./manage_aame.sh {start|stop|status|health|links|log}"
    ;;
esac
