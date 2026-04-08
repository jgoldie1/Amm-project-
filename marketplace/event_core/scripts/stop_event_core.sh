#!/usr/bin/env bash
pkill -f "event_core/gateway/app.py" 2>/dev/null || true
pkill -f "event_core/event_bus/app.py" 2>/dev/null || true
pkill -f "event_core/workers/app.py" 2>/dev/null || true
pkill -f "event_core/notifications/app.py" 2>/dev/null || true
pkill -f "event_core/analytics/app.py" 2>/dev/null || true
echo "Event core stopped."
