// src/pages/student/OnlineExamResults.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { toast } from "react-toastify";
import {
    FaAward, FaArrowLeft, FaArrowRight, FaUser, FaBookOpen,
    FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaBullseye,
    FaChartLine, FaTrophy, FaListOl, FaChartPie, FaTag, FaFilter
} from "react-icons/fa";

const OnlineExamResults = () => {
    const { title } = useParams();
    const navigate = useNavigate();
    const rollno = localStorage.getItem("studentRollno");

    const [result, setResult] = useState(null);
    const [allResults, setAllResults] = useState([]);
    const [availableExams, setAvailableExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterSubject, setFilterSubject] = useState("All");
    const [currentAnswerIndex, setCurrentAnswerIndex] = useState(0);

    useEffect(() => {
        const fetchAllResults = async () => {
            try {
                const snapshot = await getDocs(collection(db, "results"));
                const resultsData = snapshot.docs.map(doc => doc.data());
                setAllResults(resultsData);
                const examTitles = [...new Set(resultsData.map(r => r.examTitle))];
                setAvailableExams(examTitles);

                if (title) {
                    const filtered = resultsData.filter(r =>
                        r.examTitle?.trim().toLowerCase() === decodeURIComponent(title).trim().toLowerCase()
                    );
                    const studentResult = filtered.find(r => r.studentId === rollno);
                    setResult(studentResult);
                    if (!studentResult) toast.error("❌ Your result not found.");
                }
            } catch (error) {
                console.error("Error fetching result:", error);
                toast.error("❌ Failed to load result.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllResults();
    }, [title, rollno]);

    if (loading) return (
        <div className="text-center mt-5">
            <i className="fas fa-spinner fa-spin text-primary fs-4"></i>
            <p>Loading result...</p>
        </div>
    );

    if (!title) {
        return (
            <div className="container py-4 mt-4">
                <h4 className="text-primary mb-4">📋 Select an Exam to View Result</h4>
                <button className="btn btn-outline-danger mb-3" onClick={() => navigate('/student-dashboard')}>
                    <FaArrowLeft className="me-2" />Back to Dashboard
                </button>
                <div className="row">
                    {availableExams.map((exam, idx) => (
                        <div className="col-md-4 mb-3" key={idx}>
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-body d-flex flex-column justify-content-between">
                                    <h5 className="card-title text-info fw-bold">
                                        <FaAward className="me-2" />{exam}
                                    </h5>
                                    <button
                                        className="btn btn-primary mt-3"
                                        onClick={() => navigate(`/student-dashboard/online-exam-results/${encodeURIComponent(exam)}`)}
                                    >
                                        View Result
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!result) return (
        <div className="text-center mt-5 text-danger fw-bold">❌ Result not found</div>
    );

    const attempted = result.answers.filter(a => a.selected !== null && a.selected !== undefined && a.selected !== "").length;
    const unattempted = result.answers.length - attempted;
    const totalStudents = allResults.filter(r => r.examTitle === result.examTitle).length;
    const highest = Math.max(...allResults.filter(r => r.examTitle === result.examTitle).map(r => r.score));
    const topper = allResults.find(r => r.examTitle === result.examTitle && r.score === highest);
    const rank = allResults.filter(r => r.examTitle === result.examTitle && r.score > result.score).length + 1;

    const subjectStats = {};
    result.answers.forEach((a) => {
        const subject = a.subject?.trim() || "General";
        if (!subjectStats[subject]) {
            subjectStats[subject] = { correct: 0, attempted: 0, total: 0 };
        }

        subjectStats[subject].total++;

        const selected = (a.selected || "").trim();
        const correct = (a.correct || "").trim();

        if (selected) {
            subjectStats[subject].attempted++; // ✅ count as attempted even if wrong
            if (selected === correct) {
                subjectStats[subject].correct++;
            }
        }
    });


    const subjects = ["All", ...new Set(result.answers.map(a => a.subject || "General"))];
    const filteredAnswers = filterSubject === "All"
        ? result.answers
        : result.answers.filter(a => a.subject === filterSubject);
    const currentAns = filteredAnswers[currentAnswerIndex];

    return (
        <div className="container py-4 mt-4">
            <h2 className="text-center text-primary fw-bold mb-4">
                <FaAward className="me-2" />Your Exam Result
            </h2>

            <button className="btn btn-outline-danger mb-4" onClick={() => navigate('/student-dashboard/online-exam-results')}>
                <FaArrowLeft className="me-2" />Back to Dashboard
            </button>

            {/* Summary Card */}
            <div className="card shadow-lg p-4 mb-4 border-start border-4 border-success rounded-4">
                <h5 className="fw-bold text-success mb-3"><FaUser className="me-2" />{rollno}</h5>
                <div className="row">
                    <div className="col-md-6">
                        <p><FaBookOpen className="me-2" /><strong>Exam:</strong> {result.examTitle}</p>
                        <p><FaCalendarAlt className="me-2" /><strong>Date:</strong> {result.attemptedOn}</p>
                    </div>
                    <div className="col-md-6">
                        <p><FaCheckCircle className="me-2" /><strong>Attempted:</strong> {attempted}</p>
                        <p><FaTimesCircle className="me-2" /><strong>Unattempted:</strong> {unattempted}</p>
                    </div>
                </div>
                <hr />
                <div className="row text-center">
                    <div className="col-md-3"><h6><FaBullseye /> Score</h6><p className="fw-bold text-primary">{result.score} / {result.total}</p></div>
                    <div className="col-md-3"><h6><FaChartLine /> %</h6><p className="fw-bold text-info">{result.percentage}%</p></div>
                    <div className="col-md-3"><h6><FaTrophy /> Highest</h6><p className="fw-bold text-danger">{highest} ({topper?.studentId})</p></div>
                    <div className="col-md-3"><h6><FaListOl /> Rank</h6><p className="fw-bold text-dark">#{rank} / {totalStudents}</p></div>
                </div>
            </div>

            {/* Subject Accuracy */}
            <h5 className="fw-bold "><FaChartPie className="me-2" />Subject-wise Accuracy</h5>
            {Object.entries(subjectStats).map(([subject, stat], i) => {
                const accuracy = stat.attempted > 0 ? Math.round((stat.correct / stat.attempted) * 100) : 0;
                return (
                    <p key={i} className="mb-1">
                        <FaTag className="me-2 text-secondary" />
                        <strong>{subject}:</strong> {stat.correct}/{stat.attempted} correct ({accuracy}%)
                    </p>
                );
            })}
            {/* Filter */}
            <h5 className="fw-bold text-primary mt-4"><FaFilter className="me-2" />Filter Answer Review</h5>
            <div className="mb-3 d-flex flex-wrap gap-2">
                {subjects.map((subj, i) => (
                    <button
                        key={i}
                        className={`btn btn-sm ${subj === filterSubject ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => {
                            setFilterSubject(subj);
                            setCurrentAnswerIndex(0);
                        }}
                    >
                        <FaTag className="me-1" />{subj}
                    </button>
                ))}
            </div>

            {/* Question Navigator */}
            {currentAns && (
                <div className="card p-3 mb-4 border-start border-4 border-secondary rounded-3 shadow-sm">
                    {currentAns.image && (
                        <div className="text-center mb-3">
                            <img src={currentAns.image} alt="Question" className="img-fluid rounded" style={{ maxHeight: 220 }} />
                        </div>
                    )}
                    <p><strong>Q{currentAnswerIndex + 1}:</strong> {currentAns.question}</p>
                    <p className={currentAns.selected === currentAns.correct ? "text-success" : "text-danger fw-semibold"}>
                        <strong>Your Answer:</strong> {currentAns.selected || "Not Answered"}
                    </p>
                    <p><strong>Correct Answer:</strong> {currentAns.correct}</p>

                    <div className="d-flex justify-content-between mt-3">
                        <button
                            className="btn btn-outline-secondary"
                            disabled={currentAnswerIndex === 0}
                            onClick={() => setCurrentAnswerIndex(prev => prev - 1)}
                        >
                            <FaArrowLeft className="me-2" />Previous
                        </button>
                        <button
                            className="btn btn-outline-primary"
                            disabled={currentAnswerIndex === filteredAnswers.length - 1}
                            onClick={() => setCurrentAnswerIndex(prev => prev + 1)}
                        >
                            Next <FaArrowRight className="ms-2" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OnlineExamResults;
