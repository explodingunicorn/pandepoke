-- Database schema for PandePoke tournament tracking app
-- Run these commands in the Supabase SQL Editor

-- Create deck archetype tables
CREATE TABLE IF NOT EXISTS deck_archetype_1 (
  id SERIAL PRIMARY KEY,
  "Name" TEXT NOT NULL,
  image_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS deck_archetype_2 (
  id SERIAL PRIMARY KEY,
  "Name" TEXT NOT NULL,
  image_url TEXT NOT NULL
);

-- Create player table
CREATE TABLE IF NOT EXISTS player (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

-- Create result table
CREATE TABLE IF NOT EXISTS result (
  id SERIAL PRIMARY KEY,
  week_start DATE NOT NULL,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  ties INTEGER NOT NULL DEFAULT 0,
  player_id TEXT REFERENCES player(id),
  deck_archetype_1_id INTEGER REFERENCES deck_archetype_1(id),
  deck_archetype_2_id INTEGER REFERENCES deck_archetype_2(id)
);

-- Insert sample deck archetypes
INSERT INTO deck_archetype_1 ("Name", image_url) VALUES
('Charizard ex', 'https://images.pokemontcg.io/pgo/9.png'),
('Miraidon ex', 'https://images.pokemontcg.io/sv1/81.png'),
('Pikachu ex', 'https://images.pokemontcg.io/sv4pt5/8.png'),
('Lost Box', 'https://images.pokemontcg.io/swsh11/196.png'),
('Pidgeot Control', 'https://images.pokemontcg.io/sv3-5/164.png'),
('Chien-Pao ex', 'https://images.pokemontcg.io/sv2/61.png'),
('Roaring Moon ex', 'https://images.pokemontcg.io/sv4-5/124.png'),
('Iron Valiant ex', 'https://images.pokemontcg.io/sv2/89.png'),
('Gardevoir ex', 'https://images.pokemontcg.io/sv1/86.png'),
('Gholdengo ex', 'https://images.pokemontcg.io/sv2/139.png');

INSERT INTO deck_archetype_2 ("Name", image_url) VALUES
('Charizard ex', 'https://images.pokemontcg.io/pgo/9.png'),
('Miraidon ex', 'https://images.pokemontcg.io/sv1/81.png'),
('Pikachu ex', 'https://images.pokemontcg.io/sv4pt5/8.png'),
('Lost Box', 'https://images.pokemontcg.io/swsh11/196.png'),
('Pidgeot Control', 'https://images.pokemontcg.io/sv3-5/164.png'),
('Chien-Pao ex', 'https://images.pokemontcg.io/sv2/61.png'),
('Roaring Moon ex', 'https://images.pokemontcg.io/sv4-5/124.png'),
('Iron Valiant ex', 'https://images.pokemontcg.io/sv2/89.png'),
('Gardevoir ex', 'https://images.pokemontcg.io/sv1/86.png'),
('Gholdengo ex', 'https://images.pokemontcg.io/sv2/139.png');

-- Insert sample players
INSERT INTO player (id, name) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Alex Chen'),
('550e8400-e29b-41d4-a716-446655440002', 'Jordan Smith'),
('550e8400-e29b-41d4-a716-446655440003', 'Taylor Kim'),
('550e8400-e29b-41d4-a716-446655440004', 'Morgan Rivera'),
('550e8400-e29b-41d4-a716-446655440005', 'Casey Williams'),
('550e8400-e29b-41d4-a716-446655440006', 'Blake Thompson');

-- Insert sample tournament results
INSERT INTO result (week_start, wins, losses, ties, player_id, deck_archetype_1_id, deck_archetype_2_id) VALUES
-- Week 1
('2024-12-02', 4, 1, 0, '550e8400-e29b-41d4-a716-446655440001', 1, 2),
('2024-12-02', 3, 2, 0, '550e8400-e29b-41d4-a716-446655440002', 3, NULL),
('2024-12-02', 2, 3, 0, '550e8400-e29b-41d4-a716-446655440003', 4, 5),
('2024-12-02', 4, 0, 1, '550e8400-e29b-41d4-a716-446655440004', 6, NULL),

-- Week 2
('2024-12-09', 3, 2, 0, '550e8400-e29b-41d4-a716-446655440001', 2, 7),
('2024-12-09', 1, 4, 0, '550e8400-e29b-41d4-a716-446655440002', 8, NULL),
('2024-12-09', 3, 1, 1, '550e8400-e29b-41d4-a716-446655440003', 9, 10),
('2024-12-09', 2, 3, 0, '550e8400-e29b-41d4-a716-446655440005', 1, 3),

-- Week 3
('2024-12-16', 4, 1, 0, '550e8400-e29b-41d4-a716-446655440001', 4, NULL),
('2024-12-16', 3, 2, 0, '550e8400-e29b-41d4-a716-446655440002', 5, 6),
('2024-12-16', 1, 4, 0, '550e8400-e29b-41d4-a716-446655440004', 7, NULL),
('2024-12-16', 4, 1, 0, '550e8400-e29b-41d4-a716-446655440006', 8, 9),

-- Week 4
('2024-12-23', 2, 3, 0, '550e8400-e29b-41d4-a716-446655440001', 10, 1),
('2024-12-23', 4, 0, 1, '550e8400-e29b-41d4-a716-446655440003', 2, NULL),
('2024-12-23', 3, 2, 0, '550e8400-e29b-41d4-a716-446655440004', 3, 4),
('2024-12-23', 1, 3, 1, '550e8400-e29b-41d4-a716-446655440005', 5, NULL),

-- Week 5
('2024-12-30', 4, 1, 0, '550e8400-e29b-41d4-a716-446655440002', 6, 7),
('2024-12-30', 2, 3, 0, '550e8400-e29b-41d4-a716-446655440003', 8, NULL),
('2024-12-30', 3, 1, 1, '550e8400-e29b-41d4-a716-446655440005', 9, 10),
('2024-12-30', 4, 1, 0, '550e8400-e29b-41d4-a716-446655440006', 1, NULL),

-- Week 6 (current week)
('2025-01-06', 3, 2, 0, '550e8400-e29b-41d4-a716-446655440001', 2, 3),
('2025-01-06', 1, 4, 0, '550e8400-e29b-41d4-a716-446655440004', 4, NULL),
('2025-01-06', 4, 0, 1, '550e8400-e29b-41d4-a716-446655440005', 5, 6),
('2025-01-06', 2, 3, 0, '550e8400-e29b-41d4-a716-446655440006', 7, 8);