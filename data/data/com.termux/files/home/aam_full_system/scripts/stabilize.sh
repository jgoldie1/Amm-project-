#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system
mkdir -p logs backups tmp scripts tests data/modules
chmod +x scripts/*.sh
bash scripts/safe_restart.sh
bash scripts/smoke_test.sh
