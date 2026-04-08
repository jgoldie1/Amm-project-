#!/usr/bin/env bash
pkill -f "preview_dashboard/app.py" 2>/dev/null || true
echo "Preview dashboard stopped."
