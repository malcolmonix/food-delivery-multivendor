# Backend Patch: Counts, Updates, Creates

This backend patch adds minimal admin operations to the SQLite GraphQL API so the modern admin can show exact KPIs and persist edits.

## Schema additions

- Queries:
  - `usersCount: Int!`
  - `restaurantsCount: Int!`
  - `menuItemsCount: Int!`
- Mutations:
  - `updateUser(id: ID!, name: String!, email: String!): User!`
  - `updateRestaurant(id: ID!, name: String!, address: String!, phone: String): Restaurant!`
  - (Optional) `createUser(name: String!, email: String!): User!`
  - (Optional) `createRestaurant(name: String!, address: String!, phone: String): Restaurant!`

## Resolver outline (pseudo-code)

```js
// counts
usersCount: async () => db.get('SELECT COUNT(*) AS c FROM users').then(r => r.c),
restaurantsCount: async () => db.get('SELECT COUNT(*) AS c FROM restaurants').then(r => r.c),
menuItemsCount: async () => db.get('SELECT COUNT(*) AS c FROM menu_items').then(r => r.c),

// updates
updateUser: async (_, { id, name, email }) => {
  await db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
  return db.get('SELECT id, name, email FROM users WHERE id = ?', [id]);
},
updateRestaurant: async (_, { id, name, address, phone }) => {
  await db.run('UPDATE restaurants SET name = ?, address = ?, phone = ? WHERE id = ?', [name, address, phone || null, id]);
  const row = await db.get('SELECT id, name, address, phone FROM restaurants WHERE id = ?', [id]);
  return { _id: row.id, name: row.name, address: row.address, phone: row.phone };
},

// creates
createUser: async (_, { name, email }) => {
  const result = await db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
  const id = result.lastID;
  return db.get('SELECT id, name, email FROM users WHERE id = ?', [id]);
},
createRestaurant: async (_, { name, address, phone }) => {
  const result = await db.run('INSERT INTO restaurants (name, address, phone) VALUES (?, ?, ?)', [name, address, phone || null]);
  const id = result.lastID;
  const row = await db.get('SELECT id, name, address, phone FROM restaurants WHERE id = ?', [id]);
  return { _id: row.id, name: row.name, address: row.address, phone: row.phone };
},
```

Notes:
- Map DB `restaurants.id` to GraphQL field `_id` consistently.
- Ensure CORS allows http://localhost:3000 (and 3001/3002 if needed).

## Seed options

- Run `npm run seed` in the modern admin after adding `createUser`/`createRestaurant`.
- Or use a direct SQL seed (create `seed.sql` with INSERTs into `users`, `restaurants`, `menu_items`).
