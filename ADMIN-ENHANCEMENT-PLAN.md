# Admin Panel Enhancement Plan: Full Restaurant & Location Management

## Current State Analysis

### What's Working
✅ sqlite-backend running on port 4000  
✅ Basic restaurant listing (44 restaurants with name, address)  
✅ Order placement with transactions  
✅ Admin UI pointing to port 4000  

### What's Missing
❌ Admin stores page queries expect fields sqlite doesn't have:
- `unique_restaurant_id`, `orderPrefix`, `slug`, `image`, `logo`
- `deliveryTime`, `minimumOrder`, `isActive`, `commissionRate`
- `username`, `tax`, `owner { _id, email, isActive }`
- `shopType`, `location { coordinates }`, `deliveryInfo { ... }`
- `openingTimes { day, times { startTime, endTime } }`
- Menu items with images, variations, addons
- Theme colors (`primaryColor`, `secondaryColor`)

❌ No mutations for restaurant CRUD operations  
❌ No location management (cities/states CRUD)  
❌ No menu item management  

### Error on Stores Page
Admin queries `GET_RESTAURANTS_PAGINATED` or `GET_RESTAURANTS` but sqlite schema only has:
```graphql
type Restaurant {
  _id: ID!
  orderId: Int
  name: String!
  image: String
  address: String!
  phone: String
}
```

Admin expects ~30 fields, we only have 5.

---

## Implementation Plan

### Phase 1: Schema Foundation (High Priority)

#### 1.1 Extend Restaurant Type in sqlite-backend/schema.js

**Add to Restaurant type:**
```graphql
type Restaurant {
  _id: ID!
  unique_restaurant_id: String
  orderId: Int
  orderPrefix: String
  name: String!
  slug: String
  image: String
  logo: String
  address: String!
  phone: String
  deliveryTime: String
  minimumOrder: Float
  isActive: Boolean
  commissionRate: Float
  username: String
  password: String  # Hashed
  tax: Float
  shopType: String  # "restaurant" or "grocery"
  primaryColor: String  # Theme color
  secondaryColor: String  # Theme color
  location: Location
  deliveryInfo: DeliveryInfo
  openingTimes: [OpeningTime!]
  owner: Owner
  categories: [Category!]
  reviewAverage: Float
  reviewCount: Int
  isAvailable: Boolean
}

type Owner {
  _id: ID!
  email: String
  isActive: Boolean
}

type DeliveryInfo {
  minDeliveryFee: Float
  deliveryDistance: Float
  deliveryFee: Float
}

type Category {
  _id: ID!
  title: String!
  foods: [Food!]
}

type Food {
  _id: ID!
  title: String!
  description: String
  image: String
  isOutOfStock: Boolean
  variations: [Variation!]
}

type Variation {
  _id: ID!
  title: String!
  price: Float!
  discounted: Float
  addons: [Addon!]
}

type Addon {
  _id: ID!
  title: String!
  description: String
  quantityMinimum: Int
  quantityMaximum: Int
  options: [AddonOption!]
}

type AddonOption {
  _id: ID!
  title: String!
  price: Float!
}
```

#### 1.2 Update Database Schema (sqlite)

