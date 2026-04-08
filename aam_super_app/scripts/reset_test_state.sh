#!/usr/bin/env bash
set -e
cd "$HOME/aam_super_app"

mkdir -p backups
STAMP="$(date +%Y%m%d_%H%M%S)"

cp data/users.json "backups/users_before_reset_$STAMP.json" 2>/dev/null || true
cp data/wallets.json "backups/wallets_before_reset_$STAMP.json" 2>/dev/null || true
cp data/transactions.json "backups/transactions_before_reset_$STAMP.json" 2>/dev/null || true
cp data/reports.json "backups/reports_before_reset_$STAMP.json" 2>/dev/null || true
cp data/dmca.json "backups/dmca_before_reset_$STAMP.json" 2>/dev/null || true
cp data/appeals.json "backups/appeals_before_reset_$STAMP.json" 2>/dev/null || true
cp data/tracks.json "backups/tracks_before_reset_$STAMP.json" 2>/dev/null || true
cp data/streams.json "backups/streams_before_reset_$STAMP.json" 2>/dev/null || true
cp data/ads.json "backups/ads_before_reset_$STAMP.json" 2>/dev/null || true

echo '{}' > data/users.json
echo '{}' > data/wallets.json
echo '[]' > data/transactions.json
echo '[]' > data/reports.json
echo '[]' > data/dmca.json
echo '[]' > data/appeals.json
echo '{}' > data/tracks.json
echo '[]' > data/streams.json
echo '[]' > data/ads.json

echo "RESET COMPLETE"
