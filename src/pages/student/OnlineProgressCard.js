import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { studentDb as db, studentAuth as auth } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { FaArrowLeft, FaTasks, FaBullseye, FaChartPie, FaUserCheck, FaStar, FaFilePdf } from "react-icons/fa";
import Lottie from "lottie-react";
import loadingAnimation from "../../assets/loading.json";

ChartJS.register(ArcElement, Tooltip, Legend);

const OnlineProgressCard = () => {
    const navigate = useNavigate();
    const rollno = localStorage.getItem("studentRollno");
    const studentClass = localStorage.getItem("studentClass");
    const [loading, setLoading] = useState(true);
    const [examResults, setExamResults] = useState([]);
    const [assignmentStats, setAssignmentStats] = useState({ completed: 0, total: 0 });
    const [attendanceStats, setAttendanceStats] = useState({ present: 0, total: 0 });
    const [selectedExamTitle, setSelectedExamTitle] = useState("All");
    const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

    useEffect(() => {
        fetchData();
    }, [selectedMonth]);

    const fetchData = async () => {
        try {
            setLoading(true);

            const resultSnap = await getDocs(collection(db, "results"));
            const all = resultSnap.docs.map(doc => doc.data());
            const studentResults = all.filter(r => r.studentId === rollno && Array.isArray(r.answers));
            setExamResults(studentResults);

            const assignmentSnap = await getDocs(collection(db, "assignments"));
            const assignments = assignmentSnap.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(a => a.class === studentClass);

            let completedCount = 0;
            for (const a of assignments) {
                const statusDoc = await getDoc(doc(db, "assignment_status", `${auth.currentUser.uid}_${a.id}`));
                if (statusDoc.exists() && statusDoc.data().status === "Completed") {
                    completedCount++;
                }
            }
            setAssignmentStats({ completed: completedCount, total: assignments.length });

            const snap = await getDoc(doc(db, "monthly_attendance", selectedMonth));
            if (snap.exists()) {
                const studentData = snap.data().students.find(s => s.rollno === rollno);
                if (studentData) {
                    setAttendanceStats({
                        present: Number(studentData.presentDays),
                        total: Number(studentData.totalDays)
                    });
                } else {
                    setAttendanceStats({ present: 0, total: 0 });
                }
            } else {
                setAttendanceStats({ present: 0, total: 0 });
            }

        } catch (err) {
            console.error("Error loading progress data:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredExams = selectedExamTitle === "All"
        ? examResults
        : examResults.filter(r => r.examTitle === selectedExamTitle);

    const totalQuestions = filteredExams.reduce((sum, r) => sum + r.answers.length, 0);
    const correctAnswers = filteredExams.reduce((sum, r) =>
        sum + r.answers.filter(a => a.selected === a.correct).length, 0);
    const attemptedAnswers = filteredExams.reduce((sum, r) =>
        sum + r.answers.filter(a => a.selected).length, 0);
    const wrongAnswers = attemptedAnswers - correctAnswers;
    const examPercent = totalQuestions ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : 0;
    const totalMarks = filteredExams.reduce((sum, r) => sum + (r.score || 0), 0);
    const maxMarks = filteredExams.reduce((sum, r) => sum + (r.total || r.answers.length || 0), 0);
    const averageMarks = filteredExams.length ? (totalMarks / filteredExams.length).toFixed(1) : 0;
    const examTitles = [...new Set(examResults.map(r => r.examTitle))];

    const examChart = {
        labels: ["Correct", "Wrong", "Unattempted"],
        datasets: [{
            data: [correctAnswers, wrongAnswers, totalQuestions - attemptedAnswers],
            backgroundColor: ["#198754", "#dc3545", "#6c757d"]
        }]
    };
    const attendanceChart = {
        labels: ["Present", "Absent"],
        datasets: [{
            label: "Days",
            data: [attendanceStats.present, attendanceStats.total - attendanceStats.present],
            backgroundColor: ["#0d6efd", "#dc3545"]
        }]
    };
    const assignmentChart = {
        labels: ["Completed", "Pending"],
        datasets: [{
            label: "Assignments",
            data: [assignmentStats.completed, assignmentStats.total - assignmentStats.completed],
            backgroundColor: ["#20c997", "#ffc107"]
        }]
    };

    // ✅ Motivational Tip
    let motivationalMessage = "📌 Start attempting tests to view your progress!";
    if (examPercent >= 90) motivationalMessage = "🌟 Excellent performance! Keep it up!";
    else if (examPercent >= 70) motivationalMessage = "✅ Good job! Aim even higher!";
    else if (examPercent >= 50) motivationalMessage = "⚠️ You can improve. Stay focused and practice daily.";
    else if (examPercent > 0) motivationalMessage = "❌ Needs attention. Don't give up — revise concepts and seek help.";

    // 🎖 Badges
    const badges = [];
    if (examPercent >= 90) badges.push("🏆 Top Performer");
    if (assignmentStats.total && (assignmentStats.completed / assignmentStats.total) * 100 >= 90) badges.push("📝 Assignment Achiever");
    if (attendanceStats.total && (attendanceStats.present / attendanceStats.total) * 100 === 100) badges.push("📅 Perfect Attendance");

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
    if (wrongAnswers > correctAnswers) tips.push("Try to read each question carefully before answering.");
    if ((assignmentStats.completed / assignmentStats.total) * 100 < 60) tips.push("Complete pending assignments to improve understanding.");

    if (loading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center mt-5">
                <Lottie animationData={loadingAnimation} style={{ height: '250px' }} />
                <div className="fw-bold text-primary mt-3">Loading progress summary...</div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                <h4 className="fw-bold text-primary"><FaChartPie className="me-2" />Online Progress Summary</h4>
                <div>
                    <button className="btn btn-danger btn-sm me-2" onClick={() => window.print()}>
                        <FaFilePdf className="me-1" />Export as PDF
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/student-dashboard')}>
                        <FaArrowLeft className="me-2" />Back
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <label className="form-label fw-semibold">Filter by Exam Title</label>
                    <select
                        className="form-select"
                        value={selectedExamTitle}
                        onChange={(e) => setSelectedExamTitle(e.target.value)}
                    >
                        <option value="All">All Exams</option>
                        {examTitles.map((title, idx) => (
                            <option key={idx} value={title}>{title}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-semibold">Filter Attendance by Month</label>
                    <input
                        type="month"
                        className="form-control"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                </div>
            </div>

            {/* Main Stats */}
            <div className="row g-4">
                <div className="col-md-4">
                    <div className="card shadow-sm border-start border-4 border-success rounded-4 h-100 p-3">
                        <h5 className="fw-bold text-success mb-3"><FaBullseye className="me-2" />Exam Stats</h5>
                        <p><strong>Accuracy:</strong> {examPercent}%</p>
                        <p><strong>Marks:</strong> {totalMarks} / {maxMarks}</p>
                        <p><strong>Avg Marks:</strong> {averageMarks}</p>
                        <Doughnut data={examChart} />
                        <p className="mt-2 fw-semibold text-secondary">{motivationalMessage}</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm border-start border-4 border-warning rounded-4 h-100 p-3">
                        <h5 className="fw-bold text-warning mb-3"><FaTasks className="me-2" />Assignments</h5>
                        <p><strong>Completed:</strong> {assignmentStats.completed}</p>
                        <p><strong>Total:</strong> {assignmentStats.total}</p>
                        <Doughnut data={assignmentChart} />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm border-start border-4 border-info rounded-4 h-100 p-3">
                        <h5 className="fw-bold text-info mb-3"><FaUserCheck className="me-2" />Attendance ({selectedMonth})</h5>
                        <p><strong>Present:</strong> {attendanceStats.present}</p>
                        <p><strong>Total:</strong> {attendanceStats.total}</p>
                        <Doughnut data={attendanceChart} />
                    </div>
                </div>
            </div>

            {/* Add-ons */}
            {badges.length > 0 && (
                <div className="mt-4">
                    <strong>🎖 Your Badges:</strong> {badges.map((b, i) => (
                        <span key={i} className="badge bg-success me-2">{b}</span>
                    ))}
                </div>
            )}

            <div className="alert alert-light mt-4 shadow-sm">
                <strong>💡 Quote of the Day:</strong> {quoteOfTheDay}
            </div>

            {tips.length > 0 && (
                <div className="alert alert-warning mt-3">
                    <strong>📌 Suggestions:</strong>
                    <ul className="mb-0">{tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </div>
            )}

            <div className="text-end mt-4">
                <button className="btn btn-primary" onClick={() => navigate('/student-dashboard/assignments')}>
                    🚀 Go to Assignments
                </button>
            </div>
        </div>
    );
};

export default OnlineProgressCard;
