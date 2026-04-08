CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'member',
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_assets (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER,
  title TEXT,
  media_type TEXT,
  file_path TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_entries (
  id SERIAL PRIMARY KEY,
  name TEXT,
  support_type TEXT,
  amount TEXT,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_jobs (
  id SERIAL PRIMARY KEY,
  job_type TEXT,
  payload TEXT,
  status TEXT DEFAULT 'queued',
  created_at TIMESTAMP DEFAULT NOW()
);
