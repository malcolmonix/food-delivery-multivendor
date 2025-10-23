import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function getFirebaseApp() {
  // Validate that all required config values are present
  if (!firebaseConfig.apiKey) {
    throw new Error('Firebase API key is missing. Check your NEXT_PUBLIC_FIREBASE_API_KEY environment variable.');
  }
  
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

export function getFirebaseAuth() {
  try {
    const app = getFirebaseApp();
    return getAuth(app);
  } catch (error) {
    console.error('Error initializing Firebase Auth:', error);
    throw error;
  }
}
