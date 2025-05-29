import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';
import loginAnimation from '../../assets/studentLoginAnimation.json';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { studentAuth as auth, studentDb as db } from '../../services/firebase'; // ✅ student app instance
import 'aos/dist/aos.css';

function StudentLogin() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ rollno: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { rollno, password } = credentials;

        // 🔢 Validate Roll Number
        if (!/^[6-9]\d{3}$/.test(rollno)) {
            toast.error("❌ Invalid Roll Number format (e.g., 6001–9999)");
            return;
        }

        try {
            // 🔍 Fetch email from 'students_list' using roll number
            const studentRef = doc(db, 'students_list', rollno);
            const studentSnap = await getDoc(studentRef);

            if (!studentSnap.exists()) {
                toast.error("❌ Roll Number not found");
                return;
            }

            const studentData = studentSnap.data();
            const email = studentData.email?.trim();

            if (!email || !email.includes('@')) {
                toast.error("❌ Email not found for this roll number");
                return;
            }

            // 🔐 Login using email and password
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            const uid = userCred.user.uid;

            // 📄 Get full student profile from 'students'
            const profileRef = doc(db, 'students', uid);
            const profileSnap = await getDoc(profileRef);

            if (!profileSnap.exists()) {
                toast.error("❌ Student profile not found.");
                return;
            }

            const profileData = profileSnap.data();

            // 💾 Store in localStorage
            localStorage.setItem('studentUID', uid);
            localStorage.setItem('studentRollno', profileData.rollno);
            localStorage.setItem('studentClass', profileData.class);

            toast.success("✅ Login Successful!");
            navigate('/student-dashboard');
        } catch (err) {
            console.error(err);
            toast.error("❌ Login failed. Please check your Roll Number and Password.");
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
                        <h2 className="text-center mb-4">
                            <i className="fas fa-user-graduate me-2"></i> Student Login
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Roll Number</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="rollno"
                                    value={credentials.rollno}
                                    onChange={(e) => setCredentials({ ...credentials, rollno: e.target.value })} placeholder="Enter your Roll Number"
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
                                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
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
