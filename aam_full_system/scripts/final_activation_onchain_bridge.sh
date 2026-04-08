#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FINAL ACTIVATION + ONCHAIN BRIDGE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUP
########################################
cp apps/dashboard.js "backups/dashboard_final_activation_${STAMP}.js"
cp db/aam.db "backups/aam_final_activation_${STAMP}.db"

########################################
# 2) ONCHAIN / OFFCHAIN BRIDGE TABLES
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS blockchain_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT,
  ref_id INTEGER,
  payload TEXT,
  chain_layer TEXT DEFAULT 'offchain',
  tx_hash TEXT,
  event_status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS layer2_shards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shard_name TEXT,
  shard_status TEXT DEFAULT 'active',
  shard_load INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS telecom_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  network_type TEXT,
  bandwidth_profile TEXT,
  latency_profile TEXT,
  status TEXT DEFAULT 'active'
)
""")

# seed shards
for i in range(1,6):
    cur.execute("INSERT OR IGNORE INTO layer2_shards (id, shard_name) VALUES (?,?)",(i,f"shard_{i}"))

# seed telecom
cur.execute("INSERT OR IGNORE INTO telecom_profiles (id, network_type, bandwidth_profile, latency_profile) VALUES (1,'5G','high','low')")
cur.execute("INSERT OR IGNORE INTO telecom_profiles (id, network_type, bandwidth_profile, latency_profile) VALUES (2,'6G','ultra','ultra-low')")
cur.execute("INSERT OR IGNORE INTO telecom_profiles (id, network_type, bandwidth_profile, latency_profile) VALUES (3,'12G','quantum','near-zero')")

conn.commit()
conn.close()
print("[OK] onchain/offchain bridge ready")
PYEOF

########################################
# 3) PAYMENT → ACTIVATION ENFORCEMENT
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

marker = "INSERT INTO payment_transactions"

if "blockchain_events" not in text:
    injection = """
      dbRun(`INSERT INTO blockchain_events (event_type, ref_id, payload, chain_layer, tx_hash, event_status)
             VALUES ('payment_completed', ${__transactionId}, '${q(t.tier_code)}', 'layer2', 'tx_' || strftime('%s','now'), 'confirmed')`);

      dbRun(`INSERT INTO blockchain_events (event_type, ref_id, payload, chain_layer, event_status)
             VALUES ('unlock_granted', ${heirId}, '${q(t.tier_code)}', 'offchain', 'confirmed')`);
    """
    text = text.replace(marker, injection + "\n" + marker)

p.write_text(text)
print("[OK] payment → blockchain activation patch applied")
PYEOF

########################################
# 4) RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

########################################
# 5) FINAL SMOKE TEST
########################################
curl -s http://127.0.0.1:4900/ > "test_results/home_${STAMP}.txt" || true
curl -s http://127.0.0.1:4900/join > "test_results/join_${STAMP}.txt" || true
curl -s http://127.0.0.1:4900/watch > "test_results/watch_${STAMP}.txt" || true
curl -s http://127.0.0.1:4900/payment-control > "test_results/payment_${STAMP}.txt" || true
curl -s http://127.0.0.1:4900/engine-bridge > "test_results/engine_${STAMP}.txt" || true

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as blockchain_events from blockchain_events;" > "snapshots/blockchain_events_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as layer2_shards from layer2_shards;" > "snapshots/layer2_shards_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as telecom_profiles from telecom_profiles;" > "snapshots/telecom_profiles_${STAMP}.json"

########################################
# 7) REPORT
########################################
cat > "reports/final_activation_onchain_bridge_${STAMP}.txt" <<REPORT
FINAL ACTIVATION + ONCHAIN BRIDGE REPORT
Timestamp: ${STAMP}

Added:
- blockchain_events
- layer2_shards
- telecom_profiles

Connected:
- payment → blockchain events
- unlock → blockchain confirmation
- L2 shard system
- telecom simulation (5G/6G/12G)

Purpose:
- unify onchain + offchain system
- prepare for real blockchain integration
- enable scalable metaverse infrastructure
REPORT

echo "FINAL ACTIVATION + ONCHAIN BRIDGE COMPLETE: $STAMP"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/"
echo "  termux-open-url http://127.0.0.1:4900/watch"
echo "  termux-open-url http://127.0.0.1:4900/payment-control"
