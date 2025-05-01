import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';
import loginAnimation from '../../assets/studentLoginAnimation.json'; // ✅ Replace with your path
import 'aos/dist/aos.css';

function StudentLogin() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ rollno: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const studentRollNumbers = Array.from({ length: 501 }, (_, i) => (6000 + i).toString());

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { rollno, password } = credentials;

        if (studentRollNumbers.includes(rollno) && password === "Student@123") {
            localStorage.setItem('studentRollno', rollno);
            toast.success("✅ Login Successful!");
            setTimeout(() => navigate('/student-dashboard'), 1500);
        } else {
            toast.error("❌ Invalid Roll No or Password!");
        }
    };

    return (
        <div className="container py-5">
            <div className="row align-items-center justify-content-center">

                {/* Lottie Animation Section */}
                <div className="col-12 col-md-6 text-center mb-4" data-aos="zoom-in">
                    <Lottie animationData={loginAnimation} loop={true} style={{ height: 250 }} />
                </div>

                {/* Login Form */}
                <div className="col-md-6" data-aos="fade-up">
                    <div className="card shadow p-4 rounded-4">
                        <h2 className="text-center  mb-4">
                            <i className="fas fa-user-graduate me-2 "></i> Student Login
                        </h2>                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Roll Number</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="rollno"
                                    value={credentials.rollno}
                                    onChange={handleChange}
                                    placeholder="Enter your Roll Number"
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

                            <div className="text-center">
                                <button type="submit" className="btn btn-primary w-100">
                                    <i className="bi bi-box-arrow-in-right me-2"></i> Login
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentLogin;
