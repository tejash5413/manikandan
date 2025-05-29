// 🔥 GenerateQuestions.js - Complete Modern UI with All Features
import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { adminDb as db } from "../../services/firebase";
import { toast } from "react-toastify";
import Select from "react-select";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from 'react-router-dom';

const GenerateQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [filters, setFilters] = useState({ subject: '', topic: '', difficulty: '' });
    const [showPreview, setShowPreview] = useState(false);
    const navigate = useNavigate();
    const [examSettings, setExamSettings] = useState({
        Title: "",
        Type: "",
        AllowedClass: [],
        Date: "",
        Time: "",
        Duration: "",
        Status: "Draft",
        MarksPerCorrect: 4,
        MarksPerWrong: -1
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const snapshot = await getDocs(collection(db, "exams"));
                const allQuestions = [];

                snapshot.docs.forEach(docSnap => {
                    const data = docSnap.data();
                    if (Array.isArray(data.Questions)) {
                        data.Questions.forEach((q, index) => {
                            allQuestions.push({
                                id: `${docSnap.id}-${index}`, // unique ID
                                ...q
                            });
                        });
                    }
                });

                setQuestions(allQuestions);
                if (allQuestions.length > 0) {
                    toast.success(`✅ Loaded ${allQuestions.length} questions`, {
                        toastId: 'questions-loaded'
                    });
                }
            } catch (err) {
                console.error(err);
                toast.error("❌ Failed to load questions");
            }
        };

        fetchQuestions();
    }, []);

    const subjects = [...new Set(questions.map(q => q.subject))];
    const topics = [...new Set(questions.map(q => q.topic))];

    const filteredQuestions = questions.filter(q => {
        return (
            (!filters.subject || q.subject === filters.subject) &&
            (!filters.topic || q.topic === filters.topic) &&
            (!filters.difficulty || q.difficulty === filters.difficulty)
        );
    });

    const paginatedQuestions = filteredQuestions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const toggleSelect = (q) => {
        setSelectedQuestions(prev =>
            prev.some(item => item.id === q.id)
                ? prev.filter(item => item.id !== q.id)
                : [...prev, q]
        );
    };

    const handleSelectAllFiltered = () => {
        const filteredIds = filteredQuestions.map(q => q.id);
        const newSelected = [...selectedQuestions];
        filteredIds.forEach(id => {
            if (!newSelected.find(q => q.id === id)) {
                const qToAdd = questions.find(q => q.id === id);
                if (qToAdd) newSelected.push(qToAdd);
            }
        });
        setSelectedQuestions(newSelected);
    };

    const handleSubmitExam = async () => {
        if (!examSettings.Title || !examSettings.Date || !examSettings.Time || selectedQuestions.length === 0) {
            toast.warning("Fill all settings and select questions.");
            return;
        }
        try {
            await addDoc(collection(db, "exams"), {
                ...examSettings,
                Questions: selectedQuestions,
                createdAt: new Date()
            });
            toast.success("✅ Exam created from selected questions");
            setSelectedQuestions([]);
        } catch (err) {
            toast.error("❌ Failed to save exam");
        }
    };
    const visibleQuestions = showPreview ? selectedQuestions : filteredQuestions;
    const paginatedVisibleQuestions = visibleQuestions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const shuffleArray = (array) => {
        const newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    };

    const shuffleSelectedOptions = () => {
        const updatedQuestions = questions.map(q => {
            const isSelected = selectedQuestions.find(sq => sq.id === q.id);
            if (!isSelected || !Array.isArray(q.options) || q.options.length === 0) return q;

            const shuffledOptions = shuffleArray(q.options);
            const newCorrect = shuffledOptions.find(opt => opt === q.answer) || q.answer;

            return {
                ...q,
                options: shuffledOptions,
                answer: newCorrect
            };
        });

        // Update both states to reflect changes
        setQuestions(updatedQuestions);
        setSelectedQuestions(updatedQuestions.filter(q => selectedQuestions.find(sq => sq.id === q.id)));

        toast.success("Shuffled options for selected questions", { toastId: "shuffle-selected" });
    };


    return (
        <div className="container py-4 mt-5">
            <h3 className="text-primary mb-3"><i className="fas fa-magic me-2"></i>Generate Exam from Question Bank</h3>
            <button className="btn btn-outline-secondary" onClick={() => navigate('/admin-dashboard/select-exam')}>
                <i className="fas fa-arrow-left me-1"></i> Back
            </button>
            <div className="card p-3 mb-4 shadow-sm">
                <h5 className=" fw-bold mb-3">🛠️ Exam Settings</h5>
                <input className="form-control mb-2" placeholder="Exam Title" value={examSettings.Title} onChange={(e) => setExamSettings({ ...examSettings, Title: e.target.value })} />
<div className="mb-3">
  <label className="form-label">Exam Type</label>
  <select
    className="form-control"
    value={examSettings.Type}
    onChange={(e) => setExamSettings({ ...examSettings, Type: e.target.value })}
  >
    <option value="">Select Type</option>
    <option value="Weekly Test">Weekly Test</option>
    <option value="Monthly Test">Monthly Test</option>
    <option value="Unit Test">Unit Test</option>
    <option value="Chapter Test">Chapter Test</option>
    <option value="Half Yearly Exam">Half Yearly Exam</option>
    <option value="Model Exam">Model Exam</option>
    <option value="Grand Test">Grand Test</option>
    <option value="NEET Mock">NEET Mock</option>
    <option value="Revision Test">Revision Test</option>
    <option value="Daily Practice Test">Daily Practice Test</option>
    <option value="Full Portion Test">Full Portion Test</option >
    <option value="Board Exam">Board Exam</option>
    <option value="Mid-Term Test">Mid-Term Test</option>
    <option value="Preliminary Exam">Preliminary Exam</option>
    <option value="Final Exam">Final Exam</option>
    <option value="Other">Other</option>
  </select>
</div>
                <Select isMulti placeholder="Allowed Classes"
                    options={[...Array.from({ length: 12 }, (_, i) => ({ value: `Class ${i + 1}`, label: `Class ${i + 1}` })),
                    { value: "LT", label: "LT" }, { value: "NEET Repeaters", label: "NEET Repeaters" }, { value: "Crash Course", label: "Crash Course" }, { value: "Integrated", label: "Integrated" }]}
                    onChange={(selected) => setExamSettings({ ...examSettings, AllowedClass: selected.map(s => s.value) })}
                />

                <div className="row mt-2">
                    <div className="col"><input type="date" className="form-control" onChange={(e) => setExamSettings({ ...examSettings, Date: e.target.value })} /></div>
                    <div className="col"><input type="time" className="form-control" onChange={(e) => setExamSettings({ ...examSettings, Time: e.target.value })} /></div>
                    <div className="col"><input type="number" placeholder="Duration" className="form-control" onChange={(e) => setExamSettings({ ...examSettings, Duration: e.target.value })} /></div>
                </div>

                <div className="row mt-2">
                    <div className="col"><input type="number" placeholder="Marks Per Correct" className="form-control" value={examSettings.MarksPerCorrect} onChange={(e) => setExamSettings({ ...examSettings, MarksPerCorrect: Number(e.target.value) })} /></div>
                    <div className="col"><input type="number" placeholder="Marks Per Wrong" className="form-control" value={examSettings.MarksPerWrong} onChange={(e) => setExamSettings({ ...examSettings, MarksPerWrong: Number(e.target.value) })} /></div>
                    <div className="col">
                        <select className="form-select" value={examSettings.Status} onChange={(e) => setExamSettings({ ...examSettings, Status: e.target.value })}>
                            <option value="Draft">Draft</option>
                            <option value="Published">Published</option>
                            <option value="Auto-Publish">Auto-Publish</option>
                        </select>
                        <div className="col">
                            <button className="btn btn-warning btn-sm" onClick={shuffleSelectedOptions}>
                                <i className="fas fa-random me-1"></i>Shuffle Selected Questions
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card p-3 mb-4 shadow-sm">
                <h5 className=" fw-bold mb-3">🔍 Filter Questions</h5>
                <div className="row">
                    <div className="col">
                        <select className="form-select" onChange={(e) => setFilters({ ...filters, subject: e.target.value })}>
                            <option value="">All Subjects</option>
                            {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                    </div>
                    <div className="col">
                        <select className="form-select" onChange={(e) => setFilters({ ...filters, topic: e.target.value })}>
                            <option value="">All Topics</option>
                            {topics.map(top => <option key={top} value={top}>{top}</option>)}
                        </select>
                    </div>
                    <div className="col">
                        <select className="form-select" onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}>
                            <option value="">All Difficulty</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="mb-2">
                <button className="btn btn-outline-primary btn-sm" onClick={handleSelectAllFiltered}>Select All Filtered</button>
                <button className="btn btn-outline-danger btn-sm ms-2" onClick={() => setSelectedQuestions([])}>Clear All</button>
            </div>
            <h5 className="fw-bold">
                📄 {showPreview ? "Selected" : "Filtered"} Questions ({visibleQuestions.length})
            </h5>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <button
                    className="btn btn-outline-primary"
                    onClick={() => setShowPreview(!showPreview)}
                    disabled={selectedQuestions.length === 0}
                >
                    <i className="fas fa-eye me-1"></i>
                    {showPreview ? "Hide Preview" : "Preview Selected Questions"}
                </button>
            </div>
            <h5 className="fw-bold">📄 Questions ({filteredQuestions.length})</h5>
            {visibleQuestions.length === 0 ? (
                <p className="">No questions {showPreview ? "selected" : "available"}.</p>
            ) : (
                <div className="row">
                    {paginatedVisibleQuestions.map((q, idx) => (
                        <div className="col-md-6 mb-3" key={q.id || idx}>
                            <div
                                className={`list-group-item shadow-sm rounded h-100 p-3 border ${selectedQuestions.some((s) => s.id === q.id)
                                    ? "border-success bg-light"
                                    : ""
                                    }`}
                                style={{ cursor: "pointer" }}
                                onClick={() => toggleSelect(q)}
                            >
                                <div className="d-flex align-items-start gap-2">
                                    <input
                                        type="checkbox"
                                        className="form-check-input mt-1"
                                        checked={selectedQuestions.some((s) => s.id === q.id)}
                                        onChange={() => toggleSelect(q)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>

                                <div className="mt-2">
                                    <strong>
                                        Q{(currentPage - 1) * itemsPerPage + idx + 1}:
                                    </strong>{" "}
                                    <Latex>{q.q}</Latex>
                                </div>

                                {q.image && (
                                    <img
                                        src={q.image}
                                        alt="Question"
                                        className="img-fluid rounded my-2 border"
                                    />
                                )}

                                <ul className="ms-3 mt-2">
                                    {q.options?.map((opt, i) => (
                                        <li key={i}>
                                            <Latex>{opt}</Latex>
                                        </li>
                                    ))}
                                </ul>

                                <p
                                    className={`mt-2 ${selectedQuestions.some((s) => s.id === q.id)
                                        ? "text-success fw-bold"
                                        : ""
                                        }`}
                                >
                                    <strong>Answer:</strong> <Latex>{q.answer}</Latex>
                                </p>

                                <div className="d-flex flex-wrap gap-2 mt-2">
                                    <span className="badge bg-secondary">{q.subject}</span>
                                    <span className="badge bg-info text-dark">{q.topic}</span>
                                    <span
                                        className={`badge ${q.difficulty === "Easy"
                                            ? "bg-success"
                                            : q.difficulty === "Medium"
                                                ? "bg-warning text-dark"
                                                : "bg-danger"
                                            }`}
                                    >
                                        {q.difficulty}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}




            <div className="d-flex justify-content-between align-items-center mt-3">
                <button
                    className="btn btn-outline-primary"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                >
                    Previous
                </button>
                <span>Page {currentPage}</span>
                <button
                    className="btn btn-outline-primary"
                    disabled={currentPage * itemsPerPage >= visibleQuestions.length}
                    onClick={() => setCurrentPage(p => p + 1)}
                >
                    Next
                </button>
            </div>


            <div className="text-center mt-4">
                <button className="btn btn-success px-4 py-2 rounded-pill" onClick={handleSubmitExam}>
                    <i className="fas fa-check me-2"></i>Create Exam with {selectedQuestions.length} Questions
                </button>
            </div>
        </div>
    );
};

export default GenerateQuestions;
