import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { toast } from 'react-toastify';
import { getAuth, signOut } from 'firebase/auth';


function AdminDashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const handleLogout = async () => {
        const auth = getAuth();
        try {
            await signOut(auth); // 🔐 Sign out from Firebase
            localStorage.removeItem('adminLoggedIn');
            toast.success("👋 Logged out successfully!", { autoClose: 2000 });
            localStorage.removeItem('sessionToastShown'); // ✅ clear toast blocker

            setTimeout(() => {
                navigate('/admin-login');
            }, 1000);
        } catch (error) {
            toast.error("❌ Logout failed!");
            console.error("Logout error:", error.message);
        }
    };

    return (
        <div className="container py-5">
            <h2 className="text-center text-primary mb-5" data-aos="fade-down">Admin Dashboard</h2>

            <div className="row g-4">
                {/* Create Student Credentials */}
                <div className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="300">
                    <div className="card shadow-sm border-0 text-center h-100">
                        <div className="card-body">
                            <i className="bi bi-person-plus fs-1 text-primary mb-3"></i>
                            <h5 className="card-title">Create Student Login</h5>
                            <p className="card-text small">Generate login credentials for NEET students.</p>
                            <button className="btn btn-outline-primary mt-2 w-100" onClick={() => navigate('/admin-dashboard/create-student')}>
                                Go to Student Creator
                            </button>
                        </div>
                    </div>
                </div>
                {/* Students List */}
                <div className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="200">
                    <div className="card shadow-sm border-0 text-center h-100">
                        <div className="card-body">
                            <i className="fas fa-users fs-1 text-success mb-3"></i>
                            <h5 className="card-title fw-bold">Manage Students</h5>
                            <p className="card-text small">
                                View, edit, or delete student profiles and manage login credentials.
                            </p>
                            <button
                                className="btn btn-outline-success mt-2 w-100"
                                onClick={() => navigate('/admin-dashboard/students')}
                            >
                                <i className="fas fa-user-cog me-2"></i>Go to Students
                            </button>
                        </div>
                    </div>
                </div>
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
                            <h5 className="card-title">Manage Applications & ContactPage</h5>
                            <p className="card-text small ">View all student applications submitted.</p>
                            <button
                                className="btn btn-outline-info mt-2 w-100"
                                onClick={() => navigate('/admin-dashboard/manage-center')}
                            >
                                Go to Applications
                            </button>
                        </div>
                    </div>
                </div>


                {/*  Create Exams  */}
                <div className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="200">
                    <div className="card shadow-sm border-0 text-center h-100">
                        <div className="card-body">
                            <i className="bi bi-journal-plus fs-1 text-primary mb-3"></i>
                            <h5 className="card-title">Create Exams/Manage Exams</h5>
                            <p className="card-text small">Schedule exams and define syllabus for students.</p>
                            <button
                                className="btn btn-outline-primary mt-2 w-100"
                                onClick={() => navigate('/admin-dashboard/select-exam')}
                            >
                                Go to Exam Setup
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
