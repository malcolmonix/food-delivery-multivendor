# Backend CRUD Mutations for Stores

## Changes needed in `sqlite-backend/schema.js`

### 1. Add UpdateRestaurantInput type (after line ~155, after OrderInput)

```graphql
  input UpdateRestaurantInput {
    _id: ID!
    name: String
    address: String
    phone: String
    image: String
    logo: String
    orderPrefix: String
    slug: String
    deliveryTime: String
    minimumOrder: Float
    isActive: Boolean
    commissionRate: Float
    username: String
    password: String
    tax: Float
    shopType: String
    primaryColor: String
    secondaryColor: String
    latitude: Float
    longitude: Float
    ownerId: ID
    ownerEmail: String
    ownerIsActive: Boolean
  }
```

### 2. Add mutations to Mutation type (after line ~230, after placeOrder)

```graphql
    # Admin UI: Update restaurant fields
    updateRestaurant(input: UpdateRestaurantInput!): Restaurant!
    # Admin UI: Soft delete (set isActive = false) 
    deleteRestaurant(id: ID!): Restaurant!
    # Admin UI: Hard delete from DB
    hardDeleteRestaurant(id: ID!): Boolean!
```

### 3. Add resolvers in Mutation section (after ownerLogin, around line ~710)

```javascript
    updateRestaurant: async (_, { input }, { db }) => {
      const { _id, ...fields } = input;
      const id = Number(_id);
      
      const existing = await db.get('SELECT * FROM restaurants WHERE id = ?', [id]);
      if (!existing) throw new Error('Restaurant not found');

      const updates = [];
      const params = [];
      
      if (fields.name !== undefined) { updates.push('name = ?'); params.push(fields.name); }
      if (fields.address !== undefined) { updates.push('address = ?'); params.push(fields.address); }
      if (fields.phone !== undefined) { updates.push('phone = ?'); params.push(fields.phone); }
      if (fields.image !== undefined) { updates.push('image = ?'); params.push(fields.image); }
      if (fields.logo !== undefined) { updates.push('logo = ?'); params.push(fields.logo); }
      if (fields.orderPrefix !== undefined) { updates.push('order_prefix = ?'); params.push(fields.orderPrefix); }
      if (fields.slug !== undefined) { updates.push('slug = ?'); params.push(fields.slug); }
      if (fields.deliveryTime !== undefined) { updates.push('delivery_time = ?'); params.push(fields.deliveryTime); }
      if (fields.minimumOrder !== undefined) { updates.push('minimum_order = ?'); params.push(fields.minimumOrder); }
      if (fields.isActive !== undefined) { updates.push('is_active = ?'); params.push(fields.isActive ? 1 : 0); }
      if (fields.commissionRate !== undefined) { updates.push('commission_rate = ?'); params.push(fields.commissionRate); }
      if (fields.username !== undefined) { updates.push('username = ?'); params.push(fields.username); }
      if (fields.password !== undefined) { updates.push('password = ?'); params.push(fields.password); }
      if (fields.tax !== undefined) { updates.push('tax = ?'); params.push(fields.tax); }
      if (fields.shopType !== undefined) { updates.push('shop_type = ?'); params.push(fields.shopType); }
      if (fields.primaryColor !== undefined) { updates.push('primary_color = ?'); params.push(fields.primaryColor); }
      if (fields.secondaryColor !== undefined) { updates.push('secondary_color = ?'); params.push(fields.secondaryColor); }
      if (fields.latitude !== undefined) { updates.push('latitude = ?'); params.push(fields.latitude); }
      if (fields.longitude !== undefined) { updates.push('longitude = ?'); params.push(fields.longitude); }
      if (fields.ownerId !== undefined) { updates.push('owner_id = ?'); params.push(Number(fields.ownerId)); }
      if (fields.ownerEmail !== undefined) { updates.push('owner_email = ?'); params.push(fields.ownerEmail); }
      if (fields.ownerIsActive !== undefined) { updates.push('owner_is_active = ?'); params.push(fields.ownerIsActive ? 1 : 0); }

      if (updates.length === 0) throw new Error('No fields to update');

      params.push(id);
      await db.run(`UPDATE restaurants SET ${updates.join(', ')} WHERE id = ?`, params);

      const updated = await db.get('SELECT * FROM restaurants WHERE id = ?', [id]);
      return {
        _id: updated.id?.toString() ?? null,
        orderId: null,
        name: updated.name,
        image: updated.image,
        address: updated.address,
        phone: updated.phone || null,
        unique_restaurant_id: updated.unique_restaurant_id || `RES-${updated.id}`,
        orderPrefix: updated.order_prefix || 'ORD',
        slug: updated.slug || (updated.name ? updated.name.toLowerCase().replace(/\s+/g, '-') : null),
        deliveryTime: updated.delivery_time || '25-35 min',
        minimumOrder: updated.minimum_order ?? 0,
        isActive: updated.is_active != null ? Boolean(updated.is_active) : true,
        commissionRate: updated.commission_rate ?? 0,
        username: updated.username || (updated.name ? updated.name.toLowerCase().replace(/\s+/g, '') : null),
        tax: updated.tax ?? 0,
        shopType: updated.shop_type || 'restaurant',
        owner: { 
          _id: updated.owner_id != null ? String(updated.owner_id) : '1', 
          email: updated.owner_email || 'owner@example.com', 
          isActive: updated.owner_is_active != null ? Boolean(updated.owner_is_active) : true 
        },
      };
    },

    deleteRestaurant: async (_, { id }, { db }) => {
      const restaurantId = Number(id);
      const existing = await db.get('SELECT * FROM restaurants WHERE id = ?', [restaurantId]);
      if (!existing) throw new Error('Restaurant not found');

      await db.run('UPDATE restaurants SET is_active = 0 WHERE id = ?', [restaurantId]);

      const updated = await db.get('SELECT * FROM restaurants WHERE id = ?', [restaurantId]);
      return {
        _id: updated.id?.toString() ?? null,
        orderId: null,
        name: updated.name,
        image: updated.image,
        address: updated.address,
        phone: updated.phone || null,
        unique_restaurant_id: updated.unique_restaurant_id || `RES-${updated.id}`,
        orderPrefix: updated.order_prefix || 'ORD',
        slug: updated.slug || (updated.name ? updated.name.toLowerCase().replace(/\s+/g, '-') : null),
        deliveryTime: updated.delivery_time || '25-35 min',
        minimumOrder: updated.minimum_order ?? 0,
        isActive: Boolean(updated.is_active),
        commissionRate: updated.commission_rate ?? 0,
        username: updated.username || null,
        tax: updated.tax ?? 0,
        shopType: updated.shop_type || 'restaurant',
        owner: { 
          _id: updated.owner_id != null ? String(updated.owner_id) : '1', 
          email: updated.owner_email || 'owner@example.com', 
          isActive: updated.owner_is_active != null ? Boolean(updated.owner_is_active) : true 
        },
      };
    },

    hardDeleteRestaurant: async (_, { id }, { db }) => {
      const restaurantId = Number(id);
      const existing = await db.get('SELECT * FROM restaurants WHERE id = ?', [restaurantId]);
      if (!existing) throw new Error('Restaurant not found');

      await db.run('DELETE FROM restaurants WHERE id = ?', [restaurantId]);
      return true;
    },
```

## How to apply

Open `sqlite-backend/schema.js` and manually add these three sections in the locations indicated above.
