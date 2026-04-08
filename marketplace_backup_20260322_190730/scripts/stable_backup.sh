#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
STAMP=$(date +%Y%m%d_%H%M%S)
cp app.py "backups/app_manual_backup_$STAMP.py"
tar -czf "$HOME/backups/marketplace_manual_backup_$STAMP.tar.gz" -C "$HOME" marketplace
echo "Saved app backup: backups/app_manual_backup_$STAMP.py"
echo "Saved full backup: ~/backups/marketplace_manual_backup_$STAMP.tar.gz"
