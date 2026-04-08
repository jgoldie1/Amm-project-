#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
cp master_lock/master_app_locked.py app.py
echo "Restored locked master into app.py"
