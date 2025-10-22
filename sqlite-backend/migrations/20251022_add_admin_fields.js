import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

/*
  Migration: Add admin-facing columns to restaurants
  Safe for multiple runs: checks PRAGMA table_info and only adds missing columns.

  Target DB path follows index.js: '../enatega.db'
*/

const DB_PATH = '../enatega.db';

const COLUMNS = [
  { name: 'unique_restaurant_id', type: 'TEXT' },
  { name: 'order_prefix', type: 'TEXT' },
  { name: 'slug', type: 'TEXT' },
  { name: 'logo', type: 'TEXT' },
  { name: 'delivery_time', type: 'TEXT' },
  { name: 'minimum_order', type: 'REAL', defaultSql: 'DEFAULT 0' },
  { name: 'is_active', type: 'INTEGER', defaultSql: 'DEFAULT 1' },
  { name: 'commission_rate', type: 'REAL', defaultSql: 'DEFAULT 0' },
  { name: 'username', type: 'TEXT' },
  { name: 'password', type: 'TEXT' },
  { name: 'tax', type: 'REAL', defaultSql: 'DEFAULT 0' },
  { name: 'shop_type', type: 'TEXT' },
  { name: 'primary_color', type: 'TEXT' },
  { name: 'secondary_color', type: 'TEXT' },
  { name: 'latitude', type: 'REAL' },
  { name: 'longitude', type: 'REAL' },
  { name: 'owner_id', type: 'INTEGER' },
  { name: 'owner_email', type: 'TEXT' },
  { name: 'owner_is_active', type: 'INTEGER', defaultSql: 'DEFAULT 1' },
];

async function columnExists(db, table, column) {
  const info = await db.all(`PRAGMA table_info(${table})`);
  return info.some((c) => c.name === column);
}

async function addColumn(db, table, { name, type, defaultSql }) {
  const ddl = `ALTER TABLE ${table} ADD COLUMN ${name} ${type} ${defaultSql || ''}`.trim();
  console.log('Applying:', ddl);
  await db.exec(ddl);
}

async function migrate() {
  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
  try {
    await db.exec('PRAGMA foreign_keys = ON;');

    // Ensure restaurants table exists
    const table = await db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='restaurants'"
    );
    if (!table) {
      throw new Error("Table 'restaurants' does not exist. Seed or create it first.");
    }

    for (const col of COLUMNS) {
      const exists = await columnExists(db, 'restaurants', col.name);
      if (!exists) {
        await addColumn(db, 'restaurants', col);
      } else {
        console.log(`Skipping existing column: ${col.name}`);
      }
    }

    console.log('✅ Migration complete');
  } catch (err) {
    console.error('❌ Migration failed:', err.message || err);
    process.exitCode = 1;
  } finally {
    await db.close();
  }
}

migrate();
