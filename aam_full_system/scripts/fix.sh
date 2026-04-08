#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system
mkdir -p logs backups tmp
chmod +x scripts/*.sh
bash scripts/restart.sh
