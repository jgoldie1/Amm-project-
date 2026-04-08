#!/usr/bin/env bash
set -e
cd "$HOME/aam_super_app"
LATEST="$(ls -1t backups/full_state_*.tar.gz 2>/dev/null | head -n 1)"
if [ -z "$LATEST" ]; then
  echo "No backup found"
  exit 1
fi
tar -xzf "$LATEST"
echo "Restored $LATEST"
