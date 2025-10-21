import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Admin {
    id: ID!
    email: String!
    password: String!
    name: String
    role: String
  }

  type Restaurant {
    _id: ID!
    orderId: Int
    name: String!
    image: String
    address: String!
    phone: String
  }

  type Location {
    coordinates: [Float!]
  }

  type OpeningTime {
    day: String!
    times: [TimeSlot!]
  }

  type TimeSlot {
    startTime: String!
    endTime: String!
  }

  type RestaurantPreview {
    _id: ID!
    name: String!
    image: String
    logo: String
    slug: String
    shopType: String
    deliveryTime: String
    location: Location
    reviewAverage: Float
    cuisines: [String!]
    openingTimes: [OpeningTime!]
    isAvailable: Boolean
    isActive: Boolean
  }

  type NearByRestaurantsResponse {
    restaurants: [RestaurantPreview!]!
  }

  type MenuItem {
    id: ID!
    restaurant_id: ID!
    name: String!
    price: Float!
  }

  type User {
    id: ID!
    username: String!
    password: String!
    email: String!
  }

  type OwnerLoginResponse {
    userId: String!
    token: String!
    email: String!
    userType: String!
    restaurants: [Restaurant!]!
    permissions: [String!]!
    userTypeId: String
    image: String
    name: String
  }

  type Query {
    admins: [Admin]
    restaurants: [Restaurant]
    menuItems: [MenuItem]
    users: [User]
    nearByRestaurantsPreview(
      latitude: Float
      longitude: Float
      page: Int
      limit: Int
      shopType: String
    ): NearByRestaurantsResponse
    recentOrderRestaurantsPreview(latitude: Float!, longitude: Float!): [RestaurantPreview!]
    mostOrderedRestaurantsPreview(
      latitude: Float!
      longitude: Float!
      page: Int
      limit: Int
      shopType: String
    ): [RestaurantPreview!]
  }

  type Mutation {
    ownerLogin(email: String!, password: String!): OwnerLoginResponse
  }
`;

export const resolvers = {
  Query: {
    admins: async (_, __, { db }) => db.all('SELECT * FROM admins'),
    restaurants: async (_, __, { db }) => {
      const rows = await db.all('SELECT * FROM restaurants');
      return rows.map(row => ({ ...row, _id: row.id }));
    },
    menuItems: async (_, __, { db }) => db.all('SELECT * FROM menu_items'),
    users: async (_, __, { db }) => db.all('SELECT * FROM users'),
    
    nearByRestaurantsPreview: async (_, { latitude, longitude, page = 1, limit = 10, shopType }, { db }) => {
      const offset = (page - 1) * limit;
      let query = 'SELECT * FROM restaurants';
      let params = [];
      
      if (shopType) {
        query += ' WHERE shopType = ?';
        params.push(shopType);
      }
      
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const rows = await db.all(query, params);
      
      // Default to Cross River State, Nigeria coordinates if not provided
      const defaultLat = latitude || 5.0000;
      const defaultLng = longitude || 8.3200;
      
      const restaurants = rows.map(row => ({
        _id: row.id.toString(),
        name: row.name,
        image: row.image,
        logo: row.image, // Using image as logo for now
        slug: row.name.toLowerCase().replace(/\s+/g, '-'),
        shopType: 'restaurant',
        deliveryTime: '25-35 min',
        location: {
          coordinates: [defaultLng, defaultLat] // [longitude, latitude]
        },
        reviewAverage: 4.5,
        cuisines: ['Nigerian', 'African', 'Local'],
        openingTimes: [
          {
            day: 'Monday',
            times: [{ startTime: '09:00', endTime: '22:00' }]
          },
          {
            day: 'Tuesday',
            times: [{ startTime: '09:00', endTime: '22:00' }]
          },
          {
            day: 'Wednesday',
            times: [{ startTime: '09:00', endTime: '22:00' }]
          },
          {
            day: 'Thursday',
            times: [{ startTime: '09:00', endTime: '22:00' }]
          },
          {
            day: 'Friday',
            times: [{ startTime: '09:00', endTime: '23:00' }]
          },
          {
            day: 'Saturday',
            times: [{ startTime: '10:00', endTime: '23:00' }]
          },
          {
            day: 'Sunday',
            times: [{ startTime: '10:00', endTime: '21:00' }]
          }
        ],
        isAvailable: true,
        isActive: true
      }));
      
      return { restaurants };
    },
    
    recentOrderRestaurantsPreview: async (_, { latitude, longitude }, { db }) => {
      const rows = await db.all('SELECT * FROM restaurants LIMIT 5');
      return rows.map(row => ({
        _id: row.id.toString(),
        name: row.name,
        image: row.image,
        logo: row.image,
        slug: row.name.toLowerCase().replace(/\s+/g, '-'),
        shopType: 'restaurant',
        deliveryTime: '20-30 min',
        location: {
          coordinates: [latitude || -74.006, longitude || 40.7128]
        },
        reviewAverage: 4.3,
        cuisines: ['Popular'],
        openingTimes: [
          {
            day: 'Monday',
            times: [{ startTime: '09:00', endTime: '22:00' }]
          }
        ],
        isAvailable: true,
        isActive: true
      }));
    },
    
    mostOrderedRestaurantsPreview: async (_, { latitude, longitude, page = 1, limit = 10, shopType }, { db }) => {
      const offset = (page - 1) * limit;
      let query = 'SELECT * FROM restaurants';
      let params = [];
      
      if (shopType) {
        query += ' WHERE shopType = ?';
        params.push(shopType);
      }
      
      query += ' ORDER BY name LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const rows = await db.all(query, params);
      return rows.map(row => ({
        _id: row.id.toString(),
        name: row.name,
        image: row.image,
        logo: row.image,
        slug: row.name.toLowerCase().replace(/\s+/g, '-'),
        shopType: 'restaurant',
        deliveryTime: '30-40 min',
        location: {
          coordinates: [latitude || -74.006, longitude || 40.7128]
        },
        reviewAverage: 4.7,
        cuisines: ['Popular', 'Trending'],
        openingTimes: [
          {
            day: 'Monday',
            times: [{ startTime: '09:00', endTime: '22:00' }]
          }
        ],
        isAvailable: true,
        isActive: true
      }));
    }
  },
  Mutation: {
    ownerLogin: async (_, { email, password }, { db }) => {
      const admin = await db.get('SELECT * FROM admins WHERE email = ? AND password = ?', [email, password]);
      if (!admin) {
        throw new Error('Invalid credentials');
      }
      return {
        userId: admin.id.toString(),
        token: 'dummy-token-' + admin.id,
        email: admin.email,
        userType: 'ADMIN',
        restaurants: [],
        permissions: ['ADMIN'],
        userTypeId: admin.id.toString(),
        image: null,
        name: admin.name || 'Admin'
      };
    },
  },
};
