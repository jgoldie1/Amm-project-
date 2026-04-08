import os
import sqlite3

DB_PATH = "data/aame.db"
os.makedirs("data", exist_ok=True)

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.execute("""
create table if not exists products (
    id integer primary key autoincrement,
    name text not null,
    category text not null,
    price real not null
)
""")

cur.execute("""
create table if not exists streams (
    id integer primary key autoincrement,
    title text not null,
    genre text not null,
    status text not null
)
""")

cur.execute("""
create table if not exists services (
    id integer primary key autoincrement,
    name text not null,
    type text not null,
    price real not null
)
""")

cur.execute("select count(*) from products")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "insert into products (name, category, price) values (?, ?, ?)",
        [
            ("Holo Display", "Hardware", 499.99),
            ("Creator Subscription", "Digital", 19.99),
            ("Drone Billboard Slot", "Advertising", 299.00),
            ("Quantum Merch Pack", "Retail", 79.99),
            ("Vendor Booth License", "Marketplace", 149.99),
            ("VIP Event Access", "Experience", 99.99),
        ],
    )

cur.execute("select count(*) from streams")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "insert into streams (title, genre, status) values (?, ?, ?)",
        [
            ("AAME Live Launch", "Business", "scheduled"),
            ("Quantum Beats Session", "Music", "live"),
            ("Marketplace Seller Training", "Education", "archived"),
            ("Holo Sports Preview", "Sports", "scheduled"),
            ("Founder Vision Cast", "Talk", "live"),
            ("Next City Buildout", "Documentary", "archived"),
        ],
    )

cur.execute("select count(*) from services")
if cur.fetchone()[0] == 0:
    cur.executemany(
        "insert into services (name, type, price) values (?, ?, ?)",
        [
            ("Hair Appointment", "Beauty", 85.00),
            ("Logistics Dispatch", "Transport", 120.00),
            ("Brand Promotion", "Marketing", 250.00),
            ("Content Recording", "Media", 175.00),
            ("Business Setup", "Consulting", 500.00),
            ("Tech Training", "Education", 300.00),
        ],
    )

conn.commit()
conn.close()

print("Database ready:", DB_PATH)
