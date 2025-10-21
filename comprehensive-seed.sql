-- Universal seed data for all Enatega multivendor applications
-- This will populate data for admin dashboard, web apps, mobile apps

-- Clear existing data
DELETE FROM users;
DELETE FROM restaurants;
DELETE FROM menu_items;
DELETE FROM orders;
DELETE FROM categories;
DELETE FROM riders;
DELETE FROM admins;

-- Seed Admins
INSERT INTO admins (id, email, password, name, role) VALUES
(1, 'admin@example.com', 'password123', 'Super Admin', 'SUPER_ADMIN'),
(2, 'manager@enatega.com', 'manager123', 'Restaurant Manager', 'RESTAURANT_MANAGER'),
(3, 'support@enatega.com', 'support123', 'Customer Support', 'SUPPORT');

-- Seed Categories
INSERT OR IGNORE INTO categories (id, title, description, image) VALUES
(1, 'Fast Food', 'Quick and delicious fast food options', 'https://images.unsplash.com/photo-1561758033-d89a9ad46330'),
(2, 'Pizza', 'Authentic wood-fired and classic pizzas', 'https://images.unsplash.com/photo-1513104890138-7c749659a591'),
(3, 'Asian Cuisine', 'Traditional and modern Asian dishes', 'https://images.unsplash.com/photo-1617093727343-374698b1b08d'),
(4, 'Desserts', 'Sweet treats and delicious desserts', 'https://images.unsplash.com/photo-1551024506-0bccd828d307'),
(5, 'Healthy', 'Fresh, organic and healthy meal options', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd'),
(6, 'Coffee & Tea', 'Premium coffee, tea and beverages', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085');

-- Seed Restaurants
INSERT INTO restaurants (id, name, address, phone, image, delivery_time, minimum_order, delivery_fee, rating, is_active, category_id) VALUES
(1, 'Burger Palace', '123 Main St, Downtown', '+1-555-0101', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add', '20-30 min', 15.00, 2.99, 4.5, 1, 1),
(2, 'Pizza Corner', '456 Oak Ave, Midtown', '+1-555-0102', 'https://images.unsplash.com/photo-1513104890138-7c749659a591', '25-35 min', 12.00, 3.99, 4.7, 1, 2),
(3, 'Sakura Sushi', '789 Cherry Blvd, Eastside', '+1-555-0103', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351', '30-40 min', 20.00, 4.99, 4.8, 1, 3),
(4, 'Sweet Dreams Bakery', '321 Sugar Lane, Westside', '+1-555-0104', 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d', '15-25 min', 8.00, 1.99, 4.6, 1, 4),
(5, 'Green Garden', '654 Health St, Northside', '+1-555-0105', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd', '20-30 min', 10.00, 2.49, 4.4, 1, 5),
(6, 'Coffee Central', '987 Bean Ave, Central', '+1-555-0106', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', '10-15 min', 5.00, 1.49, 4.3, 1, 6),
(7, 'Taco Fiesta', '147 Spice St, Southside', '+1-555-0107', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b', '15-25 min', 8.00, 2.99, 4.2, 1, 1),
(8, 'Mediterranean Delights', '258 Olive Way, Harbor District', '+1-555-0108', 'https://images.unsplash.com/photo-1544124499-58912cbddaad', '25-35 min', 18.00, 3.49, 4.6, 1, 5);

-- Seed Users (Customers)
INSERT INTO users (id, username, email, password, phone, address, is_verified) VALUES
(1, 'john_doe', 'john@example.com', 'password123', '+1-555-1001', '100 Customer St, Apt 1A', 1),
(2, 'jane_smith', 'jane@example.com', 'password123', '+1-555-1002', '200 User Ave, Suite 2B', 1),
(3, 'mike_johnson', 'mike@example.com', 'password123', '+1-555-1003', '300 Client Rd, Unit 3C', 1),
(4, 'sarah_wilson', 'sarah@example.com', 'password123', '+1-555-1004', '400 Buyer Blvd, Floor 4D', 1),
(5, 'david_brown', 'david@example.com', 'password123', '+1-555-1005', '500 Order St, Room 5E', 1),
(6, 'lisa_davis', 'lisa@example.com', 'password123', '+1-555-1006', '600 Purchase Place, Apt 6F', 1),
(7, 'tom_miller', 'tom@example.com', 'password123', '+1-555-1007', '700 Food Lane, Suite 7G', 1),
(8, 'emma_garcia', 'emma@example.com', 'password123', '+1-555-1008', '800 Delivery Dr, Unit 8H', 1);

-- Seed Riders
INSERT OR IGNORE INTO riders (id, name, email, phone, is_available, current_location) VALUES
(1, 'Alex Rodriguez', 'alex.rider@enatega.com', '+1-555-2001', 1, '{"lat": 40.7128, "lng": -74.0060}'),
(2, 'Maria Santos', 'maria.rider@enatega.com', '+1-555-2002', 1, '{"lat": 40.7589, "lng": -73.9851}'),
(3, 'James Chen', 'james.rider@enatega.com', '+1-555-2003', 1, '{"lat": 40.7505, "lng": -73.9934}'),
(4, 'Sofia Kim', 'sofia.rider@enatega.com', '+1-555-2004', 0, '{"lat": 40.7282, "lng": -73.7949}'),
(5, 'Carlos Martinez', 'carlos.rider@enatega.com', '+1-555-2005', 1, '{"lat": 40.6892, "lng": -74.0445}');

-- Seed Menu Items for Burger Palace
INSERT INTO menu_items (id, restaurant_id, name, description, price, category, image, is_available) VALUES
-- Burger Palace (restaurant_id: 1)
(1, 1, 'Classic Burger', 'Beef patty with lettuce, tomato, and special sauce', 12.99, 'Burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', 1),
(2, 1, 'Cheese Burger', 'Classic burger with melted cheddar cheese', 14.99, 'Burgers', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add', 1),
(3, 1, 'Bacon Burger', 'Juicy burger with crispy bacon strips', 16.99, 'Burgers', 'https://images.unsplash.com/photo-1553979459-d2229ba7433a', 1),
(4, 1, 'Veggie Burger', 'Plant-based patty with fresh vegetables', 13.99, 'Burgers', 'https://images.unsplash.com/photo-1525059696034-4967a729002e', 1),
(5, 1, 'French Fries', 'Crispy golden french fries', 5.99, 'Sides', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877', 1),
(6, 1, 'Onion Rings', 'Beer-battered onion rings', 6.99, 'Sides', 'https://images.unsplash.com/photo-1639024471283-03518883512d', 1),

-- Pizza Corner (restaurant_id: 2)
(7, 2, 'Margherita Pizza', 'Classic pizza with tomato, mozzarella, and basil', 18.99, 'Pizza', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3', 1),
(8, 2, 'Pepperoni Pizza', 'Traditional pepperoni with mozzarella cheese', 21.99, 'Pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591', 1),
(9, 2, 'Supreme Pizza', 'Loaded with pepperoni, sausage, peppers, and mushrooms', 24.99, 'Pizza', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b', 1),
(10, 2, 'Hawaiian Pizza', 'Ham and pineapple with mozzarella', 22.99, 'Pizza', 'https://images.unsplash.com/photo-1552539618-7eec9b4d1796', 1),
(11, 2, 'Garlic Bread', 'Fresh baked garlic bread with herbs', 7.99, 'Appetizers', 'https://images.unsplash.com/photo-1619985632461-f33748ef8b23', 1),

-- Sakura Sushi (restaurant_id: 3)
(12, 3, 'California Roll', 'Crab, avocado, and cucumber roll', 8.99, 'Rolls', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351', 1),
(13, 3, 'Salmon Nigiri', 'Fresh salmon over seasoned rice (2 pieces)', 6.99, 'Nigiri', 'https://images.unsplash.com/photo-1607301405390-d831c242f59b', 1),
(14, 3, 'Dragon Roll', 'Eel, cucumber topped with avocado', 15.99, 'Specialty Rolls', 'https://images.unsplash.com/photo-1611143669185-af224c5e3252', 1),
(15, 3, 'Miso Soup', 'Traditional soybean paste soup', 4.99, 'Soup', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84', 1),
(16, 3, 'Tempura Shrimp', 'Lightly battered and fried shrimp (4 pieces)', 12.99, 'Appetizers', 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6', 1),

-- Sweet Dreams Bakery (restaurant_id: 4)
(17, 4, 'Chocolate Cake', 'Rich chocolate layer cake with frosting', 6.99, 'Cakes', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c', 1),
(18, 4, 'Strawberry Cheesecake', 'Creamy cheesecake with fresh strawberries', 7.99, 'Cheesecakes', 'https://images.unsplash.com/photo-1551024506-0bccd828d307', 1),
(19, 4, 'Apple Pie', 'Classic homemade apple pie', 5.99, 'Pies', 'https://images.unsplash.com/photo-1621955964441-c173e01c135b', 1),
(20, 4, 'Chocolate Chip Cookies', 'Freshly baked cookies (6 pieces)', 4.99, 'Cookies', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e', 1),
(21, 4, 'Croissant', 'Buttery flaky French croissant', 3.99, 'Pastries', 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd', 1),

-- Green Garden (restaurant_id: 5)
(22, 5, 'Caesar Salad', 'Romaine lettuce with Caesar dressing and croutons', 11.99, 'Salads', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd', 1),
(23, 5, 'Quinoa Bowl', 'Nutritious quinoa with roasted vegetables', 13.99, 'Bowls', 'https://images.unsplash.com/photo-1512058564366-18510be2db19', 1),
(24, 5, 'Avocado Toast', 'Multigrain bread with smashed avocado', 9.99, 'Toast', 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d', 1),
(25, 5, 'Green Smoothie', 'Spinach, banana, and mango smoothie', 7.99, 'Beverages', 'https://images.unsplash.com/photo-1610970881699-44a5587cabec', 1),

-- Coffee Central (restaurant_id: 6)
(26, 6, 'Espresso', 'Rich and bold espresso shot', 3.99, 'Coffee', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', 1),
(27, 6, 'Cappuccino', 'Espresso with steamed milk and foam', 5.99, 'Coffee', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d', 1),
(28, 6, 'Latte', 'Smooth espresso with steamed milk', 6.99, 'Coffee', 'https://images.unsplash.com/photo-1541167760496-1628856ab772', 1),
(29, 6, 'Iced Coffee', 'Cold brew coffee over ice', 4.99, 'Cold Drinks', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735', 1),
(30, 6, 'Blueberry Muffin', 'Fresh baked muffin with blueberries', 4.99, 'Pastries', 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa', 1);

-- Seed Orders
INSERT OR IGNORE INTO orders (id, user_id, restaurant_id, rider_id, status, total_amount, delivery_address, order_date, estimated_delivery) VALUES
(1, 1, 1, 1, 'DELIVERED', 25.97, '100 Customer St, Apt 1A', '2024-10-15 12:30:00', '2024-10-15 13:00:00'),
(2, 2, 2, 2, 'DELIVERED', 32.98, '200 User Ave, Suite 2B', '2024-10-15 18:45:00', '2024-10-15 19:20:00'),
(3, 3, 3, 3, 'IN_TRANSIT', 41.96, '300 Client Rd, Unit 3C', '2024-10-16 19:15:00', '2024-10-16 19:55:00'),
(4, 4, 4, 1, 'PREPARING', 18.98, '400 Buyer Blvd, Floor 4D', '2024-10-16 14:20:00', '2024-10-16 14:45:00'),
(5, 5, 5, 2, 'CONFIRMED', 21.98, '500 Order St, Room 5E', '2024-10-16 20:10:00', '2024-10-16 20:40:00'),
(6, 6, 6, NULL, 'PENDING', 15.97, '600 Purchase Place, Apt 6F', '2024-10-16 08:30:00', '2024-10-16 08:45:00'),
(7, 7, 1, 3, 'DELIVERED', 29.97, '700 Food Lane, Suite 7G', '2024-10-14 13:15:00', '2024-10-14 13:45:00'),
(8, 8, 2, 1, 'DELIVERED', 46.98, '800 Delivery Dr, Unit 8H', '2024-10-14 19:30:00', '2024-10-14 20:05:00');

-- Update sequence counters (SQLite auto-increment handling)
UPDATE sqlite_sequence SET seq = 8 WHERE name = 'restaurants';
UPDATE sqlite_sequence SET seq = 30 WHERE name = 'menu_items';
UPDATE sqlite_sequence SET seq = 8 WHERE name = 'users';
UPDATE sqlite_sequence SET seq = 3 WHERE name = 'admins';
UPDATE sqlite_sequence SET seq = 8 WHERE name = 'orders';

-- Insert sample configurations
INSERT OR IGNORE INTO configurations (key, value, description) VALUES
('currency_symbol', '$', 'Currency symbol used in the application'),
('currency_code', 'USD', 'Currency code used in the application'),
('delivery_rate', '2.50', 'Base delivery rate per kilometer'),
('cost_type', 'fixed', 'Type of delivery cost calculation'),
('tax_rate', '8.5', 'Tax rate percentage'),
('app_name', 'Enatega Multivendor', 'Application name'),
('app_version', '1.0.0', 'Current application version'),
('min_order_amount', '10.00', 'Minimum order amount'),
('max_delivery_time', '60', 'Maximum delivery time in minutes'),
('enable_reviews', 'true', 'Enable customer reviews feature');