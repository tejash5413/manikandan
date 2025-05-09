import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { adminDb as db } from '../../services/firebase';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNavigate } from 'react-router-dom';

const StudentsList = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingStudent, setEditingStudent] = useState(null);
    const [filters, setFilters] = useState({ class: '', batch: '', search: '' });
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const fetchStudents = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'students_list'));
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setStudents(data);
            setFilteredStudents(data);
            setLoading(false);
        } catch (error) {
            toast.error("❌ Failed to fetch students");
            console.error(error);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        let filtered = [...students];

        if (filters.class) {
            filtered = filtered.filter(s => s.class?.toLowerCase().includes(filters.class.toLowerCase()));
        }
        if (filters.batch) {
            filtered = filtered.filter(s => s.batch?.toLowerCase().includes(filters.batch.toLowerCase()));
        }
        if (filters.search) {
            filtered = filtered.filter(s => s.name?.toLowerCase().includes(filters.search.toLowerCase()));
        }

        setFilteredStudents(filtered);
    }, [filters, students]);

    const handleDelete = async (rollno) => {
        if (!window.confirm(`Delete student ${rollno}?`)) return;
        try {
            await deleteDoc(doc(db, 'students_list', rollno));
            toast.info(`🗑️ Deleted student ${rollno}`);
            fetchStudents();
        } catch (error) {
            toast.error("❌ Delete failed");
            console.error(error);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateDoc(doc(db, 'students_list', editingStudent.rollno), {
                name: editingStudent.name,
                class: editingStudent.class,
                batch: editingStudent.batch,
                password: editingStudent.password || ''
            });
            toast.success(`✅ Updated ${editingStudent.rollno}`);
            setEditingStudent(null);
            fetchStudents();
        } catch (error) {
            toast.error("❌ Update failed");
            console.error(error);
        }
    };

    const handleChange = (e) => {
        setEditingStudent({ ...editingStudent, [e.target.name]: e.target.value });
    };

    return (
        <div className="container py-4 mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="text-primary fw-bold">
                    <i className="fas fa-user-graduate me-2"></i>Student Accounts
                </h3>
                <span className="badge bg-dark fs-6">
                    <i className="fas fa-users me-1"></i>Total: {filteredStudents.length}
                </span>
            </div>
            <button
                type="button"
                className="btn btn-outline-secondary flex-fill rounded-pill"
                onClick={() => navigate('/admin-dashboard')}
            >
                <i className="fas fa-times me-2"></i>Back to Dashboard
            </button>
            {/* Filters */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <input
                        className="form-control"
                        placeholder="Search by name"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                </div>
                <div className="col-md-4">
                    <input
                        className="form-control"
                        placeholder="Filter by class (e.g., 12A)"
                        value={filters.class}
                        onChange={(e) => setFilters({ ...filters, class: e.target.value })}
                    />
                </div>
                <div className="col-md-4">
                    <input
                        className="form-control"
                        placeholder="Filter by batch (e.g., NEET2025)"
                        value={filters.batch}
                        onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
                    />
                </div>
            </div>

            {/* Student Table */}
            <div className="card shadow-sm border-0 rounded-4">
                <div className="card-body">
                    {loading ? (
                        <p className="text-center">Loading... <i className="fas fa-spinner fa-spin ms-2"></i></p>
                    ) : filteredStudents.length === 0 ? (
                        <p className="text-center text-muted">No students match the criteria.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover text-center align-middle">
                                <thead className="table-light text-uppercase small">
                                    <tr>
                                        <th>#</th>
                                        <th>Roll No</th>
                                        <th>Name</th>
                                        <th>Class</th>
                                        <th>Batch</th>
                                        <th>Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((s, idx) => (
                                        <tr key={s.rollno}>
                                            <td>{idx + 1}</td>
                                            <td className="fw-semibold">{s.rollno}</td>
                                            <td>{s.name}</td>
                                            <td>{s.class}</td>
                                            <td>{s.batch}</td>
                                            <td className="text-muted small">{s.email}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() => setEditingStudent({ ...s })}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(s.rollno)}
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-3">
                <button
                    className="btn btn-outline-primary"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                >
                    <i className="fas fa-chevron-left me-1"></i> Previous
                </button>

                <span className="fw-semibold">Page {currentPage}</span>

                <button
                    className="btn btn-outline-primary"
                    disabled={currentPage * itemsPerPage >= filteredStudents.length}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                >
                    Next <i className="fas fa-chevron-right ms-1"></i>
                </button>
            </div>
            {/* Edit Modal */}
            {editingStudent && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title"><i className="fas fa-pen me-2"></i>Edit Student</h5>
                                    <button type="button" className="btn-close" onClick={() => setEditingStudent(null)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-2">
                                        <label className="form-label">Roll No</label>
                                        <input type="text" className="form-control" value={editingStudent.rollno} readOnly />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Name</label>
                                        <input type="text" className="form-control" name="name" value={editingStudent.name} onChange={handleChange} />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Class</label>
                                        <select
                                            className="form-select"
                                            name="class"
                                            value={editingStudent.class}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Class</option>
                                            {[
                                                ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`),
                                                "LT", "NEET Repeaters", "Crash Course", "Integrated"
                                            ].map((cls, idx) => (
                                                <option key={idx} value={cls}>{cls}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Batch</label>
                                        <input type="text" className="form-control" name="batch" value={editingStudent.batch} onChange={handleChange} />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Password (for reference only)</label>
                                        <input type="text" className="form-control" name="password" value={editingStudent.password || ''} onChange={handleChange} />
                                        <small className="text-muted">Note: This won’t change login password.</small>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setEditingStudent(null)}>Cancel</button>
                                    <button type="submit" className="btn btn-success">
                                        <i className="fas fa-save me-1"></i>Update
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentsList;
