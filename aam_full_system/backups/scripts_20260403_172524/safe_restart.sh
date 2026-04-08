#!/data/data/com.termux/files/usr/bin/bash
set -e
cd ~/aam_full_system

bash scripts/check_js.sh
bash scripts/restart.sh
