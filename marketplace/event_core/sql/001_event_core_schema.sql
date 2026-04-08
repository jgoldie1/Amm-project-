CREATE TABLE IF NOT EXISTS platform_events (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  source_service TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT DEFAULT 'queued',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platform_jobs (
  id SERIAL PRIMARY KEY,
  job_type TEXT NOT NULL,
  source_event_id INTEGER,
  payload TEXT NOT NULL,
  status TEXT DEFAULT 'queued',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platform_notifications (
  id SERIAL PRIMARY KEY,
  recipient TEXT,
  channel TEXT,
  payload TEXT NOT NULL,
  status TEXT DEFAULT 'queued',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platform_analytics (
  id SERIAL PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value TEXT NOT NULL,
  source_service TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
