// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Funzione Login
export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Salviamo/Aggiorniamo l'utente nel Database in modo sicuro
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // Se è la prima volta, creiamo il profilo
            await setDoc(userRef, {
                name: user.displayName,
                email: user.email,
                joinedAt: new Date(),
                filesProcessed: 0, // Statistica
                isPremium: false
            });
        }
        return user;
    } catch (error) {
        console.error(error);
        alert("Errore durante il login");
    }
};

export const logout = () => signOut(auth);
export { auth, db };