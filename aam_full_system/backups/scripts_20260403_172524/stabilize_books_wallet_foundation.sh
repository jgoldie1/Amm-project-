#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== STABILIZE + BOOKS/WALLET FOUNDATION START ==="

########################################
# 1) DATABASE FOUNDATION
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path

db_path = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# -----------------------------
# Wallet / balances / receipts
# -----------------------------
cur.execute("""
CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_type TEXT NOT NULL,
    owner_id INTEGER NOT NULL,
    wallet_name TEXT NOT NULL,
    balance_cents INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_id INTEGER NOT NULL,
    tx_type TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    reference_type TEXT,
    reference_id INTEGER,
    note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(wallet_id) REFERENCES wallets(id)
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payer_type TEXT NOT NULL,
    payer_id INTEGER NOT NULL,
    amount_cents INTEGER NOT NULL,
    receipt_type TEXT NOT NULL,
    reference_type TEXT,
    reference_id INTEGER,
    receipt_status TEXT NOT NULL DEFAULT 'paid',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# -----------------------------
# Books / ebooks / audiobooks
# -----------------------------
cur.execute("""
CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author_name TEXT NOT NULL,
    description TEXT,
    book_type TEXT NOT NULL DEFAULT 'ebook',
    price_cents INTEGER NOT NULL DEFAULT 0,
    access_level TEXT NOT NULL DEFAULT 'paid',
    file_path TEXT,
    cover_path TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS book_chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    chapter_title TEXT NOT NULL,
    chapter_order INTEGER NOT NULL DEFAULT 0,
    content TEXT,
    audio_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(book_id) REFERENCES books(id)
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS book_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    buyer_type TEXT NOT NULL,
    buyer_id INTEGER NOT NULL,
    amount_cents INTEGER NOT NULL,
    purchase_status TEXT NOT NULL DEFAULT 'paid',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(book_id) REFERENCES books(id)
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS reading_rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER,
    room_name TEXT NOT NULL,
    host_name TEXT NOT NULL,
    topic TEXT,
    room_status TEXT NOT NULL DEFAULT 'scheduled',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(book_id) REFERENCES books(id)
)
""")

# -----------------------------
# Seed starter books safely
# -----------------------------
seed_books = [
    (
        "All American Marketplace Blueprint",
        "James Stubbs",
        "A blueprint for branch growth, marketplace operations, and ecosystem building.",
        "ebook",
        1999,
        "paid"
    ),
    (
        "Credit Recovery Field Guide",
        "AAM Credit Team",
        "A guide to dispute workflow, document organization, and financial recovery.",
        "ebook",
        1499,
        "paid"
    ),
    (
        "Holographic Streaming Playbook",
        "HSE Studio",
        "How creators, ads, podcasts, and holographic rooms fit into the ecosystem.",
        "ebook",
        2499,
        "paid"
    )
]

for title, author, desc, book_type, price_cents, access_level in seed_books:
    cur.execute("SELECT 1 FROM books WHERE title = ?", (title,))
    if not cur.fetchone():
        cur.execute(
            """
            INSERT INTO books (title, author_name, description, book_type, price_cents, access_level)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (title, author, desc, book_type, price_cents, access_level)
        )

# -----------------------------
# Seed starter wallets safely
# -----------------------------
starter_wallets = [
    ("platform", 1, "All American Marketplace Main Wallet"),
    ("platform", 2, "El Saturn Fintech Operations Wallet"),
    ("platform", 3, "HSE Media Wallet")
]

for owner_type, owner_id, wallet_name in starter_wallets:
    cur.execute(
        "SELECT 1 FROM wallets WHERE owner_type = ? AND owner_id = ? AND wallet_name = ?",
        (owner_type, owner_id, wallet_name)
    )
    if not cur.fetchone():
        cur.execute(
            "INSERT INTO wallets (owner_type, owner_id, wallet_name, balance_cents) VALUES (?, ?, ?, 0)",
            (owner_type, owner_id, wallet_name)
        )

conn.commit()
conn.close()
print("[OK] books + wallet foundation ready")
PYEOF

########################################
# 2) VERIFY DATABASE
########################################
echo
echo "=== TABLE CHECK ==="
sqlite3 db/aam.db ".tables"

echo
echo "=== BOOK COUNT ==="
sqlite3 -json db/aam.db "select count(*) as books from books;"

echo
echo "=== WALLET COUNT ==="
sqlite3 -json db/aam.db "select count(*) as wallets from wallets;"

echo
echo "=== RECEIPT COUNT ==="
sqlite3 -json db/aam.db "select count(*) as receipts from receipts;"

########################################
# 3) APP HEALTH CHECK
########################################
echo
echo "=== APP HEALTH CHECK ==="
bash scripts/check_js.sh
bash scripts/status.sh

########################################
# 4) STABLE CHECKPOINT
########################################
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots

cp apps/dashboard.js "backups/dashboard_books_wallet_foundation_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_books_wallet_foundation_${STAMP}.js"
cp db/aam.db "backups/aam_books_wallet_foundation_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as books from books;" > "snapshots/books_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as book_chapters from book_chapters;" > "snapshots/book_chapters_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as book_purchases from book_purchases;" > "snapshots/book_purchases_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as reading_rooms from reading_rooms;" > "snapshots/reading_rooms_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as wallets from wallets;" > "snapshots/wallets_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as wallet_transactions from wallet_transactions;" > "snapshots/wallet_transactions_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as receipts from receipts;" > "snapshots/receipts_${STAMP}.json"

echo
echo "BOOKS + WALLET FOUNDATION STABLE CHECKPOINT COMPLETE: $STAMP"
