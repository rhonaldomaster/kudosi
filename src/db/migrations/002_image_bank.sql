-- Image Bank table
CREATE TABLE image_bank (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  url VARCHAR(500) NOT NULL,
  category VARCHAR(50),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed images
INSERT INTO image_bank (title, url, category) VALUES
  ('Extra Mile', 'https://i.imgur.com/pcfQnyZ.png', 'extra-mile'),
  ('Leadership', 'https://i.imgur.com/AA4CcFR.png', 'leadership'),
  ('Respect', 'https://i.imgur.com/HmTrijt.png', 'respect'),
  ('Teamwork', 'https://i.imgur.com/p2w8rB6.png', 'teamwork'),
  ('Innovation', 'https://i.imgur.com/O0AZwx4.png', 'innovation');
