import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
    apiKey: "AIzaSyB-B021nc5hQWZNK52iFIO91FXi_dmiTuc",
    authDomain: "manikandanacademy-bca66.firebaseapp.com",
    projectId: "manikandanacademy-bca66",
    storageBucket: "manikandanacademy-bca66.firebasestorage.app",
    messagingSenderId: "894451635811",
    appId: "1:894451635811:web:c27c0ed4bd9be728d08a56",
    measurementId: "G-YVE3KY67NK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
