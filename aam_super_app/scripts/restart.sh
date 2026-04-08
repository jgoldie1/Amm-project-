#!/usr/bin/env bash
set -e
cd "$HOME/aam_super_app"
bash scripts/stop.sh || true
sleep 1
bash scripts/start.sh
