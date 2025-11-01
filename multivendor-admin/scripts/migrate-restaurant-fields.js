// Migration script to update existing restaurants with proper field mapping
// Run this once to ensure existing restaurants work with the web app

const { getMenuverseFirestore } = require('../lib/firebase/menuverse');
const { collection, getDocs, doc, updateDoc } = require('firebase/firestore');

async function migrateRestaurantFields() {
  try {
    const db = getMenuverseFirestore();
    const restaurantsRef = collection(db, 'eateries');
    const snapshot = await getDocs(restaurantsRef);
    
    console.log(`Found ${snapshot.docs.length} restaurants to migrate`);
    
    let migrated = 0;
    let skipped = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const updates = {};
      let needsUpdate = false;
      
      // Map image field to logoUrl and bannerUrl if they don't exist
      if (data.image && (!data.logoUrl || !data.bannerUrl)) {
        updates.logoUrl = data.image;
        updates.bannerUrl = data.image;
        needsUpdate = true;
      }
      
      // Map email to contactEmail if it doesn't exist
      if (data.email && !data.contactEmail) {
        updates.contactEmail = data.email;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        const docRef = doc(db, 'eateries', docSnapshot.id);
        await updateDoc(docRef, updates);
        console.log(`Migrated restaurant: ${data.name} (${docSnapshot.id})`);
        migrated++;
      } else {
        console.log(`Skipped restaurant: ${data.name} (already has required fields)`);
        skipped++;
      }
    }
    
    console.log(`Migration complete: ${migrated} migrated, ${skipped} skipped`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
if (require.main === module) {
  migrateRestaurantFields()
    .then(() => {
      console.log('Migration finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration error:', error);
      process.exit(1);
    });
}

module.exports = { migrateRestaurantFields };