import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { studentDb as db, studentAuth as auth } from '../../services/firebase';
import { toast } from 'react-toastify';
import { FaExternalLinkAlt, FaBookOpen, FaCalendarAlt, FaClipboardList, FaClock, FaArrowLeft, FaUserGraduate, FaTasks, FaInfoCircle } from 'react-icons/fa';
import { BsPatchCheckFill } from 'react-icons/bs';
import Lottie from 'lottie-react';
import loadingAnimation from "../../assets/loading.json";

function Assignments() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusMap, setStatusMap] = useState({});
    const navigate = useNavigate();
    const [subjectFilter, setSubjectFilter] = useState("");
    const [titleFilter, setTitleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [classFilter, setClassFilter] = useState("");
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

            const statusObj = {};
            for (const a of filtered) {
                const statusDoc = await getDoc(doc(db, 'assignment_status', `${user.uid}_${a.id}`));
                statusObj[a.id] = statusDoc.exists() ? statusDoc.data().status : 'Pending';
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

    const filteredAssignments = assignments.filter((a) => {
        const matchesSubject = a.subject.toLowerCase().includes(subjectFilter.toLowerCase());
        const matchesTitle = a.title.toLowerCase().includes(titleFilter.toLowerCase());
        const matchesClass = a.class?.toLowerCase().includes(classFilter.toLowerCase());
        const matchesStatus = statusFilter === "All" || (statusMap[a.id] || "Pending") === statusFilter;
        return matchesSubject && matchesTitle && matchesClass && matchesStatus;
    });

    return (
        <div className="container py-5 mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                <h2 className="text-primary fw-bold" data-aos="fade-right">
                    <FaClipboardList className="me-2" /> Student Assignments
                </h2>
                <button className="btn btn-outline-danger mt-2 mt-md-0" onClick={() => navigate('/student-dashboard')}>
                    <FaArrowLeft className="me-2" />Back
                </button>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-lg-3 col-md-6">
                    <FaBookOpen className="me-2 text-primary" />
                    <input
                        type="text"
                        className="form-control shadow-sm"
                        placeholder="Search by Subject"
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                    />
                </div>
                <div className="col-lg-3 col-md-6">
                    <FaClipboardList className="me-2 text-primary" />
                    <input
                        type="text"
                        className="form-control shadow-sm"
                        placeholder="Search by Title"
                        value={titleFilter}
                        onChange={(e) => setTitleFilter(e.target.value)}
                    />
                </div>
                <div className="col-lg-3 col-md-6">
                    <FaUserGraduate className="me-2 text-primary" />
                    <input
                        type="text"
                        className="form-control shadow-sm"
                        placeholder="Filter by Class"
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                    />
                </div>
                <div className="col-lg-3 col-md-6">
                    <FaTasks className="me-2 text-primary" />
                    <select
                        className="form-select shadow-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="d-flex flex-column align-items-center justify-content-center mt-5">
                    <Lottie animationData={loadingAnimation} style={{ height: '250px' }} />
                    <div className="fw-bold text-primary mt-3">Loading assignments...</div>
                </div>
            ) : filteredAssignments.length === 0 ? (
                <p className="text-center fs-5 text-muted">No assignments available.</p>
            ) : (
                <div className="row g-4">
                    {filteredAssignments.map((item, index) => (
                        <div className="col-md-6 col-lg-4" key={item.id}>
                            <div className="card h-100 shadow-sm border-0">
                                <div className="card-body">
                                    <h5 className="text-primary fw-bold mb-2">{item.title}</h5>
                                    <p className="mb-1"><strong>📘 Subject:</strong> {item.subject}</p>
                                    <p className="mb-1"><strong>🎓 Class:</strong> {item.class}</p>
                                    <p className="mb-1"><strong>📅 Due:</strong> {formatDate(item.duedate)}</p>
                                    <p className="mb-1"><strong>🕒 Posted:</strong> {formatDate(item.postedon)}</p>
                                    <p className="mb-2"><strong>📝 Description:</strong><br />{item.description}</p>
                                    <div className="d-flex justify-content-between align-items-center flex-wrap mt-2">
                                        <select
                                            className={`form-select form-select-sm ${statusMap[item.id] === 'Completed' ? 'bg-success text-white' : 'bg-warning text-dark'}`}
                                            value={statusMap[item.id] || 'Pending'}
                                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                            style={{ minWidth: '130px' }}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                        {item.link && (
                                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary mt-2">
                                                <FaExternalLinkAlt className="me-1" /> View
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Assignments;
