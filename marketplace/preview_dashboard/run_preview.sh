#!/usr/bin/env bash
pkill -f "preview_dashboard/app.py" 2>/dev/null || true
python preview_dashboard/app.py > preview_dashboard.log 2>&1 &
echo "Preview dashboard started on http://127.0.0.1:8097"
