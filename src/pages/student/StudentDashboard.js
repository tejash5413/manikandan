import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { toast } from 'react-toastify';
import {
    FaUserGraduate, FaIdCard, FaChalkboardTeacher, FaCalendarAlt,
    FaSignOutAlt, FaTasks, FaChartLine, FaRegFilePdf, FaClipboardCheck,
    FaBell, FaFileAlt, FaLaptopCode, FaCheckCircle,FaVideo 
} from 'react-icons/fa';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, doc, getDoc, onSnapshot } from "firebase/firestore";
import { studentDb as db } from '../../services/firebase';
import { studentAuth as auth } from '../../services/firebase';
import Lottie from 'lottie-react';
import loadingAnimation from "../../assets/loading.json";

function StudentDashboard() {
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [logoUrl, setLogoUrl] = useState("/logo.png");
    const [examStats, setExamStats] = useState({ percent: 0 });
    const [assignmentStats, setAssignmentStats] = useState({ completed: 0, total: 0 });
    const [attendanceStats, setAttendanceStats] = useState({ present: 0, total: 0 });
    const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const snap = await getDoc(doc(db, "settings", "siteConfig"));
                if (snap.exists() && snap.data().logoUrl) {
                    setLogoUrl(snap.data().logoUrl);
                }
            } catch (err) {
                console.warn("Fallback to default logo:", err);
            }
        };
        fetchLogo();
    }, []);

    useEffect(() => {
        AOS.init({ duration: 1000 });

        let unsubDoc = () => { };

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const tokenResult = await user.getIdTokenResult(true);
                    const role = tokenResult.claims.role || 'student';

                    const studentRef = doc(db, 'students', user.uid);
                    unsubDoc = onSnapshot(studentRef, (docSnap) => {
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            setStudent({
                                name: data.name || '',
                                rollno: data.rollno || '',
                                class: data.class || '',
                                batch: data.batch || '',
                                role
                            });
                            localStorage.setItem('studentRollno', data.rollno);
                            localStorage.setItem('studentClass', data.class);
                            localStorage.setItem('studentRole', role);
                            fetchPerformanceData(data.rollno, data.class, auth.currentUser.uid);

                            setLoading(false);
                        } else {
                            toast.error("❌ Student profile not found.");
                            navigate('/student-login');
                        }
                    });
                } catch (error) {
                    toast.error("⚠️ Failed to fetch student role.");
                    navigate('/student-login');
                }
            } else {
                toast.error("⚠️ Please log in again.");
                navigate('/student-login');
            }
        });

        return () => {
            unsubscribe();
            unsubDoc();
        };
    }, [navigate]);
    const fetchPerformanceData = async (rollno, studentClass, uid) => {
        try {
            // ✅ 1. Exam Stats
            const resultsSnap = await getDocs(collection(db, "results"));
            const studentResults = resultsSnap.docs
                .map(doc => doc.data())
                .filter(r => r.studentId === rollno && Array.isArray(r.answers));

            const totalQuestions = studentResults.reduce((sum, r) => sum + r.answers.length, 0);
            const correctAnswers = studentResults.reduce((sum, r) =>
                sum + r.answers.filter(a => a.selected === a.correct).length, 0);
            const examPercent = totalQuestions ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : 0;
            setExamStats({ percent: examPercent });

            // ✅ 2. Assignments
            const assignSnap = await getDocs(collection(db, "assignments"));
            const allAssignments = assignSnap.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(a => a.class === studentClass);

            let completed = 0;
            for (const a of allAssignments) {
                const statusSnap = await getDoc(doc(db, "assignment_status", `${uid}_${a.id}`));
                if (statusSnap.exists() && statusSnap.data().status === "Completed") {
                    completed++;
                }
            }
            setAssignmentStats({ completed, total: allAssignments.length });

            // ✅ 3. Attendance
            const attSnap = await getDoc(doc(db, "monthly_attendance", selectedMonth));
            if (attSnap.exists()) {
                const studentData = attSnap.data().students.find(s => s.rollno === rollno);
                if (studentData) {
                    setAttendanceStats({
                        present: Number(studentData.presentDays),
                        total: Number(studentData.totalDays)
                    });
                }
            }
        } catch (err) {
            console.error("🔥 Failed to fetch student stats:", err);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.info("👋 Logged Out Successfully!");
            localStorage.removeItem('studentUID');
            localStorage.removeItem('studentRollno');
            localStorage.removeItem('studentClass');
            setTimeout(() => navigate('/student-login'), 1000);
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("❌ Logout failed. Please try again.");
        }
    };

    if (loading || !student) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center mt-4">
                <Lottie animationData={loadingAnimation} style={{ height: '250px' }} />
                <div className="fw-bold text-primary mt-3">Loading your dashboard...</div>
            </div>
        );
    }

    // 🧠 Simulated performance stats (replace with real Firestore stats later)
    const examPercent = parseFloat(examStats.percent);
    const assignmentCompleted = assignmentStats.completed;
    const assignmentTotal = assignmentStats.total;
    const attendancePresent = attendanceStats.present;
    const attendanceTotal = attendanceStats.total;

    // 🎖️ Badges
    const badges = [];
    if (examPercent >= 90) badges.push("🏆 Top Performer");
    if ((assignmentCompleted / assignmentTotal) * 100 >= 90) badges.push("📝 Assignment Achiever");
    if ((attendancePresent / attendanceTotal) * 100 === 100) badges.push("📅 Perfect Attendance");

    // 💬 Quote of the Day
    const quotes = [
        "Success is the sum of small efforts, repeated day in and day out.",
        "Push yourself, because no one else is going to do it for you.",
        "The harder you work, the luckier you get.",
        "Believe you can, and you're halfway there.",
        "Every mistake is a lesson — keep going!"
    ];
    const quoteOfTheDay = quotes[new Date().getDate() % quotes.length];

    // 📌 Suggestions
    const tips = [];
    if (examPercent < 50) tips.push("Focus more on core subjects and revise daily.");
    if (assignmentCompleted < assignmentTotal * 0.6) tips.push("Complete pending assignments.");
    if (attendancePresent < attendanceTotal * 0.75) tips.push("Try to improve your attendance.");

    const dashboardCards = [
                { icon: <FaVideo className="display-6 text-info mb-2" />, label: 'Online Classes', path: '/student-dashboard/online-classes' },

        { icon: <FaTasks className="display-6 text-primary mb-2" />, label: 'Assignments', path: '/student-dashboard/assignments' },
        { icon: <FaRegFilePdf className="display-6 text-info mb-2" />, label: 'Offline Progress Card', path: '/student-dashboard/progress-card' },
        { icon: <FaLaptopCode className="display-6 text-success mb-2" />, label: 'Online Progress Card', path: '/student-dashboard/online-progress' },
        { icon: <FaClipboardCheck className="display-6 text-warning mb-2" />, label: 'Examinations', path: '/student-dashboard/examinations' },
        { icon: <FaChartLine className="display-6 text-success mb-2" />, label: 'Offline Results', path: '/student-dashboard/exam-results' },
        { icon: <FaChartLine className="display-6 text-primary mb-2" />, label: 'Online Results', path: '/student-dashboard/online-exam-results' },
        { icon: <FaCheckCircle className="display-6 text-primary mb-2" />, label: 'Attendance', path: '/student-dashboard/attendance' },
        { icon: <FaBell className="display-6 text-danger mb-2" />, label: 'Notices & Circulars', path: '/student-dashboard/notices' },
        { icon: <FaSignOutAlt className="display-6 text-dark mb-2" />, label: 'Logout', onClick: handleLogout }
    ];

    return (
        <div className="container py-5 mt-5">
            <div className="card mb-5 shadow border-0" data-aos="zoom-in" style={{ borderRadius: '20px' }}>
                <div className="card-body text-center py-4 px-3">
                    <img
                        src={logoUrl}
                        alt="Logo"
                        className="mb-3 rounded-circle border border-dark"
                        style={{ width: 80, height: 80 }}
                    />
                    <h3 className="fw-bold mb-1"><FaUserGraduate className="me-2" />{student.name}</h3>
                    <p className="mb-1"><FaIdCard className="me-2" /><strong>Roll No:</strong> {student.rollno}</p>
                    <p>
                        <FaChalkboardTeacher className="me-2" /><strong>Class:</strong> {student.class} &nbsp; | &nbsp;
                        <FaCalendarAlt className="me-2" /><strong>Batch:</strong> {student.batch}
                    </p>
                    <p className="fst-italic mt-3">💡 Stay consistent. Your hard work will pay off!</p>
                    <p className="fst-italic"><strong>Role:</strong> {student.role}</p>

                    {badges.length > 0 && (
                        <div className="mt-3">
                            <strong>🎖 Achievements:</strong><br />
                            {badges.map((b, i) => (
                                <span key={i} className="badge bg-success me-2 mt-2">{b}</span>
                            ))}
                        </div>
                    )}

                    <div className="alert alert-light mt-4 py-2 px-3 shadow-sm">
                        <strong>💬 Daily Quote:</strong><br />
                        <em>{quoteOfTheDay}</em>
                    </div>

                    {tips.length > 0 && (
                        <div className="alert alert-warning mt-3 text-start px-3">
                            <strong>📌 Tips to Improve:</strong>
                            <ul className="mb-0">{tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
                        </div>
                    )}

                    <button
                        className="btn btn-outline-primary mt-3 px-4"
                        onClick={() => navigate('/student-dashboard/profile')}
                    >
                        <i className="fas fa-user-circle me-2"></i> View Profile Details
                    </button>
                </div>
            </div>

            <h2 className="text-center text-gradient mb-4 fw-bold" data-aos="fade-down">
                <span className="text-primary">Welcome to Your</span> <span className="text-success">Student Dashboard</span>
            </h2>

            <div className="row g-4 text-center" data-aos="fade-up">
                {dashboardCards.map((btn, i) => (
                    <div className="col-md-4 col-6" key={i}>
                        <div
                            className="card border shadow h-100"
                            onClick={() => btn.path ? navigate(btn.path) : btn.onClick()}
                            role="button"
                            style={{
                                borderRadius: '15px',
                                cursor: 'pointer',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-5px)";
                                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.1)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.075)";
                            }}
                        >
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
