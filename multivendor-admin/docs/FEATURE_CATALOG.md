# Enatega Multi-Vendor Admin - Feature Catalog

## Status Legend
- ✅ **Implemented** - Feature is fully functional
- 🟡 **Partial** - Feature exists but incomplete
- ❌ **Missing** - Feature not yet implemented
- 🎯 **Priority** - High priority for next implementation

---

## 1. Authentication & Authorization

| Feature | Status | Notes |
|---------|--------|-------|
| Admin Login | ✅ | ownerLogin mutation, JWT token storage |
| Protected Routes | ✅ | useEffect-based auth guard in layout |
| Logout | ✅ | Clears localStorage token |
| Role-based Access | ❌ | No permission checks per role |
| Multi-factor Auth | ❌ | |
| Password Reset | ❌ | |
| Session Management | 🟡 | Basic localStorage, no expiry handling |

**Priority Actions:**
- Add password reset flow
- Implement role-based permissions (Super Admin, Admin, Support)

---

## 2. Dashboard

| Feature | Status | Notes |
|---------|--------|-------|
| KPI Cards | ✅ | Users, Restaurants, Menu Items counts |
| Recent Activity | ✅ | Recent 5 users & restaurants |
| Quick Edit | ✅ | Inline modals for users/restaurants |
| Charts/Graphs | ❌ 🎯 | No revenue, orders, or trend charts |
| Date Range Filter | ❌ | |
| Export Reports | ❌ | |
| Real-time Updates | ❌ | |

**Priority Actions:**
- Add revenue/orders chart with date filters
- Implement real-time WebSocket updates for live metrics

---

## 3. Orders Management

| Feature | Status | Notes |
|---------|--------|-------|
| Orders List | ❌ 🎯 | CRITICAL - core functionality missing |
| Order Detail | ❌ 🎯 | |
| Status Updates | ❌ 🎯 | PENDING → ACCEPTED → PREPARING → etc |
| Order Search | ❌ | |
| Status Filter | ❌ | All, Pending, In Progress, Completed, Cancelled |
| Date Range Filter | ❌ | |
| Export Orders | ❌ | |
| Real-time Notifications | ❌ 🎯 | Sound/notification for new orders |
| Order Assignment | ❌ | Assign rider to order |
| Refund/Cancel | ❌ | |
| Order Timeline | ❌ | Visual timeline of status changes |
| Customer Details | ❌ | View customer info in order |
| Restaurant Details | ❌ | View restaurant info in order |

**Backend Requirements:**
```graphql
type Order {
  _id: ID!
  orderId: String!
  restaurant: Restaurant!
  user: User!
  rider: Rider
  items: [OrderItem!]!
  deliveryAddress: Address!
  orderStatus: String!
  paymentMethod: String!
  paidAmount: Float!
  orderAmount: Float!
  deliveryCharges: Float!
  tipping: Float
  taxationAmount: Float
  createdAt: String!
  deliveryTime: String
  completedAt: String
  reason: String
}

type OrderItem {
  _id: ID!
  title: String!
  quantity: Int!
  variation: String
  addons: [String]
  price: Float!
}

type Query {
  orders(status: String, page: Int, limit: Int): OrdersResponse!
  order(id: ID!): Order!
  ordersCount(status: String): Int!
}

type Mutation {
  updateOrderStatus(id: ID!, status: String!): Order!
  assignRider(orderId: ID!, riderId: ID!): Order!
  cancelOrder(id: ID!, reason: String!): Order!
}

type Subscription {
  orderCreated: Order!
  orderUpdated: Order!
}
```

**Priority Actions:**
- Create `/orders` list page with filters
- Create `/orders/[id]` detail page with timeline
- Add status update buttons
- Implement real-time subscription for new orders

---

## 4. Users Management

| Feature | Status | Notes |
|---------|--------|-------|
| Users List | ✅ | All users with search |
| User Search | ✅ | Client-side filtering |
| User Edit | 🟡 | Modal exists, persistence untested |
| User Detail | ❌ | No dedicated detail page |
| User Orders History | ❌ | |
| User Address Management | ❌ | |
| User Status (Active/Banned) | ❌ | |
| User Creation | ❌ | |
| Bulk Operations | ❌ | |
| Export Users | ❌ | |

