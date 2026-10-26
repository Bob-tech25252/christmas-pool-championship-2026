// Firebase browser-module setup for GitHub Pages.
// The Firebase web config is intended to be included in client code.
// Access control is enforced by Firebase Authentication and Firestore Rules.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAB99FYFMRT1BwcXACRwtDZOmcYe3N8Amo",
  authDomain: "christmas-project-c17bd.firebaseapp.com",
  projectId: "christmas-project-c17bd",
  storageBucket: "christmas-project-c17bd.firebasestorage.app",
  messagingSenderId: "713376208643",
  appId: "1:713376208643:web:d7a4f097780241a7afbb36",
  measurementId: "G-SF905CEVBD"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const tournamentRefPath = ["tournaments", "christmas-2026"];
