const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'enatega';

async function seed() {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);

    // Admin user (password is plain for demo, use bcrypt in production)
    await db.collection('admins').insertOne({
      email: 'admin@example.com',
      password: 'password123',
      name: 'Demo Admin',
      role: 'superadmin'
    });

    // Restaurants
    await db.collection('restaurants').insertMany([
      {
        name: 'Demo Pizza',
        address: '123 Main St',
        menu: [{ name: 'Pepperoni Pizza', price: 12 }],
        image: 'https://via.placeholder.com/150'
      },
      {
        name: 'Demo Sushi',
        address: '456 Ocean Ave',
        menu: [{ name: 'California Roll', price: 8 }],
        image: 'https://via.placeholder.com/150'
      }
    ]);

    // Users
    await db.collection('users').insertMany([
      {
        email: 'user1@example.com',
        password: 'userpass1',
        name: 'User One'
      },
      {
        email: 'user2@example.com',
        password: 'userpass2',
        name: 'User Two'
      }
    ]);

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await client.close();
  }
}

seed();
