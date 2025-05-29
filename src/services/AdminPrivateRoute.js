import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { adminAuth as auth } from './firebase'; // ✅ Use the admin app's auth instance
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';

const AdminPrivateRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
                localStorage.removeItem('sessionToastShown');
            } else {
                if (!localStorage.getItem('sessionToastShown')) {
                    toast.error('Session expired. Please log in as admin.');
                    localStorage.setItem('sessionToastShown', 'true'); // prevent repeat toasts
                }
                setIsAuthenticated(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="text-center mt-5">🔐 Checking admin access...</div>; // Optionally replace with spinner
    }

    return isAuthenticated ? children : <Navigate to="/admin-login" replace />;
};

export default AdminPrivateRoute;
