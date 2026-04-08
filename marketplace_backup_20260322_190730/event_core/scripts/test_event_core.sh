#!/usr/bin/env bash
echo "Gateway:"
curl -s http://127.0.0.1:8091/ | sed 's/},{/},\n{/g'
echo
echo "Status:"
curl -s http://127.0.0.1:8091/status | sed 's/},{/},\n{/g'
echo
echo "Publishing sample event..."
curl -s -X POST http://127.0.0.1:8092/publish \
  -H "Content-Type: application/json" \
  -d '{"event_type":"media.uploaded","source_service":"media","payload":{"title":"Demo Upload","user":"test"}}'
echo
echo
echo "Recent events:"
curl -s http://127.0.0.1:8092/events | sed 's/},{/},\n{/g'
