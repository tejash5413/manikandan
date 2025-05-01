import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { toast } from 'react-toastify';

function AdminDashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');

        toast.info("Logged out successfully!", { autoClose: 2000 });
        setTimeout(() => {
            navigate('/admin-login');
        }, 2000);
    };

    return (
        <div className="container py-5">
            <h2 className="text-center text-primary mb-5" data-aos="fade-down">Admin Dashboard</h2>

            <div className="row g-4">

                {/* Manage Courses */}
                <div className="col-md-6 col-lg-4" data-aos="fade-up">
                    <div className="card shadow-sm border-0 text-center h-100">
                        <div className="card-body">
                            <i className="bi bi-journal-text fs-1 text-success mb-3"></i>
                            <h5 className="card-title">Manage Courses</h5>
                            <p className="card-text small">Add, Edit, or Delete Academy Courses.</p>
                            <button className="btn btn-outline-success mt-2 w-100" onClick={() => navigate('/admin-dashboard/manage-courses')}>
                                Go to Courses
                            </button>
                        </div>
                    </div>
                </div>

                {/* Manage Gallery */}
                <div className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="100">
                    <div className="card shadow-sm border-0 text-center h-100">
                        <div className="card-body">
                            <i className="bi bi-image fs-1 text-primary mb-3"></i>
                            <h5 className="card-title">Manage Gallery</h5>
                            <p className="card-text small ">Add or Remove Event Photos.</p>
                            <button className="btn btn-outline-primary mt-2 w-100" onClick={() => navigate('/admin-dashboard/manage-gallery')}>
                                Go to Gallery
                            </button>
                        </div>
                    </div>
                </div>

                {/* Manage Faculty */}
                <div className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="200">
                    <div className="card shadow-sm border-0 text-center h-100">
                        <div className="card-body">
                            <i className="bi bi-people fs-1 text-warning mb-3"></i>
                            <h5 className="card-title">Manage Faculty</h5>
                            <p className="card-text small ">Add or Update Faculty Profiles.</p>
                            <button className="btn btn-outline-warning mt-2 w-100" onClick={() => navigate('/admin-dashboard/manage-faculty')}>
                                Go to Faculty
                            </button>
                        </div>
                    </div>
                </div>
                {/* Manage Applications */}
                <div className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="400">
                    <div className="card shadow-sm border-0 text-center h-100">
                        <div className="card-body">
                            <i className="bi bi-person-lines-fill fs-1 text-info mb-3"></i>
                            <h5 className="card-title">Manage Applications</h5>
                            <p className="card-text small ">View all student applications submitted.</p>
                            <button
                                className="btn btn-outline-info mt-2 w-100"
                                onClick={() => navigate('/admin-dashboard/manage-applications')}
                            >
                                Go to Applications
                            </button>
                        </div>
                    </div>
                </div>
                {/* Manage Assignments */}
                <div className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="500">
                    <div className="card shadow-sm border-0 text-center h-100">
                        <div className="card-body">
                            <i className="bi bi-journal-check fs-1 text-success mb-3"></i>
                            <h5 className="card-title">Manage Assignments</h5>
                            <p className="card-text small ">Create and edit subject-wise assignments.</p>
                            <button
                                className="btn btn-outline-success mt-2 w-100"
                                onClick={() => navigate('/admin-dashboard/manage-assignments')}
                            >
                                Go to Assignments
                            </button>
                        </div>
                    </div>
                </div>

                {/* Upload Results */}
                <div className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="300">
                    <div className="card shadow-sm border-0 text-center h-100">
                        <div className="card-body">
                            <i className="bi bi-bar-chart-line fs-1 text-danger mb-3"></i>
                            <h5 className="card-title">Upload Results</h5>
                            <p className="card-text small ">Upload NEET Results and Student Ranks.</p>
                            <button className="btn btn-outline-danger mt-2 w-100" onClick={() => navigate('/admin-dashboard/upload-results')}>
                                Go to Results
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Logout */}
            <div className="text-center mt-5" >
                <button className="btn btn-outline-secondary" onClick={handleLogout}>
                    Logout
                </button>
            </div>

        </div>
    );
}

export default AdminDashboard;