**Priority Actions:**
- Add user detail page with orders history
- Implement user status toggle (active/banned)
- Add user creation form

---

## 5. Restaurants/Stores Management

| Feature | Status | Notes |
|---------|--------|-------|
| Restaurants List | ✅ | All restaurants with search |
| Restaurant Search | ✅ | Client-side filtering |
| Restaurant Edit | 🟡 | Modal exists, persistence untested |
| Restaurant Detail | ✅ | Shows items, KPIs (avg price, count) |
| Restaurant Creation | ❌ | |
| Restaurant Status | ❌ | Active, Inactive, Under Review |
| Restaurant Categories | ❌ | Fast Food, Restaurant, etc |
| Opening Hours | ❌ | |
| Delivery Zones | ❌ | |
| Commission Settings | ❌ 🎯 | Per-restaurant commission rates |
| Restaurant Documents | ❌ | License, permits verification |
| Restaurant Reviews | ❌ | |
| Restaurant Analytics | ❌ | Orders, revenue, ratings per restaurant |
| Bulk Operations | ❌ | |

**Backend Requirements:**
```graphql
type Restaurant {
  # ... existing fields ...
  isActive: Boolean!
  categories: [String!]
  openingTimes: [OpeningTime!]
  deliveryZones: [Zone!]
  commissionRate: Float!
  documents: [Document!]
  rating: Float
  reviewCount: Int
}

type OpeningTime {
  day: String!
  times: [TimeSlot!]!
}

type TimeSlot {
  startTime: String!
  endTime: String!
}

type Zone {
  _id: ID!
  title: String!
  coordinates: [[Float!]!]!
}

type Mutation {
  createRestaurant(input: RestaurantInput!): Restaurant!
  updateRestaurantStatus(id: ID!, isActive: Boolean!): Restaurant!
  updateRestaurantCommission(id: ID!, rate: Float!): Restaurant!
  approveRestaurantDocument(restaurantId: ID!, documentId: ID!): Restaurant!
}
```

**Priority Actions:**
- Add restaurant creation form (multi-step)
- Implement status toggle
- Add commission rate field
- Create restaurant analytics page

---

## 6. Vendors/Owners Management

| Feature | Status | Notes |
|---------|--------|-------|
| Vendors List | 🟡 | Reuses users query, no dedicated entity |
| Vendor Search | ✅ | Client-side filtering |
| Vendor Detail | ❌ | |
| Vendor Creation | ❌ 🎯 | Onboarding flow missing |
| Vendor Approval | ❌ 🎯 | Approve/reject new vendors |
| Vendor Documents | ❌ | KYC, business license |
| Vendor Payouts | ❌ 🎯 | Payment history, pending payouts |
| Vendor Commission | ❌ | View/edit commission rates |
| Vendor Analytics | ❌ | Revenue, orders per vendor |
| Vendor Support | ❌ | Chat/messaging with vendors |

**Backend Requirements:**
```graphql
type Owner {
  _id: ID!
  email: String!
  name: String!
  phone: String
  restaurants: [Restaurant!]
  status: String! # PENDING, APPROVED, REJECTED, SUSPENDED
  documents: [Document!]
  bankDetails: BankDetails
  totalRevenue: Float
  pendingPayout: Float
  createdAt: String!
}

type BankDetails {
  accountName: String
  accountNumber: String
  bankName: String
  routingNumber: String
}

type Document {
  _id: ID!
  type: String! # LICENSE, PERMIT, ID_PROOF, etc
  url: String!
  status: String! # PENDING, APPROVED, REJECTED
  uploadedAt: String!
}

type Query {
  owners(status: String): [Owner!]!
  owner(id: ID!): Owner!
  pendingVendors: [Owner!]!
}

type Mutation {
  createOwner(input: OwnerInput!): Owner!
  approveVendor(id: ID!): Owner!
  rejectVendor(id: ID!, reason: String!): Owner!
  updateVendorStatus(id: ID!, status: String!): Owner!
}
```

