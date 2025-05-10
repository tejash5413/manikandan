import React, { useState, useEffect } from "react";
import {
    addDoc,
    collection,
    getDocs,
    doc,
    updateDoc
} from "firebase/firestore";
import {
    ref,
    uploadBytes,
    getDownloadURL
} from "firebase/storage";

import {
    adminDb as db,
    adminStorage as storage
} from "../../services/firebase"; // ✅ Import admin instances here

import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import LiveLatexInput from './LiveLatexInput';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from 'xlsx';
import Select from 'react-select';


const CreateExamForm = () => {
    const navigate = useNavigate();
    const [previewQuestions, setPreviewQuestions] = useState([]);

    const [examDocId, setExamDocId] = useState(null);
    const location = useLocation();

    const [formData, setFormData] = useState({
        Title: "",
        Duration: "",
        MarksPerCorrect: 4,
        MarksPerWrong: -1,
        TotalQuestions: 0,
        SubjectWiseCounts: {},
        Questions: [],
        Date: "",    // 🆕 New
        Time: "",
        Status: "Draft",
        AllowedClass: [],// ✅ now an array

    });
    const handleExcelUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const workbook = XLSX.read(bstr, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet);

            const parsedQuestions = data.map((row) => ({
                q: row.Question || "",
                options: [row.Option1, row.Option2, row.Option3, row.Option4].filter(Boolean),
                answer: row.Answer || "",
                subject: row.Subject || "General",
                topic: row.Topic || "Untitled",
                image: "", // default if not provided
            }));
            setPreviewQuestions(parsedQuestions); // 👈 This is the line

            setFormData((prev) => ({
                ...prev,
                Questions: [...prev.Questions, ...parsedQuestions]
            }));

            toast.success(`✅ ${parsedQuestions.length} questions imported`);
        };

        reader.readAsBinaryString(file);
    };
    const customSelectStyles = {
        control: (provided) => ({
            ...provided,
            borderRadius: '10px',
            borderColor: '#0d6efd',
            boxShadow: 'none',
            padding: '2px 4px',
            fontSize: '0.95rem',
            minHeight: '42px'
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#0d6efd22',
            borderRadius: '8px',
            padding: '2px 6px'
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: '#0d6efd',
            fontWeight: '500',
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: '#0d6efd',
            ':hover': {
                backgroundColor: '#0d6efd33',
                color: '#0a58ca'
            }
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? '#0d6efd'
                : state.isFocused
                    ? '#e9f3ff'
                    : 'white',
            color: state.isSelected ? 'white' : '#333',
            padding: 10,
            borderRadius: '5px',
            margin: '2px 4px'
        }),
    };

    const [questionInput, setQuestionInput] = useState({
        q: "",
        options: ["", "", "", ""],
        answer: "",
        image: "",
        subject: "",
        topic: "",
    });

    const [editIndex, setEditIndex] = useState(null);
    const [filterSubject, setFilterSubject] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const handleSubmitExam = async () => {
        if (!formData.Title || !formData.Date || !formData.Time || formData.Questions.length === 0) {
            toast.warning("❗ Please fill all fields and add at least one question.");
            return;
        }
        if (!formData.AllowedClass || formData.AllowedClass.length === 0) {
            toast.error("❌ Please select at least one allowed class.");
            return;
        }
        try {
            if (examDocId) {
                await updateDoc(doc(db, "exams", examDocId), {
                    ...formData,
                });
                toast.success("✅ Exam updated successfully.");
            } else {
                const newDoc = await addDoc(collection(db, "exams"), {
                    ...formData,
                    createdAt: new Date(),
                });
                setExamDocId(newDoc.id);
                toast.success("✅ Exam created successfully.");
            }
            navigate("/admin-dashboard/select-exam");
        } catch (err) {
            console.error("Submit Error:", err);
            toast.error("❌ Failed to save exam.");
        }
    };
    useEffect(() => {
        const fetchExamData = async () => {
            try {
                const searchParams = new URLSearchParams(location.search);
                const selectedExamId = searchParams.get("id");

                if (!selectedExamId) {
                    // 🔧 No ID means fresh creation
                    setExamDocId(null);
                    setFormData({
                        Title: "",
                        Duration: "",
                        MarksPerCorrect: 4,
                        MarksPerWrong: -1,
                        TotalQuestions: 0,
                        SubjectWiseCounts: {},
                        Questions: [],
                        AllowedClass: [],
                    });
                    toast.info("🆕 Creating new exam...");
                    return;
                }

                const querySnapshot = await getDocs(collection(db, "exams"));
                const examDocs = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                const examToLoad = examDocs.find(e => e.id === selectedExamId);
                if (!examToLoad) {
                    toast.error("❌ Exam not found.");
                    return;
                }
                // 🕒 Auto-publish logic
                if (examToLoad.Status === "Auto-Publish") {
                    const scheduledTime = new Date(`${examToLoad.Date}T${examToLoad.Time}`);
                    if (new Date() >= scheduledTime) {
                        await updateDoc(doc(db, "exams", examToLoad.id), { Status: "Published" });
                        examToLoad.Status = "Published";
                    }
                }
                setExamDocId(examToLoad.id);
                setFormData({
                    Title: examToLoad.Title,
                    Duration: examToLoad.Duration,
                    MarksPerCorrect: examToLoad.MarksPerCorrect,
                    MarksPerWrong: examToLoad.MarksPerWrong,
                    TotalQuestions: examToLoad.TotalQuestions || 0,
                    SubjectWiseCounts: examToLoad.SubjectWiseCounts || {},
                    Questions: examToLoad.Questions || [],
                    Status: examToLoad.Status || "Draft", // <-- Add this line
                    AllowedClass: examToLoad.AllowedClass || [], // ✅ Now this is properly handled
                    Date: examToLoad.Date || "",
                    Time: examToLoad.Time || ""
                });

                toast.success(`📥 Loaded exam: ${examToLoad.Title}`);
            } catch (error) {
                toast.error("❌ Failed to fetch exam.");
                console.error(error);
            }
        };

        fetchExamData();
    }, [location.search]);


    const handleOptionChange = (index, value) => {
        const updated = [...questionInput.options];
        updated[index] = value;
        setQuestionInput({ ...questionInput, options: updated });
    };

    const handleAddOrUpdateQuestion = async () => {
        if (!questionInput.q && !questionInput.image) {
            toast.error("Provide either question text or image.");
            return;
        }
        if (!questionInput.answer || !questionInput.subject) {
            toast.warning("Answer and Subject are required.");
            return;
        }

        const currentSubject = questionInput.subject.trim();
        const subjectLimit = formData.SubjectWiseCounts?.[currentSubject];
        const currentCount = formData.Questions.filter(q => q.subject === currentSubject).length;

        if (subjectLimit && currentCount >= subjectLimit && editIndex === null) {
            toast.warning(`🚫 You have already added ${subjectLimit} questions for ${currentSubject}`);
            return;
        }

        let imageURL = questionInput.image;

        if (imageURL.startsWith("blob:")) {
            try {
                const blob = await fetch(imageURL).then((r) => r.blob());
                const storageRef = ref(storage, `questions/${Date.now()}.png`);
                await uploadBytes(storageRef, blob);
                imageURL = await getDownloadURL(storageRef);
            } catch (err) {
                toast.error("❌ Image upload failed.");
                console.error(err);
                return;
            }
        }

        const updatedQuestion = { ...questionInput, image: imageURL };
        const updatedQuestions = [...formData.Questions];

        if (editIndex !== null) {
            updatedQuestions[editIndex] = updatedQuestion;
            toast.success("✅ Question updated.");
        } else {
            updatedQuestions.push(updatedQuestion);
            toast.success("✅ Question added.");
        }

        setFormData({ ...formData, Questions: updatedQuestions });

        if (examDocId) {
            await updateDoc(doc(db, "exams", examDocId), {
                Questions: updatedQuestions,
            });
        } else {
            const newDoc = await addDoc(collection(db, "exams"), {
                ...formData,
                Questions: updatedQuestions,
            });
            setExamDocId(newDoc.id);
        }

        setQuestionInput({ q: "", options: ["", "", "", ""], answer: "", image: "", subject: "", topic: "" });
        setEditIndex(null);
    };

    const handleEditQuestion = (index) => {
        setQuestionInput(formData.Questions[index]);
        setEditIndex(index);
    };

    const handleDeleteQuestion = async (index) => {
        if (!window.confirm("Delete this question?")) return;
        const filtered = formData.Questions.filter((_, i) => i !== index);
        setFormData({ ...formData, Questions: filtered });
        toast.info("🗑️ Question deleted.");
        if (examDocId) {
            await updateDoc(doc(db, "exams", examDocId), {
                ...formData,
                Questions: filtered,
            });
        }
    };

    const filteredQuestions = formData.Questions.filter(q =>
        !filterSubject || q.subject.toLowerCase().includes(filterSubject.toLowerCase())
    );

    const paginatedQuestions = filteredQuestions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="container py-4 mt-4">
            <button className="btn btn-outline-secondary" onClick={() => navigate('/admin-dashboard/select-exam')}>
                <i className="fas fa-arrow-left me-1"></i> Back
            </button>
            <h3 className="text-primary mb-4"><i className="fas fa-plus-circle me-2"></i>Create New Exam</h3>

            <div className="mb-3">
                <label className="form-label">Exam Title</label>
                <input type="text" className="form-control" value={formData.Title} onChange={(e) => setFormData({ ...formData, Title: e.target.value })} />
            </div>
            <div className="mb-3">
                <label className="form-label fw-bold">Allowed Classes:</label>
                <Select
                    isMulti
                    options={[
                        ...Array.from({ length: 12 }, (_, i) => ({ value: `Class ${i + 1}`, label: `Class ${i + 1}` })),
                        { value: "LT", label: "LT" },
                        { value: "NEET Repeaters", label: "NEET Repeaters" },
                        { value: "Crash Course", label: "Crash Course" },
                        { value: "Integrated", label: "Integrated" }
                    ]}
                    value={formData.AllowedClass.map(cls => ({ value: cls, label: cls }))}
                    onChange={(selected) => {
                        const updated = selected.map(item => item.value);
                        setFormData((prev) => ({ ...prev, AllowedClass: updated }));
                    }}
                    placeholder="Select allowed classes..."
                    styles={customSelectStyles}
                    classNamePrefix="select"
                />
            </div>


            <div className="row mb-3">
                <div className="col">
                    <label className="form-label">Exam Date</label>
                    <input type="date" className="form-control"
                        value={formData.Date}
                        onChange={(e) => setFormData({ ...formData, Date: e.target.value })}
                    />
                </div>
                <div className="col">
                    <label className="form-label">Exam Time</label>
                    <input type="time" className="form-control"
                        value={formData.Time}
                        onChange={(e) => setFormData({ ...formData, Time: e.target.value })}
                    />
                </div>
            </div>
            <div className="mb-3">
                <label className="form-label">Duration (minutes)</label>
                <input type="number" className="form-control" value={formData.Duration} onChange={(e) => setFormData({ ...formData, Duration: e.target.value })} />
            </div>

            <div className="row mb-3">
                <div className="col">
                    <label className="form-label">Marks for Correct</label>
                    <input type="number" className="form-control" value={formData.MarksPerCorrect} onChange={(e) => setFormData({ ...formData, MarksPerCorrect: Number(e.target.value) })} />
                </div>
                <div className="col">
                    <label className="form-label">Marks for Wrong</label>
                    <input type="number" className="form-control" value={formData.MarksPerWrong} onChange={(e) => setFormData({ ...formData, MarksPerWrong: Number(e.target.value) })} />
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label">Total Questions</label>
                <input type="number" className="form-control" value={formData.TotalQuestions} onChange={(e) => setFormData({ ...formData, TotalQuestions: Number(e.target.value) })} />
            </div>

            <div className="mb-3">
                <label className="form-label">Subject-wise Question Count</label>
                <textarea
                    className="form-control"
                    placeholder="Physics:10\nChemistry:10\nBiology:20"
                    rows={3}
                    onChange={(e) => {
                        const lines = e.target.value.split('\n');
                        const counts = {};
                        lines.forEach(line => {
                            const [subject, count] = line.split(':');
                            if (subject && count) counts[subject.trim()] = Number(count.trim());
                        });
                        setFormData({ ...formData, SubjectWiseCounts: counts });
                    }}
                />
            </div>
            <div className="mb-4">
                <label className="form-label fw-bold">Bulk Upload Questions (Excel)</label>
                <input
                    type="file"
                    accept=".xlsx"
                    className="form-control"
                    onChange={handleExcelUpload}
                />
            </div>
            {previewQuestions.length > 0 && (
                <div className="mt-4">
                    <h5 className="fw-bold text-primary mb-3">📝 Edit Imported Questions Before Adding</h5>

                    {previewQuestions.map((q, idx) => (
                        <div key={idx} className="card mb-3 shadow-sm">
                            <div className="card-body">
                                <div className="mb-2">
                                    <label className="form-label fw-bold">Q{idx + 1}:</label>
                                    <textarea
                                        className="form-control"
                                        value={q.q}
                                        onChange={(e) => {
                                            const updated = [...previewQuestions];
                                            updated[idx].q = e.target.value;
                                            setPreviewQuestions(updated);
                                        }}
                                    />
                                </div>

                                {q.options.map((opt, optIdx) => (
                                    <div key={optIdx} className="mb-2">
                                        <label className="form-label">Option {optIdx + 1}</label>
                                        <input
                                            className="form-control"
                                            value={opt}
                                            onChange={(e) => {
                                                const updated = [...previewQuestions];
                                                updated[idx].options[optIdx] = e.target.value;
                                                setPreviewQuestions(updated);
                                            }}
                                        />
                                    </div>
                                ))}

                                <div className="mb-2">
                                    <label className="form-label">Answer</label>
                                    <input
                                        className="form-control"
                                        value={q.answer}
                                        onChange={(e) => {
                                            const updated = [...previewQuestions];
                                            updated[idx].answer = e.target.value;
                                            setPreviewQuestions(updated);
                                        }}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="form-label">Subject</label>
                                    <input
                                        className="form-control"
                                        value={q.subject}
                                        onChange={(e) => {
                                            const updated = [...previewQuestions];
                                            updated[idx].subject = e.target.value;
                                            setPreviewQuestions(updated);
                                        }}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="form-label">Topic</label>
                                    <input
                                        className="form-control"
                                        value={q.topic}
                                        onChange={(e) => {
                                            const updated = [...previewQuestions];
                                            updated[idx].topic = e.target.value;
                                            setPreviewQuestions(updated);
                                        }}
                                    />
                                </div>

                                <div className="text-end">
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => {
                                            const updated = previewQuestions.filter((_, i) => i !== idx);
                                            setPreviewQuestions(updated);
                                        }}
                                    >
                                        <i className="fas fa-trash me-1"></i> Delete Question
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        className="btn btn-success mt-3"
                        onClick={() => {
                            setFormData(prev => ({
                                ...prev,
                                Questions: [...prev.Questions, ...previewQuestions]
                            }));
                            setPreviewQuestions([]);
                            toast.success("✅ Questions added to exam form");
                        }}
                    >
                        ✅ Add All to Exam
                    </button>
                </div>
            )}

            <hr />
            <h5>{editIndex !== null ? "Edit Question" : "Add Question"}</h5>

            <LiveLatexInput value={questionInput.q} onChange={(val) => setQuestionInput({ ...questionInput, q: val })} placeholder="Enter Question (LaTeX supported)" />

            <textarea
                className="form-control mb-2"
                placeholder="Paste an image or enter image URL"
                value={questionInput.image?.startsWith("blob:") ? "" : questionInput.image}
                onChange={(e) => setQuestionInput({ ...questionInput, image: e.target.value })}
                onPaste={(e) => {
                    const item = [...e.clipboardData.items].find(i => i.type.includes("image"));
                    if (item) {
                        const blob = item.getAsFile();
                        const localURL = URL.createObjectURL(blob);
                        setQuestionInput({ ...questionInput, image: localURL });
                        toast.info("🖼️ Image pasted (will upload on Add).");
                        e.preventDefault();
                    }
                }}
            />

            {questionInput.image && (
                <div className="mt-2">
                    <img src={questionInput.image} alt="Preview" className="img-fluid rounded border" />
                    <button className="btn btn-sm btn-outline-danger mt-2" onClick={() => setQuestionInput({ ...questionInput, image: "" })}>
                        <i className="fas fa-times me-1"></i> Remove Image
                    </button>
                </div>
            )}

            {questionInput.options.map((opt, i) => (
                <LiveLatexInput key={i} value={opt} onChange={(val) => handleOptionChange(i, val)} placeholder={`Option ${i + 1}`} />
            ))}

            <LiveLatexInput value={questionInput.answer} onChange={(val) => setQuestionInput({ ...questionInput, answer: val })} placeholder="Correct Answer" />
            <input type="text" className="form-control mb-2" placeholder="Subject" value={questionInput.subject} onChange={(e) => setQuestionInput({ ...questionInput, subject: e.target.value })} />
            <input type="text" className="form-control mb-3" placeholder="Topic" value={questionInput.topic} onChange={(e) => setQuestionInput({ ...questionInput, topic: e.target.value })} />

            <button type="button" className="btn btn-outline-primary me-2" onClick={handleAddOrUpdateQuestion}>
                <i className="fas fa-plus me-1"></i>{editIndex !== null ? "Update" : "Add"} Question
            </button>

            {editIndex !== null && (
                <button className="btn btn-outline-secondary" onClick={() => {
                    setQuestionInput({ q: "", options: ["", "", "", ""], answer: "", image: "", subject: "", topic: "" });
                    setEditIndex(null);
                    toast.info("Edit cancelled.");
                }}>Cancel Edit</button>
            )}

            <div className="mt-4">
                <input className="form-control mb-2" placeholder="Filter by Subject" value={filterSubject} onChange={(e) => {
                    setFilterSubject(e.target.value);
                    setCurrentPage(1);
                }} />
                <h6>Questions Added: {filteredQuestions.length}</h6>
                {formData.SubjectWiseCounts && Object.entries(formData.SubjectWiseCounts).map(([subj, max]) => {
                    const count = formData.Questions.filter(q => q.subject === subj).length;
                    return (
                        <div key={subj}><strong>{subj}:</strong> {count} / {max}</div>
                    );
                })}
            </div>

            {paginatedQuestions.map((q, idx) => (
                <div key={idx} className="card p-3 mb-3">
                    <div className="d-flex justify-content-between">
                        <strong>Q{(currentPage - 1) * itemsPerPage + idx + 1}</strong>
                        <div>
                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditQuestion(formData.Questions.indexOf(q))}><i className="fas fa-edit"></i></button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteQuestion(formData.Questions.indexOf(q))}><i className="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <div className="mt-2">{q.q && <Latex>{q.q}</Latex>}</div>
                    {q.image && <img src={q.image} alt="q" className="img-fluid mt-2 rounded" />}
                    <ul className="mt-2">{q.options.map((opt, i) => <li key={i}><Latex>{opt}</Latex></li>)}</ul>
                    <p><strong>Answer:</strong> <Latex>{q.answer}</Latex></p>
                    <p><strong>Subject:</strong> {q.subject} | <strong>Topic:</strong> {q.topic}</p>
                </div>
            ))}
            <div className="mb-3">
                <label className="form-label">Status</label>
                <select
                    className="form-control"
                    value={formData.Status || 'Draft'}
                    onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
                >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Auto-Publish">Auto-Publish</option>
                </select>
            </div>
            <div className="text-center mt-4">
                <button className="btn btn-success px-4 py-2 rounded-pill" onClick={handleSubmitExam}>
                    <i className="fas fa-save me-2"></i>Submit Exam
                </button>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-3">
                <button className="btn btn-outline-primary" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
                <span>Page {currentPage}</span>
                <button className="btn btn-outline-primary" disabled={currentPage * itemsPerPage >= filteredQuestions.length} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
            </div>
        </div>
    );
};

export default CreateExamForm;
