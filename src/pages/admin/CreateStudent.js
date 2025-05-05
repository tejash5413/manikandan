import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNavigate } from 'react-router-dom';

const CreateStudent = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        rollno: '',
        name: '',
        password: 'Student@123',
        class: '',
        batch: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const email = `${form.rollno}@student.com`;

        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, form.password);
            const uid = userCred.user.uid;

            await setDoc(doc(db, 'students', uid), {
                rollno: form.rollno,
                name: form.name,
                class: form.class,
                batch: form.batch,
                role: 'student',
            });

            await setDoc(doc(db, 'students_list', form.rollno), {
                rollno: form.rollno,
                name: form.name,
                class: form.class,
                batch: form.batch,
                email,
                password: form.password
            });

            toast.success(`✅ Student ${form.rollno} created`);
            navigate('/admin-dashboard/students');
        } catch (err) {
            toast.error(`❌ ${err.message}`);
        }
    };


    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-lg rounded-4 border-0 p-4" data-aos="fade-up">
                        <div className="text-center mb-4">
                            <h3 className="text-primary fw-bold">
                                <i className="fas fa-user-plus me-2"></i>Create Student Login
                            </h3>
                            <p className="text-muted">Generate login credentials for a new student</p>
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
                                <small className="text-muted mt-1 d-block">Default: Student@123</small>
                            </div>

                            <div className="form-floating mb-3">
                                <input type="text" className="form-control" id="class" name="class" value={form.class} onChange={handleChange} />
                                <label htmlFor="class"><i className="fas fa-chalkboard me-2"></i>Class</label>
                            </div>

                            <div className="form-floating mb-4">
                                <input type="text" className="form-control" id="batch" name="batch" value={form.batch} onChange={handleChange} />
                                <label htmlFor="batch"><i className="fas fa-calendar-alt me-2"></i>Batch</label>
                            </div>

                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-success flex-fill rounded-pill">
                                    <i className="fas fa-user-plus me-2"></i>Create Student
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary flex-fill rounded-pill"
                                    onClick={() => navigate('/admin-dashboard')}
                                >
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
