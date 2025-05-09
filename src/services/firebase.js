import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// 🔐 Shared Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyB-B021nc5hQWZNK52iFIO91FXi_dmiTuc",
    authDomain: "manikandanacademy-bca66.firebaseapp.com",
    projectId: "manikandanacademy-bca66",
    storageBucket: "manikandanacademy-bca66.appspot.com", // ✅ fixed typo: ".app" ➜ ".com"
    messagingSenderId: "894451635811",
    appId: "1:894451635811:web:c27c0ed4bd9be728d08a56",
    measurementId: "G-YVE3KY67NK"
};

// ✅ Student App (default)
export const studentApp = initializeApp(firebaseConfig);
export const studentAuth = getAuth(studentApp);
export const studentDb = getFirestore(studentApp);
export const studentStorage = getStorage(studentApp);

// ✅ Admin App (secondary)
export const adminApp = initializeApp(firebaseConfig, "admin");
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
