#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== FINAL CATCH-UP + STABILIZE START ==="

########################################
# 1) DB FULL SAFETY PATCH
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path

db_path = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

def table_exists(name):
    r = cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (name,)).fetchone()
    return bool(r)

def ensure_table(sql):
    cur.execute(sql)

def cols(table):
    return [r[1] for r in cur.execute(f"PRAGMA table_info({table})").fetchall()]

def ensure_col(table, col, ddl):
    if table_exists(table):
        if col not in cols(table):
            cur.execute(f"ALTER TABLE {table} ADD COLUMN {ddl}")
            print(f"[OK] Added {table}.{col}")

########################################
# CORE TABLES (SAFE CREATE)
########################################

ensure_table("""
CREATE TABLE IF NOT EXISTS wallets (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 wallet_name TEXT,
 wallet_status TEXT DEFAULT 'active',
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

ensure_table("""
CREATE TABLE IF NOT EXISTS wallet_transactions (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 wallet_id INTEGER,
 tx_type TEXT,
 amount_cents INTEGER,
 reference_type TEXT,
 reference_id INTEGER,
 note TEXT,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

ensure_col("wallet_transactions", "tx_status", "tx_status TEXT DEFAULT 'posted'")

ensure_table("""
CREATE TABLE IF NOT EXISTS receipts (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 payer_type TEXT,
 payer_id INTEGER,
 amount_cents INTEGER,
 receipt_type TEXT,
 reference_type TEXT,
 reference_id INTEGER,
 receipt_status TEXT,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

ensure_table("""
CREATE TABLE IF NOT EXISTS world_order_settlements (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 world_order_id INTEGER,
 amount_cents INTEGER,
 receipt_id INTEGER,
 wallet_tx_id INTEGER,
 settlement_status TEXT,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

########################################
# HOLO / DRONE / MIC / BEAT
########################################

ensure_table("""
CREATE TABLE IF NOT EXISTS holographic_messages (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 scene_id INTEGER,
 from_owner_type TEXT,
 from_owner_id INTEGER,
 to_owner_type TEXT,
 to_owner_id INTEGER,
 message_type TEXT,
 message_body TEXT,
 message_status TEXT DEFAULT 'sent',
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

ensure_table("""
CREATE TABLE IF NOT EXISTS microphone_channels (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 scene_id INTEGER,
 channel_name TEXT,
 channel_type TEXT,
 channel_status TEXT DEFAULT 'active',
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

ensure_table("""
CREATE TABLE IF NOT EXISTS drone_service_jobs (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 scene_id INTEGER,
 service_type TEXT,
 order_ref_id INTEGER,
 launch_point TEXT,
 destination_point TEXT,
 drone_status TEXT DEFAULT 'queued',
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

ensure_table("""
CREATE TABLE IF NOT EXISTS quantum_beat_profiles (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 scene_id INTEGER,
 beat_name TEXT,
 beat_mode TEXT,
 bpm INTEGER,
 beat_status TEXT DEFAULT 'active',
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

ensure_table("""
CREATE TABLE IF NOT EXISTS quantum_beat_events (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 scene_id INTEGER,
 beat_profile_id INTEGER,
 trigger_type TEXT,
 trigger_payload TEXT,
 event_status TEXT DEFAULT 'processed',
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

########################################
# ROBOTICS + MANUFACTURING SAFE
########################################

ensure_table("""
CREATE TABLE IF NOT EXISTS robotics_assets (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 asset_name TEXT,
 asset_type TEXT,
 control_status TEXT,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

ensure_table("""
CREATE TABLE IF NOT EXISTS manufacturing_jobs (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 job_name TEXT,
 job_type TEXT,
 job_status TEXT,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

########################################
# ACCESS + ENTITLEMENTS
########################################

ensure_table("""
CREATE TABLE IF NOT EXISTS entitlements (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 scene_id INTEGER,
 owner_type TEXT,
 owner_id INTEGER,
 entitlement_type TEXT,
 entitlement_status TEXT DEFAULT 'active',
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()
conn.close()

print("[OK] FULL DB STABILIZATION COMPLETE")
PYEOF

########################################
# 2) CLEAN RESTART EVERYTHING
########################################
echo "[INFO] Restarting all services..."

bash scripts/restart_world_socket.sh || true
bash scripts/safe_restart.sh

########################################
# 3) VERIFY SYSTEM HEALTH
########################################
echo "=== VERIFYING SYSTEM ==="

bash scripts/check_js.sh
bash scripts/status.sh

echo "--- SOCKET HEALTH ---"
curl -s http://127.0.0.1:5090/health || true

########################################
# 4) FINAL CHECKPOINT
########################################
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots

cp apps/dashboard.js "backups/dashboard_final_stable_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_final_stable_${STAMP}.js"
cp db/aam.db "backups/aam_final_stable_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as wallets from wallets;" > "snapshots/wallets_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as tx from wallet_transactions;" > "snapshots/tx_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as holo from holographic_messages;" > "snapshots/holo_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as drone from drone_service_jobs;" > "snapshots/drone_${STAMP}.json"

echo "FINAL CATCH-UP STABILIZATION COMPLETE: $STAMP"

echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/world-state"
echo "  termux-open-url http://127.0.0.1:4900/world-access"
echo "  termux-open-url http://127.0.0.1:4900/books"
echo "  termux-open-url http://127.0.0.1:4900/wallet-transactions"
echo "  curl -s http://127.0.0.1:5090/health"

