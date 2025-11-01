import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// MenuVerse Firebase configuration (same as used in multivendor-web)
const firebaseConfig = {
  apiKey: "AIzaSyBHH9iZK9a1x9Gs8LKwGK6IpOLxWqGvLaY",
  authDomain: "chopchop-67750.firebaseapp.com",
  projectId: "chopchop-67750",
  storageBucket: "chopchop-67750.firebasestorage.app",
  messagingSenderId: "925058923880",
  appId: "1:925058923880:web:bc2f18a48a8e01b1f2b8e5"
};

let adminApp: FirebaseApp;
let adminAuth: Auth;
let adminFirestore: Firestore;
let adminStorage: FirebaseStorage;

export function getMenuverseApp(): FirebaseApp {
  if (!adminApp) {
    // Check if app already exists to avoid duplicate initialization
    const existingApps = getApps();
    const existingApp = existingApps.find(app => app.name === 'menuverse-admin');
    
    if (existingApp) {
      adminApp = existingApp;
    } else {
      adminApp = initializeApp(firebaseConfig, 'menuverse-admin');
    }
  }
  return adminApp;
}

export function getMenuverseAuth(): Auth {
  if (!adminAuth) {
    adminAuth = getAuth(getMenuverseApp());
  }
  return adminAuth;
}

export function getMenuverseFirestore(): Firestore {
  if (!adminFirestore) {
    adminFirestore = getFirestore(getMenuverseApp());
  }
  return adminFirestore;
}

export function getMenuverseStorage(): FirebaseStorage {
  if (!adminStorage) {
    adminStorage = getStorage(getMenuverseApp());
  }
  return adminStorage;
}

// Helper function to ensure admin authentication with enhanced security
export async function ensureAdminAuth(): Promise<boolean> {
  try {
    // Import adminAuthService dynamically to avoid circular dependency
    const { adminAuthService } = await import('../services/admin-auth.service');
    const currentUser = await adminAuthService.getCurrentUser();
    
    if (!currentUser) {
      console.warn('No authenticated admin user found');
      return false;
    }

    if (!currentUser.isActive) {
      console.warn('Admin account is deactivated');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Admin authentication check failed:', error);
    
    // Fallback to basic Firebase auth check for development
    const auth = getMenuverseAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return false;
    }
    
    // Basic admin email check as fallback
    const adminEmails = [
      'admin@chopchop.com',
      'manager@chopchop.com',
      'admin@enatega.com'
    ];
    
    return adminEmails.includes(user.email || '');
  }
}

/**
 * Check if current admin has specific permission
 */
export async function hasAdminPermission(permission: string): Promise<boolean> {
  try {
    const { adminAuthService } = await import('../services/admin-auth.service');
    return adminAuthService.hasPermission(permission as any);
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}

/**
 * Check if current admin can access specific restaurant
 */
export async function canAccessRestaurant(restaurantId: string): Promise<boolean> {
  try {
    const { adminAuthService } = await import('../services/admin-auth.service');
    return adminAuthService.canAccessRestaurant(restaurantId);
  } catch (error) {
    console.error('Restaurant access check failed:', error);
    return false;
  }
}

/**
 * Get current admin user
 */
export async function getCurrentAdmin() {
  try {
    const { adminAuthService } = await import('../services/admin-auth.service');
    return await adminAuthService.getCurrentUser();
  } catch (error) {
    console.error('Get current admin failed:', error);
    return null;
  }
}

export default {
  getMenuverseApp,
  getMenuverseAuth,
  getMenuverseFirestore,
  getMenuverseStorage,
  ensureAdminAuth,
  hasAdminPermission,
  canAccessRestaurant,
  getCurrentAdmin
};