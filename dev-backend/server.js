const express = require('express');
const cors = require('cors');
const { ApolloServer, gql } = require('apollo-server-express');
const sqlite3 = require('sqlite3');
const { promisify } = require('util');

const PORT = Number(process.env.PORT) || 4000;

function wrapDb(db) {
  return {
    exec: promisify(db.exec.bind(db)),
    run: (sql, params=[]) => new Promise((resolve, reject) => db.run(sql, params, function(err){ if(err) reject(err); else resolve(this); })),
    get: (sql, params=[]) => new Promise((resolve, reject) => db.get(sql, params, (err, row)=>{ if(err) reject(err); else resolve(row); })),
    all: (sql, params=[]) => new Promise((resolve, reject) => db.all(sql, params, (err, rows)=>{ if(err) reject(err); else resolve(rows); })),
    close: promisify(db.close.bind(db)),
  };
}

async function createDb() {
  const raw = new sqlite3.Database('./data.db');
  const db = wrapDb(raw);
  await db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      name TEXT
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE
    );
    CREATE TABLE IF NOT EXISTS restaurants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      address TEXT,
      phone TEXT
    );
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_id INTEGER,
      name TEXT,
      price REAL,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      restaurant_id INTEGER NOT NULL,
      order_status TEXT DEFAULT 'PENDING',
      payment_method TEXT DEFAULT 'CARD',
      paid_amount REAL DEFAULT 0,
      order_amount REAL DEFAULT 0,
      delivery_charges REAL DEFAULT 0,
      tipping REAL DEFAULT 0,
      taxation_amount REAL DEFAULT 0,
      delivery_address TEXT,
      delivery_latitude REAL,
      delivery_longitude REAL,
      reason TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      delivery_time TEXT,
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      variation TEXT,
      addons TEXT,
      price REAL DEFAULT 0,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
  `);
  // Seed an admin if none
  const admin = await db.get('SELECT * FROM admins LIMIT 1');
  if (!admin) {
    await db.run('INSERT INTO admins (email, password, name) VALUES (?, ?, ?)', ['owner@example.com', 'password', 'Owner']);
  }
  return db;
}

const typeDefs = gql`
  type Admin { id: ID! email: String! name: String }
  type User { id: ID! name: String! email: String! }
  type Restaurant { _id: ID! name: String! address: String! phone: String }
  type MenuItem { id: ID! restaurant_id: ID! name: String! price: Float! }

  type Address {
    deliveryAddress: String!
    latitude: Float
    longitude: Float
  }

  type OrderItem {
    id: ID!
    title: String!
    quantity: Int!
    variation: String
    addons: String
    price: Float!
  }

  type Order {
    _id: ID!
    orderId: String!
    user: User!
    restaurant: Restaurant!
    items: [OrderItem!]!
    deliveryAddress: Address!
    orderStatus: String!
    paymentMethod: String!
    paidAmount: Float!
    orderAmount: Float!
    deliveryCharges: Float!
    tipping: Float
    taxationAmount: Float!
    createdAt: String!
    deliveryTime: String
    completedAt: String
    reason: String
  }

  type OrdersResponse {
    orders: [Order!]!
    total: Int!
  }

  type Query {
    admins: [Admin!]!
    users: [User!]!
    restaurants: [Restaurant!]!
    menuItems: [MenuItem!]!
    usersCount: Int!
    restaurantsCount: Int!
    menuItemsCount: Int!
    orders(status: String, page: Int, limit: Int): OrdersResponse!
    order(id: ID!): Order
    ordersCount(status: String): Int!
  }

  type AuthPayload { token: String! userId: ID! email: String! userType: String! }

  type Mutation {
    ownerLogin(email: String!, password: String!): AuthPayload!
    updateUser(id: ID!, name: String!, email: String!): User!
    updateRestaurant(id: ID!, name: String!, address: String!, phone: String): Restaurant!
    createUser(name: String!, email: String!): User!
    createRestaurant(name: String!, address: String!, phone: String): Restaurant!
    updateOrderStatus(id: ID!, status: String!): Order
    cancelOrder(id: ID!, reason: String!): Order
  }
