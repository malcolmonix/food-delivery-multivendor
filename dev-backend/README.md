# Dev GraphQL Backend

A tiny SQLite-backed GraphQL server for local development. Exposes queries and mutations the new admin expects, including counts and update/create ops.

- Endpoint: http://localhost:4000/graphql
- Tech: Express + Apollo Server + SQLite

## Usage

1. Install deps
   - Open a terminal in this folder
   - Run: npm install
2. Seed demo data (optional but recommended)
   - npm run seed
3. Start the server
   - npm run dev (auto-restart) or npm start

Now your admin can point to http://localhost:4000/graphql

## Schema

- Queries: admins, users, restaurants, menuItems, usersCount, restaurantsCount, menuItemsCount
- Mutations: ownerLogin, updateUser, updateRestaurant, createUser, createRestaurant

Notes:
- Restaurant GraphQL `_id` maps to DB column `restaurants.id` as string.
- Default owner credentials: owner@example.com / password
- CORS allows localhost:3000-3999

## Files
- server.js: GraphQL server and resolvers
- seed.js: seeds basic users/restaurants/menu items
- data.db: SQLite database (auto-created)

## Troubleshooting
- Port in use: change PORT env (set PORT=4001) and update admin SERVER_URL accordingly.
- Windows PowerShell: if scripts fail, run them individually with `node server.js` or `node seed.js`.
