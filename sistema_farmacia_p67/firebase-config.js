import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2c8yE3pA-5s8SMw_asUU4V3YOwOVq7f4",
  authDomain: "farmacia-sistema-36f6b.firebaseapp.com",
  projectId: "farmacia-sistema-36f6b",
  storageBucket: "farmacia-sistema-36f6b.firebasestorage.app",
  messagingSenderId: "1081937290065",
  appId: "1:1081937290065:web:7fbb65c3560c3524352970"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);