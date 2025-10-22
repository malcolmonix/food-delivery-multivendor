import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

/**
 * Seed Nigerian fast-food restaurants and menus for Uyo, Calabar, and Ikom.
 * - Uses parameterized queries (safe for names with apostrophes)
 * - Idempotent upsert-by (name + address) for restaurants and (restaurant_id + name) for menu items
 * - Cleans price strings like "from ₦9,000" or "Estimated ₦1,500 - ₦3,000" to numeric
 */

const DB_PATH = '../enatega.db';

function parseNairaPrice(text) {
  if (!text || typeof text !== 'string') return 0;
  // Normalize
  let s = text
    .replace(/\s+/g, ' ')
    .replace(/₦/g, '')
    .replace(/,/g, '')
    .trim()
    .toLowerCase();

  // Ranges (e.g., "estimated 1500 - 3000" or "780 - 1040")
  const rangeMatch = s.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    const a = parseFloat(rangeMatch[1]);
    const b = parseFloat(rangeMatch[2]);
    if (!Number.isNaN(a) && !Number.isNaN(b)) return Math.round(((a + b) / 2) * 100) / 100;
  }

  // Single number possibly preceded by words like "from", "estimated"
  const singleMatch = s.match(/(\d+(?:\.\d+)?)/);
  if (singleMatch) {
    const v = parseFloat(singleMatch[1]);
    if (!Number.isNaN(v)) return v;
  }

  return 0;
}