**Create migration SQL:**
```sql
-- Extend restaurants table
ALTER TABLE restaurants ADD COLUMN unique_restaurant_id TEXT UNIQUE;
ALTER TABLE restaurants ADD COLUMN order_prefix TEXT DEFAULT 'ORD';
ALTER TABLE restaurants ADD COLUMN slug TEXT;
ALTER TABLE restaurants ADD COLUMN logo TEXT;
ALTER TABLE restaurants ADD COLUMN delivery_time TEXT DEFAULT '25-35 min';
ALTER TABLE restaurants ADD COLUMN minimum_order REAL DEFAULT 0;
ALTER TABLE restaurants ADD COLUMN is_active INTEGER DEFAULT 1;
ALTER TABLE restaurants ADD COLUMN commission_rate REAL DEFAULT 0.1;
ALTER TABLE restaurants ADD COLUMN username TEXT;
ALTER TABLE restaurants ADD COLUMN password TEXT;
ALTER TABLE restaurants ADD COLUMN tax REAL DEFAULT 0;
ALTER TABLE restaurants ADD COLUMN shop_type TEXT DEFAULT 'restaurant';
ALTER TABLE restaurants ADD COLUMN primary_color TEXT DEFAULT '#4CAF50';
ALTER TABLE restaurants ADD COLUMN secondary_color TEXT DEFAULT '#FF9800';
ALTER TABLE restaurants ADD COLUMN latitude REAL;
ALTER TABLE restaurants ADD COLUMN longitude REAL;
ALTER TABLE restaurants ADD COLUMN min_delivery_fee REAL DEFAULT 0;
ALTER TABLE restaurants ADD COLUMN delivery_distance REAL DEFAULT 5;
ALTER TABLE restaurants ADD COLUMN delivery_fee REAL DEFAULT 0;
ALTER TABLE restaurants ADD COLUMN review_average REAL DEFAULT 4.5;
ALTER TABLE restaurants ADD COLUMN review_count INTEGER DEFAULT 0;
ALTER TABLE restaurants ADD COLUMN is_available INTEGER DEFAULT 1;
ALTER TABLE restaurants ADD COLUMN owner_id INTEGER;

-- Create owners table
CREATE TABLE IF NOT EXISTS owners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Create opening_times table
CREATE TABLE IF NOT EXISTS opening_times (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  day TEXT NOT NULL,  -- Monday, Tuesday, etc.
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Extend menu_items (foods)
CREATE TABLE IF NOT EXISTS foods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  is_out_of_stock INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Create variations table
CREATE TABLE IF NOT EXISTS variations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  food_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  price REAL NOT NULL,
  discounted REAL,
  FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
);

-- Create addons table
CREATE TABLE IF NOT EXISTS addons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  quantity_minimum INTEGER DEFAULT 0,
  quantity_maximum INTEGER DEFAULT 1
);

-- Create addon_options table
CREATE TABLE IF NOT EXISTS addon_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  addon_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  price REAL NOT NULL,
  FOREIGN KEY (addon_id) REFERENCES addons(id) ON DELETE CASCADE
);

-- Create variation_addons junction table
CREATE TABLE IF NOT EXISTS variation_addons (
  variation_id INTEGER NOT NULL,
  addon_id INTEGER NOT NULL,
  PRIMARY KEY (variation_id, addon_id),
  FOREIGN KEY (variation_id) REFERENCES variations(id) ON DELETE CASCADE,
  FOREIGN KEY (addon_id) REFERENCES addons(id) ON DELETE CASCADE
);
```

#### 1.3 Add GraphQL Queries

**In sqlite-backend/schema.js:**
```graphql
type Query {
  # Existing
  restaurants: [Restaurant]
  restaurant(id: ID!): Restaurant
  
  # NEW: Admin-specific queries
  restaurantsPaginated(page: Int, limit: Int, search: String): RestaurantsPaginatedResponse!
  restaurantByOwner(id: String): Owner
  
  # Menu queries
  categories(restaurantId: ID!): [Category!]
  foods(categoryId: ID!): [Food!]
  
  # Location queries
  availableLocations: [ServiceLocation!]!
}

type RestaurantsPaginatedResponse {
  count: Int!
  restaurants: [Restaurant!]!
}
```

---

### Phase 2: Mutations for CRUD Operations

#### 2.1 Restaurant Mutations

```graphql
type Mutation {
  # Restaurant CRUD
  createRestaurant(input: RestaurantInput!): Restaurant!
  updateRestaurant(id: ID!, input: RestaurantInput!): Restaurant!
  deleteRestaurant(id: ID!): Boolean!
  
  # Category CRUD
  createCategory(restaurantId: ID!, title: String!): Category!
  updateCategory(id: ID!, title: String!): Category!
  deleteCategory(id: ID!): Boolean!
  
  # Food CRUD
  createFood(categoryId: ID!, input: FoodInput!): Food!
  updateFood(id: ID!, input: FoodInput!): Food!
  deleteFood(id: ID!): Boolean!
  
  # Location CRUD
  createLocation(input: LocationInput!): ServiceLocation!
  updateLocation(id: ID!, input: LocationInput!): ServiceLocation!
  deleteLocation(id: ID!): Boolean!
}

input RestaurantInput {
  name: String!
  slug: String
  image: String
  logo: String
  address: String!
  phone: String
  deliveryTime: String
  minimumOrder: Float
  commissionRate: Float
  tax: Float
  shopType: String
  primaryColor: String
  secondaryColor: String
  latitude: Float
  longitude: Float
  minDeliveryFee: Float
  deliveryDistance: Float
  deliveryFee: Float
  ownerId: ID
  openingTimes: [OpeningTimeInput!]
}

input OpeningTimeInput {
  day: String!
  startTime: String!
  endTime: String!
}

input FoodInput {
  title: String!
  description: String
  image: String
  variations: [VariationInput!]
}

input VariationInput {
  title: String!
  price: Float!
  discounted: Float
}
```

