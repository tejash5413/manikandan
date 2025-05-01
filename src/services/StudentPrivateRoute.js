// src/services/StudentPrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const StudentPrivateRoute = ({ children }) => {
    const rollno = localStorage.getItem("studentRollno");

    if (!rollno) {
        toast.error("Session expired. Please log in as student.");
        return <Navigate to="/student-login" replace />;
    }

    return children;
};

export default StudentPrivateRoute;