const DATA = [
  {
    state: 'Akwa Ibom',
    city: 'Uyo',
    restaurants: [
      {
        name: 'Chicken Republic',
        menu: [
          { name: 'Half Flame Grilled Chicken', price: 'from ₦9,000' },
          { name: 'Big Boyz Meals', price: '₦7,150' },
          { name: 'Burger', price: '₦4,560' },
          { name: 'Burger Meal', price: '₦6,765' },
          { name: 'Chicken Pie', price: '₦1,080' },
          { name: 'Refuel Max (Spicy Fried Chicken with Plantain)', price: '₦3,900' },
        ],
      },
      {
        name: 'Madrid Foods Nigeria',
        menu: [
          { name: 'Burgers', price: 'Estimated ₦1,500 - ₦3,000' },
          { name: 'Continental Dishes', price: 'Estimated ₦2,000 - ₦4,000' },
          { name: 'Pastries', price: 'Estimated ₦500 - ₦1,000' },
          { name: 'Shawarma', price: 'Estimated ₦1,500' },
        ],
      },
      {
        name: 'Kilimanjaro',
        menu: [
          { name: 'Beefy Rice & Breaded Chicken', price: '₦3,900' },
          { name: 'K-Jollof Rice & Breaded Chicken', price: '₦3,200' },
          { name: 'Meat Pie Triple Delight', price: 'Estimated ₦1,000 - ₦2,000' },
        ],
      },
      {
        name: 'Oliver Tweest Food',
        menu: [
          { name: 'Local Dishes', price: 'Estimated ₦1,000 - ₦2,500' },
          { name: 'Continental Dishes', price: 'Estimated ₦2,000 - ₦3,500' },
        ],
      },
      {
        name: 'Tantalizers Fast Food',
        menu: [
          { name: 'Jollof Rice', price: '₦600' },
          { name: 'Fried Rice', price: '₦600' },
          { name: 'Peppered Grilled Chicken', price: '₦3,800' },
          { name: 'Roasted Chicken', price: '₦3,800' },
          { name: 'Crunchy Chicken Piece (1/8)', price: '₦2,000' },
          { name: 'Chicken Wings', price: '₦2,000' },
        ],
      },
      {
        name: 'Crunchies Fried Chicken',
        menu: [
          { name: 'Fried Chicken Bucket', price: 'Estimated ₦3,000 - ₦5,000' },
          { name: 'Shawarma', price: 'Estimated ₦1,500' },
          { name: 'Pastries', price: 'Estimated ₦500 - ₦1,000' },
          { name: 'Ice Cream', price: 'Estimated ₦800 - ₦1,500' },
        ],
      },
    ],
  },
  {
    state: 'Cross River',
    city: 'Calabar',
    restaurants: [
      {
        name: 'Crunchies Fried Chicken',
        menu: [
          { name: 'Fried Chicken Meals', price: 'Estimated ₦2,500 - ₦4,000' },
          { name: 'Shawarma', price: 'Estimated ₦1,500' },
          { name: 'Pastries and Cakes', price: 'Estimated ₦500 - ₦2,000' },
          { name: 'Ice Cream', price: 'Estimated ₦800 - ₦1,500' },
        ],
      },
      {
        name: "Domino's Pizza Calabar",
        menu: [
          { name: 'Smallie Pizza', price: '₦780 - ₦1,040' },
          { name: 'Medium Pizza', price: 'from ₦2,200' },
          { name: 'Breadsticks', price: 'Estimated ₦1,000' },
          { name: 'Cinnastix', price: 'Estimated ₦1,200' },
        ],
      },
      {
        name: "AJ's PiriPiri",
        menu: [
          { name: 'Shawarma', price: '₦1,500' },
          { name: 'Piri Piri Chicken', price: 'Estimated ₦2,000 - ₦3,000' },
          { name: 'Burger', price: 'Estimated ₦1,500 - ₦2,500' },
          { name: 'Chips', price: 'Estimated ₦500' },
        ],
      },
      {
        name: 'Amys Patisserie',
        menu: [
          { name: 'Cakes (250g)', price: '₦15,000' },
          { name: 'Pastries', price: 'Estimated ₦500 - ₦2,000' },
        ],
      },
      {
        name: 'Beverly Heels Club & Fast Food',
        menu: [
          { name: 'Local Nigerian Dishes', price: 'Estimated ₦1,000 - ₦3,000' },
          { name: 'Pastries', price: 'Estimated ₦500 - ₦1,000' },
          { name: 'Drinks', price: 'Estimated ₦300 - ₦800' },
        ],
      },
      {
        name: 'Crispy Chicken',
        menu: [
          { name: 'Fried Chicken', price: 'Estimated ₦2,000 - ₦4,000' },
          { name: 'Fried Rice', price: 'Estimated ₦1,000 - ₦1,500' },
          { name: 'Burgers', price: 'Estimated ₦1,500' },
        ],
      },
      {
        name: 'De Choice Fast Food',
        menu: [
          { name: 'Boiled Yam', price: 'Estimated ₦500' },
          { name: 'Chicken Moi Moi', price: 'Estimated ₦800' },
          { name: 'Chicken Rice', price: 'Estimated ₦1,200' },
          { name: 'Coconut Rice', price: 'Estimated ₦1,000' },
          { name: 'Spaghetti', price: 'Estimated ₦1,000' },
        ],
      },
      {
        name: 'Fiesta Fries Calabar',
        menu: [
          { name: 'Fries and Chicken Combos', price: 'Estimated ₦1,500 - ₦2,500' },
          { name: 'Buffet Ticket', price: '₦2,000' },
        ],
      },
      {
        name: 'Fresh Chopa',
        menu: [
          { name: 'Chopa (Fish) Dishes', price: 'Estimated ₦2,000 - ₦5,000' },
          { name: 'Local Soups', price: 'Estimated ₦1,500 - ₦3,000' },
        ],
      },
      {
        name: "Jason's Pizza Hut",
        menu: [
          { name: 'Pizza', price: 'Estimated ₦2,000 - ₦4,000' },
          { name: 'Shawarma', price: 'Estimated ₦1,500' },
          { name: 'Pies and Cakes', price: 'Estimated ₦1,000 - ₦2,000' },
        ],
      },
      {
        name: 'Jose Bole and Barbecue',
        menu: [
          { name: 'Bole (Roasted Plantain)', price: 'Estimated ₦500 - ₦1,000' },
          { name: 'Barbecue Fish/Chicken', price: 'Estimated ₦2,000 - ₦4,000' },
          { name: 'Pepper Sauce', price: 'Estimated ₦200' },
        ],
      },
      {
        name: 'Joseph Fast Food Joint',
        menu: [
          { name: 'Fast Food Meals', price: 'Estimated ₦1,000 - ₦2,500' },
        ],
      },
      {
        name: 'Native Kitchen',
        menu: [
          { name: 'Native Dishes (e.g., Soups and Swallow)', price: '₦6,000' },
          { name: 'Local Delicacies', price: 'Estimated ₦1,000 - ₦3,000' },
        ],
      },
      {
        name: 'Okey Fast Food',
        menu: [
          { name: 'Local Meals', price: 'Estimated ₦800 - ₦2,000' },
        ],
      },
      {
        name: 'Royal Chops',
        menu: [
          { name: 'Small Chops', price: '₦1,000' },
          { name: 'Grilled Meats', price: 'Estimated ₦2,000 - ₦3,500' },
        ],
      },
      {
        name: 'Chicken Republic',
        menu: [
          { name: 'Half Flame Grilled Chicken', price: 'from ₦9,000' },
          { name: 'Refuel Meal', price: 'from ₦1,000' },
          { name: 'Burgers', price: '₦4,560' },
        ],
      },
      {
        name: 'Happy Food',
        menu: [
          { name: 'Chinese Dishes', price: 'Estimated ₦1,500 - ₦3,000' },
          { name: 'Bakery Items', price: 'Estimated ₦500 - ₦1,500' },
        ],
      },
      {
        name: 'Hot Grill',
        menu: [
          { name: 'Grilled Meats', price: 'Estimated ₦2,000 - ₦4,000' },
          { name: 'Shawarma', price: 'Estimated ₦1,500' },
          { name: 'Bakery Items', price: 'Estimated ₦500 - ₦1,000' },
        ],
      },
      {
        name: 'Apples Fried Chicken Ltd',
        menu: [
          { name: 'Fried Chicken', price: 'Estimated ₦2,000 - ₦3,500' },
        ],
      },
      {
        name: 'Pepperoni',
        menu: [
          { name: 'Pizza and Pastas', price: 'Estimated ₦2,000 - ₦4,000' },
          { name: 'Unique Dishes', price: 'Estimated ₦1,500 - ₦3,000' },
        ],
      },
      {
        name: 'Food Villa Shawarma',
        menu: [
          { name: 'Beef Shawarma', price: '₦1,500' },
          { name: 'Chicken Shawarma', price: '₦1,500' },
          { name: 'Special Shawarma', price: '₦1,500' },
          { name: 'Hungry Man Special', price: '₦2,500' },
        ],
      },
      {
        name: "Mimi's Delicacies",
        menu: [
          { name: 'Akara & Pap', price: '₦4,000' },
          { name: 'Sauced Chicken (2 litres)', price: '₦25,000' },
          { name: 'Local Delicacies', price: 'Estimated ₦1,000 - ₦3,000' },
        ],
      },
      {
        name: 'Fried Chicken Limited',
        menu: [
          { name: 'Fried Chicken Meals', price: 'Estimated ₦2,000 - ₦4,000' },
        ],
      },
      {
        name: 'Pizza Calabar',
        menu: [
          { name: 'Pizza', price: 'Estimated ₦2,000 - ₦4,000' },
          { name: 'Grilled Dishes', price: 'Estimated ₦1,500 - ₦3,000' },
        ],
      },
    ],
  },
  {
    state: 'Cross River',
    city: 'Ikom',
    restaurants: [
      {
        name: 'Mustard Seed Restaurant',
        menu: [
          { name: 'Chicken Tikka Sandwich', price: 'Estimated ₦2,000 - ₦3,000' },
          { name: 'Traditional Dishes', price: 'Estimated ₦1,500 - ₦4,000' },
        ],
      },
      {
        name: 'Mr Nice Restaurant',
        menu: [
          { name: 'Local and Continental Meals', price: 'Estimated ₦1,000 - ₦3,000' },
        ],
      },
      {
        name: 'Suya Arcade',
        menu: [
          { name: 'Beef Suya', price: '₦40' },
          { name: 'Chicken Suya', price: 'Estimated ₦30 - ₦50' },
          { name: 'Suya Combos', price: 'Estimated ₦2,000 - ₦4,000' },
        ],
      },
      {
        name: 'Havanna Kitchen',
        menu: [
          { name: 'Grilled Chicken', price: 'Estimated ₦2,000' },
          { name: 'Local Dishes', price: 'Estimated ₦1,000 - ₦2,500' },
        ],
      },
    ],
  },
];

