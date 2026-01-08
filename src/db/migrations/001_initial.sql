-- Categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Kudos table
CREATE TABLE kudos (
  id SERIAL PRIMARY KEY,
  sender_id VARCHAR(50),
  is_anonymous BOOLEAN DEFAULT false,
  message TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  channel_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Kudos recipients table (many recipients per kudos)
CREATE TABLE kudos_recipients (
  id SERIAL PRIMARY KEY,
  kudos_id INTEGER REFERENCES kudos(id) ON DELETE CASCADE,
  recipient_id VARCHAR(50) NOT NULL,
  notified BOOLEAN DEFAULT false
);

-- Settings table
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Default categories
INSERT INTO categories (name, emoji) VALUES
  ('Teamwork', '🤝'),
  ('Innovation', '💡'),
  ('Helping Hand', '🙌'),
  ('Leadership', '⭐'),
  ('Going Extra Mile', '🚀');
