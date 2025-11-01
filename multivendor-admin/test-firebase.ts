// Test Firebase connection and create sample data for admin panel
// Run this to verify MenuVerse Firebase integration and seed initial restaurants

import { getMenuverseFirestore, getMenuverseAuth } from './lib/firebase/menuverse';
import { restaurantService } from './lib/services/restaurant.service';
import { menuService } from './lib/services/menu.service';

async function testFirebaseConnection() {
  console.log('🔥 Testing MenuVerse Firebase Connection...');
  
  try {
    // Test Firestore connection
    const db = getMenuverseFirestore();
    console.log('✅ Firestore connected successfully');
    
    // Test Auth connection
    const auth = getMenuverseAuth();
    console.log('✅ Auth connected successfully');
    
    // Check for existing restaurants
    const existingRestaurants = await restaurantService.getAllRestaurants();
    console.log(`📊 Found ${existingRestaurants.length} existing restaurants`);
    
    if (existingRestaurants.length === 0) {
      console.log('🏗️ Creating sample restaurants...');
      await createSampleData();
    } else {
      console.log('✅ Restaurants already exist, skipping sample data creation');
    }
    
    console.log('🎉 Firebase connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    throw error;
  }
}

async function createSampleData() {
  try {
    // Create sample restaurants
    const restaurants = [
      {
        name: "Pizza Palace",
        description: "Authentic Italian pizza with fresh ingredients",
        address: "123 Main Street, Lagos, Nigeria",
        phone: "+234 901 234 5678",
        email: "contact@pizzapalace.ng",
        cuisineType: ["Italian", "Pizza"],
        deliveryFee: 500,
        minimumOrder: 2000,
        estimatedDeliveryTime: "30-45 mins",
        isActive: true,
        openingHours: {
          monday: { open: "09:00", close: "22:00", isOpen: true },
          tuesday: { open: "09:00", close: "22:00", isOpen: true },
          wednesday: { open: "09:00", close: "22:00", isOpen: true },
          thursday: { open: "09:00", close: "22:00", isOpen: true },
          friday: { open: "09:00", close: "23:00", isOpen: true },
          saturday: { open: "10:00", close: "23:00", isOpen: true },
          sunday: { open: "12:00", close: "21:00", isOpen: true }
        },
        coordinates: { lat: 6.5244, lng: 3.3792 }, // Lagos coordinates
        rating: 4.5,
        totalReviews: 128
      },
      {
        name: "Spice Kitchen",
        description: "Traditional Nigerian cuisine with modern twists",
        address: "456 Victoria Island, Lagos, Nigeria",
        phone: "+234 902 345 6789",
        email: "hello@spicekitchen.ng",
        cuisineType: ["Nigerian", "African", "Spicy"],
        deliveryFee: 600,
        minimumOrder: 1500,
        estimatedDeliveryTime: "25-40 mins",
        isActive: true,
        openingHours: {
          monday: { open: "08:00", close: "21:00", isOpen: true },
          tuesday: { open: "08:00", close: "21:00", isOpen: true },
          wednesday: { open: "08:00", close: "21:00", isOpen: true },
          thursday: { open: "08:00", close: "21:00", isOpen: true },
          friday: { open: "08:00", close: "22:00", isOpen: true },
          saturday: { open: "09:00", close: "22:00", isOpen: true },
          sunday: { open: "10:00", close: "20:00", isOpen: true }
        },
        coordinates: { lat: 6.4281, lng: 3.4219 },
        rating: 4.2,
        totalReviews: 89
      },
      {
        name: "Green Garden",
        description: "Fresh salads, smoothies, and healthy options",
        address: "789 Ikoyi Road, Lagos, Nigeria",
        phone: "+234 903 456 7890",
        email: "info@greengarden.ng",
        cuisineType: ["Vegetarian", "Vegan", "Healthy"],
        deliveryFee: 400,
        minimumOrder: 1200,
        estimatedDeliveryTime: "20-35 mins",
        isActive: true,
        openingHours: {
          monday: { open: "07:00", close: "20:00", isOpen: true },
          tuesday: { open: "07:00", close: "20:00", isOpen: true },
          wednesday: { open: "07:00", close: "20:00", isOpen: true },
          thursday: { open: "07:00", close: "20:00", isOpen: true },
          friday: { open: "07:00", close: "21:00", isOpen: true },
          saturday: { open: "08:00", close: "21:00", isOpen: true },
          sunday: { open: "08:00", close: "19:00", isOpen: true }
        },
        coordinates: { lat: 6.4698, lng: 3.4343 },
        rating: 4.7,
        totalReviews: 156
      }
    ];

    const createdRestaurants = [];
    
    for (const restaurant of restaurants) {
      const restaurantId = await restaurantService.createRestaurant(restaurant as any);
      createdRestaurants.push({ id: restaurantId, ...restaurant });
      console.log(`✅ Created restaurant: ${restaurant.name}`);
    }

    // Create sample menu categories and items for the first restaurant
    if (createdRestaurants.length > 0) {
      const pizzaRestaurant = createdRestaurants[0];
      
      // Create categories
      const categoriesData = [
        { name: "Pizza", description: "Traditional and gourmet pizzas", isActive: true, sortOrder: 1 },
        { name: "Appetizers", description: "Start your meal right", isActive: true, sortOrder: 2 },
        { name: "Beverages", description: "Refreshing drinks", isActive: true, sortOrder: 3 }
      ];

      const createdCategories = [];
      for (const category of categoriesData) {
        const categoryId = await menuService.createCategory({
          ...category,
          restaurantId: pizzaRestaurant.id
        });
        createdCategories.push({ id: categoryId, ...category });
        console.log(`✅ Created category: ${category.name}`);
      }

      // Create sample menu items
      if (createdCategories.length > 0) {
        const pizzaCategory = createdCategories[0];
        
        const menuItems = [
          {
            name: "Margherita Pizza",
            description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
            price: 3500,
            isVegetarian: true,
            isPopular: true,
            preparationTime: 15,
            ingredients: ["Tomato Sauce", "Mozzarella", "Fresh Basil", "Olive Oil"],
            isAvailable: true,
            sortOrder: 1
          },
          {
            name: "Pepperoni Pizza",
            description: "Traditional pepperoni with cheese and tomato sauce",
            price: 4200,
            isPopular: true,
            isFeatured: true,
            preparationTime: 18,
            ingredients: ["Tomato Sauce", "Mozzarella", "Pepperoni"],
            isAvailable: true,
            sortOrder: 2
          }
        ];

        for (const item of menuItems) {
          await menuService.createMenuItem({
            ...item,
            restaurantId: pizzaRestaurant.id,
            categoryId: pizzaCategory.id
          });
          console.log(`✅ Created menu item: ${item.name}`);
        }
      }
    }

    console.log('🎉 Sample data created successfully!');
    return createdRestaurants;
    
  } catch (error) {
    console.error('❌ Failed to create sample data:', error);
    throw error;
  }
}

// Export for use in other files
export { testFirebaseConnection, createSampleData };

// If running directly, execute the test
if (typeof window === 'undefined') {
  testFirebaseConnection().catch(console.error);
}