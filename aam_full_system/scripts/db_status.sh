#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system
echo "=== DB STATUS ==="
sqlite3 db/aam.db ".tables"
echo
echo "People count:"
sqlite3 db/aam.db "select count(*) from people;"
echo
echo "Business count:"
sqlite3 db/aam.db "select count(*) from businesses;"
echo
echo "Archive notes count:"
sqlite3 db/aam.db "select count(*) from archive_notes;"
