#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

REPO="https://github.com/jgoldie1/jarvis-2.0-memory-vault.git"
DIR="$HOME/jarvis-2.0-memory-vault"
BRANCH="${1:-main}"

echo "=== JARVIS VAULT SYNC ==="

if [ ! -d "$DIR/.git" ]; then
  echo "[1] Cloning repo..."
  git clone "$REPO" "$DIR"
fi

cd "$DIR"

echo "[2] Fetching..."
git fetch origin

echo "[3] Checkout branch..."
git checkout "$BRANCH" || git checkout -b "$BRANCH"

echo "[4] Pulling latest..."
git pull --rebase origin "$BRANCH" || true

echo
echo "=== STATUS ==="
git status --short
echo
echo "Branch:"
git branch --show-current
echo
echo "Remote:"
git remote -v
