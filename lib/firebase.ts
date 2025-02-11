// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBPmn0VwTrLD2yHQsm35kmouMfyfBtL25s",
  authDomain: "ai-voice-ads-thing.firebaseapp.com",
  projectId: "ai-voice-ads-thing",
  storageBucket: "ai-voice-ads-thing.firebasestorage.app",
  messagingSenderId: "91871224346",
  appId: "1:91871224346:web:f1c540cd3619866dec67a3",
  measurementId: "G-ECCEZZ5VW6",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Only initialize analytics on the client side
let analytics = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, auth, db };
