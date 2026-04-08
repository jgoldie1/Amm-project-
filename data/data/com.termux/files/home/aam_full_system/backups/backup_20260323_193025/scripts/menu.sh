#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system

while true; do
  clear
  echo "=============================="
  echo "   AAM OS TERMUX CONTROL"
  echo "=============================="
  echo "1) Start system"
  echo "2) Stop system"
  echo "3) Restart system"
  echo "4) Status"
  echo "5) Open Dashboard"
  echo "6) Open Jarvis"
  echo "7) Backup"
  echo "8) Exit"
  echo
  read -p "Choose: " choice

  case "$choice" in
    1) bash scripts/start.sh; read -p "Press Enter..." ;;
    2) bash scripts/stop.sh; read -p "Press Enter..." ;;
    3) bash scripts/restart.sh; read -p "Press Enter..." ;;
    4) bash scripts/status.sh; read -p "Press Enter..." ;;
    5) bash scripts/open_dashboard.sh; read -p "Press Enter..." ;;
    6) bash scripts/open_jarvis.sh; read -p "Press Enter..." ;;
    7) bash scripts/backup.sh; read -p "Press Enter..." ;;
    8) exit 0 ;;
    *) echo "Invalid choice"; sleep 1 ;;
  esac
done
