#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system

while true; do
  clear
  echo "=============================="
  echo "   AAM OS TERMUX CONTROL"
  echo "=============================="
  echo "1) Start system"
  echo "2) Stop system"
  echo "3) Safe restart"
  echo "4) Status"
  echo "5) Doctor"
  echo "6) Open Dashboard"
  echo "7) Open Jarvis"
  echo "8) Backup"
  echo "9) Recover Dashboard"
  echo "10) Exit"
  echo
  read -p "Choose: " choice

  case "$choice" in
    1) bash scripts/start.sh; read -p "Press Enter..." ;;
    2) bash scripts/stop.sh; read -p "Press Enter..." ;;
    3) bash scripts/safe_restart.sh; read -p "Press Enter..." ;;
    4) bash scripts/status.sh; read -p "Press Enter..." ;;
    5) bash scripts/doctor.sh; read -p "Press Enter..." ;;
    6) bash scripts/open_dashboard.sh; read -p "Press Enter..." ;;
    7) bash scripts/open_jarvis.sh; read -p "Press Enter..." ;;
    8) bash scripts/backup.sh; read -p "Press Enter..." ;;
    9) bash scripts/recover_dashboard.sh; read -p "Press Enter..." ;;
    10) exit 0 ;;
    *) echo "Invalid choice"; sleep 1 ;;
  esac
done
