-- EsiFit PostgreSQL schema (replaces Firestore collections)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(256) UNIQUE,
  password_hash VARCHAR(255),
  phone VARCHAR(20) UNIQUE,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  role VARCHAR(16) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'COACH', 'ADMIN')),
  subscription_tier VARCHAR(16) NOT NULL DEFAULT 'FREE' CHECK (subscription_tier IN ('FREE', 'ECONOMY', 'VIP', 'ELITE')),
  stripe_customer_id VARCHAR(255),
  age INTEGER,
  gender VARCHAR(32),
  height_cm DOUBLE PRECISION,
  weight_kg DOUBLE PRECISION,
  goal VARCHAR(32) CHECK (goal IS NULL OR goal IN ('MUSCLE_GAIN', 'FAT_LOSS', 'GENERAL_FITNESS', 'STRENGTH')),
  activity_level VARCHAR(32) CHECK (activity_level IS NULL OR activity_level IN ('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE')),
  injuries TEXT,
  assigned_coach_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id);

CREATE TABLE IF NOT EXISTS phone_otp_codes (
  id TEXT PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phone_otp_phone ON phone_otp_codes(phone);

CREATE TABLE IF NOT EXISTS saved_exercises (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id VARCHAR(128) NOT NULL,
  PRIMARY KEY (user_id, exercise_id)
);

CREATE TABLE IF NOT EXISTS body_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date VARCHAR(32) NOT NULL,
  weight_kg DOUBLE PRECISION,
  waist_cm DOUBLE PRECISION,
  neck_cm DOUBLE PRECISION,
  hip_cm DOUBLE PRECISION,
  chest_cm DOUBLE PRECISION,
  arm_cm DOUBLE PRECISION,
  body_fat_pct DOUBLE PRECISION,
  photo_url VARCHAR(512)
);

CREATE INDEX IF NOT EXISTS idx_body_logs_user ON body_logs(user_id);

CREATE TABLE IF NOT EXISTS exercise_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id VARCHAR(128) NOT NULL,
  exercise_name VARCHAR(256) NOT NULL,
  date VARCHAR(32) NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight_kg DOUBLE PRECISION NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exercise_logs_user ON exercise_logs(user_id);

CREATE TABLE IF NOT EXISTS calculator_results (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(64) NOT NULL,
  input_json JSONB NOT NULL DEFAULT '{}',
  result_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calculator_results_user ON calculator_results(user_id);

CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(256) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_name VARCHAR(128) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
