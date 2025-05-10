import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/common/Header';
import AppRoutes from './routes/AppRoutes';
import Footer from './components/common/Footer';
import FloatingChatButton from './components/common/FloatingChatButton';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'; // For dark mode styles

import { getIdTokenResult, onAuthStateChanged } from "firebase/auth";
import { adminAuth as auth } from './services/firebase'; // Admin auth instance

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // ✅ Admin role tracking

  // Dark mode toggle
  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  // Admin role detection
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const tokenResult = await getIdTokenResult(user, true); // 🔁 Refresh token
          const role = tokenResult.claims.role;
          console.log("✅ Admin Role:", role);
          setIsAdmin(role === 'admin'); // ✅ Track admin status
        } catch (err) {
          console.error("❌ Error fetching admin role:", err);
          setIsAdmin(false);
        }
      } else {
        console.log("❌ No admin logged in");
        setIsAdmin(false);
      }
    });

    return () => unsubscribe(); // cleanup
  }, []);

  return (
    <Router>
      <div className={isDarkMode ? 'dark' : ''}>
        <Header isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} isAdmin={isAdmin} />
        <div className="d-flex flex-column min-vh-100">
          <main className="mt-4">
            <AppRoutes isAdmin={isAdmin} /> {/* Pass admin state to routes */}
            <ToastContainer position="top-center" />
          </main>
          <Footer />
        </div>
        <FloatingChatButton />
      </div>
    </Router>
  );
}

export default App;
