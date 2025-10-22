import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { typeDefs, resolvers } from './schema.js';

const app = express();
// Allow requests from the admin UI and external devices
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://172.20.10.7:3000',
      'http://172.20.10.7:3001',
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
// IMPORTANT: Do NOT change this port. Other apps (web menu, purchase, checkout)
// assume the SQLite GraphQL backend is available on http://localhost:4000/.
// If you must override, update enatega-multivendor-web/.env.local accordingly.
const PORT = process.env.PORT || 4000;

// SQLite DB setup with WAL mode and busy timeout to prevent lock errors
// SQLite DB setup with retry & safer pragmas
async function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

async function initDbWithRetry(maxAttempts = 5) {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      const db = await open({ filename: '../enatega.db', driver: sqlite3.Database });
      // Concurrency-friendly pragmas
      await db.exec('PRAGMA journal_mode = WAL;');
      await db.exec('PRAGMA synchronous = NORMAL;');
      await db.exec('PRAGMA temp_store = MEMORY;');
      await db.exec('PRAGMA wal_autocheckpoint = 1000;');
      await db.exec('PRAGMA busy_timeout = 8000;');
      await db.exec('PRAGMA foreign_keys = ON;');
      console.log('✅ Database configured (WAL, timeout, pragmas)');
      return db;
    } catch (err) {
      attempt += 1;
      const isBusy = /SQLITE_BUSY/i.test(String(err?.message)) || err?.code === 'SQLITE_BUSY';
      console.error(`SQLite init failed (attempt ${attempt}/${maxAttempts}):`, err?.message || err);
      if (!isBusy || attempt >= maxAttempts) throw err;
      await sleep(500 * attempt); // exponential-ish backoff
    }
  }
}

const db = await initDbWithRetry();

// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async () => ({ db })
});

await server.start();
// Disable Apollo's built-in CORS (we use express CORS above)
server.applyMiddleware({ app, cors: false });

app.listen(PORT, () => {
  console.log(`🚀 SQLite GraphQL API ready at http://localhost:${PORT}${server.graphqlPath}`);
});

// Global error handlers to avoid unhelpful crashes
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
