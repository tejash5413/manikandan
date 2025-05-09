import React, { useEffect, useState } from 'react';
import { adminDb as db } from '../../services/firebase';
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    doc
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaArrowLeft, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function ManageAssignments() {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [formData, setFormData] = useState({
        subject: '',
        title: '',
        duedate: '',
        description: '',
        link: '',
        postedon: '',
        status: '',
        class: '',
        batch: ''
    });
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const snapshot = await getDocs(collection(db, 'assignments'));
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAssignments(list);
        } catch (err) {
            toast.error("Failed to fetch assignments");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                const ref = doc(db, 'assignments', editId);
                await updateDoc(ref, formData);
                toast.success("Assignment updated");
            } else {
                await addDoc(collection(db, 'assignments'), formData);
                toast.success("Assignment added");
            }
            setFormData({ subject: '', title: '', duedate: '', description: '', link: '', postedon: '', status: '' });
            setEditId(null);
            fetchAssignments();
        } catch {
            toast.error("Failed to save assignment");
        }
    };

    const handleEdit = (assignment) => {
        setFormData(assignment);
        setEditId(assignment.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this assignment?")) return;
        try {
            await deleteDoc(doc(db, 'assignments', id));
            toast.info("Assignment deleted");
            fetchAssignments();
        } catch {
            toast.error("Failed to delete");
        }
    };
    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const classOptions = [
        ...Array.from({ length: 12 }, (_, i) => ({ value: `Class ${i + 1}`, label: `Class ${i + 1}` })),
        { value: "LT", label: "LT" },
        { value: "NEET Repeaters", label: "NEET Repeaters" },
        { value: "Crash Course", label: "Crash Course" },
        { value: "Integrated", label: "Integrated" },

    ];
    return (
        <div className="container py-5">
            <button className="btn btn-outline-danger mb-3" onClick={() => navigate('/admin-dashboard')}>
                <FaArrowLeft className="me-2" />Back to Dashboard
            </button>
            <h2 className="text-center text-primary mb-4 fw-bold">
                Manage Assignments
            </h2>

            <form className="card p-3 shadow-sm mb-4" onSubmit={handleSubmit}>
                <div className="row g-3">
                    <div className="col-md-4">
                        <label className="form-label">Subject/Exam</label>
                        <input name="subject" value={formData.subject} onChange={handleChange} className="form-control" placeholder="Subject/Exam" required />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Title</label>
                        <input name="title" value={formData.title} onChange={handleChange} className="form-control" placeholder="Title" required />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Due Date & Time</label>
                        <input
                            name="duedate"
                            value={formData.duedate}
                            onChange={handleChange}
                            type="datetime-local"
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Description</label>
                        <input name="description" value={formData.description} onChange={handleChange} className="form-control" placeholder="Description" required />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Link (Optional)</label>
                        <input name="link" value={formData.link} onChange={handleChange} className="form-control" placeholder="Link (Optional)" />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Posted On</label>
                        <input
                            name="postedon"
                            value={formData.postedon}
                            onChange={handleChange}
                            type="datetime-local"
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="form-select" required>
                            <option value="">-- Status --</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Class</label>
                        <select
                            className="form-select"
                            name="class"
                            value={formData.class}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Class</option>
                            {classOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Batch</label>
                        <input
                            name="batch"
                            value={formData.batch}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Batch"
                            required
                        />
                    </div>

                    <div className="col-md-4 text-end align-self-end">
                        <button className="btn btn-success w-100">
                            <FaPlus className="me-2" />{editId ? "Update" : "Add"}
                        </button>
                    </div>
                </div>

            </form>

            {loading ? (
                <div className="text-center">
                    <div className="spinner-border text-primary"></div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-striped align-middle">
                        <thead className="table-dark text-center">
                            <tr>
                                <th>#</th>
                                <th>Subject</th>
                                <th>Title</th>
                                <th>Due Date</th>
                                <th>Description</th>
                                <th>Link</th>
                                <th>Posted On</th>
                                <th>Status</th>
                                <th>Class</th>
                                <th>Batch</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.length === 0 ? (
                                <tr><td colSpan="9" className="text-center text-muted">No assignments found</td></tr>
                            ) : (
                                assignments.map((a, i) => (
                                    <tr key={a.id} className="text-center">
                                        <td>{i + 1}</td>
                                        <td>{a.subject}</td>
                                        <td>{a.title}</td>
                                        <td>{formatDate(a.duedate)}</td>
                                        <td>{a.description}</td>
                                        <td><a href={a.link} target="_blank" rel="noreferrer">View</a></td>
                                        <td>{formatDate(a.postedon)}</td>
                                        <td>{a.status}</td>
                                        <td>{a.class}</td>
                                        <td>{a.batch}</td>
                                        <td>
                                            <button className="btn btn-sm btn-info me-2" onClick={() => handleEdit(a)}><FaEdit /></button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.id)}><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ManageAssignments;
