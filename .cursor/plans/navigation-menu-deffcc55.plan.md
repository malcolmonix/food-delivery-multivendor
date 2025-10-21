<!-- deffcc55-ed8f-4324-a7cc-8ed684aa3183 a65e5347-bfa5-4e1a-99d5-cc5a13c98e16 -->
# Navigation Menu Implementation Plan

## Overview

Implement the complete navigation structure from enatega-multivendor-admin into multivendor-admin with improved organization, supporting multiple user roles (Super Admin, Vendor, Restaurant/Store Admin), sidebar + top bar layout, and full CRUD operations.

## Phase 1: Core Infrastructure & Layout Components

### 1.1 Copy Essential Context Providers

- Copy `lib/context/global/layout.context.tsx` for sidebar visibility state management
- Copy `lib/context/global/configuration.context.tsx` for app configuration
- Copy `lib/context/global/toast.context.tsx` for notifications
- Update `lib/context/global/user-context.tsx` to include role-based logic

### 1.2 Create Layout Structure

- Copy `lib/ui/layouts/protected/super-admin/index.tsx` as base layout
- Copy `lib/ui/layouts/protected/vendor/index.tsx` for vendor role
- Copy `lib/ui/layouts/protected/restaurant/index.tsx` for store admin role
- Update layouts to support sidebar + top bar (mixed approach)

### 1.3 Build Sidebar Component

- Copy `lib/ui/screen-components/protected/layout/super-admin-layout/side-bar/index.tsx`
- Copy `lib/ui/screen-components/protected/layout/super-admin-layout/side-bar/side-bar-item.tsx`
- Implement expandable/collapsible menu sections with animations
- Add icons from FontAwesome (already in dependencies)

### 1.4 Build Top Navigation Bar

- Copy `lib/ui/screen-components/protected/layout/super-admin-layout/app-bar/index.tsx`
- Include: logo, notifications bell, user profile menu, logout, language switcher
- Add hamburger menu for sidebar toggle

## Phase 2: Menu Structure Implementation

### 2.1 Define Menu Items Configuration

Create `lib/config/menu-items.ts` with improved organization:

**Home** (Dashboard route: `/dashboard`)

- Single page, not expandable

**General** (Icon: faCog)

- Vendors → `/general/vendors`
- Stores → `/general/stores`
- Riders → `/general/riders`
- Users → `/general/users`
- Staff → `/general/staff`

**Management** (Icon: faSliders)

- Configuration → `/management/configurations`
- Orders → `/management/orders`
- Coupons → `/management/coupons`
- Cuisine → `/management/cuisines`
- Shop Types → `/management/shop-types`
- Banners → `/management/banners`
- Tipping → `/management/tippings`
- Commission Rate → `/management/commission-rates`
- Notifications → `/management/notifications`
- Audit Logs → `/management/audit-logs`

**Wallet** (Icon: faWallet)

- Transaction History → `/wallet/transaction-history`
- Withdrawal Requests → `/wallet/withdraw-requests`
- Earnings → `/wallet/earnings`

**Customer Support** (Icon: faHeadset, route: `/customer-support`)

- Dedicated page with ticketing + chat interface

### 2.2 Copy Required Interfaces

- Copy `lib/utils/interfaces/panel-menu.interface.ts` (ISidebarMenuItem)
- Copy `lib/utils/interfaces/layout.interface.ts`
- Update imports in existing interfaces

### 2.3 Implement Role-Based Menu Access

- Copy `lib/hooks/useCheckAllowedRoutes.tsx` for permission-based filtering
- Define permissions in `lib/utils/constants/permissions.ts`
- Filter menu items based on user role

## Phase 3: Page Routes & CRUD Operations (Priority: Core Sections First)

### 3.1 Core Dashboard

- Create `app/(protected)/dashboard/page.tsx` 
- Stats cards, charts, recent activity overview

### 3.2 General Section Pages

For each (Vendors, Stores, Riders, Users, Staff):

- Create route: `app/(protected)/general/[entity]/page.tsx`
- Data table with search, filter, pagination (use PrimeReact DataTable)
- Create/Edit dialogs (PrimeReact Dialog)
- Delete confirmation
- Copy relevant screen components from `enatega-multivendor-admin/lib/ui/screen-components/protected/super-admin/`

### 3.3 Management Section Pages  

For each (Configuration, Orders, Coupons, Cuisine, Shop Types, Banners, Tipping, Commission Rates, Notifications, Audit Logs):

- Create route: `app/(protected)/management/[entity]/page.tsx`
- Full CRUD with forms (Formik + Yup validation)
- Copy table components and forms from enatega source

### 3.4 Wallet Section

- Transaction History: Read-only table with filters
- Withdrawal Requests: Approval workflow
- Earnings: Dashboard with charts

### 3.5 Customer Support

- Create `app/(protected)/customer-support/page.tsx`
- Ticket list with status filters
- Ticket detail view with chat interface
- Copy chat components from `lib/ui/useable-components/chat-message/`

