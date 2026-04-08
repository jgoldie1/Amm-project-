#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== TIME MACHINE + TERRITORY INTELLIGENCE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) SAFE BACKUP
########################################
cp db/aam.db "backups/aam_time_machine_${STAMP}.db"

########################################
# 2) DATABASE — TIME MACHINE LAYER
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

########################################
# TERRITORY REGISTRY
########################################
cur.execute("""
CREATE TABLE IF NOT EXISTS territory_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  territory_name TEXT,
  territory_type TEXT, -- state, country, city
  region TEXT,
  launch_phase TEXT DEFAULT 'future', -- past, live, future
  monetization_focus TEXT,
  priority_level TEXT DEFAULT 'medium',
  activation_status TEXT DEFAULT 'inactive',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

########################################
# TIMELINE ENGINE
########################################
cur.execute("""
CREATE TABLE IF NOT EXISTS timeline_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT,
  entity_name TEXT,
  phase TEXT, -- past, present, future
  event_description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

########################################
# SCENARIO ENGINE
########################################
cur.execute("""
CREATE TABLE IF NOT EXISTS scenario_simulation_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scenario_name TEXT,
  target_region TEXT,
  strategy_type TEXT,
  projected_users INTEGER,
  projected_revenue_cents INTEGER,
  confidence_level TEXT,
  scenario_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

########################################
# FORECAST ENGINE
########################################
cur.execute("""
CREATE TABLE IF NOT EXISTS territory_forecast (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  territory_name TEXT,
  projected_growth TEXT,
  projected_revenue_cents INTEGER,
  recommended_action TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

########################################
# SEED — USA STATES + GLOBAL SAMPLE
########################################
states = [
"California","Texas","Florida","New York","Illinois","Georgia","Ohio","North Carolina","Michigan","Pennsylvania",
"Washington","Arizona","Massachusetts","Tennessee","Indiana","Missouri","Maryland","Colorado","Minnesota","South Carolina"
]

for s in states:
    cur.execute("""
    INSERT INTO territory_registry
    (territory_name, territory_type, region, launch_phase, monetization_focus, priority_level, activation_status)
    VALUES (?, 'state', 'USA', 'future', 'creator+property+premium', 'high', 'inactive')
    """, (s,))

countries = [
"United States","Canada","Japan","India","China","Nigeria","Ghana","Kenya","Philippines","Thailand"
]

for c in countries:
    cur.execute("""
    INSERT INTO territory_registry
    (territory_name, territory_type, region, launch_phase, monetization_focus, priority_level, activation_status)
    VALUES (?, 'country', 'global', 'future', 'creator+marketplace', 'high', 'inactive')
    """, (c,))

########################################
# SAMPLE SCENARIOS
########################################
cur.execute("""
INSERT INTO scenario_simulation_registry
(scenario_name, target_region, strategy_type, projected_users, projected_revenue_cents, confidence_level)
VALUES
('USA Creator Expansion','USA','creator-first',50000,250000000,'high'),
('Africa Mobile Creator Boom','Africa','mobile-first',75000,180000000,'medium'),
('Asia Premium Gaming Push','Asia','premium-world',100000,400000000,'high')
""")

########################################
# SAMPLE FORECAST
########################################
cur.execute("""
INSERT INTO territory_forecast
(territory_name, projected_growth, projected_revenue_cents, recommended_action)
VALUES
('Georgia','high',50000000,'launch_creator_marketplace'),
('Nigeria','very_high',90000000,'mobile_creator_focus'),
('Japan','high',120000000,'premium_world_launch')
""")

conn.commit()
conn.close()
print("[OK] time machine + territory intelligence tables ready")
PYEOF

########################################
# 3) SAFE RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

########################################
# 4) SNAPSHOT
########################################
sqlite3 -json db/aam.db "select count(*) as territory_registry from territory_registry;" > "snapshots/territory_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as timeline_registry from timeline_registry;" > "snapshots/timeline_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scenario_simulation_registry from scenario_simulation_registry;" > "snapshots/scenario_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as territory_forecast from territory_forecast;" > "snapshots/forecast_${STAMP}.json"

########################################
# 5) REPORT
########################################
cat > "reports/time_machine_territory_intelligence_${STAMP}.txt" <<REPORT
TIME MACHINE + TERRITORY INTELLIGENCE REPORT
Timestamp: ${STAMP}

Added:
- territory registry (states + countries)
- timeline engine
- scenario simulation engine
- forecast engine

Purpose:
- turn platform into future simulation system
- support global rollout
- enable intelligent expansion decisions
REPORT

echo "TIME MACHINE + TERRITORY INTELLIGENCE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/territory_registry_${STAMP}.json"
echo "  cat snapshots/forecast_${STAMP}.json"

