#!/usr/bin/env bash
set -e
docker compose up -d
echo "Started local stack"
echo "API Gateway: http://localhost:4000/health"
