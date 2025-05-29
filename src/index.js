import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';     // Bootstrap main CSS
import 'bootstrap-icons/font/bootstrap-icons.css'; // Bootstrap icons
import '@fortawesome/fontawesome-free/css/all.min.css'; // FontAwesome icons
import 'react-toastify/dist/ReactToastify.css';    // Toastify (for later notifications)
import './assets/styles/main.css';                // Your custom CSS (even if empty now)
import 'aos/dist/aos.css';
import AOS from 'aos';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

AOS.init();
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
