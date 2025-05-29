import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from 'react-toastify';
import { FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Make sure this is at the top

const ExamResultPage = () => {
    const { title } = useParams();
    const navigate = useNavigate(); // Declare inside your component

    const [result, setResult] = useState(null);
    const [allResults, setAllResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterSubject, setFilterSubject] = useState("All");
    const [currentAnswerIndex, setCurrentAnswerIndex] = useState(0);

    const handleLogout = () => {
        toast.info("Logged Out Successfully!");
        localStorage.removeItem('studentRollno');
        setTimeout(() => navigate('/student-login'), 1000);
    };
    const dummyResult = {
        studentId: "test-student",
        examTitle: decodeURIComponent(title),
        score: 145,
        total: 200,
        percentage: 72.5,
        attemptedOn: new Date().toLocaleString(),
        answers: [
            {
                question: "What is the SI unit of force?",
                selected: "Newton",
                correct: "Newton",
                image: "",
                subject: "Physics"
            },
            {
                question: "Identify the structure in the image.",
                selected: "Plant cell",
                correct: "Plant cell",
                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Plant_cell_structure.svg/640px-Plant_cell_structure.svg.png",
                subject: "Biology"
            },
            {
                question: "Which vitamin is synthesized in skin?",
                selected: "Vitamin C",
                correct: "Vitamin D",
                image: "",
                subject: "Biology"
            }
        ]
    };

    useEffect(() => {
        const fetchResults = async () => {
            try {
                throw new Error("Firestore disabled. Using dummy data.");
            } catch (err) {
                console.warn("Using dummy result due to error:", err.message);
                setAllResults([dummyResult]);
                setResult(dummyResult);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [title]);

    if (loading)
        return <div className="text-center mt-5"><i className="fas fa-spinner fa-spin text-primary fs-4"></i><p className="fw-semibold">Loading result...</p></div>;
    if (!result) return <div className="text-center mt-5 text-danger fw-bold">❌ Result not found</div>;

    const attempted = result.answers.filter(a => a.selected !== undefined).length;
    const unattempted = result.answers.length - attempted;
    const totalStudents = allResults.length;
    const highest = Math.max(...allResults.map(r => r.score));
    const topper = allResults.find(r => r.score === highest);
    const rank = allResults.filter(r => r.score > result.score).length + 1;

    const subjectStats = {};
    result.answers.forEach(a => {
        const subject = a.subject || "General";
        if (!subjectStats[subject]) subjectStats[subject] = { correct: 0, total: 0 };
        subjectStats[subject].total++;
        if (a.selected === a.correct) subjectStats[subject].correct++;
    });

    const subjects = ["All", ...new Set(result.answers.map(a => a.subject || "General"))];
    const filteredAnswers = filterSubject === "All"
        ? result.answers
        : result.answers.filter(a => a.subject === filterSubject);
    const currentAns = filteredAnswers[currentAnswerIndex];

    return (
        <div className="container py-4 mt-4" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            <h2 className="text-center text-primary fw-bold mb-4">
                <i className="fas fa-award me-2"></i>Your Exam Result
            </h2>

            <button className="btn btn-outline-danger " onClick={handleLogout} >
                logout
            </button>
            <div className="card shadow-lg p-4 mb-4 border-start border-4 border-success rounded-4">
                <h5 className="fw-bold text-success mb-3"><i className="fas fa-user me-2"></i>{result.studentId}</h5>
                <div className="row">
                    <div className="col-md-6">
                        <p><strong><i className="fas fa-book-open me-2"></i>Exam:</strong> {result.examTitle}</p>
                        <p><strong><i className="fas fa-calendar-alt me-2"></i>Date:</strong> {result.attemptedOn}</p>
                    </div>
                    <div className="col-md-6">
                        <p><strong><i className="fas fa-check-circle me-2"></i>Attempted:</strong> {attempted}</p>
                        <p><strong><i className="fas fa-times-circle me-2"></i>Unattempted:</strong> {unattempted}</p>
                    </div>
                </div>
                <hr />
                <div className="row text-center">
                    <div className="col-md-3"><h6><i className="fas fa-bullseye me-1"></i>Score</h6><p className="fw-bold text-primary">{result.score} / {result.total}</p></div>
                    <div className="col-md-3"><h6><i className="fas fa-chart-line me-1"></i>Percentage</h6><p className="fw-bold text-info">{result.percentage}%</p></div>
                    <div className="col-md-3"><h6><i className="fas fa-trophy me-1"></i>Highest</h6><p className="fw-bold text-danger">{highest} ({topper?.studentId})</p></div>
                    <div className="col-md-3"><h6><i className="fas fa-list-ol me-1"></i>Rank</h6><p className="fw-bold text-dark">#{rank} / {totalStudents}</p></div>
                </div>
            </div>

            <div className="mb-4">
                <h5 className="fw-bold text-dark"><i className="fas fa-chart-pie me-2"></i>Subject-wise Accuracy:</h5>
                {Object.entries(subjectStats).map(([subject, stat], i) => (
                    <p key={i} className="mb-1">
                        <i className="fas fa-book me-2 text-secondary"></i>{subject}: {stat.correct}/{stat.total} correct ({Math.round((stat.correct / stat.total) * 100)}%)
                    </p>
                ))}
            </div>

            <h5 className="fw-bold text-primary mb-3"><i className="fas fa-filter me-2"></i>Filter Answer Review</h5>
            <div className="mb-3 d-flex flex-wrap gap-2">
                {subjects.map((subj, i) => (
                    <button
                        key={i}
                        className={`btn btn-sm ${subj === filterSubject ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => { setFilterSubject(subj); setCurrentAnswerIndex(0); }}
                    >
                        <i className="fas fa-tag me-1"></i>{subj}
                    </button>
                ))}
            </div>

            {currentAns && (
                <div className="card p-3 mb-4 border-start border-4 border-secondary rounded-3 shadow-sm">
                    {currentAns.image && (
                        <div className="text-center mb-3">
                            <img src={currentAns.image} alt="Question" className="img-fluid rounded" style={{ maxHeight: 220 }} />
                        </div>
                    )}
                    <p><strong><i className="far fa-question-circle me-2"></i>Q{currentAnswerIndex + 1}:</strong> {currentAns.question}</p>
                    <p className={currentAns.selected === currentAns.correct ? "text-success" : "text-danger fw-semibold"}>
                        <strong><i className="fas fa-user-check me-2"></i>Your Answer:</strong> {currentAns.selected || "Not Answered"}
                    </p>
                    <p><strong><i className="fas fa-check me-2"></i>Correct Answer:</strong> {currentAns.correct}</p>

                    <div className="d-flex justify-content-between mt-3">
                        <button
                            className="btn btn-outline-secondary"
                            disabled={currentAnswerIndex === 0}
                            onClick={() => setCurrentAnswerIndex(prev => prev - 1)}
                        >
                            <i className="fas fa-arrow-left me-2"></i>Previous
                        </button>
                        <button
                            className="btn btn-outline-primary"
                            disabled={currentAnswerIndex === filteredAnswers.length - 1}
                            onClick={() => setCurrentAnswerIndex(prev => prev + 1)}
                        >
                            Next<i className="fas fa-arrow-right ms-2"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamResultPage;
