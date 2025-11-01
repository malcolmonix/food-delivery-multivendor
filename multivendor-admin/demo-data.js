// Demo Data Creation Script for Admin Panel
// This creates sample restaurants and menu items in MenuVerse Firebase

const sampleRestaurants = [
  {
    name: "Pizza Palace",
    description: "Authentic Italian pizza with fresh ingredients and traditional recipes",
    address: "123 Victoria Island, Lagos, Nigeria", 
    phone: "+234 901 234 5678",
    email: "contact@pizzapalace.ng",
    cuisineType: ["Italian", "Pizza", "Fast Food"],
    deliveryFee: 500,
    minimumOrder: 2000,
    estimatedDeliveryTime: "30-45 mins",
    isActive: true,
    coordinates: { lat: 6.4281, lng: 3.4219 },
    rating: 4.5,
    totalReviews: 128,
    openingHours: {
      monday: { open: "09:00", close: "22:00", isOpen: true },
      tuesday: { open: "09:00", close: "22:00", isOpen: true },
      wednesday: { open: "09:00", close: "22:00", isOpen: true },
      thursday: { open: "09:00", close: "22:00", isOpen: true },
      friday: { open: "09:00", close: "23:00", isOpen: true },
      saturday: { open: "10:00", close: "23:00", isOpen: true },
      sunday: { open: "12:00", close: "21:00", isOpen: true }
    }
  },
  {
    name: "Spice Kitchen",
    description: "Traditional Nigerian cuisine with authentic spices and flavors",
    address: "456 Lekki Phase 1, Lagos, Nigeria",
    phone: "+234 902 345 6789", 
    email: "hello@spicekitchen.ng",
    cuisineType: ["Nigerian", "African", "Spicy"],
    deliveryFee: 600,
    minimumOrder: 1500,
    estimatedDeliveryTime: "25-40 mins",
    isActive: true,
    coordinates: { lat: 6.4698, lng: 3.4343 },
    rating: 4.2,
    totalReviews: 89,
    openingHours: {
      monday: { open: "08:00", close: "21:00", isOpen: true },
      tuesday: { open: "08:00", close: "21:00", isOpen: true },
      wednesday: { open: "08:00", close: "21:00", isOpen: true },
      thursday: { open: "08:00", close: "21:00", isOpen: true },
      friday: { open: "08:00", close: "22:00", isOpen: true },
      saturday: { open: "09:00", close: "22:00", isOpen: true },
      sunday: { open: "10:00", close: "20:00", isOpen: true }
    }
  },
  {
    name: "Green Garden",
    description: "Fresh salads, smoothies, and healthy organic options",
    address: "789 Ikoyi Road, Lagos, Nigeria",
    phone: "+234 903 456 7890",
    email: "info@greengarden.ng", 
    cuisineType: ["Vegetarian", "Vegan", "Healthy"],
    deliveryFee: 400,
    minimumOrder: 1200,
    estimatedDeliveryTime: "20-35 mins",
    isActive: true,
    coordinates: { lat: 6.4578, lng: 3.3958 },
    rating: 4.7,
    totalReviews: 156,
    openingHours: {
      monday: { open: "07:00", close: "20:00", isOpen: true },
      tuesday: { open: "07:00", close: "20:00", isOpen: true },
      wednesday: { open: "07:00", close: "20:00", isOpen: true },
      thursday: { open: "07:00", close: "20:00", isOpen: true },
      friday: { open: "07:00", close: "21:00", isOpen: true },
      saturday: { open: "08:00", close: "21:00", isOpen: true },
      sunday: { open: "08:00", close: "19:00", isOpen: true }
    }
  },
  {
    name: "Burger Junction",
    description: "Gourmet burgers, fries, and American classics with a Nigerian twist",
    address: "321 Surulere, Lagos, Nigeria",
    phone: "+234 904 567 8901",
    email: "orders@burgerjunction.ng",
    cuisineType: ["American", "Fast Food", "Burgers"],
    deliveryFee: 450,
    minimumOrder: 1800,
    estimatedDeliveryTime: "20-30 mins",
    isActive: true,
    coordinates: { lat: 6.5027, lng: 3.3588 },
    rating: 4.3,
    totalReviews: 203,
    openingHours: {
      monday: { open: "10:00", close: "23:00", isOpen: true },
      tuesday: { open: "10:00", close: "23:00", isOpen: true },
      wednesday: { open: "10:00", close: "23:00", isOpen: true },
      thursday: { open: "10:00", close: "23:00", isOpen: true },
      friday: { open: "10:00", close: "00:00", isOpen: true },
      saturday: { open: "10:00", close: "00:00", isOpen: true },
      sunday: { open: "11:00", close: "22:00", isOpen: true }
    }
  },
  {
    name: "Sushi Zen",
    description: "Fresh sushi, sashimi, and Japanese delicacies prepared by expert chefs",
    address: "567 Banana Island, Lagos, Nigeria", 
    phone: "+234 905 678 9012",
    email: "contact@sushizen.ng",
    cuisineType: ["Japanese", "Sushi", "Asian"],
    deliveryFee: 800,
    minimumOrder: 3000,
    estimatedDeliveryTime: "35-50 mins",
    isActive: true,
    coordinates: { lat: 6.4315, lng: 3.4182 },
    rating: 4.8,
    totalReviews: 94,
    openingHours: {
      monday: { open: "12:00", close: "22:00", isOpen: true },
      tuesday: { open: "12:00", close: "22:00", isOpen: true },
      wednesday: { open: "12:00", close: "22:00", isOpen: true },
      thursday: { open: "12:00", close: "22:00", isOpen: true },
      friday: { open: "12:00", close: "23:00", isOpen: true },
      saturday: { open: "12:00", close: "23:00", isOpen: true },
      sunday: { open: "15:00", close: "21:00", isOpen: true }
    }
  }
];

