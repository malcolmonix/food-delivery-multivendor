import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { typeDefs, resolvers } from './schema.js';

const app = express();
// Allow requests from the admin UI
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
const PORT = process.env.PORT || 4000;

// SQLite DB setup
const dbPromise = open({
  filename: '../enatega.db',
  driver: sqlite3.Database
});

// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async () => ({ db: await dbPromise })
});

await server.start();
// Disable Apollo's built-in CORS (we use express CORS above)
server.applyMiddleware({ app, cors: false });

app.listen(PORT, () => {
  console.log(`🚀 SQLite GraphQL API ready at http://localhost:${PORT}${server.graphqlPath}`);
});
