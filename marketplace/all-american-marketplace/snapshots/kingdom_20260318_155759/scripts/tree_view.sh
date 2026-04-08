#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/.."
find . -maxdepth 3 | sort
