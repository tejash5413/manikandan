import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';
import loginAnimation from '../../assets/studentLoginAnimation.json';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
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

        if (!/^[6-9]\d{3}$/.test(rollno)) {
            toast.error("❌ Invalid Roll Number format (e.g., 6001–6500)");
            return;
        }

        const email = `${rollno}@student.com`;

        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            const uid = userCred.user.uid;

            const docRef = doc(db, 'students', uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                toast.error("❌ Student data not found.");
                return;
            }

            const student = docSnap.data();
            localStorage.setItem('studentUID', uid);
            localStorage.setItem('studentRollno', student.rollno);
            localStorage.setItem("studentClass", student.class); // ← do this at login

            toast.success("✅ Login Successful!");
            navigate('/student-dashboard');
        } catch (err) {
            console.error(err);
            toast.error("❌ Incorrect Roll No or Password");
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
