#!/usr/bin/env bash
set -e

python event_core/gateway/app.py > event_core_gateway.log 2>&1 &
python event_core/event_bus/app.py > event_bus.log 2>&1 &
python event_core/workers/app.py > event_workers.log 2>&1 &
python event_core/notifications/app.py > event_notifications.log 2>&1 &
python event_core/analytics/app.py > event_analytics.log 2>&1 &

echo "Event core started."
echo "Gateway:        http://127.0.0.1:8091"
echo "Event Bus:      http://127.0.0.1:8092"
echo "Workers:        http://127.0.0.1:8093"
echo "Notifications:  http://127.0.0.1:8094"
echo "Analytics:      http://127.0.0.1:8095"
