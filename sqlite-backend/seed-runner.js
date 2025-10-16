import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';

async function runSeed() {
  const db = await open({ filename: '../enatega.db', driver: sqlite3.Database });
  const sql = fs.readFileSync('../seed.sql', 'utf8');
  // split statements by semicolon and run sequentially
  const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    try {
      await db.exec(stmt + ';');
    } catch (err) {
      console.error('Seed statement error:', err.message);
    }
  }
  const admins = await db.all('SELECT * FROM admins');
  console.log('admins:', admins);
  const restaurants = await db.all('SELECT * FROM restaurants');
  console.log('restaurants:', restaurants.length);
  await db.close();
}

runSeed().catch(err => console.error(err));
