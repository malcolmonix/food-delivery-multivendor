

-- SQLite seed script for demo data

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT
);
INSERT INTO admins (email, password, name, role) VALUES
  ('admin@example.com', 'password123', 'Demo Admin', 'superadmin');

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT,
  image TEXT
);
INSERT INTO restaurants (name, address, image) VALUES
  ('Demo Pizza', '123 Main St', 'https://via.placeholder.com/150'),
  ('Demo Sushi', '456 Ocean Ave', 'https://via.placeholder.com/150');

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER,
  name TEXT,
  price REAL,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);
INSERT INTO menu_items (restaurant_id, name, price) VALUES
  (1, 'Pepperoni Pizza', 12.00),
  (2, 'California Roll', 8.00);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  name TEXT
);
INSERT INTO users (email, password, name) VALUES
  ('user1@example.com', 'userpass1', 'User One'),
  ('user2@example.com', 'userpass2', 'User Two');

-- Add more demo data as needed for your schema.
