-- ====================================================
-- AMM OMNIVERSE — SUPABASE DATABASE SCHEMA
-- Run this in: supabase.com → SQL Editor → New Query
-- ====================================================

-- USERS (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                TEXT,
  email               TEXT UNIQUE,
  avatar_url          TEXT,
  avatar_species      TEXT DEFAULT 'human_male',
  subscription_tier   TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free','pro','creator','battle')),
  subscription_active BOOLEAN DEFAULT FALSE,
  subscription_start  TIMESTAMPTZ,
  stripe_customer_id  TEXT,
  amm_tokens          INTEGER DEFAULT 100,
  is_creator          BOOLEAN DEFAULT FALSE,
  is_ministry         BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- PLAYER STATE (game progress)
CREATE TABLE IF NOT EXISTS player_state (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  cash       INTEGER DEFAULT 2500,
  tokens     INTEGER DEFAULT 100,
  xp         INTEGER DEFAULT 0,
  level      INTEGER DEFAULT 1,
  missions   JSONB DEFAULT '[]',
  vehicles   JSONB DEFAULT '[]',
  avatar     TEXT DEFAULT 'human_male',
  cards      JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BUSINESSES (African American / Black-owned business directory)
CREATE TABLE IF NOT EXISTS businesses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  category      TEXT NOT NULL,
  city          TEXT,
  state         TEXT,
  zip           TEXT,
  phone         TEXT,
  email         TEXT,
  website       TEXT,
  hours         TEXT,
  logo_url      TEXT,
  cover_url     TEXT,
  rating        DECIMAL(2,1) DEFAULT 0,
  review_count  INTEGER DEFAULT 0,
  verified      BOOLEAN DEFAULT FALSE,
  featured      BOOLEAN DEFAULT FALSE,
  status        TEXT DEFAULT 'active' CHECK (status IN ('active','pending','suspended')),
  tags          TEXT[],
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- BUSINESS CATEGORIES (for directory browsing)
CREATE TABLE IF NOT EXISTS business_categories (
  id    SERIAL PRIMARY KEY,
  name  TEXT UNIQUE NOT NULL,
  emoji TEXT,
  count INTEGER DEFAULT 0
);
INSERT INTO business_categories (name, emoji) VALUES
  ('Food & Restaurant', '🍽️'),
  ('Barbershop & Beauty', '✂️'),
  ('Fashion & Clothing', '👗'),
  ('Music & Entertainment', '🎵'),
  ('Health & Wellness', '💪'),
  ('Technology', '💻'),
  ('Real Estate', '🏠'),
  ('Legal & Finance', '⚖️'),
  ('Church & Ministry', '✝️'),
  ('Education', '📚'),
  ('Construction & Trades', '🔨'),
  ('Photography & Media', '📸'),
  ('Consulting & Business', '💼'),
  ('Art & Design', '🎨'),
  ('Childcare & Family', '👨‍👩‍👧')
ON CONFLICT DO NOTHING;

-- BUSINESS REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  rating      INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS (marketplace)
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL,
  category    TEXT,
  is_dropship BOOLEAN DEFAULT FALSE,
  supplier_id TEXT,
  ships_in    TEXT DEFAULT 'Instant',
  inventory   INTEGER DEFAULT 999,
  sold_count  INTEGER DEFAULT 0,
  rating      DECIMAL(2,1) DEFAULT 0,
  image_url   TEXT,
  status      TEXT DEFAULT 'active',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- MARKETPLACE ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID REFERENCES products(id),
  buyer_id    UUID REFERENCES users(id),
  seller_id   UUID REFERENCES users(id),
  amount      DECIMAL(10,2) NOT NULL,
  amm_cut     DECIMAL(10,2),
  seller_cut  DECIMAL(10,2),
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','shipped','delivered','refunded')),
  stripe_pi   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- MUSIC TRACKS
CREATE TABLE IF NOT EXISTS tracks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  genre            TEXT,
  scripture        TEXT,
  bpm              INTEGER,
  file_url         TEXT,
  cover_url        TEXT,
  duration         INTEGER DEFAULT 0,
  stream_count     INTEGER DEFAULT 0,
  royalties_earned DECIMAL(10,6) DEFAULT 0,
  is_public        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- STREAM EVENTS (qualified streams for royalty calculation)
CREATE TABLE IF NOT EXISTS stream_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id       UUID REFERENCES tracks(id) ON DELETE CASCADE,
  user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  duration       INTEGER NOT NULL,
  royalty_amount DECIMAL(10,6) DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- LIVE GIFTS (streaming economy)
CREATE TABLE IF NOT EXISTS gifts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  receiver_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  gift_type    TEXT NOT NULL,
  token_amount INTEGER NOT NULL,
  usd_value    DECIMAL(10,2),
  session_id   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- SUBSCRIPTIONS LOG
CREATE TABLE IF NOT EXISTS subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  tier            TEXT NOT NULL,
  stripe_sub_id   TEXT,
  status          TEXT DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── ROW LEVEL SECURITY (RLS) ──────────────────────────────────────────
-- Users can only read/write their own data
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_state   ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks         ENABLE ROW LEVEL SECURITY;

-- Users can see their own data
CREATE POLICY "users_own" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "player_own" ON player_state FOR ALL USING (auth.uid() = user_id);

-- Businesses are public to read, owner can edit
CREATE POLICY "businesses_public_read" ON businesses FOR SELECT USING (status = 'active');
CREATE POLICY "businesses_owner_write" ON businesses FOR ALL USING (auth.uid() = owner_id);

-- Products are public to read
CREATE POLICY "products_public_read" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "products_creator_write" ON products FOR ALL USING (auth.uid() = creator_id);

-- Orders visible to buyer and seller
CREATE POLICY "orders_parties" ON orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Tracks are public
CREATE POLICY "tracks_public" ON tracks FOR SELECT USING (is_public = TRUE);
CREATE POLICY "tracks_creator" ON tracks FOR ALL USING (auth.uid() = creator_id);

-- ── INDEXES for fast queries ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_city     ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category);
CREATE INDEX IF NOT EXISTS idx_tracks_genre        ON tracks(genre);
CREATE INDEX IF NOT EXISTS idx_tracks_creator      ON tracks(creator_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer        ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_stream_events_track ON stream_events(track_id);

-- ── AUTO-CREATE user profile on signup ───────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  ) ON CONFLICT DO NOTHING;

  INSERT INTO player_state (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ====================================================
-- DONE. Your database is ready.
-- Tables: users, player_state, businesses, products,
--         orders, tracks, stream_events, gifts, subscriptions
-- ====================================================
SELECT 'AMM Omniverse schema installed successfully!' as status;