#### 2.2 Implement Resolvers with Transactions

Example createRestaurant:
```javascript
createRestaurant: async (_, { input }, { db }) => {
  try {
    await db.exec('BEGIN IMMEDIATE TRANSACTION');
    
    const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, '-');
    const result = await db.run(
      `INSERT INTO restaurants (
        unique_restaurant_id, name, slug, image, logo, address, phone,
        delivery_time, minimum_order, commission_rate, tax, shop_type,
        primary_color, secondary_color, latitude, longitude,
        min_delivery_fee, delivery_distance, delivery_fee, owner_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `REST-${Date.now()}`,
        input.name,
        slug,
        input.image || null,
        input.logo || null,
        input.address,
        input.phone || null,
        input.deliveryTime || '25-35 min',
        input.minimumOrder || 0,
        input.commissionRate || 0.1,
        input.tax || 0,
        input.shopType || 'restaurant',
        input.primaryColor || '#4CAF50',
        input.secondaryColor || '#FF9800',
        input.latitude || null,
        input.longitude || null,
        input.minDeliveryFee || 0,
        input.deliveryDistance || 5,
        input.deliveryFee || 0,
        input.ownerId || null
      ]
    );
    
    const restaurantId = result.lastID;
    
    // Insert opening times
    if (input.openingTimes && input.openingTimes.length > 0) {
      for (const ot of input.openingTimes) {
        await db.run(
          'INSERT INTO opening_times (restaurant_id, day, start_time, end_time) VALUES (?, ?, ?, ?)',
          [restaurantId, ot.day, ot.startTime, ot.endTime]
        );
      }
    }
    
    await db.exec('COMMIT');
    
    // Fetch and return complete restaurant
    return getRestaurantById(db, restaurantId);
  } catch (error) {
    await db.exec('ROLLBACK');
    throw error;
  }
}
```

---

### Phase 3: Seed Rich Sample Data

#### 3.1 Create seed-restaurants-full.js

```javascript
// Seed 10 Calabar restaurants with complete details
const restaurants = [
  {
    name: "Chicken Republic Calabar",
    slug: "chicken-republic-calabar",
    image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Chicken_Republic_Logo.svg/1200px-Chicken_Republic_Logo.svg.png",
    address: "Marian Road, Calabar, Cross River",
    phone: "+234 803 123 4567",
    deliveryTime: "20-30 min",
    minimumOrder: 1500,
    commissionRate: 0.15,
    tax: 0.075,
    shopType: "restaurant",
    primaryColor: "#E31837",
    secondaryColor: "#FFC72C",
    latitude: 4.9517,
    longitude: 8.3410,
    reviewAverage: 4.6,
    reviewCount: 342,
    openingTimes: [
      { day: "Monday", startTime: "08:00", endTime: "22:00" },
      { day: "Tuesday", startTime: "08:00", endTime: "22:00" },
      // ... all 7 days
    ],
    categories: [
      {
        title: "Chicken & Chips",
        foods: [
          {
            title: "Refuel Max",
            description: "1 Piece chicken, Chips, Coleslaw, 1 Sausage & Drink",
            image: "https://images.unsplash.com/photo-1562059390-a761a084768e",
            variations: [
              { title: "Regular", price: 2800, discounted: null },
              { title: "Large", price: 3500, discounted: 3200 }
            ]
          }
        ]
      }
    ]
  },
  // ... 9 more restaurants
];
```

---

### Phase 4: Admin UI Integration

#### 4.1 Verify Admin Queries Match Schema

Update `enatega-multivendor-admin/lib/api/graphql/queries/restaurants/index.ts`:

```typescript
export const GET_RESTAURANTS_PAGINATED = gql`
  query restaurantsPaginated($page: Int, $limit: Int, $search: String) {
    restaurantsPaginated(page: $page, limit: $limit, search: $search) {
      count
      restaurants {
        _id
        unique_restaurant_id
        name
        slug
        image
        logo
        address
        phone
        deliveryTime
        minimumOrder
        isActive
        commissionRate
        tax
        shopType
        primaryColor
        secondaryColor
        location {
          coordinates
        }
        owner {
          _id
          email
          isActive
        }
        reviewAverage
        reviewCount
        isAvailable
      }
    }
  }
`;
```

#### 4.2 Add Mutations to Admin

```typescript
export const CREATE_RESTAURANT = gql`
  mutation createRestaurant($input: RestaurantInput!) {
    createRestaurant(input: $input) {
      _id
      name
      slug
    }
  }
`;

