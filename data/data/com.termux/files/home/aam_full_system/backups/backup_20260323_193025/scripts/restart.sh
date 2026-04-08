#!/data/data/com.termux/files/usr/bin/bash
set -e
cd ~/aam_full_system
bash scripts/stop.sh
sleep 1
bash scripts/start.sh
bash scripts/status.sh
