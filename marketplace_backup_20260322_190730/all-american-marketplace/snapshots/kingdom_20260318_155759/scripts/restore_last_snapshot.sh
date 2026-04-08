#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

PROJECT_ROOT="$HOME/marketplace/all-american-marketplace"
cd "$PROJECT_ROOT"

LATEST_TAR=$(ls -1t backups/kingdom_*/project_files_*.tar.gz 2>/dev/null | head -n 1 || true)

if [ -z "${LATEST_TAR:-}" ]; then
  echo "No project backup archive found."
  exit 1
fi

echo "Restoring from: $LATEST_TAR"
bash scripts/stop_all.sh || true
tar -xzf "$LATEST_TAR" -C "$PROJECT_ROOT"

echo "Restore complete."
echo "Now run:"
echo "bash scripts/install_all.sh"
echo "bash scripts/start_all.sh"
