// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Ako koristiš autentifikaciju

const firebaseConfig = {
    apiKey: "AIzaSyC6YEOl3NqGh-E1UMGxzl_Z5hvPRMG66VE",
    authDomain: "chat1-d75f2.firebaseapp.com",
    projectId: "chat1-d75f2",
    storageBucket: "chat1-d75f2.appspot.com",
    messagingSenderId: "149222948906",
    appId: "1:149222948906:web:3ba26ed7b33bb6489f4353"
  };  

// Inicijalizacija Firebase-a
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);  // Ako koristiš autentifikaciju

export { db, auth };
