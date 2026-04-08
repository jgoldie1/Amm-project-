CREATE TABLE IF NOT EXISTS notifications_live (
  id TEXT PRIMARY KEY,
  recipient TEXT,
  channel TEXT,
  subject TEXT,
  message TEXT,
  status TEXT,
  created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification_requests_live (
  id TEXT PRIMARY KEY,
  applicant_name TEXT,
  email TEXT,
  verification_type TEXT,
  brand_or_creator TEXT,
  notes TEXT,
  status TEXT,
  reviewer_note TEXT,
  created_at TIMESTAMP
);
