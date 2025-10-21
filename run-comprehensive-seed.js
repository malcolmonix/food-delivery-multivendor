const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');

async function runComprehensiveSeed() {
  console.log('🌱 Starting comprehensive database seeding...');
  
  try {
    // Open database connection
    const db = await open({ 
      filename: './enatega.db', 
      driver: sqlite3.Database 
    });

    console.log('📂 Connected to SQLite database');

    // Read the comprehensive seed file
    const seedSQL = fs.readFileSync('./comprehensive-seed.sql', 'utf8');
    
    // Split statements by semicolon and filter empty ones
    const statements = seedSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await db.exec(statement + ';');
        if (i % 10 === 0) {
          console.log(`✅ Executed ${i + 1}/${statements.length} statements`);
        }
      } catch (error) {
        console.warn(`⚠️  Warning: ${error.message}`);
        // Continue with other statements
      }
    }

    console.log('🔍 Verifying seeded data...');

    // Verify the seeded data
    const adminCount = await db.get('SELECT COUNT(*) as count FROM admins');
    const restaurantCount = await db.get('SELECT COUNT(*) as count FROM restaurants');
    const menuItemCount = await db.get('SELECT COUNT(*) as count FROM menu_items');
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    const orderCount = await db.get('SELECT COUNT(*) as count FROM orders');

    console.log('📊 Database Statistics:');
    console.log(`   👥 Admins: ${adminCount.count}`);
    console.log(`   🏪 Restaurants: ${restaurantCount.count}`);
    console.log(`   🍕 Menu Items: ${menuItemCount.count}`);
    console.log(`   👤 Users: ${userCount.count}`);
    console.log(`   📦 Orders: ${orderCount.count}`);

    // Show sample data
    console.log('\\n🔍 Sample Data Preview:');
    
    const sampleRestaurants = await db.all('SELECT name, address, rating FROM restaurants LIMIT 3');
    console.log('   Restaurants:');
    sampleRestaurants.forEach(r => console.log(`     • ${r.name} (${r.rating}⭐) - ${r.address}`));

    const sampleMenuItems = await db.all('SELECT name, price FROM menu_items LIMIT 5');
    console.log('   Menu Items:');
    sampleMenuItems.forEach(m => console.log(`     • ${m.name} - $${m.price}`));

    await db.close();
    console.log('\\n✅ Database seeding completed successfully!');
    console.log('🚀 Ready for all applications: multivendor-admin, enatega-multivendor-web, etc.');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

// Run the seeding
runComprehensiveSeed();