async function ensureTables(db) {
  await db.exec(`CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image TEXT,
    address TEXT NOT NULL,
    phone TEXT
  );`);

  await db.exec(`CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
  );`);

  // Make sure legacy DBs have the columns we need on restaurants
  const cols = await db.all(`PRAGMA table_info(restaurants);`);
  const colNames = new Set(cols.map((c) => c.name));
  if (!colNames.has('image')) {
    try { await db.exec(`ALTER TABLE restaurants ADD COLUMN image TEXT;`); } catch {}
  }
  if (!colNames.has('phone')) {
    try { await db.exec(`ALTER TABLE restaurants ADD COLUMN phone TEXT;`); } catch {}
  }
}

async function upsertRestaurant(db, name, address) {
  const info = await db.all(`PRAGMA table_info(restaurants);`);
  const hasImage = info.some((c) => c.name === 'image');
  const hasPhone = info.some((c) => c.name === 'phone');

  const existing = await db.get(`SELECT id FROM restaurants WHERE name = ? AND address = ?`, [name, address]);
  if (existing?.id) return existing.id;

  if (hasImage && hasPhone) {
    const stmt = await db.run(
      `INSERT INTO restaurants (name, image, address, phone) VALUES (?, ?, ?, ?)`,
      [name, null, address, null]
    );
    return stmt.lastID;
  } else if (hasImage && !hasPhone) {
    const stmt = await db.run(
      `INSERT INTO restaurants (name, image, address) VALUES (?, ?, ?)`,
      [name, null, address]
    );
    return stmt.lastID;
  } else if (!hasImage && hasPhone) {
    const stmt = await db.run(
      `INSERT INTO restaurants (name, address, phone) VALUES (?, ?, ?)`,
      [name, address, null]
    );
    return stmt.lastID;
  } else {
    const stmt = await db.run(
      `INSERT INTO restaurants (name, address) VALUES (?, ?)`,
      [name, address]
    );
    return stmt.lastID;
  }
}

