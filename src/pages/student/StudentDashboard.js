import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { toast } from 'react-toastify';

function StudentDashboard() {
    const navigate = useNavigate();
    const [rollno, setRollno] = useState('');

    useEffect(() => {
        AOS.init({ duration: 1000 });
        const storedRollno = localStorage.getItem("studentRollno");
        if (storedRollno) {
            setRollno(storedRollno);
        } else {
            toast.error("Session expired. Please log in again.");
            navigate('/student-login');
        }
    }, []);

    const handleLogout = () => {
        toast.info("Logged Out Successfully!");
        localStorage.removeItem('studentRollno');
        setTimeout(() => navigate('/student-login'), 1000);
    };

    return (
        <div className="container py-5">
            <h2 className="text-center text-primary mb-4" data-aos="fade-down">
                🎓 Student Dashboard
            </h2>

            {/* Welcome Card */}
            <div className="card shadow-sm mb-5" data-aos="zoom-in">
                <div className="card-body text-center">
                    <h4>Welcome, <span className="text-success">Roll No: {rollno}</span></h4>
                    <p >Stay consistent. Your hard work will pay off!</p>
                </div>
            </div>

            {/* Quick Access Buttons */}
            <div className="d-flex flex-wrap justify-content-center gap-3" data-aos="fade-up">
                <button
                    className="btn btn-outline-primary px-4 py-2"
                    onClick={() => navigate('/student-dashboard/assignments')}
                >
                    📚 View Assignments
                </button>
                <button
                    className="btn btn-outline-success px-4 py-2"
                    onClick={() => navigate('/student-dashboard/exam-results')}
                >
                    📊 View Exam Results
                </button>
                <button
                    className="btn btn-outline-danger px-4 py-2"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>
            </div>
        </div>
    );
}

export default StudentDashboard;
