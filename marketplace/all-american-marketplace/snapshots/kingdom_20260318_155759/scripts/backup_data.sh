#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/.."

mkdir -p backups
STAMP=$(date +%Y%m%d_%H%M%S)
DEST="backups/data_${STAMP}"
mkdir -p "$DEST"
cp -r data/* "$DEST"/ 2>/dev/null || true
echo "Backup created at $DEST"
