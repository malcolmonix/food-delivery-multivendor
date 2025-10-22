import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';

async function runSeedLocations() {
  const db = await open({ filename: '../enatega.db', driver: sqlite3.Database });
  const file = './seed-locations.sql';
  if (!fs.existsSync(file)) {
    console.error('❌ seed-locations.sql not found next to this script');
    process.exit(1);
  }
  const sql = fs.readFileSync(file, 'utf8');
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(`🌱 Seeding locations... (${statements.length} statements)`);
  for (const stmt of statements) {
    try {
      await db.exec(stmt + ';');
    } catch (err) {
      console.error('   ↳ statement failed:', err.message);
    }
  }

  const rows = await db.all('SELECT state, city, latitude, longitude, isAvailable FROM locations');
  console.log(`✅ Seed complete. Inserted/updated ${rows.length} locations.`);
  rows.forEach((r) =>
    console.log(` • ${r.state} - ${r.city} (${r.latitude}, ${r.longitude}) available=${r.isAvailable}`)
  );

  await db.close();
}

runSeedLocations().catch((e) => {
  console.error('❌ Seed error:', e);
  process.exit(1);
});