export const UPDATE_RESTAURANT = gql`
  mutation updateRestaurant($id: ID!, $input: RestaurantInput!) {
    updateRestaurant(id: $id, input: $input) {
      _id
      name
    }
  }
`;
```

---

## Execution Steps

### Step 1: Database Migration
```bash
cd sqlite-backend
node migrate-schema.js  # Create this script with ALTER TABLE statements
npm run seed:restaurants-full
```

### Step 2: Update Schema & Resolvers
- Add new types to `schema.js`
- Implement all resolvers with transaction wrapping
- Test with GraphQL Playground

### Step 3: Test Backend
```powershell
# Test paginated query
$query = '{"query":"query { restaurantsPaginated(page: 1, limit: 5) { count restaurants { _id name image logo primaryColor } } }"}';
Invoke-RestMethod -Uri "http://localhost:4000/graphql" -Method POST -Body $query -ContentType "application/json"
```

### Step 4: Start Admin & Verify
```bash
cd enatega-multivendor-admin
npm run dev
# Navigate to /general/stores
# Should see: Restaurant grid with images, colors, all details
# Click Edit: Form should load with all fields
# Click Add: Should be able to create new restaurant
```

---

## File Changes Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `sqlite-backend/schema.js` | Major Update | Add 20+ new types, extend Restaurant, add mutations |
| `sqlite-backend/migrate-schema.js` | New File | SQL migrations for new columns & tables |
| `sqlite-backend/seed-restaurants-full.js` | New File | Seed 10+ restaurants with complete data |
| `sqlite-backend/resolvers/` | New Directory | Split resolvers by domain (restaurants, menu, locations) |
| `enatega-multivendor-admin/lib/api/graphql/queries/restaurants/index.ts` | Update | Match query fields to new schema |
| `enatega-multivendor-admin/lib/api/graphql/mutations/restaurants/index.ts` | New File | Add CRUD mutations |

---

## Testing Checklist

- [ ] Backend starts without errors
- [ ] `restaurants` query returns all fields
- [ ] `restaurantsPaginated` works with search
- [ ] `createRestaurant` mutation creates with all fields
- [ ] `updateRestaurant` mutation updates correctly
- [ ] `deleteRestaurant` mutation soft-deletes (sets isActive=false)
- [ ] Admin stores page loads restaurant grid
- [ ] Admin can view restaurant details (images, colors, menu)
- [ ] Admin can edit restaurant (all fields editable)
- [ ] Admin can add new restaurant
- [ ] Location management works (add/edit/delete cities)

---

## Priority Order

1. **Critical (Today)**
   - Extend Restaurant type with basic fields admin needs
   - Implement `restaurantsPaginated` query
   - Fix stores page error

2. **High (This Week)**
   - Add all CRUD mutations
   - Implement menu structure (categories, foods, variations)
   - Seed rich sample data

3. **Medium (Next Week)**
   - Add location management
   - Add theme color picker in admin
   - Add image upload handling

4. **Nice to Have**
   - Restaurant analytics dashboard
   - Bulk operations (import CSV)
   - Advanced filtering by shop type, location

---

## Risk Mitigation

**Risk:** Breaking existing web app queries  
**Mitigation:** Keep backward compatibility; existing `nearByRestaurantsPreview` stays unchanged

**Risk:** Database locks during migration  
**Mitigation:** Use WAL mode already configured; run migration when no users active

**Risk:** Admin UI expects different field names  
**Mitigation:** Map GraphQL response to match admin interface expectations

---

## Success Criteria

✅ Admin can navigate to Stores page without errors  
✅ Admin sees restaurant grid with images and theme colors  
✅ Admin can click on a restaurant and see full details (menu, photos, hours)  
✅ Admin can edit restaurant details (name, address, colors, menu items)  
✅ Admin can add new restaurants with photos and menu  
✅ Admin can manage locations (cities/states for restaurant filtering)  
✅ All changes persist in SQLite database  
✅ Web app restaurant listing still works (backward compatible)

---

**Estimated Effort:** 8-12 hours total
- Schema updates: 2 hours
- Resolver implementation: 3 hours
- Seed data creation: 1 hour
- Admin integration: 2 hours
- Testing & debugging: 2-4 hours

**Next Immediate Action:** Extend sqlite-backend/schema.js with Restaurant fields admin expects
