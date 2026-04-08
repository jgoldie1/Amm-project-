#!/usr/bin/env bash
pkill -f "next_level_access_preview/app.py" 2>/dev/null || true
python next_level_access_preview/app.py > next_level_access_preview.log 2>&1 &
echo "Accessibility preview started on http://127.0.0.1:8098"
