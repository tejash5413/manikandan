import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    doc
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaCloudDownloadAlt, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';

function ManageApplications() {
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '', course: '', accommodation: '' });
    const [editId, setEditId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'applications'));
                const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setApplications(apps);
                setFilteredApplications(apps);
            } catch (err) {
                console.error("Error loading applications:", err);
                toast.error("Failed to fetch applications");
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    useEffect(() => {
        const filtered = applications.filter(app =>
            Object.values(app).some(val =>
                val?.toString().toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
        setFilteredApplications(filtered);
    }, [searchQuery, applications]);

    const handleInputChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                const ref = doc(db, 'applications', editId);
                await updateDoc(ref, formData);
                toast.success("Application updated!");
            } else {
                await addDoc(collection(db, 'applications'), { ...formData, date: new Date().toISOString() });
                toast.success("Application added!");
            }
            setFormData({ name: '', phone: '', email: '', address: '', course: '', accommodation: '' });
            setEditId(null);
            const snapshot = await getDocs(collection(db, 'applications'));
            const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setApplications(apps);
        } catch (err) {
            console.error("Submit error:", err);
            toast.error("Failed to submit application");
        }
    };

    const handleEdit = (app) => {
        setFormData(app);
        setEditId(app.id);
    };

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'applications', id));
            setApplications(prev => prev.filter(app => app.id !== id));
            toast.success("Application deleted");
        } catch (err) {
            console.error("Delete error:", err);
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
    const csvHeaders = [
        { label: "Name", key: "name" },
        { label: "Phone", key: "phone" },
        { label: "Email", key: "email" },
        { label: "Address", key: "address" },
        { label: "Course", key: "course" },
        { label: "Accommodation", key: "accommodation" },
        { label: "Submitted On", key: "submittedAt" }
    ];
    return (
        <div className="container py-5">
            <button className="btn btn-outline-danger mb-3" onClick={() => navigate('/admin-dashboard/manage-center')}>
                <FaArrowLeft className="me-2" />Back to Manage Center
            </button>
            <h2 className="text-center text-primary mb-4 fw-bold">
                <FaFilter className="me-2" />Manage Student Applications
            </h2>

            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <input type="text" className="form-control" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />

                </div>
            </div>

            <form className="card p-3 shadow-sm mb-4" onSubmit={handleSubmit}>
                <div className="row g-3">
                    <div className="col-md-4"><input name="name" value={formData.name} onChange={handleInputChange} className="form-control" placeholder="Name" required /></div>
                    <div className="col-md-4"><input name="phone" value={formData.phone} onChange={handleInputChange} className="form-control" placeholder="Phone" required /></div>
                    <div className="col-md-4"><input name="email" value={formData.email} onChange={handleInputChange} className="form-control" placeholder="Email" required /></div>
                    <div className="col-md-6"><input name="address" value={formData.address} onChange={handleInputChange} className="form-control" placeholder="Address" /></div>
                    <div className="col-md-3">
                        <select name="course" value={formData.course} onChange={handleInputChange} className="form-select">
                            <option value="">Select Course</option>
                            <option>NEET Foundation Batch</option>
                            <option>NEET Crash Course</option>
                            <option>Repeater Batch</option>
                            <option>Medical Entrance Batch</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <select name="accommodation" value={formData.accommodation} onChange={handleInputChange} className="form-select">
                            <option value="">Accommodation</option>
                            <option>Day Scholar</option>
                            <option>Hosteller</option>
                        </select>
                    </div>
                </div>
                <div className="text-end mt-3">
                    <button className="btn btn-success">
                        <FaPlus className="me-2" />{editId ? "Update" : "Add"}
                    </button>
                </div>

            </form>
            <div className="text-end mb-3">
                <CSVLink
                    data={filteredApplications}
                    headers={csvHeaders}
                    filename={"applications_export.csv"}
                    className="btn btn-outline-primary"
                >
                    <FaCloudDownloadAlt className="me-2" />
                    Download CSV
                </CSVLink>
            </div>
            {loading ? (
                <div className="text-center">
                    <div className="spinner-border text-primary"></div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle">
                        <thead className="table-dark text-center">
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Address</th>
                                <th>Course</th>
                                <th>Accommodation</th>
                                <th>Actions</th>
                                <th>Enquiry On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.length === 0 ? (
                                <tr><td colSpan="8" className="text-center ">No Applications Found</td></tr>
                            ) : (
                                filteredApplications.map((app, idx) => (
                                    <tr key={app.id} className="text-center">
                                        <td>{idx + 1}</td>
                                        <td>{app.name}</td>
                                        <td>{app.phone}</td>
                                        <td>{app.email}</td>
                                        <td>{app.address}</td>
                                        <td>{app.course}</td>
                                        <td>{app.accommodation}</td>

                                        <td>
                                            <button className="btn btn-sm btn-info me-2" onClick={() => handleEdit(app)}><FaEdit /></button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(app.id)}><FaTrash /></button>
                                        </td>
                                        <td>{formatDate(app.submittedAt)}</td>

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

export default ManageApplications;