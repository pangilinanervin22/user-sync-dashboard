-- =============================================
-- User Sync Dashboard — Database Setup
-- Run this in the Supabase SQL Editor
-- =============================================

-- 1. Enable uuid extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the users table
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  synced_at  TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Seed sample users (some synced, some pending)
INSERT INTO users (name, email, synced_at) VALUES
  ('Alice Johnson',  'alice@example.com',   NOW() - INTERVAL '2 days'),
  ('Bob Smith',      'bob@example.com',     NULL),
  ('Carol Williams', 'carol@example.com',   NOW() - INTERVAL '5 hours'),
  ('David Brown',    'david@example.com',   NULL),
  ('Eve Davis',      'eve@example.com',     NULL)
ON CONFLICT (email) DO NOTHING;

-- 4. (Optional) Enable Row Level Security — open access for demo
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);
