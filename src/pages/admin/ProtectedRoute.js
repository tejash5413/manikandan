// src/routes/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
            } else {
                if (!localStorage.getItem("sessionToastShown")) {
                    toast.error("Session expired. Please log in as admin.");
                    localStorage.setItem("sessionToastShown", "true");
                }
                setIsAuthenticated(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) return null;

    return isAuthenticated ? children : <Navigate to="/admin-login" replace />;
};

export default ProtectedRoute;
