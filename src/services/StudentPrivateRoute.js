import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { studentAuth as auth, studentDb as db } from './firebase'; // ✅ correct
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

const StudentPrivateRoute = ({ children }) => {
    const [authorized, setAuthorized] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                toast.error("Session expired. Please login as student.");
                setAuthorized(false);
                return;
            }

            try {
                const docRef = doc(db, 'students', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists() && docSnap.data().role === "student") {
                    setAuthorized(true);
                } else {
                    toast.error("Access denied. Student only area.");
                    setAuthorized(false);
                }
            } catch (err) {
                console.error("Error verifying student:", err);
                toast.error("Authentication check failed.");
                setAuthorized(false);
            }
        });

        return () => unsubscribe(); // ✅ properly unsubscribe on unmount
    }, []);


    if (authorized === null) return <div className="text-center mt-5">🔒 Verifying Student Access...</div>;

    return authorized ? children : <Navigate to="/student-login" replace />;
};

export default StudentPrivateRoute;
