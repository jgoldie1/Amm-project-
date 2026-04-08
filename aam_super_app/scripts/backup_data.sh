#!/usr/bin/env bash
set -e
cd "$HOME/aam_super_app"
mkdir -p backups
STAMP="$(date +%Y%m%d_%H%M%S)"
tar -czf "backups/data_backup_$STAMP.tar.gz" data config
echo "Created backups/data_backup_$STAMP.tar.gz"
