import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0616047831",
  appId: "1:814202677309:web:affcccf8183e42851da254",
  apiKey: "AIzaSyDJKeBz6rY3daVH1uQMyZzG_U36Ja-vRnM",
  authDomain: "gen-lang-client-0616047831.firebaseapp.com",
  storageBucket: "gen-lang-client-0616047831.firebasestorage.app",
  messagingSenderId: "814202677309"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the specific database ID from the applet configuration
export const db = initializeFirestore(app, {}, "ai-studio-f91f68c6-5351-4b49-87a8-b35bed49034a");
