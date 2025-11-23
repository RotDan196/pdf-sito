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
        // 1. PROVIAMO IL LOGIN (Parte critica)
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // 2. PROVIAMO A SALVARE NEL DB (Parte opzionale)
        // Mettiamo un try/catch interno così se fallisce il DB, il login resta valido!
        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    name: user.displayName,
                    email: user.email,
                    joinedAt: new Date(),
                    filesProcessed: 0,
                    isPremium: false
                });
            }
        } catch (dbError) {
            // Se il database fallisce (es. permessi), lo scriviamo in console ma NON fermiamo l'utente
            console.error("Login riuscito, ma impossibile salvare nel DB (Controlla le regole Firestore):", dbError);
        }

        // 3. RITORNIAMO L'UTENTE (Successo!)
        return user;

    } catch (error) {
        // Questo scatta solo se fallisce proprio il LOGIN (es. chiudi il popup)
        console.error("Errore critico Login:", error);
        // Non mostriamo alert se l'utente ha semplicemente chiuso la finestra
        if (error.code !== 'auth/popup-closed-by-user') {
            alert("Impossibile accedere: " + error.message);
        }
    }
};

export const logout = () => signOut(auth);
export { auth, db };