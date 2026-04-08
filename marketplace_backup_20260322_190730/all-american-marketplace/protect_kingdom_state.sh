#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

PROJECT_ROOT="$HOME/marketplace/all-american-marketplace"
cd "$PROJECT_ROOT"

mkdir -p backups snapshots scripts logs data .pids

STAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/kingdom_${STAMP}"
SNAP_DIR="snapshots/kingdom_${STAMP}"

mkdir -p "$BACKUP_DIR"
mkdir -p "$SNAP_DIR"

echo "==> 1) Save service health snapshot"
{
  echo "SNAPSHOT TIME: $(date)"
  echo
  bash scripts/status.sh || true
  echo
  bash scripts/smoke_test.sh || true
} > "$SNAP_DIR/health_snapshot.txt"

echo "==> 2) Save logs snapshot"
mkdir -p "$SNAP_DIR/logs"
cp -r logs/* "$SNAP_DIR/logs/" 2>/dev/null || true

echo "==> 3) Save data snapshot"
mkdir -p "$SNAP_DIR/data"
cp -r data/* "$SNAP_DIR/data/" 2>/dev/null || true

echo "==> 4) Save code snapshot"
tar -czf "$BACKUP_DIR/project_files_${STAMP}.tar.gz" \
  services \
  packages \
  scripts \
  data \
  .env \
  package.json \
  package-lock.json \
  2>/dev/null || true

echo "==> 5) Save service list"
cat > "$SNAP_DIR/service_manifest.txt" <<'EOM'
4000 api-gateway
4100 auth-service
4200 booking-service
4300 payment-service
4400 dispatch-service
4500 rewards-service
4600 marketplace-service
4700 driver-service
4800 admin-service
4900 frontend-service
5000 storehouse-service
5100 finbank-service
5200 crossborder-service
5300 university-service
5400 creator-service
EOM

echo "==> 6) Save current scripts"
mkdir -p "$SNAP_DIR/scripts"
cp scripts/*.sh "$SNAP_DIR/scripts/" 2>/dev/null || true

echo "==> 7) Write restore helper"
cat > scripts/restore_last_snapshot.sh <<'EOM'
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
EOM
chmod +x scripts/restore_last_snapshot.sh

echo "==> 8) Write freeze-state helper"
cat > scripts/freeze_state.sh <<'EOM'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
bash ./protect_kingdom_state.sh
EOM
chmod +x scripts/freeze_state.sh

echo "==> 9) Write pre-change safety helper"
cat > scripts/pre_change_guard.sh <<'EOM'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Creating safety snapshot before changes..."
bash ./protect_kingdom_state.sh
echo "Safety snapshot complete."
echo "Proceed with changes only after this finishes."
EOM
chmod +x scripts/pre_change_guard.sh

echo "==> 10) Save package versions"
{
  echo "Node: $(node -v 2>/dev/null || true)"
  echo "NPM: $(npm -v 2>/dev/null || true)"
} > "$SNAP_DIR/runtime_versions.txt"

echo
echo "KINGDOM STATE PROTECTED"
echo "Backup folder: $BACKUP_DIR"
echo "Snapshot folder: $SNAP_DIR"
echo
echo "Use these before every future change:"
echo "bash scripts/pre_change_guard.sh"
echo
echo "If something breaks later:"
echo "bash scripts/restore_last_snapshot.sh"