async function upsertMenuItem(db, restaurantId, itemName, priceValue) {
  const existing = await db.get(
    `SELECT id FROM menu_items WHERE restaurant_id = ? AND name = ?`,
    [restaurantId, itemName]
  );
  if (existing?.id) {
    await db.run(`UPDATE menu_items SET price = ? WHERE id = ?`, [priceValue, existing.id]);
    return existing.id;
  }
  const stmt = await db.run(
    `INSERT INTO menu_items (restaurant_id, name, price) VALUES (?, ?, ?)`,
    [restaurantId, itemName, priceValue]
  );
  return stmt.lastID;
}

async function seed() {
  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
  await ensureTables(db);

  let restaurantCount = 0;
  let menuCount = 0;

  for (const region of DATA) {
    const { state, city } = region;
    for (const r of region.restaurants) {
      const address = `${city}, ${state}`;
      const restaurantId = await upsertRestaurant(db, r.name, address);
      restaurantCount++;

      for (const mi of r.menu || []) {
        const price = parseNairaPrice(mi.price);
        await upsertMenuItem(db, restaurantId, mi.name, price);
        menuCount++;
      }
    }
  }

  console.log(`✅ Seeded restaurants: ${restaurantCount}, menu items: ${menuCount}`);
  await db.close();
}

seed().catch((e) => {
  console.error('❌ Seed error:', e);
  process.exit(1);
});
