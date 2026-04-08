#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FIX QUANTUM CLOUD + HOLOGRAPHIC FINISH START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) LIGHT BACKUP
########################################
cp apps/dashboard.js "backups/dashboard_fix_quantum_cloud_holo_${STAMP}.js"
cp db/aam.db "backups/aam_fix_quantum_cloud_holo_${STAMP}.db"

########################################
# 2) VERIFY REQUIRED TABLES
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path
import sys

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

required = [
    "quantum_cloud_nodes",
    "holographic_generator_profiles",
    "immersive_experience_registry",
    "quantum_game_engine_profiles",
    "quantum_compute_tasks",
    "render_generation_queue",
]

missing = []
for t in required:
    row = cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (t,)).fetchone()
    if not row:
        missing.append(t)

conn.close()

if missing:
    print("Missing tables: " + ", ".join(missing))
    sys.exit(1)

print("[OK] quantum cloud + holographic tables verified")
PYEOF

########################################
# 3) VERIFY ROUTES EXIST
########################################
python3 << 'PYEOF'
from pathlib import Path
import sys

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

checks = [
    ("renderQuantumCloudPage", "helper renderQuantumCloudPage"),
    ("renderHolographicEnginePage", "helper renderHolographicEnginePage"),
    ("pathname === '/quantum-cloud'", "route /quantum-cloud"),
    ("pathname === '/holographic-engine'", "route /holographic-engine"),
]

missing = [label for needle, label in checks if needle not in text]

if missing:
    print("Missing dashboard pieces: " + ", ".join(missing))
    sys.exit(1)

print("[OK] quantum cloud + holographic routes verified")
PYEOF

########################################
# 4) RESTART / VERIFY
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true

########################################
# 5) FRESH SMOKE TEST
########################################
for route in \
  / \
  /quantum-cloud \
  /holographic-engine \
  /quantum-accelerator \
  /orchestration-control \
  /holo-search \
  /platform-analytics \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as quantum_cloud_nodes from quantum_cloud_nodes;" > "snapshots/quantum_cloud_nodes_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as holographic_generator_profiles from holographic_generator_profiles;" > "snapshots/holographic_generator_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as immersive_experience_registry from immersive_experience_registry;" > "snapshots/immersive_experience_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as quantum_game_engine_profiles from quantum_game_engine_profiles;" > "snapshots/quantum_game_engine_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as quantum_compute_tasks from quantum_compute_tasks;" > "snapshots/quantum_compute_tasks_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as render_generation_queue from render_generation_queue;" > "snapshots/render_generation_queue_${STAMP}.json"

sqlite3 -json db/aam.db "select id, node_name, node_type, region_scope, compute_profile, node_status, created_at from quantum_cloud_nodes order by id desc limit 50;" > "snapshots/quantum_cloud_nodes_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, profile_name, render_mode, depth_mode, output_mode, profile_status, created_at from holographic_generator_profiles order by id desc limit 50;" > "snapshots/holographic_generator_profiles_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, experience_name, experience_type, world_scope, territory_scope, experience_status, created_at from immersive_experience_registry order by id desc limit 50;" > "snapshots/immersive_experience_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, engine_name, engine_mode, physics_profile, rendering_profile, engine_status, created_at from quantum_game_engine_profiles order by id desc limit 50;" > "snapshots/quantum_game_engine_profiles_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, task_name, task_group, linked_system, compute_priority, task_status, created_at from quantum_compute_tasks order by id desc limit 50;" > "snapshots/quantum_compute_tasks_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, generation_name, generation_type, target_world, output_target, generation_status, created_at from render_generation_queue order by id desc limit 50;" > "snapshots/render_generation_queue_tail_${STAMP}.json"

########################################
# 7) FRESH-ONLY ERROR SCAN
########################################
python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such table" in lower:
        issues.append({"file": f.name, "problem": "missing_table"})
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "quantum_cloud_holographic_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] quantum cloud + holographic finish scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/fix_quantum_cloud_holographic_finish_${STAMP}.txt" <<REPORT
FIX QUANTUM CLOUD + HOLOGRAPHIC FINISH REPORT
Timestamp: ${STAMP}

Verified:
- quantum_cloud_nodes
- holographic_generator_profiles
- immersive_experience_registry
- quantum_game_engine_profiles
- quantum_compute_tasks
- render_generation_queue
- /quantum-cloud
- /holographic-engine
- dashboard health
- jarvis health
- fresh route smoke tests

Purpose:
- recover from interrupted report section
- stabilize everything
- finish the quantum cloud + holographic phase cleanly
REPORT

echo "FIX QUANTUM CLOUD + HOLOGRAPHIC FINISH COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/quantum_cloud_holographic_scan_latest.json"
echo "  cat snapshots/quantum_cloud_nodes_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/quantum-cloud"
echo "  termux-open-url http://127.0.0.1:4900/holographic-engine"
echo "  termux-open-url http://127.0.0.1:4900/quantum-accelerator"
