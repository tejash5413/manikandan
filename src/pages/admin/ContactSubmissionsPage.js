import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Spinner, Badge } from 'react-bootstrap';
import { FaEnvelope, FaUser, FaCalendarAlt, FaArrowLeft, FaEdit, FaTrash, FaCheck, FaRegCommentDots, FaTasks, FaTools } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function ContactSubmissionsPage() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        AOS.init({ duration: 800 });
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'contact_submissions'));
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setContacts(data);
        } catch (error) {
            console.error("Failed to fetch contact submissions:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        try {
            await deleteDoc(doc(db, 'contact_submissions', id));
            toast.success("Message deleted");
            fetchContacts();
        } catch (err) {
            toast.error("Failed to delete message");
        }
    };

    const handleEditStatus = async (id, newStatus) => {
        try {
            await updateDoc(doc(db, 'contact_submissions', id), { status: newStatus });
            toast.success(`Status updated to "${newStatus}"`);
            fetchContacts();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const getStatusBadge = (status) => {
        const variant = status === 'Read' ? 'info' : status === 'Resolved' ? 'success' : 'warning';
        return <Badge bg={variant}>{status || 'New'}</Badge>;
    };

    return (
        <div className="container py-5">
            <h2 className="text-center text-primary mb-4">
                <FaEnvelope className="me-2" /> Contact Form Submissions
            </h2>
            <button className="btn btn-outline-danger mb-3" onClick={() => navigate('/admin-dashboard/manage-center')}>
                <FaArrowLeft className="me-2" /> Back to Dashboard
            </button>

            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : contacts.length === 0 ? (
                <p className="text-center text-muted">No contact messages found.</p>
            ) : (
                <div className="table-responsive" >
                    <table className="table table-hover table-bordered align-middle text-center">
                        <thead className="table-primary">
                            <tr>
                                <th>#</th>
                                <th><FaUser className="me-1" /> Name</th>
                                <th><FaEnvelope className="me-1" /> Email</th>
                                <th><FaRegCommentDots className="me-1" /> Message</th>
                                <th><FaCalendarAlt className="me-1" /> Submitted On</th>
                                <th><FaTasks className="me-1" /> Status</th>
                                <th><FaTools className="me-1" /> Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((msg, index) => (
                                <tr key={msg.id}>
                                    <td>{index + 1}</td>
                                    <td>{msg.name}</td>
                                    <td>{msg.email}</td>
                                    <td className="text-start">{msg.message}</td>
                                    <td>{formatDate(msg.submittedAt)}</td>
                                    <td>{getStatusBadge(msg.status)}</td>
                                    <td>
                                        <div className="d-flex justify-content-center gap-2">
                                            <button className="btn btn-sm btn-outline-info" onClick={() => handleEditStatus(msg.id, 'Read')}>
                                                <FaEdit /> Read
                                            </button>
                                            <button className="btn btn-sm btn-outline-success" onClick={() => handleEditStatus(msg.id, 'Resolved')}>
                                                <FaCheck /> Resolved
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(msg.id)}>
                                                <FaTrash />
                                            </button>
                                        </div>
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

export default ContactSubmissionsPage;
