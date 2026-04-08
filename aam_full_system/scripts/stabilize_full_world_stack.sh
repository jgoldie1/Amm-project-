#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== FULL WORLD STACK STABILIZATION START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports logs pids

########################################
# 1) HEALTH + SYNTAX
########################################
bash scripts/check_js.sh
bash scripts/status.sh
curl -s http://127.0.0.1:5090/health > "snapshots/world_socket_health_${STAMP}.json"

########################################
# 2) TABLE CHECKS
########################################
sqlite3 db/aam.db ".tables" > "snapshots/tables_${STAMP}.txt"

sqlite3 -json db/aam.db "select count(*) as people from people;" > "snapshots/people_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as businesses from businesses;" > "snapshots/businesses_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as payments from payments;" > "snapshots/payments_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as wallets from wallets;" > "snapshots/wallets_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as receipts from receipts;" > "snapshots/receipts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as books from books;" > "snapshots/books_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as podcasts from podcasts;" > "snapshots/podcasts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as credit_cases from credit_cases;" > "snapshots/credit_cases_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as compliance_events from compliance_events;" > "snapshots/compliance_events_${STAMP}.json"

sqlite3 -json db/aam.db "select count(*) as scene_registry from scene_registry;" > "snapshots/scene_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scene_portals from scene_portals;" > "snapshots/scene_portals_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scene_media_panels from scene_media_panels;" > "snapshots/scene_media_panels_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as avatar_profiles from avatar_profiles;" > "snapshots/avatar_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as avatar_positions from avatar_positions;" > "snapshots/avatar_positions_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as shared_world_objects from shared_world_objects;" > "snapshots/shared_world_objects_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as object_interaction_log from object_interaction_log;" > "snapshots/object_interaction_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as socket_connections from socket_connections;" > "snapshots/socket_connections_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as socket_event_log from socket_event_log;" > "snapshots/socket_event_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as shared_world_state from shared_world_state;" > "snapshots/shared_world_state_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as state_application_log from state_application_log;" > "snapshots/state_application_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_sessions from world_sessions;" > "snapshots/world_sessions_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scene_checkpoints from scene_checkpoints;" > "snapshots/scene_checkpoints_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as replay_timeline from replay_timeline;" > "snapshots/replay_timeline_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as recovery_snapshots from recovery_snapshots;" > "snapshots/recovery_snapshots_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_automation_rules from world_automation_rules;" > "snapshots/world_automation_rules_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_jobs from world_jobs;" > "snapshots/world_jobs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_orchestration_log from world_orchestration_log;" > "snapshots/world_orchestration_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_assets from world_assets;" > "snapshots/world_assets_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as asset_ownership from asset_ownership;" > "snapshots/asset_ownership_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_inventory from world_inventory;" > "snapshots/world_inventory_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as asset_transfer_log from asset_transfer_log;" > "snapshots/asset_transfer_log_${STAMP}.json"

########################################
# 3) ROUTE CHECKS
########################################
curl -s http://127.0.0.1:4900/sitemap.xml > "snapshots/sitemap_${STAMP}.xml"
curl -s http://127.0.0.1:4900/world-state > "snapshots/world_state_page_${STAMP}.html"
curl -s http://127.0.0.1:4900/world-control > "snapshots/world_control_page_${STAMP}.html"
curl -s http://127.0.0.1:4900/world-execution > "snapshots/world_execution_page_${STAMP}.html"
curl -s http://127.0.0.1:4900/world-persistence > "snapshots/world_persistence_page_${STAMP}.html"
curl -s http://127.0.0.1:4900/world-automation > "snapshots/world_automation_page_${STAMP}.html"
curl -s http://127.0.0.1:4900/world-economy > "snapshots/world_economy_page_${STAMP}.html"
curl -s http://127.0.0.1:4900/motion-worlds/1 > "snapshots/motion_world_1_${STAMP}.html"

curl -s http://127.0.0.1:5090/sync/1 > "snapshots/socket_sync_scene1_${STAMP}.json"

########################################
# 4) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_stable_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_stable_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_stable_${STAMP}.js"
cp db/aam.db "backups/aam_stable_${STAMP}.db"

########################################
# 5) HUMAN REPORT
########################################
cat > "reports/system_report_${STAMP}.txt" <<REPORT
FULL WORLD STACK STABILIZATION REPORT
Timestamp: ${STAMP}

Core Services
- Dashboard: 4900
- Jarvis: 5000
- World Socket: 5090

Verified Areas
- Core dashboard shell
- Jarvis service
- Sitemap
- World state
- World control
- World execution
- World persistence
- World automation
- World economy
- Motion world
- Socket sync

Stabilization Output
- JS syntax checked
- Service health checked
- Critical routes fetched
- Database snapshotted
- Code and DB backed up

Checkpoint:
- backups/dashboard_stable_${STAMP}.js
- backups/world_socket_stable_${STAMP}.js
- backups/jarvis_stable_${STAMP}.js
- backups/aam_stable_${STAMP}.db
REPORT

echo "FULL WORLD STACK STABILIZATION COMPLETE: $STAMP"
echo "Report: reports/system_report_${STAMP}.txt"
echo "Backup DB: backups/aam_stable_${STAMP}.db"
