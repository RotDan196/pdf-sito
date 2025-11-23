// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
    apiKey: "AIzaSyAqi_KctTQ9efZiso7HLCmfuNpAcfu_AMg",
    authDomain: "pdf-pro-app-c4642.firebaseapp.com",
    projectId: "pdf-pro-app-c4642",
    storageBucket: "pdf-pro-app-c4642.firebasestorage.app",
    messagingSenderId: "467858095074",
    appId: "1:467858095074:web:30eee013fe7c79949757bb",
    measurementId: "G-C6PJ1KSNTR"
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