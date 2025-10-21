const sqlite3 = require('sqlite3');

async function run() {
  const raw = new sqlite3.Database('./data.db');
  const db = {
    run: (sql, params=[]) => new Promise((resolve, reject) => raw.run(sql, params, function(err){ if(err) reject(err); else resolve(this); })),
    get: (sql, params=[]) => new Promise((resolve, reject) => raw.get(sql, params, (err, row)=>{ if(err) reject(err); else resolve(row); })),
    all: (sql, params=[]) => new Promise((resolve, reject) => raw.all(sql, params, (err, rows)=>{ if(err) reject(err); else resolve(rows); })),
    close: () => new Promise((resolve, reject) => raw.close(err => err ? reject(err) : resolve())),
  };
  const users = await db.all('SELECT id FROM users');
  if (users.length === 0) {
    console.log('Seeding users...');
    for (const u of [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
      { name: 'Carol', email: 'carol@example.com' },
    ]) {
      await db.run('INSERT INTO users (name, email) VALUES (?, ?)', [u.name, u.email]);
    }
  }

  const restaurants = await db.all('SELECT id FROM restaurants');
  if (restaurants.length === 0) {
    console.log('Seeding restaurants...');
    for (const r of [
      { name: 'Pizza Palace', address: '123 Main St', phone: '555-1111' },
      { name: 'Sushi Spot', address: '456 Oak Ave', phone: '555-2222' },
    ]) {
      await db.run('INSERT INTO restaurants (name, address, phone) VALUES (?, ?, ?)', [r.name, r.address, r.phone]);
    }
  }

  const rows = await db.all('SELECT id FROM restaurants');
  const first = rows[0]?.id;
  const second = rows[1]?.id;
  const mi = await db.all('SELECT id FROM menu_items');
  if (mi.length === 0 && first && second) {
    console.log('Seeding menu items...');
    for (const m of [
      { restaurant_id: first, name: 'Margherita', price: 9.99 },
      { restaurant_id: first, name: 'Pepperoni', price: 11.5 },
      { restaurant_id: second, name: 'California Roll', price: 7.25 },
      { restaurant_id: second, name: 'Spicy Tuna Roll', price: 8.75 },
    ]) {
      await db.run('INSERT INTO menu_items (restaurant_id, name, price) VALUES (?, ?, ?)', [m.restaurant_id, m.name, m.price]);
    }
  }

  console.log('Seed completed.');
  await db.close();
}

run().catch(err => { console.error(err); process.exit(1); });
