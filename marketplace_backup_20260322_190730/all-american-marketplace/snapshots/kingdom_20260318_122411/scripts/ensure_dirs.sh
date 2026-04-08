#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/.."
mkdir -p logs backups .pids data
echo "Directories ensured."