`;

async function start() {
  const db = await createDb();

  const resolvers = {
    Query: {
      admins: async () => await db.all('SELECT id, email, name FROM admins'),
      users: async () => await db.all('SELECT id, name, email FROM users'),
      restaurants: async () => {
        const rows = await db.all('SELECT id, name, address, phone FROM restaurants');
        return rows.map(r => ({ _id: String(r.id), name: r.name, address: r.address, phone: r.phone }));
      },
      menuItems: async () => await db.all('SELECT id, restaurant_id, name, price FROM menu_items'),
      usersCount: async () => (await db.get('SELECT COUNT(*) as c FROM users')).c,
      restaurantsCount: async () => (await db.get('SELECT COUNT(*) as c FROM restaurants')).c,
      menuItemsCount: async () => (await db.get('SELECT COUNT(*) as c FROM menu_items')).c,
      
      orders: async (_, { status, page = 1, limit = 20 }) => {
        let sql = 'SELECT * FROM orders';
        let params = [];
        if (status && status !== 'ALL') {
          sql += ' WHERE order_status = ?';
          params.push(status);
        }
        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, (page - 1) * limit);
        
        const orders = await db.all(sql, params);
        
        let countSql = 'SELECT COUNT(*) as c FROM orders';
        let countParams = [];
        if (status && status !== 'ALL') {
          countSql += ' WHERE order_status = ?';
          countParams.push(status);
        }
        const total = (await db.get(countSql, countParams)).c;
        
        return { orders, total };
      },
      
      order: async (_, { id }) => {
        return await db.get('SELECT * FROM orders WHERE id = ?', [id]);
      },
      
      ordersCount: async (_, { status }) => {
        let sql = 'SELECT COUNT(*) as c FROM orders';
        let params = [];
        if (status && status !== 'ALL') {
          sql += ' WHERE order_status = ?';
          params.push(status);
        }
        return (await db.get(sql, params)).c;
      },
    },
    
    Order: {
      _id: (parent) => String(parent.id),
      orderId: (parent) => parent.order_id,
      orderStatus: (parent) => parent.order_status,
      paymentMethod: (parent) => parent.payment_method,
      paidAmount: (parent) => parent.paid_amount,
      orderAmount: (parent) => parent.order_amount,
      deliveryCharges: (parent) => parent.delivery_charges,
      taxationAmount: (parent) => parent.taxation_amount,
      createdAt: (parent) => parent.created_at,
      deliveryTime: (parent) => parent.delivery_time,
      completedAt: (parent) => parent.completed_at,
      
      user: async (parent) => {
        return await db.get('SELECT id, name, email FROM users WHERE id = ?', [parent.user_id]);
      },
      
      restaurant: async (parent) => {
        const r = await db.get('SELECT id, name, address, phone FROM restaurants WHERE id = ?', [parent.restaurant_id]);
        return { _id: String(r.id), name: r.name, address: r.address, phone: r.phone };
      },
      
      items: async (parent) => {
        return await db.all('SELECT id, title, quantity, variation, addons, price FROM order_items WHERE order_id = ?', [parent.id]);
      },
      
      deliveryAddress: (parent) => ({
        deliveryAddress: parent.delivery_address || '',
        latitude: parent.delivery_latitude,
        longitude: parent.delivery_longitude,
      }),
    },
    Mutation: {
      ownerLogin: async (_, { email, password }) => {
        const row = await db.get('SELECT id, email FROM admins WHERE email = ? AND password = ?', [email, password]);
        if (!row) throw new Error('Invalid credentials');
        // Demo token only
        return { token: 'dev-token', userId: String(row.id), email: row.email, userType: 'OWNER' };
      },
      updateUser: async (_, { id, name, email }) => {
        await db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
        return await db.get('SELECT id, name, email FROM users WHERE id = ?', [id]);
      },
      updateRestaurant: async (_, { id, name, address, phone }) => {
        await db.run('UPDATE restaurants SET name = ?, address = ?, phone = ? WHERE id = ?', [name, address, phone || null, id]);
        const r = await db.get('SELECT id, name, address, phone FROM restaurants WHERE id = ?', [id]);
        return { _id: String(r.id), name: r.name, address: r.address, phone: r.phone };
      },
      createUser: async (_, { name, email }) => {
        const result = await db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
        const id = result.lastID;
        return await db.get('SELECT id, name, email FROM users WHERE id = ?', [id]);
      },
      createRestaurant: async (_, { name, address, phone }) => {
        const result = await db.run('INSERT INTO restaurants (name, address, phone) VALUES (?, ?, ?)', [name, address, phone || null]);
        const id = result.lastID;
        const r = await db.get('SELECT id, name, address, phone FROM restaurants WHERE id = ?', [id]);
        return { _id: String(r.id), name: r.name, address: r.address, phone: r.phone };
      },
      
      updateOrderStatus: async (_, { id, status }) => {
        const validStatuses = ['PENDING', 'ACCEPTED', 'PREPARING', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
          throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
        
        const completedAt = (status === 'DELIVERED' || status === 'CANCELLED') ? new Date().toISOString() : null;
        await db.run(
          'UPDATE orders SET order_status = ?, completed_at = ? WHERE id = ?',
          [status, completedAt, id]
        );
        return await db.get('SELECT * FROM orders WHERE id = ?', [id]);
      },
      
      cancelOrder: async (_, { id, reason }) => {
        await db.run(
          'UPDATE orders SET order_status = ?, reason = ?, completed_at = ? WHERE id = ?',
          ['CANCELLED', reason, new Date().toISOString(), id]
        );
        return await db.get('SELECT * FROM orders WHERE id = ?', [id]);
      },
    },
  };

  const app = express();
  app.use(cors({ origin: [/http:\/\/localhost:3\d{3}/, /http:\/\/127\.0\.0\.1:3\d{3}/], credentials: true }));

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  app.get('/', (_req, res) => res.send('Dev GraphQL backend running. Visit /graphql'));

  app.listen(PORT, () => console.log(`GraphQL server at http://localhost:${PORT}/graphql`));
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});
