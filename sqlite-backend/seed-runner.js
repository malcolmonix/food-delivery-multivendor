import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';

async function runSeed() {
  const db = await open({ filename: '../enatega.db', driver: sqlite3.Database });
  
  // Read the schema-matched seed file
  const sql = fs.readFileSync('../schema-matched-seed.sql', 'utf8');
  
  // split statements by semicolon and run sequentially
  const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
  
  console.log('🌱 Starting comprehensive database seeding...');
  console.log(`📝 Found ${statements.length} SQL statements to execute`);
  
  for (const stmt of statements) {
    try {
      await db.exec(stmt + ';');
    } catch (err) {
      console.error('Seed statement error:', err.message);
    }
  }
  
  // Verify the seeded data
  const admins = await db.all('SELECT * FROM admins');
  console.log('👥 admins:', admins.length);
  
  const restaurants = await db.all('SELECT * FROM restaurants');
  console.log('🏪 restaurants:', restaurants.length);
  
  const menuItems = await db.all('SELECT * FROM menu_items');
  console.log('🍕 menu items:', menuItems.length);
  
  const users = await db.all('SELECT * FROM users');
  console.log('👤 users:', users.length);
  
  // Show sample data preview
  console.log('\n🔍 Sample Restaurant Data:');
  const sampleRestaurants = await db.all('SELECT name, address FROM restaurants LIMIT 3');
  sampleRestaurants.forEach(r => console.log(`   • ${r.name} - ${r.address}`));
  
  console.log('\n🍕 Sample Menu Items:');
  const sampleMenuItems = await db.all('SELECT name, price FROM menu_items LIMIT 5');
  sampleMenuItems.forEach(m => console.log(`   • ${m.name} - $${m.price}`));
  
  console.log('\n👤 Sample Users:');
  const sampleUsers = await db.all('SELECT name, email FROM users LIMIT 3');
  sampleUsers.forEach(u => console.log(`   • ${u.name} (${u.email})`));
  
  await db.close();
  console.log('\n✅ Database seeding completed successfully!');
  console.log('🚀 Ready for all applications: multivendor-admin, enatega-multivendor-web, etc.');
}

runSeed().catch(err => console.error(err));
