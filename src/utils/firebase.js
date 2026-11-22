// src/utils/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDs3L4Y9yurz86Q5Zj_eBJSSlzgyswXkwg",
  authDomain: "asc-diplo.firebaseapp.com",
  projectId: "asc-diplo",
  storageBucket: "asc-diplo.firebasestorage.app",
  messagingSenderId: "922586395889",
  appId: "1:922586395889:web:dc9114e17e8d024e832550",
  measurementId: "G-ZJCM16Y37S"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
