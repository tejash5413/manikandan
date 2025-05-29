import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { adminAuth as auth, adminDb as db } from '../../services/firebase';

const CreateStudent = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        rollno: '',
        name: '',
        email: '',
        password: 'Student@123',
        class: '',
        batch: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const classOptions = [
        ...Array.from({ length: 12 }, (_, i) => ({ value: `Class ${i + 1}`, label: `Class ${i + 1}` })),
        { value: "LT", label: "LT" },
        { value: "NEET Repeaters", label: "NEET Repeaters" },
        { value: "Crash Course", label: "Crash Course" },
        { value: "Integrated", label: "Integrated" },
        { value: "Class 12th NEET", label: "Class 12th NEET" },
        { value: "Class 12th JEE", label: "Class 12th JEE" },
         { value: "Class 11th NEET", label: "Class 11th NEET" },
        { value: "Class 11th JEE", label: "Class 11th JEE" },
    ];

    const handleCreate = async (e) => {
        e.preventDefault();
        const email = form.email.trim();
        if (!email.includes('@')) {
            toast.warning("⚠️ Enter a valid email address.");
            return;
        }
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("No admin user logged in");

            const token = await currentUser.getIdTokenResult(true);
            if (token.claims.role !== "admin") {
                toast.error("❌ You are not an admin.");
                return;
            }

            const existing = await getDoc(doc(db, 'students_list', form.rollno));
            if (existing.exists()) {
                toast.error("❌ Roll number already exists!");
                return;
            }

            const userCred = await createUserWithEmailAndPassword(auth, email, form.password);
            const uid = userCred.user.uid;

            await auth.signOut();
            await signInWithEmailAndPassword(auth, "admin@manikandanacademy.com", "Admin@123");

            await new Promise((resolve) => {
                const unsubscribe = onAuthStateChanged(auth, async (user) => {
                    if (user) {
                        const refreshed = await user.getIdTokenResult(true);
                        if (refreshed.claims.role === 'admin') {
                            unsubscribe();
                            resolve();
                        }
                    }
                });
            });

            const studentData = {
                rollno: form.rollno,
                name: form.name,
                class: form.class,
                batch: form.batch,
                role: 'student',
                uid,
            };

            await setDoc(doc(db, 'students', uid), studentData);
            await setDoc(doc(db, 'students_list', form.rollno), {
                ...studentData,
                email,
                password: form.password,
            });

            toast.success(`✅ Student ${form.rollno} created`);
            navigate('/admin-dashboard/students');
        } catch (err) {
            console.error("CreateStudent error:", err);
            toast.error(`❌ ${err.message}`);
        }
    };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet);

            let created = 0, skipped = 0;

            for (let row of rows) {
                const { rollno, name, password = "Student@123", class: studentClass, batch } = row;
                const email = row.email?.trim() || `${rollno}@student.com`;

                if (!rollno || !name || !studentClass) {
                    toast.warn(`⚠️ Missing data for ${rollno || 'Unknown Roll No'}`);
                    skipped++;
                    continue;
                }

                try {
                    const existing = await getDoc(doc(db, 'students_list', rollno));
                    if (existing.exists()) { skipped++; continue; }

                    const userCred = await createUserWithEmailAndPassword(auth, email, password);
                    const uid = userCred.user.uid;

                    await auth.signOut();
                    await signInWithEmailAndPassword(auth, "admin@manikandanacademy.com", "Admin@123");

                    await new Promise((resolve) => {
                        const unsub = onAuthStateChanged(auth, async (user) => {
                            if (user) {
                                const token = await user.getIdTokenResult(true);
                                if (token.claims.role === "admin") {
                                    unsub();
                                    resolve();
                                }
                            }
                        });
                    });

                    const studentData = {
                        rollno, name, email,
                        class: studentClass,
                        batch,
                        role: 'student',
                        uid
                    };

                    await setDoc(doc(db, 'students', uid), studentData);
                    await setDoc(doc(db, 'students_list', rollno), {
                        ...studentData,
                        email,
                        password
                    });

                    created++;
                } catch (error) {
                    console.error("Bulk creation error:", error);
                    skipped++;
                }
            }

            toast.success(`✅ Created: ${created}, Skipped: ${skipped}`);
        };

        reader.readAsArrayBuffer(file);
    };

    useEffect(() => {
        auth.currentUser?.getIdToken(true);
    }, []);

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-10 col-lg-8">
                    <div className="card shadow-lg border-0 rounded-4 p-4">
                        <div className="text-center mb-4">
                            <h3 className="text-primary fw-bold">
                                <i className="fas fa-user-plus me-2"></i>Create Student Login
                            </h3>
                            <p className="text-muted small">Add new student or upload from Excel file</p>
                        </div>

                        <form onSubmit={handleCreate}>
                            <div className="form-floating mb-3">
                                <input type="text" className="form-control" name="rollno" value={form.rollno} onChange={handleChange} required />
                                <label><i className="fas fa-id-badge me-2"></i>Roll Number</label>
                            </div>

                            <div className="form-floating mb-3">
                                <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
                                <label><i className="fas fa-user me-2"></i>Student Name</label>
                            </div>
                            <div className="form-floating mb-3">
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                                <label><i className="fas fa-envelope me-2"></i>Email Address</label>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    <i className="fas fa-lock me-2 text-dark"></i>Password
                                </label>
                                <div className="input-group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Default: Student@123"
                                    />
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                    </button>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label"><i className="fas fa-chalkboard me-2"></i>Class</label>
                                <select className="form-select" name="class" value={form.class} onChange={handleChange} required>
                                    <option value="">Select Class</option>
                                    {classOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-floating mb-4">
                                <input type="text" className="form-control" name="batch" value={form.batch} onChange={handleChange} />
                                <label><i className="fas fa-calendar-alt me-2"></i>Batch</label>
                            </div>

                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-success rounded-pill flex-fill">
                                    <i className="fas fa-user-plus me-2"></i>Create Student
                                </button>
                                <button type="button" className="btn btn-outline-secondary rounded-pill flex-fill" onClick={() => navigate('/admin-dashboard')}>
                                    <i className="fas fa-arrow-left me-2"></i>Back
                                </button>
                            </div>

                            <hr className="my-4" />

                            <div className="mb-3">
                                <label className="form-label fw-bold"><i className="fas fa-file-excel me-2"></i>Bulk Upload via Excel/CSV</label>
                                <input type="file" className="form-control" accept=".xlsx,.csv" onChange={handleBulkUpload} />
                                <small className="text-muted">
                                    Required Columns: <code>rollno</code>, <code>name</code>, <code>class</code><br />
                                    Optional: <code>password</code>, <code>batch</code>,<code>email</code>
                                </small>
                            </div>
                            <a
                                href="/templates/student-upload-template.xlsx"
                                className="btn btn-sm btn-outline-primary rounded-pill"
                                download
                            >
                                <i className="fas fa-download me-2"></i>Download Template
                            </a>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateStudent;
