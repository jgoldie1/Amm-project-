CREATE TABLE IF NOT EXISTS users_live (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT,
  password_hash TEXT,
  role TEXT,
  created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media_assets_live (
  id UUID PRIMARY KEY,
  owner TEXT,
  title TEXT,
  filename TEXT,
  created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS support_payments_live (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  support_type TEXT,
  amount NUMERIC,
  message TEXT,
  created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications_live (
  id UUID PRIMARY KEY,
  recipient TEXT,
  channel TEXT,
  subject TEXT,
  message TEXT,
  status TEXT,
  created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification_requests_live (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  verification_type TEXT,
  brand_or_creator TEXT,
  notes TEXT,
  status TEXT,
  reviewer_note TEXT,
  created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS checkout_requests_live (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  product TEXT,
  amount NUMERIC,
  created_at TIMESTAMP
);
