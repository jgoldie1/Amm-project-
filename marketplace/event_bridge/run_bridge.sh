#!/usr/bin/env bash
python event_bridge/bridge_app.py > event_bridge.log 2>&1 &
echo "Event bridge started on http://127.0.0.1:8096"
