#!/usr/bin/env bash
pkill -f "ultimate_vision_preview/app.py" 2>/dev/null || true
python ultimate_vision_preview/app.py > ultimate_vision_preview.log 2>&1 &
echo "Ultimate Vision Center started on http://127.0.0.1:8100"
