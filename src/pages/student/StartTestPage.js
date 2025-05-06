// src/pages/student/StartTestPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../../services/firebase";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";
import "bootstrap/dist/css/bootstrap.min.css";

const StartTestPage = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [showScrollTop, setShowScrollTop] = useState(false);

    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const [subjectFilter, setSubjectFilter] = useState("All");
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    useEffect(() => {
        const fetchExam = async () => {
            try {
                const docRef = doc(db, "exams", examId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {

                    const data = docSnap.data();
                    setExam(data);
                    const shuffled = [...data.Questions].sort(() => Math.random() - 0.5).map((q, idx) => ({ ...q, _index: idx }));
                    setQuestions(shuffled);
                    setTimeLeft(data.Duration * 60);

                    Swal.fire({
                        title: "Ready to Begin?",
                        html: `<strong>Date:</strong> ${data.Date || "N/A"}<br/><strong>Time:</strong> ${data.Time || "N/A"}`,
                        icon: "info",
                        confirmButtonText: "Start Test",
                        allowOutsideClick: false
                    }).then((result) => {
                        if (result.isConfirmed) {
                            setHasStarted(true);
                        } else {
                            navigate("/student-dashboard/examinations");
                        }
                    });
                } else {
                    toast.error("❌ Exam not found");
                    navigate("/student-dashboard/examinations");
                }
            } catch (err) {
                console.error("Error fetching exam:", err);
                toast.error("❌ Failed to load exam.");
                navigate("/student-dashboard/examinations");
            } finally {
                setLoading(false);
            }
        };
        fetchExam();
    }, [examId, navigate]);

    useEffect(() => {
        const blockNavigation = (e) => { e.preventDefault(); e.returnValue = ""; };
        const disableBack = () => window.history.pushState(null, null, window.location.pathname);
        const handleTabSwitch = () => {
            if (document.hidden) {
                setTabSwitchCount(prev => {
                    const count = prev + 1;
                    if (count >= 3) {
                        Swal.fire("Warning", "🚫 You switched tabs multiple times!", "warning");
                    } else {
                        alert("⚠️ You switched tabs! Please stay on the test page.");
                    }
                    return count;
                });
            }
        };
        window.addEventListener("beforeunload", blockNavigation);
        window.addEventListener("popstate", disableBack);
        document.addEventListener("visibilitychange", handleTabSwitch);
        return () => {
            window.removeEventListener("beforeunload", blockNavigation);
            window.removeEventListener("popstate", disableBack);
            document.removeEventListener("visibilitychange", handleTabSwitch);
        };
    }, []);

    useEffect(() => {
        if (!hasStarted || !exam || questions.length === 0) return;
        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }
        const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, hasStarted, exam, questions]);

    const handleSelect = (Index, option) => {
        setSelectedAnswers((prev) => ({ ...prev, [Index]: option }));
    };

    const handleSubmit = useCallback(async () => {
        const unattemptedCount = questions.filter((_, i) => selectedAnswers[i] === undefined).length;

        if (unattemptedCount > 0) {
            const warn = await Swal.fire({
                title: "Unattempted Questions!",
                text: `You have left ${unattemptedCount} question(s) unattempted. Do you still want to submit?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, Submit Anyway",
                cancelButtonText: "Go Back",
            });
            if (!warn.isConfirmed) return;
        }

        const confirm = await Swal.fire({
            title: "Submit Test?",
            text: "Are you sure you want to submit the test?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, Submit",
            cancelButtonText: "Cancel",
        });

        if (!confirm.isConfirmed) return;

        const marksPerCorrect = exam?.MarksPerCorrect ?? 4;
        const marksPerWrong = exam?.MarksPerWrong ?? -1;

        let score = 0;
        const answers = [];

        questions.forEach((q, i) => {
            const selected = selectedAnswers[i];
            const correct = q.answer;

            if (selected === correct) score += marksPerCorrect;
            else if (selected && selected !== correct) score += marksPerWrong;

            answers.push({
                question: q.q ?? "",
                selected: selected ?? null,
                correct: correct ?? "",
                image: q.image ?? "",
                subject: q.subject ?? "General"
            });
        });

        const total = questions.length * marksPerCorrect;
        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
        const rollno = localStorage.getItem("studentRollno") || "Unknown";

        try {
            console.log("Submitting result data:", {
                studentId: rollno,
                examTitle: exam.Title ?? "Untitled Exam",
                score,
                total,
                percentage,
                attemptedOn: new Date().toLocaleString(),
                answers,
            });
            await addDoc(collection(db, "results"), {
                studentId: rollno,
                examTitle: exam.Title || "Untitled Exam",
                score,
                total,
                percentage,
                attemptedOn: new Date().toLocaleString(),
                answers,
            });

            Swal.fire("Success", "🎉 Test submitted successfully!", "success");
            navigate(`/student-dashboard/online-exam-results`);
        } catch (err) {
            console.error("Failed to submit test:", err);
            Swal.fire("Error", "❌ Failed to submit test.", "error");
        }
    }, [exam, questions, selectedAnswers, navigate]);


    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const uniqueSubjects = Array.from(new Set(questions.map(q => q.subject)));

    const subjectStats = uniqueSubjects.map(subject => {
        const subjectQuestions = questions.filter(q => q.subject === subject);
        const attempted = subjectQuestions.filter((q, i) => selectedAnswers[questions.indexOf(q)] !== undefined).length;
        return { subject, total: subjectQuestions.length, attempted };
    });

    const filteredQuestions = subjectFilter === "All" ? questions : questions.filter(q => q.subject === subjectFilter);

    if (loading || !hasStarted) return <div className="text-center mt-5">Loading exam...</div>;
    const showSubjectQuestionPopup = (initialSubject) => {
        let currentSubject = initialSubject;

        const renderPopup = () => {
            const subjectQuestions = subjectQuestionMap[currentSubject] || [];

            const questionsHtml = subjectQuestions.map((q, idx) => {
                const isAnswered = selectedAnswers[q.index] !== undefined;
                const bg = isAnswered ? '#d4edda' : '#f8d7da'; // Green or Red
                return `<button data-index="${q.index}" class="swal2-question-btn swal2-styled" 
                            style="margin:5px;padding:5px 10px;border:1px solid #ccc;
                            background:${bg};color:black;border-radius:5px;">
                            Q${q.index + 1}
                        </button>`;
            }).join("");

            Swal.fire({
                title: '<i class="fas fa-book-reader me-2 text-primary"></i> Questions in Subject',
                html: `
                    <div style="max-width:100%;box-sizing:border-box;">
                        <select id="swal-subject-switcher" class="swal2-select" 
                            style="margin-bottom:10px;padding:10px;width:100%;font-size:16px;border-radius:6px;">
                            ${Object.keys(subjectQuestionMap).map(sub =>
                    `<option value="${sub}" ${sub === currentSubject ? 'selected' : ''}>${sub}</option>`).join('')}
                        </select>
            
                        <input id="swal-search" class="swal2-input" placeholder="🔍 Search Q#" 
                            style="font-size:16px;margin-bottom:10px;padding:10px;border-radius:6px;" />
            
                        <div id="swal-question-list" 
                            style="max-height:300px;overflow-x:auto;display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-start;">
                            ${subjectQuestionMap[currentSubject].map((q, i) => {
                        const isAnswered = selectedAnswers[q.index] !== undefined;
                        const bg = isAnswered ? '#d4edda' : '#f8d7da'; // green or red
                        return `<button data-index="${q.index}" class="swal2-question-btn swal2-styled" 
                                    style="min-width:60px;font-size:14px;margin:5px;padding:10px 15px;
                                           border-radius:6px;background:${bg};color:black;">
                                           Q${q.index + 1}
                                        </button>`;
                    }).join('')}
                        </div>
                    </div>
                `,
                width: '95%',
                showConfirmButton: false,

                didOpen: () => {
                    // 🔄 Subject switcher dropdown
                    document.querySelector("#swal-subject-switcher").addEventListener("change", (e) => {
                        currentSubject = e.target.value;
                        Swal.close();
                        setTimeout(() => renderPopup(), 100);
                    });

                    // 🔍 Live search
                    document.querySelector("#swal-search").addEventListener("input", (e) => {
                        const val = e.target.value.toLowerCase();
                        document.querySelectorAll(".swal2-question-btn").forEach(btn => {
                            const text = btn.textContent.toLowerCase();
                            btn.style.display = text.includes(val) ? "inline-block" : "none";
                        });
                    });

                    // ✅ Jump to question
                    document.querySelectorAll(".swal2-question-btn").forEach(btn => {
                        btn.addEventListener("click", () => {
                            const idx = parseInt(btn.getAttribute("data-index"));
                            Swal.close();
                            setSubjectFilter("All"); // Optional: switch to All
                            setCurrentQuestionIndex(idx); // ✅ Switch question directly

                            setTimeout(() => {
                                const el = document.getElementById(`q-${idx}`);
                                if (el) {
                                    window.scrollTo({
                                        top: el.offsetTop - 100,
                                        behavior: 'smooth'
                                    });
                                } else {
                                    console.warn("Question element not found: ", `q-${idx}`);
                                }
                            }, 200);
                        });
                    });
                }
            });


        };

        renderPopup();
    };
    const subjectQuestionMap = {};

    questions.forEach((q, index) => {
        const subject = q.subject || "Uncategorized";
        if (!subjectQuestionMap[subject]) subjectQuestionMap[subject] = [];
        subjectQuestionMap[subject].push({ ...q, index });
    });

    return (
        <div className="container py-5 mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4 sticky-top bg-white py-2">
                <div>
                    <button
                        className="btn btn-outline-danger"
                        onClick={() => {
                            Swal.fire({
                                title: 'Are you sure?',
                                text: "Any unsaved answers or changes will be lost.",
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#d33',
                                cancelButtonColor: '#3085d6',
                                confirmButtonText: 'Yes, go back!',
                                cancelButtonText: 'Stay Here'
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    navigate('/student-dashboard/examinations');
                                }
                            });
                        }}
                    >
                        ← Back to Examinations
                    </button>
                    <h2 className="text-primary fw-bold mb-1">
                        <i className="fas fa-pencil-alt me-2"></i>{exam.Title}
                    </h2>
                    <div className="text-muted small">
                        <i className="fas fa-calendar-alt me-1"></i> {exam.Date || 'N/A'} &nbsp;
                        <i className="fas fa-clock me-1"></i> {exam.Time || 'N/A'}
                    </div>
                </div>
                <div className="badge bg-danger fs-5 px-3 py-2">
                    ⏱ {formatTime(timeLeft)}
                </div>
            </div>

            {/* Subject Filter Buttons */}
            <div className="mb-4">
                <button
                    className={`btn btn-sm me-2 ${subjectFilter === "All" ? "btn-info" : "btn-outline-info"}`}
                    onClick={() => setSubjectFilter("All")}
                >
                    All ({questions.length})
                </button>

                {subjectStats.map(({ subject, total, attempted }) => (
                    <button
                        key={subject}
                        className="btn btn-outline-info btn-sm me-2"
                        onClick={() => showSubjectQuestionPopup(subject)}
                    >
                        {subject} ({attempted}/{total})
                    </button>
                ))}
            </div>


            {/* Navigator Buttons */}
            <div
                className="mb-4 bg-white"
                style={{
                    position: 'sticky',
                    top: 70, // adjust to match your navbar/header
                    zIndex: 1000,
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    padding: '10px 0',
                    borderBottom: '1px solid #ddd',
                }}
            >
                <div className="d-inline-flex gap-2 px-3">
                    {questions.map((_, idx) => {
                        const isAnswered = selectedAnswers[idx] !== undefined;
                        return (
                            <button
                                key={idx}
                                className={`btn btn-sm ${isAnswered ? 'btn-success' : 'btn-outline-danger'}`}
                                style={{ minWidth: 50 }}
                                onClick={() => {
                                    setSubjectFilter("All");
                                    setCurrentQuestionIndex(idx); // ⬅️ This is enough

                                    setTimeout(() => {
                                        const target = document.getElementById(`q-${idx}`);
                                        if (target) window.scrollTo({ top: target.offsetTop - 100, behavior: 'smooth' });
                                    }, 100);
                                }}
                            >
                                Q{idx + 1}
                            </button>
                        );
                    })}
                </div>
            </div>


            {/* Question Rendering */}
            {filteredQuestions.length > 0 && (() => {
                const q = filteredQuestions[currentQuestionIndex];
                const realIndex = q._index !== undefined ? q._index : currentQuestionIndex;

                return (
                    <div key={realIndex} id={`q-${realIndex}`} className="card mb-4 shadow-sm">
                        <div className="card-body">
                            <h5><strong>Q{realIndex + 1}.</strong> <Latex>{q.q}</Latex></h5>
                            {q.image && <img src={q.image} alt="Question" className="img-fluid my-2" />}
                            <ul className="list-group mt-3">
                                {q.options.map((opt, idx) => {
                                    const isChecked = selectedAnswers[realIndex] === opt;
                                    return (
                                        <li key={idx} className="list-group-item">
                                            <label className="d-flex align-items-center">
                                                <input
                                                    type="radio"
                                                    name={`question-${realIndex}`}
                                                    value={opt}
                                                    className="form-check-input me-2"
                                                    checked={isChecked}
                                                    onChange={() => handleSelect(realIndex, opt)}
                                                />
                                                <Latex>{opt}</Latex>
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                );
            })()}

            {showScrollTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="btn btn-danger rounded-circle shadow animate__animated animate__fadeIn"
                    style={{
                        position: 'fixed',
                        bottom: 20,
                        right: 20,
                        zIndex: 9999,
                        width: 50,
                        height: 50,
                        fontSize: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    title="Scroll to Top"
                >
                    <i className="fas fa-arrow-up"></i>
                </button>
            )}

            <div className="d-flex justify-content-between mt-3">
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
                    disabled={currentQuestionIndex === 0}
                >
                    ← Previous
                </button>

                <button
                    className="btn btn-outline-secondary"
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(prev + 1, filteredQuestions.length - 1))}
                    disabled={currentQuestionIndex === filteredQuestions.length - 1}
                >
                    Next →
                </button>
            </div>
            {/* Submit Button */}
            <div className="text-center mt-4">
                <button className="btn btn-danger px-4 py-2 rounded-pill" onClick={handleSubmit}>
                    <i className="fas fa-paper-plane me-2"></i>Submit Test
                </button>
            </div>
        </div>

    );

};

export default StartTestPage;
