-- Comprehensive seed data matching the actual database schema
-- Tables: admins, restaurants, menu_items, users

-- Clear existing data
DELETE FROM users;
DELETE FROM restaurants;
DELETE FROM menu_items;
DELETE FROM admins;

-- Seed Admins
INSERT INTO admins (id, email, password, name, role) VALUES
(1, 'admin@example.com', 'password123', 'Super Admin', 'SUPER_ADMIN'),
(2, 'manager@enatega.com', 'manager123', 'Restaurant Manager', 'RESTAURANT_MANAGER'),
(3, 'support@enatega.com', 'support123', 'Customer Support', 'SUPPORT');

-- Seed Restaurants (matching actual schema: id, name, address, image)
INSERT INTO restaurants (id, name, address, image) VALUES
(1, 'Burger Palace', '123 Main St, Downtown', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add'),
(2, 'Pizza Corner', '456 Oak Ave, Midtown', 'https://images.unsplash.com/photo-1513104890138-7c749659a591'),
(3, 'Sakura Sushi', '789 Cherry Blvd, Eastside', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351'),
(4, 'Sweet Dreams Bakery', '321 Sugar Lane, Westside', 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d'),
(5, 'Green Garden', '654 Health St, Northside', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd'),
(6, 'Coffee Central', '987 Bean Ave, Central', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085'),
(7, 'Taco Fiesta', '147 Spice St, Southside', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b'),
(8, 'Mediterranean Delights', '258 Olive Way, Harbor District', 'https://images.unsplash.com/photo-1544124499-58912cbddaad'),
(9, 'Thai Spice House', '369 Bangkok Rd, Asia Town', 'https://images.unsplash.com/photo-1617093727343-374698b1b08d'),
(10, 'Indian Curry Palace', '741 Spice Route, Little India', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe');

-- Seed Users (matching actual schema: id, email, password, name)
INSERT INTO users (id, email, password, name) VALUES
(1, 'john@example.com', 'password123', 'John Doe'),
(2, 'jane@example.com', 'password123', 'Jane Smith'),
(3, 'mike@example.com', 'password123', 'Mike Johnson'),
(4, 'sarah@example.com', 'password123', 'Sarah Wilson'),
(5, 'david@example.com', 'password123', 'David Brown'),
(6, 'lisa@example.com', 'password123', 'Lisa Davis'),
(7, 'tom@example.com', 'password123', 'Tom Miller'),
(8, 'emma@example.com', 'password123', 'Emma Garcia'),
(9, 'alex@example.com', 'password123', 'Alex Rodriguez'),
(10, 'maria@example.com', 'password123', 'Maria Santos'),
(11, 'james@example.com', 'password123', 'James Chen'),
(12, 'sofia@example.com', 'password123', 'Sofia Kim'),
(13, 'carlos@example.com', 'password123', 'Carlos Martinez'),
(14, 'anna@example.com', 'password123', 'Anna Johnson'),
(15, 'ryan@example.com', 'password123', 'Ryan Anderson');

-- Seed Menu Items (matching actual schema: id, restaurant_id, name, price)
-- Burger Palace (restaurant_id: 1)
INSERT INTO menu_items (id, restaurant_id, name, price) VALUES
(1, 1, 'Classic Burger', 12.99),
(2, 1, 'Cheese Burger', 14.99),
(3, 1, 'Bacon Burger', 16.99),
(4, 1, 'Veggie Burger', 13.99),
(5, 1, 'French Fries', 5.99),
(6, 1, 'Onion Rings', 6.99),
(7, 1, 'Chicken Wings', 9.99),
(8, 1, 'BBQ Burger', 17.99),

-- Pizza Corner (restaurant_id: 2)
(9, 2, 'Margherita Pizza', 18.99),
(10, 2, 'Pepperoni Pizza', 21.99),
(11, 2, 'Supreme Pizza', 24.99),
(12, 2, 'Hawaiian Pizza', 22.99),
(13, 2, 'Veggie Pizza', 20.99),
(14, 2, 'Garlic Bread', 7.99),
(15, 2, 'Caesar Salad', 9.99),
(16, 2, 'Buffalo Wings', 11.99),

-- Sakura Sushi (restaurant_id: 3)
(17, 3, 'California Roll', 8.99),
(18, 3, 'Salmon Nigiri', 6.99),
(19, 3, 'Dragon Roll', 15.99),
(20, 3, 'Tuna Sashimi', 12.99),
(21, 3, 'Miso Soup', 4.99),
(22, 3, 'Tempura Shrimp', 12.99),
(23, 3, 'Rainbow Roll', 16.99),
(24, 3, 'Spicy Tuna Roll', 9.99),

-- Sweet Dreams Bakery (restaurant_id: 4)
(25, 4, 'Chocolate Cake', 6.99),
(26, 4, 'Strawberry Cheesecake', 7.99),
(27, 4, 'Apple Pie', 5.99),
(28, 4, 'Chocolate Chip Cookies', 4.99),
(29, 4, 'Croissant', 3.99),
(30, 4, 'Blueberry Muffin', 4.99),
(31, 4, 'Red Velvet Cake', 7.99),
(32, 4, 'Tiramisu', 8.99),

-- Green Garden (restaurant_id: 5)
(33, 5, 'Caesar Salad', 11.99),
(34, 5, 'Quinoa Bowl', 13.99),
(35, 5, 'Avocado Toast', 9.99),
(36, 5, 'Green Smoothie', 7.99),
(37, 5, 'Kale Salad', 10.99),
(38, 5, 'Acai Bowl', 12.99),
(39, 5, 'Veggie Wrap', 9.99),
(40, 5, 'Fresh Fruit Bowl', 8.99),

-- Coffee Central (restaurant_id: 6)
(41, 6, 'Espresso', 3.99),
(42, 6, 'Cappuccino', 5.99),
(43, 6, 'Latte', 6.99),
(44, 6, 'Iced Coffee', 4.99),
(45, 6, 'Americano', 4.49),
(46, 6, 'Mocha', 6.99),
(47, 6, 'Frappuccino', 7.99),
(48, 6, 'Hot Chocolate', 5.49),

-- Taco Fiesta (restaurant_id: 7)
(49, 7, 'Beef Tacos', 8.99),
(50, 7, 'Chicken Quesadilla', 10.99),
(51, 7, 'Guacamole & Chips', 6.99),
(52, 7, 'Burrito Bowl', 12.99),
(53, 7, 'Fish Tacos', 11.99),
(54, 7, 'Nachos Supreme', 13.99),
(55, 7, 'Churros', 5.99),
(56, 7, 'Mexican Rice Bowl', 9.99),

-- Mediterranean Delights (restaurant_id: 8)
(57, 8, 'Hummus Platter', 9.99),
(58, 8, 'Grilled Chicken Shawarma', 14.99),
(59, 8, 'Lamb Gyros', 16.99),
(60, 8, 'Greek Salad', 11.99),
(61, 8, 'Falafel Wrap', 10.99),
(62, 8, 'Baklava', 6.99),
(63, 8, 'Tabbouleh', 8.99),
(64, 8, 'Mediterranean Bowl', 13.99),

-- Thai Spice House (restaurant_id: 9)
(65, 9, 'Pad Thai', 13.99),
(66, 9, 'Green Curry', 15.99),
(67, 9, 'Tom Yum Soup', 8.99),
(68, 9, 'Mango Sticky Rice', 6.99),
(69, 9, 'Thai Basil Chicken', 14.99),
(70, 9, 'Massaman Curry', 16.99),
(71, 9, 'Spring Rolls', 7.99),
(72, 9, 'Coconut Rice', 4.99),

-- Indian Curry Palace (restaurant_id: 10)
(73, 10, 'Chicken Tikka Masala', 16.99),
(74, 10, 'Lamb Biryani', 18.99),
(75, 10, 'Vegetable Curry', 13.99),
(76, 10, 'Naan Bread', 4.99),
(77, 10, 'Samosas', 6.99),
(78, 10, 'Mango Lassi', 5.99),
(79, 10, 'Palak Paneer', 14.99),
(80, 10, 'Gulab Jamun', 5.99);