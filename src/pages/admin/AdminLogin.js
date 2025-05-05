import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Lottie from 'lottie-react';
import adminLoginAnimation from '../../assets/adminLoginAnimation.json';

function AdminLogin() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const auth = getAuth();
    useEffect(() => {
        AOS.init({ duration: 1000 });

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate('/admin-dashboard');
            }
        });

        return () => unsubscribe(); // 👈 Important cleanup to prevent multiple triggers
    }, [auth, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
            toast.success("✅ Login Successful!");
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.removeItem('sessionToastShown'); // ✅ clear toast blocker

            // Navigate will be triggered by onAuthStateChanged
        } catch (error) {
            toast.error("❌ Invalid Credentials!");
            console.error("Login error:", error.message);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center align-items-center">
                {/* Animation */}
                <div className="col-12 col-md-6 text-center mb-4" data-aos="zoom-in">
                    <Lottie animationData={adminLoginAnimation} loop={true} style={{ height: 250 }} />
                </div>

                {/* Login Form */}
                <div className="col-lg-6 col-md-8" data-aos="fade-left">
                    <div className="card shadow-lg border-0 p-4 rounded-4">
                        <h3 className="text-center mb-4">
                            <i className="fas fa-user-shield me-2"></i>Admin Login
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={credentials.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="form-label">Password</label>
                                <div className="input-group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control"
                                        name="password"
                                        value={credentials.password}
                                        onChange={handleChange}
                                        placeholder="Enter password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary w-100">
                                <i className="fas fa-sign-in-alt me-2"></i>Login
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
