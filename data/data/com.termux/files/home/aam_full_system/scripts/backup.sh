#!/data/data/com.termux/files/usr/bin/bash
set -e
ROOT="$HOME/aam_full_system"
STAMP="$(date +%Y%m%d_%H%M%S)"
DEST="$ROOT/backups/backup_$STAMP"
mkdir -p "$DEST"

cp -r "$ROOT/apps" "$DEST/"
cp -r "$ROOT/data" "$DEST/"
cp -r "$ROOT/scripts" "$DEST/"
cp "$ROOT"/logs/*.log "$DEST/" 2>/dev/null || true

echo "Backup created at: $DEST"
