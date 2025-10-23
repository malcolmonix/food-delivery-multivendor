import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// MenuVerse Firebase configuration
const menuverseConfig = {
  apiKey: process.env.NEXT_PUBLIC_MENUVERSE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_MENUVERSE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_MENUVERSE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_MENUVERSE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MENUVERSE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_MENUVERSE_APP_ID,
};

// Initialize MenuVerse Firebase app with a unique name
export function getMenuverseApp() {
  // Validate that all required config values are present
  if (!menuverseConfig.apiKey) {
    console.warn('MenuVerse API key is missing. Check your NEXT_PUBLIC_MENUVERSE_API_KEY environment variable.');
    return null;
  }
  
  try {
    // Check if MenuVerse app already exists
    const existingApp = getApps().find(app => app.name === 'menuverse');
    if (existingApp) {
      return existingApp;
    }
    
    // Initialize new MenuVerse app
    return initializeApp(menuverseConfig, 'menuverse');
  } catch (error) {
    console.error('Error initializing MenuVerse Firebase app:', error);
    return null;
  }
}

export function getMenuverseAuth() {
  try {
    const app = getMenuverseApp();
    if (!app) return null;
    
    return getAuth(app);
  } catch (error) {
    console.error('Error initializing MenuVerse Auth:', error);
    return null;
  }
}

export function getMenuverseFirestore() {
  try {
    const app = getMenuverseApp();
    if (!app) return null;
    
    return getFirestore(app);
  } catch (error) {
    console.error('Error initializing MenuVerse Firestore:', error);
    return null;
  }
}

// Helper function to ensure anonymous authentication for MenuVerse
export async function ensureMenuverseAuth() {
  try {
    const auth = getMenuverseAuth();
    if (!auth) {
      console.warn('MenuVerse auth not available, proceeding without authentication');
      return null;
    }
    
    // Check if already signed in
    if (auth.currentUser) {
      return auth.currentUser;
    }
    
    try {
      // Sign in anonymously
      const userCredential = await signInAnonymously(auth);
      console.log('Signed in to MenuVerse anonymously:', userCredential.user.uid);
      return userCredential.user;
    } catch (authError) {
      if (authError.code === 'auth/admin-restricted-operation') {
        console.warn('Anonymous authentication disabled. Enable it in Firebase Console: Authentication > Sign-in method > Anonymous');
        console.warn('Proceeding without authentication - some features may be limited');
        return null;
      }
      throw authError;
    }
  } catch (error) {
    console.error('MenuVerse authentication failed:', error);
    // Don't throw error for auth issues, allow app to continue
    return null;
  }
}