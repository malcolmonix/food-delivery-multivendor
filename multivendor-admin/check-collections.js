// Check all collections in MenuVerse Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, listCollections } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBHH9iZK9a1x9Gs8LKwGK6IpOLxWqGvLaY",
  authDomain: "chopchop-67750.firebaseapp.com",
  projectId: "chopchop-67750",
  storageBucket: "chopchop-67750.firebasestorage.app",
  messagingSenderId: "925058923880",
  appId: "1:925058923880:web:bc2f18a48a8e01b1f2b8e5"
};

async function checkCollections() {
  try {
    console.log('🔥 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('📊 Checking collections in MenuVerse database...\n');
    
    // Check eateries collection (what multivendor-web expects)
    console.log('🏪 Checking "eateries" collection:');
    try {
      const eateriesRef = collection(db, 'eateries');
      const eateriesSnapshot = await getDocs(eateriesRef);
      console.log(`   Found ${eateriesSnapshot.size} documents`);
      
      if (eateriesSnapshot.size > 0) {
        eateriesSnapshot.forEach((doc, index) => {
          const data = doc.data();
          console.log(`   ${index + 1}. ${data.name || 'Unnamed'} (ID: ${doc.id})`);
        });
      }
    } catch (error) {
      console.log(`   Error accessing eateries: ${error.message}`);
    }
    
    console.log('');
    
    // Check restaurants collection (what admin panel creates)
    console.log('🍴 Checking "restaurants" collection:');
    try {
      const restaurantsRef = collection(db, 'restaurants');
      const restaurantsSnapshot = await getDocs(restaurantsRef);
      console.log(`   Found ${restaurantsSnapshot.size} documents`);
      
      if (restaurantsSnapshot.size > 0) {
        restaurantsSnapshot.forEach((doc, index) => {
          const data = doc.data();
          console.log(`   ${index + 1}. ${data.name || 'Unnamed'} (ID: ${doc.id})`);
        });
      }
    } catch (error) {
      console.log(`   Error accessing restaurants: ${error.message}`);
    }
    
    console.log('');
    
    // Check menu items
    console.log('🍽️ Checking "menuItems" collection:');
    try {
      const menuItemsRef = collection(db, 'menuItems');
      const menuItemsSnapshot = await getDocs(menuItemsRef);
      console.log(`   Found ${menuItemsSnapshot.size} documents`);
    } catch (error) {
      console.log(`   Error accessing menuItems: ${error.message}`);
    }
    
    console.log('');
    
    // Check menu categories
    console.log('📂 Checking "menuCategories" collection:');
    try {
      const categoriesRef = collection(db, 'menuCategories');
      const categoriesSnapshot = await getDocs(categoriesRef);
      console.log(`   Found ${categoriesSnapshot.size} documents`);
    } catch (error) {
      console.log(`   Error accessing menuCategories: ${error.message}`);
    }
    
    console.log('\n🔍 ANALYSIS:');
    console.log('- multivendor-web expects restaurants in "eateries" collection');
    console.log('- admin panel creates restaurants in "restaurants" collection');
    console.log('- We need to align these collections for data to show properly');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkCollections();