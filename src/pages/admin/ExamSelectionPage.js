import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, query, where, deleteDoc } from 'firebase/firestore';
import { adminDb as db } from '../../services/firebase'; // ✅ Use admin Firestore
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ExamSelectionPage = () => {
    const [exams, setExams] = useState([]);
    const navigate = useNavigate();
    const [selectedClass, setSelectedClass] = useState("All");

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'exams'));
                const examList = querySnapshot.docs.map(docSnap => ({
                    id: docSnap.id,
                    ...docSnap.data()
                }));
                setExams(examList);
            } catch (error) {
                toast.error('❌ Failed to load exams');
                console.error(error);
            }
        };

        fetchExams();
    }, []);

    const handleStatusChange = async (examId, newStatus) => {
        try {
            const examRef = doc(db, 'exams', examId);
            await updateDoc(examRef, { Status: newStatus });

            setExams(prev =>
                prev.map(exam =>
                    exam.id === examId ? { ...exam, Status: newStatus } : exam
                )
            );
            toast.success(`✅ Status updated to ${newStatus}`);
        } catch (error) {
            console.error(error);
            toast.error('❌ Failed to update status');
        }
    };
    const handleDeleteExam = async (examId, title) => {
        if (!window.confirm(`Are you sure you want to delete the exam "${title}"? This will also delete related results.`)) return;

        try {
            // 1. Delete the exam document
            await deleteDoc(doc(db, 'exams', examId));

            // 2. Find and delete all results with that examTitle
            const resultQuery = query(collection(db, 'results'), where('examTitle', '==', title));
            const resultSnapshot = await getDocs(resultQuery);

            const deletePromises = resultSnapshot.docs.map(resultDoc =>
                deleteDoc(doc(db, 'results', resultDoc.id))
            );
            await Promise.all(deletePromises);

            // 3. Remove exam from local state
            setExams(prev => prev.filter(e => e.id !== examId));

            toast.success(`🗑️ Exam "${title}" and related results deleted successfully.`);
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("❌ Failed to delete exam and/or results.");
        }
    };
    return (
        <div className="container py-5">
            <h3 className="text-primary mb-4"><i className="fas fa-list-ul me-2"></i>Select or Create Exam</h3>
            <button className="btn btn-warning mb-4" onClick={() => navigate('/admin-dashboard')}>
                <i className="fas fa-arrow-left me-1"></i> Back
            </button>
            <button className="btn btn-success mb-4 ms-2" onClick={() => navigate('/admin-dashboard/create-exams')}>
                <i className="fas fa-plus me-2"></i>Create New Exam
            </button>
            <button className="btn btn-outline-dark mb-4 ms-2" onClick={() => navigate('/admin-dashboard/generate-paper')}>
                <i className="fas fa-file-alt me-2"></i> Generate Paper
            </button>
            <div className="mb-4">
                <label className="form-label fw-bold me-2">Filter by Class:</label>
                <select
                    className="form-select w-auto d-inline-block"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                >
                    <option value="All">All</option>
                    {[...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`), "LT", "NEET Repeaters", "Crash Course", "Integrated"]
                        .map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                        ))
                    }
                </select>
            </div>
            <h5>Existing Exams:</h5>
            {exams.length === 0 ? (
                <p>No exams found.</p>
            ) : (
                <ul className="list-group ">
                    {exams.filter((exam) => {
                        if (selectedClass === "All") return true;
                        return exam.AllowedClass?.includes(selectedClass);
                    })
                        .map((exam) => (
                            <li key={exam.id} className="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                                <div className="flex-grow-1 me-3">
                                    <strong>{exam.Title}</strong><br />
                                    <small>
                                        <i className="fas fa-calendar-alt me-1"></i> {exam.Date || 'N/A'} &nbsp;
                                        <i className="fas fa-clock me-1"></i> {exam.Time || 'N/A'} &nbsp;
                                        <i className="fas fa-stopwatch me-1"></i> {exam.Duration} mins &nbsp;|&nbsp;
                                        <i className="fas fa-question me-1"></i> {exam.Questions?.length || 0} Questions <br />
                                        <i className="fas fa-users me-1 mt-1"></i> <strong>Allowed Classes:</strong>
                                        <span className="ms-1">
                                            {exam.AllowedClass && exam.AllowedClass.length > 0
                                                ? exam.AllowedClass.join(", ")
                                                : "All"}
                                        </span>
                                    </small>
                                    <div className="mt-2">
                                        <label className="me-2"><strong>Status:</strong></label>
                                        <select
                                            className={`form-select form-select-sm d-inline-block w-auto ${exam.Status === 'Published' ? 'border-success text-success' :
                                                exam.Status === 'Auto-Publish' ? 'border-warning text-warning' :
                                                    'border-secondary'
                                                }`} value={exam.Status || 'Draft'}
                                            onChange={(e) => handleStatusChange(exam.id, e.target.value)}
                                        >
                                            <option value="Draft">Draft</option>
                                            <option value="Published">Published</option>
                                            <option value="Auto-Publish">Auto-Publish</option> {/* ✅ Add this line */}

                                        </select>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-outline-primary mt-2"
                                    onClick={() => navigate(`/admin-dashboard/create-exams?id=${exam.id}`)}
                                >
                                    <i className="fas fa-pen me-1"></i> Continue
                                </button>

                                <button
                                    className="btn btn-outline-danger mt-2"
                                    onClick={() => handleDeleteExam(exam.id, exam.Title)}
                                >
                                    <i className="fas fa-trash me-1"></i> Delete
                                </button>
                            </li>
                        ))}

                </ul>
            )}
        </div>
    );
};

export default ExamSelectionPage;
