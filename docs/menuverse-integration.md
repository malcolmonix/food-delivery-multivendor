# MenuVerse Integration Guide

## Overview
Complete Firebase integration for restaurant and menu data using MenuVerse backend (`chopchop-67750`).

## ✅ Current Working Status
- **Restaurant Listings**: Homepage shows restaurants from MenuVerse Firebase
- **Menu Display**: Restaurant pages show menu items from correct nested collections
- **Cart Integration**: Items can be added to cart from MenuVerse data
- **Collection Structure**: Using proper `eateries/{eateryId}/menu_items` format

## Firebase Configuration

### Database: `chopchop-67750`
- **Project**: Firebase project for MenuVerse app
- **Authentication**: Anonymous auth for public access
- **Collections**:
  - `eateries/` - Restaurant documents
  - `eateries/{eateryId}/menu_items` - Menu items (nested subcollection)

### API Service: `lib/services/menuverse-api.ts`
```typescript
// Get all restaurants
const restaurants = await getRestaurants();

// Get menu items for a specific restaurant  
const menuItems = await getRestaurantMenu(restaurantId);
```

## Data Structure

### Restaurant Document
```json
{
  "id": "0GI3MojVnLfvzSEqMc25oCzAmCz2",
  "name": "cookies",
  "description": "Delicious cookies and treats",
  "image": "https://example.com/restaurant-image.jpg",
  "address": "123 Main St",
  "phone": "+1234567890"
}
```

### Menu Item Document (in nested collection)
```json
{
  "id": "item-123",
  "name": "Chocolate Chip Cookie",
  "description": "Fresh baked chocolate chip cookie", 
  "price": 500,
  "category": "Desserts",
  "image": "https://example.com/cookie.jpg",
  "available": true
}
```

## Implementation Files

### 1. Firebase Service (`lib/services/menuverse-api.ts`)
- Handles all Firebase operations
- Proper error handling and logging
- Uses correct collection paths

### 2. Restaurant Pages (`pages/restaurant/[id].tsx`)
- Integrated with MenuVerse API
- Modern UI with categories
- Cart integration working

### 3. Cart Context (`lib/context/cart.context.tsx`)
- Supports MenuVerse data format
- Persistent storage in localStorage
- Quantity management

## Key Integration Points

### Homepage Restaurant Listing
```typescript
// In pages/index.tsx
const restaurants = await getRestaurants();
// Displays restaurants from MenuVerse Firebase
```

### Restaurant Detail Page
```typescript
// In pages/restaurant/[id].tsx  
const menuItems = await getRestaurantMenu(restaurantId);
// Shows menu items from nested collection
```

### Cart Integration
```typescript
// Adding items to cart
const item = {
  id: menuItem.id,
  name: menuItem.name, 
  price: menuItem.price,
  restaurantId: restaurantId,
  restaurantName: restaurant.name
};
addItem(item);
```

## Database Seeding

### Seed Script: `lib/utils/seed-menuverse.ts`
- Creates restaurant documents in `eateries/` collection
- Creates menu items in `eateries/{eateryId}/menu_items` subcollection
- Follows proper MenuVerse structure

### Example Seed Data
```typescript
// Restaurant data
const restaurant = {
  name: 'Sample Restaurant',
  description: 'Great food and service',
  address: '123 Food Street'
};

// Menu items (in nested collection)
const menuItem = {
  name: 'Burger',
  price: 1200,
  category: 'Main Dishes',
  description: 'Delicious burger with fries'
};
```

## Success Metrics

✅ **Working Integration**: 
- Restaurants visible on homepage
- Menu items display correctly  
- Cart functionality working
- Real data from MenuVerse Firebase

✅ **Proper Structure**:
- Using correct nested collections
- Following MenuVerse app conventions
- Consistent data format

✅ **User Experience**:
- Fast loading from Firebase
- Responsive design
- Modern UI components

## Troubleshooting

### Restaurants Not Showing
1. Check browser console for Firebase errors
2. Verify internet connection (Firebase requires online)
3. Check Firebase project configuration

### Menu Items Not Loading
1. Verify correct collection path: `eateries/{eateryId}/menu_items`
2. Check restaurant ID is valid
3. Ensure menu items exist in nested collection

### Cart Issues
1. Clear localStorage: `localStorage.clear()`
2. Check cart context is properly wrapped
3. Verify item format matches expected structure

---

**Integration Status**: Complete and Working ✅  
**Last Updated**: October 27, 2025