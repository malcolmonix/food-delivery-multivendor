import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function checkSchema() {
  const db = await open({ filename: '../enatega.db', driver: sqlite3.Database });
  
  const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
  console.log('Tables:', tables.map(t => t.name));
  
  for (const table of tables) {
    if (!table.name.startsWith('sqlite_')) {
      const schema = await db.all(`PRAGMA table_info(${table.name})`);
      console.log(`\n${table.name} columns:`, schema.map(c => `${c.name} (${c.type})`));
    }
  }
  
  await db.close();
}

checkSchema().catch(console.error);