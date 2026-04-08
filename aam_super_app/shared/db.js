const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.resolve('data/aam.db'));

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  userId TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  passwordHash TEXT,
  age INTEGER DEFAULT 0,
  parentId TEXT,
  verified INTEGER DEFAULT 0,
  trustScore INTEGER DEFAULT 0,
  role TEXT DEFAULT 'creator',
  status TEXT DEFAULT 'active',
  createdAt TEXT,
  verifiedAt TEXT
);

CREATE TABLE IF NOT EXISTS wallets (
  userId TEXT PRIMARY KEY,
  balance REAL DEFAULT 0,
  credits REAL DEFAULT 0,
  pending REAL DEFAULT 0,
  lifetimeEarned REAL DEFAULT 0,
  platformFeesPaid REAL DEFAULT 0,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS tracks (
  trackId TEXT PRIMARY KEY,
  artistId TEXT,
  title TEXT,
  genre TEXT,
  rate REAL DEFAULT 0.04,
  remix TEXT DEFAULT 'open',
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS streams (
  id TEXT PRIMARY KEY,
  trackId TEXT,
  artistId TEXT,
  title TEXT,
  genre TEXT,
  seconds REAL,
  verified INTEGER DEFAULT 0,
  repeatCount INTEGER DEFAULT 0,
  qualified INTEGER DEFAULT 0,
  payout REAL DEFAULT 0,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  contentId TEXT,
  reason TEXT,
  reporter TEXT,
  evidenceWindow TEXT,
  at TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS dmca (
  id TEXT PRIMARY KEY,
  claimant TEXT,
  contentId TEXT,
  statement TEXT,
  at TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS appeals (
  id TEXT PRIMARY KEY,
  contentId TEXT,
  appellant TEXT,
  reason TEXT,
  at TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS ads (
  id TEXT PRIMARY KEY,
  adId TEXT,
  placement TEXT,
  viewerId TEXT,
  revenue REAL DEFAULT 0,
  at TEXT
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT,
  userId TEXT,
  fromUser TEXT,
  toUser TEXT,
  creatorId TEXT,
  amount REAL DEFAULT 0,
  gross REAL DEFAULT 0,
  fee REAL DEFAULT 0,
  net REAL DEFAULT 0,
  platformPct REAL DEFAULT 0,
  createdAt TEXT
);
`);

module.exports = db;
