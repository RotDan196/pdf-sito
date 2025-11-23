import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configurazione (prende i dati dal file .env o usa i tuoi codici se non usi .env)
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Funzione Login Intelligente (Popup su PC, Redirect su iPhone)
export const loginWithGoogle = async () => {
    try {
        // 1. Prova prima col Popup (più comodo su Desktop)
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        // 2. Se è bloccato (errore tipico di iPhone/Safari), usa il Redirect
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
            console.log("Popup bloccato, passo al Redirect...");
            await signInWithRedirect(auth, googleProvider);
        } else {
            console.error("Errore Login:", error);
            alert("Errore accesso: " + error.message);
        }
    }
};

export const logout = () => signOut(auth);

export { auth, db };