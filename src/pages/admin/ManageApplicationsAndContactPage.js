import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FaUserCheck, FaEnvelopeOpenText, FaArrowLeft } from 'react-icons/fa';

function ManageApplicationsAndContactPage() {
    const navigate = useNavigate();

    useEffect(() => {
        AOS.init({ duration: 800 });
    }, []);

    return (
        <div className="container py-5">
            <h2 className="text-center text-primary fw-bold mb-5" data-aos="fade-down">
                📊 Admin Panel: Manage Applications & Contact
            </h2>
            <button className="btn btn-outline-danger mb-3" onClick={() => navigate('/admin-dashboard')}>
                <FaArrowLeft className="me-2" /> Back to Dashboard
            </button>
            <div className="row g-4" data-aos="fade-up">
                {/* Applications Card */}
                <div className="col-md-6">
                    <div className="card border-0 shadow h-100 rounded-4 text-center">
                        <div className="card-body p-4">
                            <FaUserCheck className="text-success fs-1 mb-3" />
                            <h5 className="card-title fw-bold">Manage Applications</h5>
                            <p className="card-text ">View and process student course applications with details like course and accommodation.</p>
                            <button
                                onClick={() => navigate('/admin-dashboard/manage-applications')}
                                className="btn btn-outline-success mt-3"
                            >
                                Go to Applications
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contact Submissions Card */}
                <div className="col-md-6">
                    <div className="card border-0 shadow h-100 rounded-4 text-center">
                        <div className="card-body p-4">
                            <FaEnvelopeOpenText className="text-primary fs-1 mb-3" />
                            <h5 className="card-title fw-bold">Contact Submissions</h5>
                            <p className="card-text ">View messages received via the contact form and respond quickly to parent or student queries.</p>
                            <button
                                onClick={() => navigate('/admin-dashboard/contact-submissions')}
                                className="btn btn-outline-primary mt-3"
                            >
                                View Messages
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManageApplicationsAndContactPage;
