import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database, ref, push, set, onValue, serverTimestamp, onDisconnect, Unsubscribe } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAfX9xEEoJrkLDGU0DDSxmmBwELCffEHU4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "multiuserchatapp-953e6.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://multiuserchatapp-953e6-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "multiuserchatapp-953e6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "multiuserchatapp-953e6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "631023246649",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:631023246649:web:988a7d00dc254563ee1ce8",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-VC035DYMNV"
};

let app: FirebaseApp;
let database: Database;

export const initializeFirebase = async (): Promise<void> => {
  try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    throw error;
  }
};

export const getFirebaseDatabase = (): Database => {
  if (!database) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return database;
};

export {
  ref,
  push,
  set,
  onValue,
  serverTimestamp,
  onDisconnect,
  type Unsubscribe
};
