// Script to check restaurant data structure and completeness
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase config for MenuVerse
const firebaseConfig = {
  apiKey: "AIzaSyBrvg3lpA5RNLpk3P7LjbZQWnj0VfqG8iQ",
  authDomain: "chopchop-67750.firebaseapp.com",
  projectId: "chopchop-67750",
  storageBucket: "chopchop-67750.firebasestorage.app",
  messagingSenderId: "1055097700013",
  appId: "1:1055097700013:web:08e6db6b7cac2a25f1e0a1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkRestaurantData() {
  console.log('\n=== Restaurant Data Structure Analysis ===\n');

  try {
    const eateriesRef = collection(db, 'eateries');
    const snapshot = await getDocs(eateriesRef);
    
    if (snapshot.empty) {
      console.log('No restaurants found in eateries collection');
      return;
    }

    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. Restaurant: ${data.name || 'Unnamed'} (ID: ${doc.id})`);
      console.log('📋 Data structure:');
      
      // Check essential fields
      const essentialFields = [
        'name', 'description', 'address', 'phone', 'email', 'image', 
        'cuisineType', 'rating', 'totalReviews', 'isActive'
      ];
      
      essentialFields.forEach(field => {
        const value = data[field];
        const status = value !== undefined && value !== null ? '✅' : '❌';
        const displayValue = value !== undefined && value !== null ? 
          (Array.isArray(value) ? `[${value.length} items]` : String(value)) : 
          'undefined/null';
        console.log(`   ${status} ${field}: ${displayValue}`);
      });

      // Check nested objects
      if (data.openingHours) {
        console.log('   ✅ openingHours: [object with ' + Object.keys(data.openingHours).length + ' days]');
      } else {
        console.log('   ❌ openingHours: undefined/null');
      }

      if (data.location) {
        console.log('   ✅ location: {lat: ' + data.location.latitude + ', lng: ' + data.location.longitude + '}');
      } else {
        console.log('   ❌ location: undefined/null');
      }
      
      console.log('\n📝 Missing Fields Analysis:');
      const missingFields = essentialFields.filter(field => 
        data[field] === undefined || data[field] === null
      );
      
      if (missingFields.length === 0) {
        console.log('   🎉 All essential fields are present!');
      } else {
        console.log('   ⚠️  Missing fields: ' + missingFields.join(', '));
        console.log('   💡 These fields should be handled gracefully in the UI');
      }
    });

    console.log('\n=== Analysis Complete ===');
    console.log('✅ Enhanced stores page should now handle missing fields gracefully');

  } catch (error) {
    console.error('❌ Error checking restaurant data:', error);
  }
}

checkRestaurantData();