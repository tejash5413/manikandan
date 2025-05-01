import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/common/Header';
import AppRoutes from './routes/AppRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './components/common/Footer';
import FloatingChatButton from './components/common/FloatingChatButton';
import './App.css'; // ✅ Add this for dark styles

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  return (
    <Router>
      <div className={isDarkMode ? 'dark' : ''}>
        <Header isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />
        <div className="d-flex flex-column min-vh-100">
          <main className="mt-4">
            <AppRoutes />
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
