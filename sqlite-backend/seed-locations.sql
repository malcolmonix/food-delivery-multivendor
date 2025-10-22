-- SQLite seed script for locations table
-- States: Akwa Ibom, Cross River
-- Cities: Uyo (Akwa Ibom), Calabar & Ikom (Cross River)

CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  isAvailable INTEGER NOT NULL DEFAULT 1
);

INSERT INTO locations (state, city, latitude, longitude, isAvailable) VALUES
  ('Akwa Ibom', 'Uyo', 5.0389, 7.9135, 1),
  ('Cross River', 'Calabar', 4.9589, 8.3269, 1),
  ('Cross River', 'Ikom', 5.9640, 8.7067, 1);