**Priority Actions:**
- Create `/vendors/onboarding` multi-step form
- Add vendor approval queue page
- Implement payouts module

---

## 7. Menu Items Management

| Feature | Status | Notes |
|---------|--------|-------|
| Menu Items List | ✅ | All items with store links |
| Item Search | ✅ | Client-side filtering |
| Item Edit | ❌ | No edit modal/page |
| Item Creation | ❌ | |
| Item Detail | ❌ | |
| Item Categories | ❌ | Organize by category |
| Item Variations | ❌ | Size, toppings, etc |
| Item Addons | ❌ | Extra cheese, etc |
| Item Availability | ❌ | In stock, out of stock |
| Item Images | ❌ | Upload/manage images |
| Bulk Operations | ❌ | |
| Import/Export | ❌ | CSV import for bulk items |

**Backend Requirements:**
```graphql
type MenuItem {
  # ... existing fields ...
  category: Category
  variations: [Variation!]
  addons: [Addon!]
  isAvailable: Boolean!
  image: String
}

type Category {
  _id: ID!
  title: String!
  restaurant: Restaurant!
}

type Variation {
  _id: ID!
  title: String!
  price: Float!
}

type Addon {
  _id: ID!
  title: String!
  price: Float!
}

type Mutation {
  createMenuItem(input: MenuItemInput!): MenuItem!
  updateMenuItem(id: ID!, input: MenuItemInput!): MenuItem!
  deleteMenuItem(id: ID!): Boolean!
  updateItemAvailability(id: ID!, isAvailable: Boolean!): MenuItem!
}
```

**Priority Actions:**
- Add item creation/edit form with variations/addons
- Implement image upload
- Add category management

---

## 8. Riders/Delivery Management

| Feature | Status | Notes |
|---------|--------|-------|
| Riders List | ❌ | |
| Rider Creation | ❌ | |
| Rider Detail | ❌ | |
| Rider Status | ❌ | Active, Inactive, Online, Offline |
| Rider Documents | ❌ | License, vehicle registration |
| Rider Location Tracking | ❌ | Real-time map view |
| Rider Orders History | ❌ | |
| Rider Earnings | ❌ | |
| Rider Availability | ❌ | Set working hours |
| Rider Zones | ❌ | Assign delivery zones |
| Performance Metrics | ❌ | Deliveries, ratings, on-time % |

**Backend Requirements:**
```graphql
type Rider {
  _id: ID!
  name: String!
  email: String!
  phone: String!
  status: String!
  isAvailable: Boolean!
  location: Location
  vehicle: String
  documents: [Document!]
  zone: Zone
  currentOrders: [Order!]
  completedOrders: Int!
  rating: Float
  totalEarnings: Float
}

type Location {
  latitude: Float!
  longitude: Float!
  updatedAt: String!
}

type Query {
  riders(status: String): [Rider!]!
  rider(id: ID!): Rider!
  availableRiders(zoneId: ID): [Rider!]!
}

type Mutation {
  createRider(input: RiderInput!): Rider!
  updateRiderStatus(id: ID!, status: String!): Rider!
  updateRiderAvailability(id: ID!, isAvailable: Boolean!): Rider!
}

type Subscription {
  riderLocationUpdated(riderId: ID!): Rider!
}
```

**Priority Actions:**
- Create riders CRUD pages
- Add real-time location tracking map
- Implement rider assignment logic

---

## 9. Analytics & Reports

| Feature | Status | Notes |
|---------|--------|-------|
| Revenue Dashboard | ❌ 🎯 | Line/bar charts with trends |
| Orders Analytics | ❌ 🎯 | By status, time, restaurant |
| Top Restaurants | ❌ | By revenue, orders |
| Top Items | ❌ | Best sellers |
| User Growth | ❌ | New users over time |
| Geographic Analysis | ❌ | Orders by location |
| Date Range Filter | ❌ | Custom date selection |
| Export Reports | ❌ | PDF/Excel export |
| Scheduled Reports | ❌ | Email daily/weekly reports |
| Commission Reports | ❌ | Earnings from restaurants |
| Rider Performance | ❌ | Deliveries, earnings per rider |

