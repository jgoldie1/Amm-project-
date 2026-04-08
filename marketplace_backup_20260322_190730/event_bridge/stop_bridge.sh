#!/usr/bin/env bash
pkill -f "event_bridge/bridge_app.py" 2>/dev/null || true
echo "Event bridge stopped."
