import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { toast } from 'react-toastify';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx5RL4Ke5ktuMbzEJ88Hy6U-8VOX514Su9dTxZjOmEME47G3Yc5ZFR30hzCCAHb8wDJsA/exec";

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
        status: ''
    });
    const [editIndex, setEditIndex] = useState(null);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        AOS.init({ duration: 1000 });
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const res = await fetch(`${GOOGLE_SCRIPT_URL}?type=assignments`);
            const data = await res.json();
            setAssignments(data);
        } catch (err) {
            toast.error("Failed to load assignments");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const action = editIndex !== null ? "editAssignment" : "addAssignment";

        const payload = {
            action,
            ...formData,

            id: editingId
        };

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',

                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            toast.success(editIndex !== null ? "Assignment updated!" : "Assignment added!");
            setFormData({
                subject: '',
                title: '',
                duedate: '',
                description: '',
                link: '',
                postedon: '',
                status: ''
            });
            setEditIndex(null);
            setEditingId(null);
            fetchAssignments();
        } catch {
            toast.error("Submission failed");
        }
    };
    const formatDateToDDMMYYYY = (inputDate) => {
        const [yyyy, mm, dd] = inputDate.split("-");
        return `${dd}-${mm}-${yyyy}`;
    };
    const handleEdit = (index) => {
        const a = assignments[index];


        setFormData({
            subject: a["subjectexam"] || '',
            title: a.title || '',
            duedate: a.duedate,
            description: a.description || '',
            link: a.link || '',
            postedon: a.postedon,
            status: a.status || '',
            id: a.id || ''
        });

        setEditIndex(index);
        setEditingId(a.id);
    };



    const handleDelete = async (index) => {
        const id = assignments[index].id;
        if (!window.confirm("Delete this assignment?")) return;

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "deleteAssignment", id })
            });
            toast.info("Assignment deleted");
            fetchAssignments();
        } catch {
            toast.error("Delete failed");
        }
    };
    function formatDate(inputDate) {
        if (!inputDate) return '';

        const dateObj = new Date(inputDate);

        if (isNaN(dateObj)) {
            return inputDate; // If already text like 29-04-2025
        }

        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();

        return `${day}-${month}-${year}`;
    }
    return (
        <div className="container py-5">
            <div className="text-center mb-4">
                <button
                    className="btn btn-outline-danger"
                    onClick={() => navigate('/admin-dashboard')}
                >
                    ← Back to Dashboard
                </button></div>
            <h2 className="text-center text-primary mb-5" data-aos="fade-down">Manage Assignments</h2>
            <form className="row g-3 mb-5" onSubmit={handleSubmit} data-aos="fade-up">
                <div className="col-md-4">
                    <input className="form-control" name="subject" placeholder="Subject/Exam" value={formData.subject} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                    <input className="form-control" name="title" placeholder="Assignment Title" value={formData.title} onChange={handleChange} required />
                </div>

                <div className="col-md-4">
                    <input className="form-control" type="date" placeholder="Due Date" name="duedate" value={formData.duedate} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                    <input className="form-control" name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                    <input className="form-control" name="link" placeholder="Assignment Link" value={formData.link} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                    <input className="form-control" type="date" placeholder="PostedOn" name="postedon" value={formData.postedon} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                    <select className="form-select" name="status" value={formData.status} onChange={handleChange} required>
                        <option value="">-- Status --</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
                <div className="col-md-4 text-center">
                    <button type="submit" className="btn btn-primary px-4 mt-2">{editIndex !== null ? "Update" : "Add"}</button>
                </div>
            </form>

            <div className="table-responsive" data-aos="fade-up" data-aos-delay="200">
                <table className="table table-bordered text-center">
                    <thead className="table-secondary">
                        <tr>
                            <th>#</th>
                            <th>Subject/Exam</th>
                            <th>Title</th>
                            <th>DueDate</th>
                            <th>Description</th>
                            <th>Link</th>
                            <th>PostedOn</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assignments.length === 0 ? (
                            <tr><td colSpan="9">No assignments found</td></tr>
                        ) : (
                            assignments.map((item, i) => (
                                <tr key={i}>
                                    <td>{i + 1}</td>
                                    <td>{item.subjectexam}</td>
                                    <td>{item.title}</td>
                                    <td>{formatDate(item.duedate)}</td>
                                    <td>{item.description}</td>
                                    <td><a href={item.link} target="_blank" rel="noreferrer">View</a></td>
                                    <td>{formatDate(item.postedon)}</td>
                                    <td>{item.status}</td>
                                    <td>
                                        <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(i)}>Edit</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(i)}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ManageAssignments;