const sampleMenuCategories = {
  "Pizza Palace": [
    { name: "Pizza", description: "Traditional and gourmet pizzas", sortOrder: 1 },
    { name: "Appetizers", description: "Start your meal right", sortOrder: 2 },
    { name: "Beverages", description: "Refreshing drinks", sortOrder: 3 },
    { name: "Desserts", description: "Sweet endings", sortOrder: 4 }
  ],
  "Spice Kitchen": [
    { name: "Rice Dishes", description: "Jollof, fried rice, and more", sortOrder: 1 },
    { name: "Soups & Stews", description: "Traditional Nigerian soups", sortOrder: 2 },
    { name: "Grilled & BBQ", description: "Grilled meats and fish", sortOrder: 3 },
    { name: "Sides", description: "Perfect complements", sortOrder: 4 }
  ],
  "Green Garden": [
    { name: "Salads", description: "Fresh garden salads", sortOrder: 1 },
    { name: "Smoothies", description: "Healthy fruit smoothies", sortOrder: 2 },
    { name: "Wraps", description: "Healthy wraps and sandwiches", sortOrder: 3 },
    { name: "Bowls", description: "Nutritious Buddha bowls", sortOrder: 4 }
  ]
};

const sampleMenuItems = {
  "Pizza": [
    {
      name: "Margherita Pizza",
      description: "Classic pizza with tomato sauce, mozzarella, and fresh basil leaves",
      price: 3500,
      isVegetarian: true,
      isPopular: true,
      preparationTime: 15,
      ingredients: ["Tomato Sauce", "Mozzarella Cheese", "Fresh Basil", "Olive Oil"],
      allergens: ["Dairy", "Gluten"],
      isAvailable: true,
      sortOrder: 1
    },
    {
      name: "Pepperoni Pizza",
      description: "Traditional pepperoni with cheese and rich tomato sauce",
      price: 4200,
      isPopular: true,
      isFeatured: true,
      preparationTime: 18,
      ingredients: ["Tomato Sauce", "Mozzarella Cheese", "Pepperoni"],
      allergens: ["Dairy", "Gluten"],
      isAvailable: true,
      sortOrder: 2
    },
    {
      name: "Meat Lovers Pizza",
      description: "Loaded with pepperoni, sausage, bacon, and ham",
      price: 5500,
      preparationTime: 20,
      ingredients: ["Tomato Sauce", "Mozzarella", "Pepperoni", "Sausage", "Bacon", "Ham"],
      allergens: ["Dairy", "Gluten"],
      isAvailable: true,
      sortOrder: 3
    }
  ],
  "Rice Dishes": [
    {
      name: "Jollof Rice",
      description: "Nigeria's famous spiced rice with vegetables and your choice of protein",
      price: 2500,
      isPopular: true,
      isFeatured: true,
      isSpicy: true,
      spiceLevel: 3,
      preparationTime: 25,
      ingredients: ["Rice", "Tomatoes", "Onions", "Bell Peppers", "Spices"],
      variations: [
        { id: "chicken", name: "With Chicken", price: 3200 },
        { id: "beef", name: "With Beef", price: 3500 },
        { id: "fish", name: "With Fish", price: 3000 }
      ],
      isAvailable: true,
      sortOrder: 1
    },
    {
      name: "Fried Rice",
      description: "Colorful fried rice with mixed vegetables and protein",
      price: 2800,
      preparationTime: 20,
      ingredients: ["Rice", "Mixed Vegetables", "Eggs", "Seasonings"],
      variations: [
        { id: "chicken", name: "With Chicken", price: 3500 },
        { id: "shrimp", name: "With Shrimp", price: 4000 }
      ],
      isAvailable: true,
      sortOrder: 2
    }
  ],
  "Salads": [
    {
      name: "Caesar Salad",
      description: "Crisp romaine lettuce with parmesan cheese and croutons",
      price: 2200,
      isVegetarian: true,
      preparationTime: 10,
      ingredients: ["Romaine Lettuce", "Parmesan Cheese", "Croutons", "Caesar Dressing"],
      allergens: ["Dairy", "Gluten"],
      addons: [
        { id: "chicken", name: "Grilled Chicken", price: 800, category: "Protein" },
        { id: "avocado", name: "Fresh Avocado", price: 500, category: "Extras" }
      ],
      isAvailable: true,
      sortOrder: 1
    },
    {
      name: "Greek Salad",
      description: "Mediterranean salad with feta cheese, olives, and fresh vegetables",
      price: 2500,
      isVegetarian: true,
      preparationTime: 8,
      ingredients: ["Mixed Greens", "Feta Cheese", "Olives", "Tomatoes", "Cucumber"],
      allergens: ["Dairy"],
      nutritionalInfo: {
        calories: 180,
        protein: 8,
        carbs: 12,
        fat: 14,
        fiber: 4
      },
      isAvailable: true,
      sortOrder: 2
    }
  ]
};

