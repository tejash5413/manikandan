import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { studentDb as db, studentAuth as auth } from '../../services/firebase'; // ✅ use student context
import { toast } from 'react-toastify';
import { FaExternalLinkAlt, FaBookOpen, FaCalendarAlt, FaClipboardList, FaClock } from 'react-icons/fa';
import { BsPatchCheckFill } from 'react-icons/bs';


function Assignments() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusMap, setStatusMap] = useState({});
    const navigate = useNavigate();
    const studentClass = localStorage.getItem("studentClass");
    const user = auth.currentUser;
    useEffect(() => {
        AOS.init({ duration: 1000 });
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const assignmentSnap = await getDocs(collection(db, 'assignments'));
            const filtered = assignmentSnap.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(item => item.class === studentClass);

            setAssignments(filtered);

            // Fetch per-assignment status for the current student
            const statusObj = {};
            for (const a of filtered) {
                const statusDoc = await getDoc(doc(db, 'assignment_status', `${user.uid}_${a.id}`));
                if (statusDoc.exists()) {
                    statusObj[a.id] = statusDoc.data().status;
                } else {
                    statusObj[a.id] = 'Pending';
                }
            }
            setStatusMap(statusObj);

        } catch (err) {
            console.error("Failed to load assignments:", err);
        } finally {
            setLoading(false);
        }
    };


    const formatDate = (inputDate) => {
        if (!inputDate) return '';
        const dateObj = new Date(inputDate);
        if (isNaN(dateObj)) return inputDate;
        return `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;
    };

    const handleStatusChange = async (assignmentId, newStatus) => {
        try {
            const ref = doc(db, 'assignment_status', `${user.uid}_${assignmentId}`);
            await setDoc(ref, {
                studentId: user.uid,
                assignmentId: assignmentId,
                status: newStatus
            });
            setStatusMap(prev => ({ ...prev, [assignmentId]: newStatus }));
            toast.success(`Status updated to ${newStatus}`);
        } catch (err) {
            toast.error("Failed to update status");
            console.error(err);
        }
    };


    return (
        <div className="container py-5 mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary fw-bold" data-aos="fade-right">
                    <FaClipboardList className="me-2" />
                    Student Assignments
                </h2>
                <button className="btn btn-outline-danger" onClick={() => navigate('/student-dashboard')}>
                    ← Back
                </button>
            </div>

            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Loading assignments...</p>
                </div>
            ) : assignments.length === 0 ? (
                <p className="text-center fs-5 text-muted">No assignments available for your class.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-hover shadow-sm align-middle text-center rounded-4 overflow-hidden">
                        <thead className="table-primary">
                            <tr>
                                <th>#</th>
                                <th><FaBookOpen className="me-1" /> Subject</th>
                                <th><FaClipboardList className="me-1" /> Title</th>
                                <th><FaCalendarAlt className="me-1" /> Due Date</th>
                                <th><FaClock className="me-1" /> Posted On</th>
                                <th><i className="bi bi-info-circle me-1" /> Description</th>
                                <th><i className="bi bi-link-45deg me-1" /> Link</th>
                                <th><BsPatchCheckFill className="me-1" /> Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map((item, index) => (
                                <tr key={item.id} className="align-middle">
                                    <td className="fw-bold">{index + 1}</td>
                                    <td className="fw-bold">{item.subject}</td>
                                    <td className="fw-medium">{item.title}</td>
                                    <td>{formatDate(item.duedate)}</td>
                                    <td>{formatDate(item.postedon)}</td>
                                    <td className="text-start">{item.description}</td>
                                    <td>
                                        {item.link ? (
                                            <OverlayTrigger placement="top" overlay={<Tooltip>Open Link</Tooltip>}>
                                                <a href={item.link} target="_blank" rel="noopener noreferrer">
                                                    <FaExternalLinkAlt className="text-primary fs-5" />
                                                </a>
                                            </OverlayTrigger>
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                    <td>
                                        <select
                                            className={`form-select text-uppercase fw-bold ${item.status?.toLowerCase() === 'completed' ? 'bg-success text-white' : 'bg-warning text-dark'}`}
                                            value={item.status}
                                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                            style={{ minWidth: '120px' }}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Assignments;
