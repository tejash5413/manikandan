import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { toast } from 'react-toastify';
import { FaUserGraduate, FaIdCard, FaChalkboardTeacher, FaCalendarAlt, FaSignOutAlt, FaTasks, FaChartLine, FaRegFileAlt, FaClipboardCheck } from 'react-icons/fa';
import { doc } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';

import { getAuth } from 'firebase/auth';
import { db } from '../../services/firebase';
function StudentDashboard() {
    const navigate = useNavigate();
    const [rollno, setRollno] = useState('');
    const [name, setName] = useState('');
    const [studentClass, setStudentClass] = useState('');
    const [batch, setBatch] = useState('');


    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const studentRef = doc(db, 'students', user.uid);

            // 🔄 Listen for real-time updates
            const unsubscribe = onSnapshot(studentRef, (snap) => {
                if (snap.exists()) {
                    const data = snap.data();
                    setName(data.name || '');
                    setRollno(data.rollno || '');
                    setStudentClass(data.class || '');
                    setBatch(data.batch || '');
                }
            });

            // 🧹 Cleanup listener on unmount
            return () => unsubscribe();
        }
    }, []);



    const handleLogout = () => {
        toast.info("Logged Out Successfully!");
        localStorage.removeItem('studentRollno');
        setTimeout(() => navigate('/student-login'), 1000);
    };

    return (
        <div className="container py-5">
            <h2 className="text-center text-gradient mb-4 fw-bold" data-aos="fade-down">
                <span className="text-primary">Welcome to Your</span> <span className="text-success">Student Dashboard</span>
            </h2>

            <div className="card mb-5 shadow border-0" data-aos="zoom-in" style={{

                borderRadius: "20px",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)"
            }}>
                <div className="card-body text-center py-4 px-3">
                    <img src="/logo.png" alt="Academy Logo" className="mb-3 rounded-circle border border-dark" style={{ width: 80, height: 80 }} />

                    <h3 className="fw-bold  mb-1">
                        <FaUserGraduate className="me-2" />
                        {name || 'Student'}
                    </h3>

                    <p className="mb-2 ">
                        <FaIdCard className="me-2" />
                        <strong>Roll No:</strong> {rollno}
                    </p>

                    <p className="mb-2 ">
                        <FaChalkboardTeacher className="me-2" />
                        <strong>Class:</strong> {studentClass} &nbsp; | &nbsp;
                        <FaCalendarAlt className="me-2" />
                        <strong>Batch:</strong> {batch}
                    </p>

                    <p className=" fst-italic mt-3">
                        💡 Stay consistent. Your hard work will pay off!
                    </p>
                </div>
            </div>


            {/* Quick Access Buttons */}
            <div className="row g-4 text-center" data-aos="fade-up">
                <div className="col-md-3 col-6">
                    <div className="card border-primary shadow h-100" onClick={() => navigate('/student-dashboard/assignments')} role="button">
                        <div className="card-body">
                            <FaTasks className="display-6 text-primary mb-2" />
                            <h6 className="fw-bold">View Assignments</h6>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card border-info shadow h-100" onClick={() => navigate('/student-dashboard/progress-card')} role="button">
                        <div className="card-body">
                            <FaRegFileAlt className="display-6 text-info mb-2" />
                            <h6 className="fw-bold">Progress Card</h6>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card border-warning shadow h-100" onClick={() => navigate('/student-dashboard/examinations')} role="button">
                        <div className="card-body">
                            <FaClipboardCheck className="display-6 text-warning mb-2" />
                            <h6 className="fw-bold">Examinations</h6>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card border-success shadow h-100" onClick={() => navigate('/student-dashboard/exam-results')} role="button">
                        <div className="card-body">
                            <FaChartLine className="display-6 text-success mb-2" />
                            <h6 className="fw-bold"> Offline Exam Results</h6>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card border-primary shadow h-100" onClick={() => navigate('/student-dashboard/online-exam-results')} role="button">
                        <div className="card-body">
                            <FaChartLine className="display-6 text-primary mb-2" />
                            <h6 className="fw-bold">Online Exam Results</h6>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card border-danger shadow h-100" onClick={handleLogout} role="button">
                        <div className="card-body">
                            <FaSignOutAlt className="display-6 text-danger mb-2" />
                            <h6 className="fw-bold">Logout</h6>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentDashboard;
