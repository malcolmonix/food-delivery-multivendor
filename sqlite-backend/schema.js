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
