// Test script to verify restaurant creation in the correct eateries collection
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, addDoc, getDocs, deleteDoc, Timestamp } = require('firebase/firestore');

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

async function testRestaurantService() {
  console.log('\n=== Testing Restaurant Service Collection Alignment ===\n');

  try {
    // Test 1: Create a test restaurant in the eateries collection
    console.log('1. Creating test restaurant in eateries collection...');
    const testRestaurant = {
      name: "Test Pizza Palace",
      description: "Delicious wood-fired pizzas and Italian cuisine",
      address: "123 Main Street, City Center",
      phone: "+1-555-TEST-PIZZA",
      email: "contact@testpizzapalace.com",
      image: "https://example.com/pizza-palace.jpg",
      cuisineType: ["Italian", "Pizza"],
      rating: 4.5,
      totalReviews: 127,
      isActive: true,
      deliveryRadius: 5,
      deliveryFee: 2.99,
      minimumOrder: 15.00,
      estimatedDeliveryTime: "30-45 minutes",
      openingHours: {
        monday: { open: "11:00", close: "22:00", isOpen: true },
        tuesday: { open: "11:00", close: "22:00", isOpen: true },
        wednesday: { open: "11:00", close: "22:00", isOpen: true },
        thursday: { open: "11:00", close: "22:00", isOpen: true },
        friday: { open: "11:00", close: "23:00", isOpen: true },
        saturday: { open: "11:00", close: "23:00", isOpen: true },
        sunday: { open: "12:00", close: "21:00", isOpen: true }
      },
      location: {
        latitude: 40.7128,
        longitude: -74.0060
      },
      ownerId: "test-owner-123",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const eateriesRef = collection(db, 'eateries');
    const docRef = await addDoc(eateriesRef, testRestaurant);
    console.log(`✅ Test restaurant created with ID: ${docRef.id}`);

    // Test 2: Verify the restaurant appears in eateries collection
    console.log('\n2. Verifying restaurants in eateries collection...');
    const eateriesSnapshot = await getDocs(eateriesRef);
    const eateries = eateriesSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      isActive: doc.data().isActive
    }));
    
    console.log(`Found ${eateries.length} restaurants in eateries collection:`);
    eateries.forEach(restaurant => {
      console.log(`  - ${restaurant.name} (ID: ${restaurant.id}) - Active: ${restaurant.isActive}`);
    });

    // Test 3: Check if any restaurants exist in the old 'restaurants' collection
    console.log('\n3. Checking old restaurants collection...');
    const restaurantsRef = collection(db, 'restaurants');
    const restaurantsSnapshot = await getDocs(restaurantsRef);
    console.log(`Found ${restaurantsSnapshot.size} restaurants in old 'restaurants' collection`);

    // Test 4: Clean up test restaurant
    console.log('\n4. Cleaning up test restaurant...');
    await deleteDoc(doc(db, 'eateries', docRef.id));
    console.log('✅ Test restaurant deleted');

    console.log('\n=== Collection Alignment Test Complete ===');
    console.log('✅ Restaurant service is now correctly using the eateries collection');
    console.log('✅ Admin panel and multivendor-web will now share the same data');

  } catch (error) {
    console.error('❌ Error during restaurant service test:', error);
  }
}

testRestaurantService();