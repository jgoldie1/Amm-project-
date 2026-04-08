#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Creating safety snapshot before changes..."
bash ./protect_kingdom_state.sh
echo "Safety snapshot complete."
echo "Proceed with changes only after this finishes."
