import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { toast } from 'react-toastify';
import {
    FaUserGraduate, FaIdCard, FaChalkboardTeacher, FaCalendarAlt,
    FaSignOutAlt, FaTasks, FaChartLine, FaRegFileAlt, FaClipboardCheck
} from 'react-icons/fa';
import { getAuth } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

function StudentDashboard() {
    const navigate = useNavigate();
    const [student, setStudent] = useState({ name: '', rollno: '', class: '', batch: '' });

    useEffect(() => {
        AOS.init({ duration: 1000 });

        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const studentRef = doc(db, 'students', user.uid);
            const unsubscribe = onSnapshot(studentRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setStudent({
                        name: data.name || '',
                        rollno: data.rollno || '',
                        class: data.class || '',
                        batch: data.batch || ''
                    });
                    localStorage.setItem('studentRollno', data.rollno);
                    localStorage.setItem('studentClass', data.class);
                }
            });

            return () => unsubscribe();
        } else {
            toast.error("Please log in again.");
            navigate('/student-login');
        }
    }, [navigate]);

    const handleLogout = () => {
        toast.info("Logged Out Successfully!");
        localStorage.removeItem('studentRollno');
        localStorage.removeItem('studentClass');
        setTimeout(() => navigate('/student-login'), 1000);
    };

    return (
        <div className="container py-5 mt-5">
            <h2 className="text-center text-gradient mb-4 fw-bold" data-aos="fade-down">
                <span className="text-primary">Welcome to Your</span> <span className="text-success">Student Dashboard</span>
            </h2>

            <div className="card mb-5 shadow border-0" data-aos="zoom-in" style={{ borderRadius: '20px' }}>
                <div className="card-body text-center py-4 px-3">
                    <img src="/logo.png" alt="Logo" className="mb-3 rounded-circle border border-dark" style={{ width: 80, height: 80 }} />
                    <h3 className="fw-bold mb-1"><FaUserGraduate className="me-2" />{student.name}</h3>
                    <p className="mb-1"><FaIdCard className="me-2" /><strong>Roll No:</strong> {student.rollno}</p>
                    <p><FaChalkboardTeacher className="me-2" /><strong>Class:</strong> {student.class} &nbsp; | &nbsp;
                        <FaCalendarAlt className="me-2" /><strong>Batch:</strong> {student.batch}</p>
                    <p className="fst-italic mt-3">💡 Stay consistent. Your hard work will pay off!</p>
                </div>
            </div>

            <div className="row g-4 text-center" data-aos="fade-up">
                {[
                    { icon: <FaTasks className="display-6 text-primary mb-2" />, label: 'Assignments', path: '/student-dashboard/assignments' },
                    { icon: <FaRegFileAlt className="display-6 text-info mb-2" />, label: 'Progress Card', path: '/student-dashboard/progress-card' },
                    { icon: <FaClipboardCheck className="display-6 text-warning mb-2" />, label: 'Examinations', path: '/student-dashboard/examinations' },
                    { icon: <FaChartLine className="display-6 text-success mb-2" />, label: 'Offline Results', path: '/student-dashboard/exam-results' },
                    { icon: <FaChartLine className="display-6 text-primary mb-2" />, label: 'Online Results', path: '/student-dashboard/online-exam-results' },
                    { icon: <FaSignOutAlt className="display-6 text-danger mb-2" />, label: 'Logout', onClick: handleLogout }
                ].map((btn, i) => (
                    <div className="col-md-4 col-6" key={i}>
                        <div className="card border shadow h-100" onClick={() => btn.path ? navigate(btn.path) : btn.onClick()} role="button">
                            <div className="card-body">
                                {btn.icon}
                                <h6 className="fw-bold">{btn.label}</h6>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default StudentDashboard;
