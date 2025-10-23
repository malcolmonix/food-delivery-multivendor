// Sample restaurant data for testing MenuVerse integration
// This data structure matches the MenuVerse API format

export const sampleEateries = [
  {
    id: 'pizza-palace',
    name: 'Pizza Palace',
    description: 'Authentic Italian pizzas made with fresh ingredients and traditional recipes. Family-owned since 1985.',
    logoUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop&crop=center',
    bannerUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=400&fit=crop&crop=center',
    contactEmail: 'contact@pizzapalace.com'
  },
  {
    id: 'burger-junction',
    name: 'Burger Junction',
    description: 'Gourmet burgers and crispy fries. Locally sourced beef and fresh vegetables.',
    logoUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&h=200&fit=crop&crop=center',
    bannerUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=400&fit=crop&crop=center',
    contactEmail: 'hello@burgerjunction.com'
  },
  {
    id: 'sushi-zen',
    name: 'Sushi Zen',
    description: 'Fresh sushi and Japanese cuisine. Premium quality fish and traditional preparation methods.',
    logoUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=200&fit=crop&crop=center',
    bannerUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=400&fit=crop&crop=center',
    contactEmail: 'info@sushizen.com'
  },
  {
    id: 'taco-fiesta',
    name: 'Taco Fiesta',
    description: 'Authentic Mexican tacos and burritos with house-made salsas and fresh tortillas.',
    logoUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=200&fit=crop&crop=center',
    bannerUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=400&fit=crop&crop=center',
    contactEmail: 'orders@tacofiesta.com'
  }
];

export const sampleMenuItems = {
  'pizza-palace': [
    {
      id: 'margherita-pizza',
      name: 'Margherita Pizza',
      description: 'Classic pizza with tomato sauce, fresh mozzarella, and basil',
      price: 16.99,
      category: 'Main Course',
      imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300&h=300&fit=crop&crop=center',
      eateryId: 'pizza-palace'
    },
    {
      id: 'pepperoni-pizza',
      name: 'Pepperoni Pizza',
      description: 'Traditional pepperoni pizza with mozzarella cheese',
      price: 18.99,
      category: 'Main Course',
      imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=300&fit=crop&crop=center',
      eateryId: 'pizza-palace'
    },
    {
      id: 'caesar-salad',
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with parmesan cheese and croutons',
      price: 12.99,
      category: 'Appetizer',
      imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=300&h=300&fit=crop&crop=center',
      eateryId: 'pizza-palace'
    },
    {
      id: 'tiramisu',
      name: 'Tiramisu',
      description: 'Classic Italian dessert with coffee and mascarpone',
      price: 8.99,
      category: 'Dessert',
      imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&h=300&fit=crop&crop=center',
      eateryId: 'pizza-palace'
    }
  ],
  'burger-junction': [
    {
      id: 'classic-burger',
      name: 'Classic Burger',
      description: 'Beef patty with lettuce, tomato, onion, and special sauce',
      price: 14.99,
      category: 'Main Course',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop&crop=center',
      eateryId: 'burger-junction'
    },
    {
      id: 'cheese-fries',
      name: 'Cheese Fries',
      description: 'Crispy fries topped with melted cheese',
      price: 7.99,
      category: 'Appetizer',
      imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=300&fit=crop&crop=center',
      eateryId: 'burger-junction'
    },
    {
      id: 'chocolate-shake',
      name: 'Chocolate Shake',
      description: 'Rich chocolate milkshake with whipped cream',
      price: 5.99,
      category: 'Beverage',
      imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&h=300&fit=crop&crop=center',
      eateryId: 'burger-junction'
    }
  ],
  'sushi-zen': [
    {
      id: 'salmon-roll',
      name: 'Salmon Roll',
      description: 'Fresh salmon with avocado and cucumber',
      price: 12.99,
      category: 'Main Course',
      imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=300&fit=crop&crop=center',
      eateryId: 'sushi-zen'
    },
    {
      id: 'miso-soup',
      name: 'Miso Soup',
      description: 'Traditional Japanese soup with tofu and seaweed',
      price: 4.99,
      category: 'Appetizer',
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=300&fit=crop&crop=center',
      eateryId: 'sushi-zen'
    },
    {
      id: 'green-tea',
      name: 'Green Tea',
      description: 'Premium Japanese green tea',
      price: 3.99,
      category: 'Beverage',
      imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop&crop=center',
      eateryId: 'sushi-zen'
    }
  ],
  'taco-fiesta': [
    {
      id: 'beef-tacos',
      name: 'Beef Tacos (3)',
      description: 'Three soft tacos with seasoned ground beef and fresh toppings',
      price: 11.99,
      category: 'Main Course',
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=300&fit=crop&crop=center',
      eateryId: 'taco-fiesta'
    },
    {
      id: 'guacamole',
      name: 'Guacamole & Chips',
      description: 'Fresh avocado dip with crispy tortilla chips',
      price: 8.99,
      category: 'Appetizer',
      imageUrl: 'https://images.unsplash.com/photo-1541544181051-e46607e5d8ce?w=300&h=300&fit=crop&crop=center',
      eateryId: 'taco-fiesta'
    },
    {
      id: 'horchata',
      name: 'Horchata',
      description: 'Traditional Mexican rice drink with cinnamon',
      price: 4.99,
      category: 'Beverage',
      imageUrl: 'https://images.unsplash.com/photo-1571671670467-91e37c5e1d7e?w=300&h=300&fit=crop&crop=center',
      eateryId: 'taco-fiesta'
    }
  ]
};

// Instructions for manual setup (since we can't run Firebase Admin directly)
export const setupInstructions = `
To set up test data in your Firebase project:

1. Go to Firebase Console: https://console.firebase.google.com/project/chopchop-67750
2. Navigate to Firestore Database
3. Create the following collections and documents:

COLLECTION: eateries
├── DOCUMENT: pizza-palace
│   └── DATA: ${JSON.stringify(sampleEateries[0], null, 2)}
│   └── SUBCOLLECTION: menu_items
│       ├── DOCUMENT: margherita-pizza (data from sampleMenuItems)
│       ├── DOCUMENT: pepperoni-pizza
│       ├── DOCUMENT: caesar-salad
│       └── DOCUMENT: tiramisu
├── DOCUMENT: burger-junction
│   └── DATA: ${JSON.stringify(sampleEateries[1], null, 2)}
│   └── SUBCOLLECTION: menu_items
│       ├── DOCUMENT: classic-burger
│       ├── DOCUMENT: cheese-fries
│       └── DOCUMENT: chocolate-shake
├── DOCUMENT: sushi-zen
│   └── DATA: ${JSON.stringify(sampleEateries[2], null, 2)}
│   └── SUBCOLLECTION: menu_items
│       ├── DOCUMENT: salmon-roll
│       ├── DOCUMENT: miso-soup
│       └── DOCUMENT: green-tea
└── DOCUMENT: taco-fiesta
    └── DATA: ${JSON.stringify(sampleEateries[3], null, 2)}
    └── SUBCOLLECTION: menu_items
        ├── DOCUMENT: beef-tacos
        ├── DOCUMENT: guacamole
        └── DOCUMENT: horchata

Note: Each menu item should include the full data from sampleMenuItems above.
`;

console.log('Sample data prepared for Firebase setup');
console.log(setupInstructions);