**Backend Requirements:**
```graphql
type Analytics {
  totalRevenue: Float!
  totalOrders: Int!
  avgOrderValue: Float!
  revenueByDate: [RevenuePoint!]!
  ordersByStatus: [StatusCount!]!
  topRestaurants: [RestaurantStats!]!
  topItems: [ItemStats!]!
  userGrowth: [GrowthPoint!]!
}

type RevenuePoint {
  date: String!
  revenue: Float!
  orders: Int!
}

type Query {
  analytics(startDate: String!, endDate: String!): Analytics!
}
```

**Priority Actions:**
- Create `/analytics` page with multiple chart types
- Install recharts or chart.js
- Add date range picker
- Implement export functionality

---

## 10. Settings & Configuration

| Feature | Status | Notes |
|---------|--------|-------|
| General Settings | ❌ | Site name, logo, contact |
| Payment Gateways | ❌ 🎯 | Stripe, PayPal config |
| Email Settings | ❌ | SMTP config, templates |
| SMS Settings | ❌ | Twilio/similar integration |
| Delivery Settings | ❌ | Base charges, per-km rate |
| Commission Settings | ❌ | Default commission rate |
| Tax Settings | ❌ | Tax rates, GST/VAT |
| Currency Settings | ❌ | Currency symbol, format |
| Notification Settings | ❌ | Push, email, SMS toggles |
| Terms & Privacy | ❌ | Editable legal pages |
| Maintenance Mode | ❌ | Toggle site availability |
| Google Maps API | ❌ | API key configuration |
| Firebase Config | ❌ | Push notifications setup |

**Backend Requirements:**
```graphql
type Configuration {
  _id: ID!
  key: String!
  value: String!
  category: String!
}

type Query {
  configurations(category: String): [Configuration!]!
  configuration(key: String!): Configuration
}

type Mutation {
  updateConfiguration(key: String!, value: String!): Configuration!
  updateConfigurations(configs: [ConfigInput!]!): [Configuration!]!
}
```

**Priority Actions:**
- Create `/settings` page with tabs
- Implement payment gateway configuration
- Add email template editor
- Create delivery settings form

---

## 11. Reviews & Ratings

| Feature | Status | Notes |
|---------|--------|-------|
| Restaurant Reviews | ❌ | List all reviews |
| Rider Reviews | ❌ | List all reviews |
| Review Moderation | ❌ | Approve/delete reviews |
| Review Detail | ❌ | Full review with response |
| Owner Response | ❌ | Let restaurants respond |
| Review Search | ❌ | By rating, restaurant, user |
| Review Analytics | ❌ | Avg ratings, trends |

---

## 12. Notifications

| Feature | Status | Notes |
|---------|--------|-------|
| Notification Center | ❌ | Bell icon with badge |
| Push Notifications | ❌ | Firebase Cloud Messaging |
| Email Notifications | ❌ | Order updates, etc |
| SMS Notifications | ❌ | Via Twilio |
| In-app Notifications | ❌ | Toast/alert system |
| Notification Templates | ❌ | Customizable templates |
| Notification History | ❌ | View sent notifications |
| Broadcast Messages | ❌ | Send to all users/vendors |

---

## 13. Coupons & Offers

| Feature | Status | Notes |
|---------|--------|-------|
| Coupons List | ❌ | All active coupons |
| Coupon Creation | ❌ | Discount %, fixed amount |
| Coupon Edit/Delete | ❌ | |
| Usage Limits | ❌ | Max uses per user/total |
| Validity Period | ❌ | Start/end dates |
| Restaurant-specific | ❌ | Limit to certain restaurants |
| Minimum Order Value | ❌ | |
| Coupon Usage History | ❌ | Who used, when |

---

## 14. Zones & Delivery Areas

| Feature | Status | Notes |
|---------|--------|-------|
| Zones List | ❌ | Geographic zones |
| Zone Creation | ❌ | Draw on map |
| Zone Edit/Delete | ❌ | |
| Delivery Charges | ❌ | Per-zone rates |
| Restaurant-Zone Mapping | ❌ | Which restaurants serve which zones |
| Rider-Zone Assignment | ❌ | Assign riders to zones |

