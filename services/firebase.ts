// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDB2M4dToEYBnMRMER-ISh0QXDaAhrm4IE",
  authDomain: "private-chat-f2353.firebaseapp.com",
  projectId: "private-chat-f2353",
  storageBucket: "private-chat-f2353.firebasestorage.app",
  messagingSenderId: "641691329780",
  appId: "1:641691329780:web:2260a67426e940c697eaa1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);