## Phase 4: GraphQL Integration

### 4.1 Copy GraphQL Queries & Mutations

- Copy all from `enatega-multivendor-admin/lib/api/graphql/queries/`
- Copy all from `enatega-multivendor-admin/lib/api/graphql/mutations/`
- Copy subscriptions from `lib/api/graphql/subscription/`

### 4.2 Update Apollo Client Setup

- Copy `lib/hooks/useSetApollo.tsx`
- Configure in root layout with proper error handling
- Add subscription support (WebSocket)

### 4.3 Create Custom Hooks

- Copy `lib/hooks/useQueryQL.tsx` for queries
- Copy `lib/hooks/useLazyQueryQL.tsx` for lazy queries
- Copy `lib/hooks/useConfiguration.tsx`
- Copy `lib/hooks/useToast.tsx`

## Phase 5: UI Components & Forms

### 5.1 Copy Reusable Components

From `lib/ui/useable-components/`:

- custom-dialog, custom-dropdown, custom-input, custom-text-area-field
- custom-multi-select, custom-date-range, date-filter
- data-view (for tables), table components
- custom-skeletons (loading states)
- upload component (for images)
- confirm-delete-popup, notification

### 5.2 Copy Form Schemas

- Copy all from `lib/utils/schema/` (Yup validation schemas)

### 5.3 Copy Helper Methods

- Copy from `lib/utils/methods/`: currency, filter, date.sorter, image, error handling

## Phase 6: Authentication & Guards

### 6.1 Role-Based Guards

- Copy `lib/hoc/SUPER_ADMIN_GUARD.tsx`
- Copy `lib/hoc/VENDOR_GUARD.tsx`  
- Copy `lib/hoc/RESTAURANT_GUARD.tsx`
- Apply to route layouts in `app/(protected)/layout.tsx`

### 6.2 Update Authentication Pages

- Enhance `app/(auth)/authentication/login/page.tsx` with role detection
- Add OTP verification if needed
- Store user role in context

## Phase 7: Styling & Theming

### 7.1 Copy Global Styles

- Copy `app/(localized)/global.css` custom styles
- Add PrimeReact theme CSS imports
- Ensure Tailwind utilities work with PrimeReact

### 7.2 Copy Icons & Assets

- Copy `lib/utils/assets/svgs/` (logo, etc.)
- Copy `lib/config/icons/index.tsx`

## Phase 8: Testing & Polish

### 8.1 Update Scripts

- Add `dev:fast` script to package.json
- Update build configuration

### 8.2 Create Mock Data (for testing)

- Copy `lib/utils/dummy/` for development testing

### 8.3 Test All Routes

- Verify navigation works
- Test CRUD operations
- Verify role-based access
- Check responsive design

## Key Files to Reference

**Sidebar Implementation:**

```62:229:enatega-multivendor-admin/lib/ui/screen-components/protected/layout/super-admin-layout/side-bar/index.tsx
const navBarItems: ISidebarMenuItem[] = [
  { text: 'Home', route: '/home', icon: faHome, isParent: true, isClickable: true },
  { 
    text: 'General', 
    icon: faCog, 
    subMenu: [
      { text: 'Vendors', route: '/general/vendors' },
      { text: 'Stores', route: '/general/stores' },
      // ...
    ]
  },
  // Management, Wallet, Customer Support sections...
]
```

**Layout Structure:**

- Sidebar: 260px width when expanded, collapsible
- Top bar: Fixed with logo, search, notifications, profile
- Content area: Responsive width based on sidebar state

**Apollo Client Setup:**

Already partially in place, needs full integration with subscriptions

**PrimeReact Components Used:**

- DataTable, Dialog, Dropdown, InputText, Button, Menu, Skeleton, InputSwitch

### To-dos

- [ ] Copy and set up context providers (layout, configuration, toast)
- [ ] Create protected layout structure for different user roles
- [ ] Build sidebar component with expandable menu sections
- [ ] Build top navigation bar with logo, notifications, profile
- [ ] Define menu items configuration with proper routes and permissions
- [ ] Copy required interfaces for menu and layout
- [ ] Implement role-based access control and menu filtering
- [ ] Create main dashboard page with stats and charts
- [ ] Implement CRUD operations for General section (Vendors, Stores, Riders, Users, Staff)
- [ ] Implement CRUD operations for Management section (Configuration, Orders, Coupons, etc.)
- [ ] Create Wallet section pages (Transaction History, Withdrawal, Earnings)
- [ ] Build Customer Support page with ticketing and chat
- [ ] Copy all GraphQL queries, mutations, and subscriptions
- [ ] Configure Apollo Client with proper error handling and subscriptions
- [ ] Copy all reusable UI components from enatega-multivendor-admin
- [ ] Copy Yup validation schemas for forms
- [ ] Implement role-based authentication guards
- [ ] Copy global styles, PrimeReact theme, and assets
- [ ] Test all routes, CRUD operations, and responsive design