---

## 15. Support & Help

| Feature | Status | Notes |
|---------|--------|-------|
| Support Tickets | ❌ | Customer issues |
| Ticket Detail | ❌ | Conversation thread |
| Ticket Assignment | ❌ | Assign to admin |
| Ticket Status | ❌ | Open, In Progress, Resolved |
| Help Center | ❌ | FAQ management |
| Chat System | ❌ | Live chat with users/vendors |

---

## 16. System & Advanced

| Feature | Status | Notes |
|---------|--------|-------|
| Admin Users | ❌ | Multiple admin accounts |
| Role Management | ❌ | Define custom roles |
| Activity Logs | ❌ | Audit trail of actions |
| Data Export | ❌ | Full database export |
| Data Import | ❌ | CSV bulk import |
| Database Backup | ❌ | Scheduled backups |
| API Documentation | ❌ | GraphQL playground |
| Webhooks | ❌ | External integrations |
| Multi-language | ❌ | i18n support |
| Dark Mode | ❌ | UI theme toggle |

---

## Implementation Priorities

### Phase 1: Core Operations (2-3 weeks)
1. **Orders Management** 🎯 - Most critical, complete CRUD + real-time
2. **Analytics Dashboard** 🎯 - Revenue/orders charts with date filters
3. **Restaurant Status & Categories** - Enable/disable restaurants

### Phase 2: Platform Growth (2-3 weeks)
4. **Vendor Onboarding & Approval** 🎯 - Multi-step form + document verification
5. **Riders Module** - Complete CRUD, availability management
6. **Menu Items CRUD** - Creation, editing with variations/addons

### Phase 3: Operations Efficiency (2 weeks)
7. **Settings & Configuration** 🎯 - Payment gateways, delivery charges
8. **Notifications System** - Push, email, SMS
9. **Coupons & Offers** - Discount management

### Phase 4: Growth & Support (2 weeks)
10. **Zones & Delivery Areas** - Geographic management
11. **Reviews & Ratings** - Moderation system
12. **Support Tickets** - Customer support workflow

### Phase 5: Polish & Scale (1-2 weeks)
13. **Advanced Features** - Multi-admin, audit logs, webhooks
14. **UI Enhancements** - Dark mode, i18n, mobile responsive
15. **Performance** - Pagination, caching, optimization

---

## Technical Approach (Anti-Plagiarism)

### Design Principles
1. **Modern Stack**: Next.js 14 App Router, TypeScript, Tailwind CSS
2. **Clean Architecture**: Separation of concerns, reusable components
3. **API First**: GraphQL with typed schema, proper error handling
4. **Real-time**: WebSocket subscriptions for live updates
5. **Responsive**: Mobile-first design approach

### Code Standards
- Use React Server Components where possible
- Client components only when needed (interactivity, hooks)
- Custom hooks for shared logic (useAuth, useOrders, etc)
- Tailwind for styling (no CSS-in-JS libraries)
- GraphQL Code Generator for type safety
- Proper error boundaries and loading states
- Comprehensive TypeScript types

### Component Library
Build custom components inspired by shadcn/ui patterns:
- Button, Input, Select, Modal, Table
- Chart components with recharts
- Form handling with react-hook-form
- Toast notifications with sonner

### Backend Standards
- Schema-first GraphQL design
- Proper input validation
- Error handling with meaningful messages
- Authentication with JWT
- Rate limiting and security headers
- Database migrations for schema changes

---

## Next Steps

1. **Create feature branch**: `git checkout -b feature/orders-module`
2. **Implement Orders CRUD**: Start with list page, then detail page
3. **Add backend support**: Orders schema, resolvers, queries/mutations
4. **Test thoroughly**: Both frontend and backend
5. **Move to next priority**: Analytics dashboard

**Key Focus**: Build each feature from scratch using modern patterns, not copying code from old admin. Use this catalog as requirements specification, not implementation reference.
