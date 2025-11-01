// Simple Node.js script to test Firebase connection
// Run with: node verify-firebase.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// MenuVerse Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBHH9iZK9a1x9Gs8LKwGK6IpOLxWqGvLaY",
  authDomain: "chopchop-67750.firebaseapp.com",
  projectId: "chopchop-67750",
  storageBucket: "chopchop-67750.firebasestorage.app",
  messagingSenderId: "925058923880",
  appId: "1:925058923880:web:bc2f18a48a8e01b1f2b8e5"
};

async function verifyFirebaseConnection() {
  try {
    console.log('🔥 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    
    console.log('📊 Connecting to Firestore...');
    const db = getFirestore(app);
    
    console.log('🏪 Checking restaurants collection...');
    const restaurantsRef = collection(db, 'restaurants');
    const snapshot = await getDocs(restaurantsRef);
    
    console.log(`✅ Success! Found ${snapshot.size} restaurants in Firebase`);
    
    if (snapshot.size > 0) {
      console.log('\n📋 Restaurant List:');
      snapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ${data.name || 'Unnamed'} (ID: ${doc.id})`);
        if (data.address) console.log(`   Address: ${data.address}`);
        if (data.phone) console.log(`   Phone: ${data.phone}`);
        console.log(`   Active: ${data.isActive ? 'Yes' : 'No'}`);
        console.log('');
      });
    } else {
      console.log('\n📝 No restaurants found. The admin panel should show an empty state.');
      console.log('   You can add restaurants through the admin interface at /stores');
    }
    
    console.log('🎉 Firebase connection verified successfully!');
    console.log('   The admin stores page should now pull data from this Firebase database.');
    
  } catch (error) {
    console.error('❌ Firebase connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify Firebase configuration in lib/firebase/menuverse.ts');
    console.log('3. Ensure Firebase project permissions are correct');
  }
}

verifyFirebaseConnection();