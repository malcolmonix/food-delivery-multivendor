const sqlite3 = require('sqlite3');

function wrapDb(db) {
  return {
    run: (sql, params=[]) => new Promise((resolve, reject) => db.run(sql, params, function(err){ if(err) reject(err); else resolve(this); })),
    get: (sql, params=[]) => new Promise((resolve, reject) => db.get(sql, params, (err, row)=>{ if(err) reject(err); else resolve(row); })),
    all: (sql, params=[]) => new Promise((resolve, reject) => db.all(sql, params, (err, rows)=>{ if(err) reject(err); else resolve(rows); })),
  };
}

async function seedOrders() {
  console.log('🌱 Seeding orders data...');
  const raw = new sqlite3.Database('./data.db');
  const db = wrapDb(raw);

  try {
    // Check if orders already exist
    const existing = await db.get('SELECT id FROM orders LIMIT 1');
    if (existing) {
      console.log('✓ Orders already exist. Skipping seed.');
      return;
    }

    // Get existing users and restaurants
    const users = await db.all('SELECT id FROM users');
    const restaurants = await db.all('SELECT id FROM restaurants');

    if (users.length === 0 || restaurants.length === 0) {
      console.log('⚠ No users or restaurants found. Run seed.js first.');
      return;
    }

    const statuses = ['PENDING', 'ACCEPTED', 'PREPARING', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'];
    const paymentMethods = ['CARD', 'CASH', 'PAYPAL'];
    const addresses = [
      { address: '123 Main St, New York, NY 10001', lat: 40.7589, lng: -73.9851 },
      { address: '456 Oak Ave, Los Angeles, CA 90012', lat: 34.0522, lng: -118.2437 },
      { address: '789 Pine Rd, Chicago, IL 60601', lat: 41.8781, lng: -87.6298 },
    ];

    const itemTitles = [
      'Margherita Pizza',
      'Caesar Salad',
      'Pasta Carbonara',
      'Grilled Chicken',
      'French Fries',
      'Cheese Burger',
      'Veggie Wrap',
      'Chocolate Cake',
    ];

    // Create 15 sample orders
    for (let i = 1; i <= 15; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const payment = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const address = addresses[Math.floor(Math.random() * addresses.length)];
      
      const orderAmount = (Math.random() * 50 + 10).toFixed(2);
      const deliveryCharges = (Math.random() * 5 + 2).toFixed(2);
      const taxationAmount = (orderAmount * 0.1).toFixed(2);
      const tipping = (Math.random() * 5).toFixed(2);
      const paidAmount = (parseFloat(orderAmount) + parseFloat(deliveryCharges) + parseFloat(taxationAmount) + parseFloat(tipping)).toFixed(2);

      // Create date in the past (random within last 30 days)
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      
      const completedAt = (status === 'DELIVERED' || status === 'CANCELLED') 
        ? new Date(createdAt.getTime() + Math.random() * 3600000).toISOString() // +1hr
        : null;

      const orderId = `ORD-${1000 + i}`;

      const result = await db.run(
        `INSERT INTO orders (
          order_id, user_id, restaurant_id, order_status, payment_method,
          paid_amount, order_amount, delivery_charges, tipping, taxation_amount,
          delivery_address, delivery_latitude, delivery_longitude, reason,
          created_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          user.id,
          restaurant.id,
          status,
          payment,
          paidAmount,
          orderAmount,
          deliveryCharges,
          tipping,
          taxationAmount,
          address.address,
          address.lat,
          address.lng,
          status === 'CANCELLED' ? 'Customer cancelled' : null,
          createdAt.toISOString(),
          completedAt,
        ]
      );

      const dbOrderId = result.lastID;

      // Add 1-4 items to the order
      const numItems = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numItems; j++) {
        const title = itemTitles[Math.floor(Math.random() * itemTitles.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = (Math.random() * 20 + 5).toFixed(2);
        const variation = j === 0 ? 'Large' : null;
        const addons = j === 0 ? 'Extra Cheese, Garlic' : null;

        await db.run(
          `INSERT INTO order_items (order_id, title, quantity, variation, addons, price)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [dbOrderId, title, quantity, variation, addons, price]
        );
      }

      console.log(`✓ Created order ${orderId} (${status})`);
    }

    console.log('✅ Orders seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding orders:', error);
  } finally {
    raw.close();
  }
}

seedOrders();
