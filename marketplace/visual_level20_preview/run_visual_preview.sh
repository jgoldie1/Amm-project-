#!/usr/bin/env bash
pkill -f "visual_level20_preview/app.py" 2>/dev/null || true
python visual_level20_preview/app.py > visual_level20_preview.log 2>&1 &
echo "Visual Level 20 preview started on http://127.0.0.1:8099"
