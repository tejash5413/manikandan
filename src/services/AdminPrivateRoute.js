// src/services/AdminPrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminPrivateRoute = ({ children }) => {
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn');

    if (!isAdminLoggedIn) {
        toast.error("Session expired. Please log in as admin.");
        return <Navigate to="/admin-login" replace />;
    }

    return children;
};

export default AdminPrivateRoute;
