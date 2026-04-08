#!/usr/bin/env bash
set -e
cd "$HOME/aam_super_app"
mkdir -p backups
STAMP="$(date +%Y%m%d_%H%M%S)"
tar -czf "backups/full_state_$STAMP.tar.gz" data config scripts gateway services shared package.json 2>/dev/null || true
echo "Created backups/full_state_$STAMP.tar.gz"
