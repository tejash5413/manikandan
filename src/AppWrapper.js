// src/AppWrapper.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./components/common/Header";
import AppRoutes from "./routes/AppRoutes";
import Footer from "./components/common/Footer";
import FloatingChatButton from "./components/common/FloatingChatButton";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import { getIdTokenResult, onAuthStateChanged } from "firebase/auth";
import { adminAuth as auth } from "./services/firebase";

const AppWrapper = () => {
    const location = useLocation(); // ✅ valid now
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const isDashboardPage =
        location.pathname.startsWith("/admin") || location.pathname.startsWith("/student");

    useEffect(() => {
        document.body.classList.toggle("dark-mode", isDarkMode);
    }, [isDarkMode]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const tokenResult = await getIdTokenResult(user, true);
                    const role = tokenResult.claims.role;
                    setIsAdmin(role === "admin");
                } catch (err) {
                    console.error("❌ Error fetching admin role:", err);
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className={isDarkMode ? "dark" : ""}>
            {!isDashboardPage && (
                <Header
                    isDarkMode={isDarkMode}
                    toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                    isAdmin={isAdmin}
                />
            )}
            <div className="d-flex flex-column min-vh-100">
                <main className="mt-4">
                    <AppRoutes isAdmin={isAdmin} />
                    <ToastContainer position="top-center" />
                </main>
                {!isDashboardPage && <Footer />}
            </div>
            <FloatingChatButton />
        </div>
    );
};

export default AppWrapper;
