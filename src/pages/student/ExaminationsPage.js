import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import { collection, getDocs } from "firebase/firestore";
import { studentDb as db } from "../../services/firebase"; // ✅ use student context
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Latex from "react-latex-next";
import 'katex/dist/katex.min.css';

const ExaminationsPage = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [titleFilter, setTitleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    useEffect(() => {
        AOS.init({ duration: 800 });

        const fetchExamsAndResults = async () => {
            try {
                const rollno = localStorage.getItem("studentRollno");
                const studentClass = localStorage.getItem("studentClass"); // 🔍 make sure this is set at login

                if (!rollno || !studentClass) {
                    toast.error("Student not logged in.");
                    return navigate("/student-login");
                }

                const examsSnapshot = await getDocs(collection(db, "exams"));
                const resultsSnapshot = await getDocs(collection(db, "results"));

                const resultsData = resultsSnapshot.docs.map(doc => doc.data());

                const fetchedExams = examsSnapshot.docs
                    .map(doc => {
                        const data = doc.data();

                        const completed = resultsData.some(
                            res => res.examTitle === data.Title && res.studentId === rollno
                        );

                        const isAllowed = !data.AllowedClass || data.AllowedClass.length === 0 || data.AllowedClass.includes(studentClass);

                        return isAllowed ? { id: doc.id, ...data, completed } : null;
                    })
                    .filter(exam => exam !== null); // ✅ remove disallowed exams

                const now = new Date();

                const autoPublishedExams = fetchedExams.map((exam) => {
                    if (exam.Status === "Auto-Publish" && exam.Date && exam.Time) {
                        const scheduledDateTime = new Date(`${exam.Date}T${exam.Time}`);
                        if (now >= scheduledDateTime) {
                            return { ...exam, Status: "Published" };
                        }
                    }
                    return exam;
                });

                setExams(autoPublishedExams);
            } catch (error) {
                console.error("Error fetching exams or results:", error);
                toast.error("❌ Failed to load exams.");
            } finally {
                setLoading(false);
            }
        };


        fetchExamsAndResults();
    }, []);

    const handleTakeTest = (examId) => {
        const rollno = localStorage.getItem("studentRollno");
        if (rollno) {
            localStorage.setItem("currentExamRollno", rollno); // ✅ store for reference if needed
        }
        navigate(`/student-dashboard/start-test/${examId}`);
    };
    const filteredExams = exams.filter((exam) => {
        const matchesTitle = exam.Title.toLowerCase().includes(titleFilter.toLowerCase());

        let matchesStatus = true;
        if (statusFilter === "Not Yet Started") {
            matchesStatus = exam.Status !== "Published";
        } else if (statusFilter === "Start") {
            matchesStatus = exam.Status === "Published" && !exam.completed;
        } else if (statusFilter === "Completed") {
            matchesStatus = exam.completed;
        }

        return matchesTitle && matchesStatus;
    });
    return (
        <div className="container py-5 mt-5">
            <h2 className="text-center fw-bold mb-5" data-aos="fade-down" style={{
                background: "linear-gradient(to right, #0d6efd, #20c997)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
            }}>
                <i className="fas fa-clipboard-list me-2"></i>Upcoming Examinations
            </h2>
            <button className="btn btn-outline-danger " onClick={() => navigate('/student-dashboard')}>
                ← Back to Dashboard
            </button>
            <div className="row mt-4 mb-4 align-items-end">
                {/* Exam Title Filter */}
                <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label fw-bold ">
                        <i className="fas fa-search me-2 text-primary"></i>Search by Title
                    </label>
                    <div className="input-group shadow-sm">
                        <span className="input-group-text bg-white border-end-0">
                            <i className="fas fa-book text-info"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control border-start-0"
                            placeholder="Type exam title..."
                            value={titleFilter}
                            onChange={(e) => setTitleFilter(e.target.value)}
                        />
                    </div>
                </div>

                {/* Exam Status Filter */}
                <div className="col-md-6">
                    <label className="form-label fw-bold ">
                        <i className="fas fa-filter me-2 text-primary"></i>Filter by Status
                    </label>
                    <div className="input-group shadow-sm">
                        <span className="input-group-text bg-white border-end-0">
                            <i className="fas fa-tasks text-info"></i>
                        </span>
                        <select
                            className="form-select border-start-0"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">🗂 All</option>
                            <option value="Not Yet Started">⏳ Not Yet Started</option>
                            <option value="Start">✅ Start</option>
                            <option value="Completed">✔️ Completed</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="text-end text-muted small mb-3">
                <i className="fas fa-list-ol me-1 text-secondary"></i>
                <strong>{filteredExams.length}</strong> exam{filteredExams.length !== 1 ? 's' : ''} found.
            </div>
            {loading ? (
                <div className="text-center text-muted">
                    <div className="spinner-border text-info" role="status"></div>
                    <p className="mt-2">Loading exams...</p>
                </div>
            ) : exams.length === 0 ? (
                <div className="alert alert-warning text-center">
                    <i className="fas fa-exclamation-circle me-2"></i>No exams found.
                </div>
            ) : (
                <div className="row g-4">
                    {filteredExams.map((exam, idx) => (
                        <div className="col-md-6 col-lg-4" key={exam.id || idx} data-aos="zoom-in-up">
                            <div className="card shadow border-0 h-100" style={{
                                borderRadius: '15px',
                                transition: 'transform 0.3s ease-in-out',
                                cursor: 'pointer'
                            }}>
                                <div className="card-body d-flex flex-column justify-content-between p-4">
                                    <div>
                                        <h5 className="card-title text-primary fw-bold mb-3">
                                            <i className="fas fa-book-open me-2"></i>{exam.Title}
                                        </h5>

                                        {exam.Date && (
                                            <p><i className="fas fa-calendar-alt me-2 text-secondary"></i><strong>Date:</strong> {exam.Date}</p>
                                        )}
                                        {exam.Time && (
                                            <p><i className="fas fa-clock me-2 text-secondary"></i><strong>Time:</strong> {exam.Time}</p>
                                        )}
                                        <p><i className="fas fa-hourglass-half me-2 text-secondary"></i><strong>Duration:</strong> {exam.Duration} min</p>
                                        <p><i className="fas fa-question-circle me-2 text-secondary"></i><strong>Questions:</strong> {exam.Questions?.length || 0}</p>
                                        {exam.Subject && (
                                            <div className="mt-2 p-2 bg-light border rounded small">
                                                <i className="fas fa-file-alt me-2 text-secondary"></i>
                                                <Latex>{`$${exam.Subject}$`}</Latex>
                                            </div>
                                        )}
                                    </div>
                                    {/* 🧑‍🏫 Allowed Classes */}
                                    {exam.AllowedClass && exam.AllowedClass.length > 0 && (
                                        <div className="mb-2">
                                            <small className="fw-bold">🎓 Allowed Classes:</small><br />
                                            <span className="badge bg-info text-dark me-1 mt-1">
                                                {exam.AllowedClass.join(', ')}
                                            </span>
                                        </div>
                                    )}

                                    {exam.Status !== "Published" ? (
                                        <button className="btn btn-outline-warning mt-4 w-100" disabled>
                                            <i className="fas fa-ban me-2"></i>Not Yet Started
                                        </button>
                                    ) : exam.completed ? (
                                        <button className="btn btn-secondary mt-4 w-100" disabled>
                                            <i className="fas fa-check-circle me-2"></i>Test Completed
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-outline-success mt-4 w-100"
                                            onClick={() => handleTakeTest(exam.id)}
                                        >
                                            <i className="fas fa-pencil-alt me-2"></i>Start Test
                                        </button>
                                    )}

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExaminationsPage;