// Instructions for manual data entry
console.log(`
🎉 DEMO DATA FOR ADMIN PANEL

To test the enhanced admin interface, you can manually add this sample data:

📊 SAMPLE RESTAURANTS (${sampleRestaurants.length} total):
${sampleRestaurants.map((r, i) => `
${i + 1}. ${r.name}
   Address: ${r.address}
   Phone: ${r.phone}
   Cuisine: ${r.cuisineType.join(", ")}
   Delivery: ₦${r.deliveryFee} (Min: ₦${r.minimumOrder})
   Rating: ${r.rating}/5 (${r.totalReviews} reviews)
`).join('')}

🍕 SAMPLE MENU CATEGORIES:
${Object.entries(sampleMenuCategories).map(([restaurant, categories]) => `
${restaurant}:
${categories.map(cat => `  - ${cat.name}: ${cat.description}`).join('\n')}
`).join('')}

🍽️ SAMPLE MENU ITEMS:
${Object.entries(sampleMenuItems).map(([category, items]) => `
${category}:
${items.map(item => `  - ${item.name} (₦${item.price}): ${item.description}`).join('\n')}
`).join('')}

🚀 TO USE THIS DATA:
1. Navigate to the admin panel at http://localhost:3000/stores
2. Click "Add Restaurant" to create new restaurants using the data above
3. Navigate to http://localhost:3000/menu-items to add categories and items
4. Use the enhanced Firebase interface to manage everything in real-time!

✨ ENHANCED FEATURES TO TEST:
- Real-time restaurant creation and editing
- Menu category and item management
- Image uploads for restaurants and menu items
- Advanced filtering and search
- Dietary restriction indicators
- Availability toggling
- Popular and featured item management
- Opening hours configuration
- Statistics and analytics

`);

export { sampleRestaurants, sampleMenuCategories, sampleMenuItems };