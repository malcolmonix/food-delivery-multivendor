# MenuVerse API Documentation

This document serves as the official API and developer guide for building client applications that interact with the MenuVerse backend on Firebase.

## Backend Overview

The backend is built on **Firebase** and consists of two main services:

-   **Firebase Authentication**: Manages user accounts. While this vendor app uses email/password, your customer-facing app can use any Firebase provider (e.g., Google, Facebook, or Anonymous sign-in).
-   **Firestore**: A NoSQL database that stores all application data. It is the single source of truth for eatery profiles, menus, and orders.

Client applications do not interact with a traditional REST API. Instead, they use the Firebase Client SDKs (for Web, iOS, or Android) to interact directly and securely with Firestore. The structure of the database *is* the API.

The canonical source of truth for the database schema and data models is `docs/backend.json`.

---

## 1. Initial Setup

Before interacting with the API, you must initialize the Firebase SDK in your client-side project.

```javascript
// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// This should be stored securely, e.g., in environment variables
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ... other config values
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
```
**Note**: You can get your `firebaseConfig` object from the Firebase console project settings.

---

## 2. Authentication

Your customer app will need to authenticate users before they can place orders. For testing, you can use **Anonymous Authentication**.

```javascript
import { signInAnonymously } from "firebase/auth";

// Sign in the user anonymously
signInAnonymously(auth)
  .then((userCredential) => {
    const user = userCredential.user;
    console.log("Signed in anonymously with UID:", user.uid);
  })
  .catch((error) => {
    console.error("Anonymous sign-in failed:", error);
  });
```

---

## 3. API Resources & Endpoints

The following sections detail the available data resources and how to interact with them. The "endpoints" are Firestore collection or document paths.

### Resource: `Eatery`

An `Eatery` represents a single restaurant's public profile.

#### Data Model

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "logoUrl": "string (uri)",
  "bannerUrl": "string (uri)",
  "contactEmail": "string (email)"
}
```

#### GET Eatery Profile

Fetch the public profile for a single eatery.

-   **Method**: `getDoc`
-   **Path**: `/eateries/{eateryId}`

```javascript
import { doc, getDoc } from "firebase/firestore";

async function getEateryProfile(eateryId) {
  const eateryRef = doc(db, "eateries", eateryId);
  const docSnap = await getDoc(eateryRef);

  if (docSnap.exists()) {
    console.log("Eatery data:", docSnap.data());
    return docSnap.data();
  } else {
    console.error("No such eatery!");
    return null;
  }
}
```

---

### Resource: `MenuItem`

A `MenuItem` represents a single item on an eatery's menu.

#### Data Model

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": "number",
  "category": "string (Enum: 'Appetizer', 'Main Course', 'Dessert', 'Beverage')",
  "imageUrl": "string (uri)",
  "eateryId": "string"
}
```

#### LIST Menu Items

Fetch all menu items for a specific eatery.

-   **Method**: `getDocs`
-   **Path**: `/eateries/{eateryId}/menu_items`

```javascript
import { collection, query, getDocs } from "firebase/firestore";

async function getMenu(eateryId) {
  const menuItems = [];
  const q = query(collection(db, "eateries", eateryId, "menu_items"));

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    menuItems.push({ id: doc.id, ...doc.data() });
  });

  console.log("Menu Items:", menuItems);
  return menuItems;
}
```
---

### Resource: `Order`

An `Order` represents a customer's order from an eatery. Creating a document in this collection is how a customer places an order.

#### Data Model

```json
{
  "eateryId": "string",
  "customer": {
    "name": "string",
    "email": "string",
    "address": "string"
  },
  "items": [
    {
      "id": "string",
      "name": "string",
      "quantity": "number",
      "price": "number"
    }
  ],
  "totalAmount": "number",
  "status": "string (Default: 'Pending')",
  "createdAt": "Timestamp"
}
```

#### CREATE an Order

Place a new order for an eatery.

-   **Method**: `addDoc`
-   **Path**: `/eateries/{eateryId}/orders`

```javascript
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

async function placeOrder(eateryId, orderData) {
  try {
    const ordersRef = collection(db, "eateries", eateryId, "orders");
    
    // The data for the new order document
    const newOrder = {
      ...orderData,
      status: "Pending", // Initial status
      createdAt: serverTimestamp(), // Use server timestamp for reliability
    };

    const docRef = await addDoc(ordersRef, newOrder);
    console.log("Order placed with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    return null;
  }
}

// Example usage:
/*
const eateryId = "the_vendor_user_id";

const order = {
  eateryId: eateryId,
  customer: {
    name: "John Customer",
    email: "john.customer@example.com",
    address: "456 Oak Avenue, Springfield, USA"
  },
  items: [
    { id: "menu_item_id_1", name: "Classic Burger", quantity: 1, price: 12.99 },
    { id: "menu_item_id_2", name: "Fries", quantity: 1, price: 4.50 }
  ],
  totalAmount: 17.49,
};

placeOrder(eateryId, order);
*/
```

---

## 4. Integration Notes for Enatega MultiVendor

### Authentication Strategy
- Use Firebase Anonymous Auth for guest users
- Optionally integrate with existing Enatega user authentication
- Consider implementing user migration between anonymous and authenticated states

### Data Mapping
- Map MenuVerse `Eatery` to Enatega `Restaurant` model
- Map MenuVerse `MenuItem` to Enatega `Food` model  
- Map MenuVerse `Order` to Enatega order flow

### Implementation Plan
1. Create separate Firebase config for MenuVerse connection
2. Build data service layer for MenuVerse operations
3. Update existing components to use MenuVerse data
4. Implement order placement flow
5. Add error handling and offline support

### Environment Configuration
```env
# MenuVerse Firebase Config
NEXT_PUBLIC_MENUVERSE_API_KEY=your_api_key
NEXT_PUBLIC_MENUVERSE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_MENUVERSE_PROJECT_ID=your_project_id
NEXT_PUBLIC_MENUVERSE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_MENUVERSE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_MENUVERSE_APP_ID=1:123456789:web:abcdef
```