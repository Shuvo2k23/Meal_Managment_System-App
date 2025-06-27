// Import the functions you need from the SDKs you need
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyA_VdLSngU7Kb0qA3yIWHgwqp6udl78UwU",
  authDomain: "meal-management-system-3e2e2.firebaseapp.com",
  projectId: "meal-management-system-3e2e2",
  storageBucket: "meal-management-system-3e2e2.firebasestorage.app",
  messagingSenderId: "960259974154",
  appId: "1:960259974154:web:c695808b406fcb0ac46bf3",
  measurementId: "G-2LLDCXV28S"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Firebase
 

 const db = getDatabase(app, "https://meal-management-system-3e2e2-default-rtdb.asia-southeast1.firebasedatabase.app");

export { auth, db };

