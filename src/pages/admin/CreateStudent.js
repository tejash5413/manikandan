import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { adminAuth as auth, adminDb as db } from '../../services/firebase'; // Use admin instance



const CreateStudent = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        rollno: '',
        name: '',
        password: 'Student@123',
        class: '',
        batch: '',
    });
    useEffect(() => {
        const checkAdminRole = async () => {
            const user = auth.currentUser;
            if (user) {
                const { claims } = await user.getIdTokenResult(true); // force refresh
                console.log("✅ Admin Role Claim:", claims.role);
                if (claims.role !== "admin") {
                    toast.error("🚫 You are not authorized to access this page.");
                    navigate("/admin-login");
                }
            }
        };

        checkAdminRole();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const email = `${form.rollno}@student.com`;

        try {
            // 🔁 Refresh token to ensure latest custom claims are available
            const currentUser = auth.currentUser;
            if (currentUser) {
                await currentUser.getIdToken(true); // Force refresh
            }

            // 1️⃣ Check if student with this roll number already exists in list
            const existing = await getDoc(doc(db, 'students_list', form.rollno));
            if (existing.exists()) {
                toast.error("❌ Roll number already exists!");
                return;
            }

            // 2️⃣ Check if email is already registered (optional optimization)
            // Note: This line alone may not help unless used with Admin SDK,
            // so we rely on Firebase error codes below

            // 3️⃣ Create student Auth user
            const userCred = await createUserWithEmailAndPassword(auth, email, form.password);
            const uid = userCred.user.uid;

            // 4️⃣ Add to students collection
            await setDoc(doc(db, 'students', uid), {
                rollno: form.rollno,
                name: form.name,
                class: form.class,
                batch: form.batch,
                role: 'student'
            });

            // 5️⃣ Add to students_list collection
            await setDoc(doc(db, 'students_list', form.rollno), {
                uid,
                rollno: form.rollno,
                name: form.name,
                class: form.class,
                batch: form.batch,
                email,
                password: form.password // stored for internal reference (optional)
            });

            toast.success(`✅ Student ${form.rollno} created`);
            navigate('/admin-dashboard/students');
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                toast.error("❌ Email already in use. Choose another roll number.");
            } else if (err.code === 'permission-denied') {
                toast.error("❌ You don't have permission to create student. Make sure your admin token is valid.");
            } else {
                toast.error(`❌ ${err.message}`);
                console.error("CreateStudent error:", err);
            }
        }
    };


    const classOptions = [
        ...Array.from({ length: 12 }, (_, i) => ({ value: `Class ${i + 1}`, label: `Class ${i + 1}` })),
        { value: "LT", label: "LT" },
        { value: "NEET Repeaters", label: "NEET Repeaters" },
        { value: "Crash Course", label: "Crash Course" },
        { value: "Integrated", label: "Integrated" },
    ];

    useEffect(() => {
        auth.currentUser?.getIdToken(true); // force refresh token (ensure latest custom claims)
    }, []);

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-lg rounded-4 border-0 p-4">
                        <div className="text-center mb-4">
                            <h3 className="text-primary fw-bold">
                                <i className="fas fa-user-plus me-2"></i>Create Student Login
                            </h3>
                            <p>Generate login credentials for a new student</p>
                        </div>

                        <form onSubmit={handleCreate}>
                            <div className="form-floating mb-3">
                                <input type="text" className="form-control" id="rollno" name="rollno" value={form.rollno} onChange={handleChange} required />
                                <label htmlFor="rollno"><i className="fas fa-id-badge me-2"></i>Roll Number</label>
                            </div>

                            <div className="form-floating mb-3">
                                <input type="text" className="form-control" id="name" name="name" value={form.name} onChange={handleChange} required />
                                <label htmlFor="name"><i className="fas fa-user me-2"></i>Name</label>
                            </div>

                            <div className="form-floating mb-3">
                                <input type="text" className="form-control" id="password" name="password" value={form.password} onChange={handleChange} />
                                <label htmlFor="password"><i className="fas fa-lock me-2"></i>Password</label>
                                <small className="d-block mt-1">Default: Student@123</small>
                            </div>

                            <div className="mb-3">
                                <label className="form-label"><i className="fas fa-chalkboard me-2"></i>Class</label>
                                <select className="form-select" name="class" value={form.class} onChange={handleChange} required>
                                    <option value="">Select Class</option>
                                    {classOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-floating mb-4">
                                <input type="text" className="form-control" id="batch" name="batch" value={form.batch} onChange={handleChange} />
                                <label htmlFor="batch"><i className="fas fa-calendar-alt me-2"></i>Batch</label>
                            </div>

                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-success flex-fill rounded-pill">
                                    <i className="fas fa-user-plus me-2"></i>Create Student
                                </button>
                                <button type="button" className="btn btn-outline-secondary flex-fill rounded-pill" onClick={() => navigate('/admin-dashboard')}>
                                    <i className="fas fa-times me-2"></i>Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateStudent;
