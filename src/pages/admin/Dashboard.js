import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { toast } from 'react-toastify';
import { adminAuth as auth } from '../../services/firebase';
import { signOut, getIdTokenResult } from 'firebase/auth';
import { Tab, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function AdminDashboard() {
    const navigate = useNavigate();
    const [key, setKey] = useState('students');

    useEffect(() => {
        AOS.init({ duration: 800 });
        const checkClaims = async () => {
            const user = auth.currentUser;
            if (user) {
                const tokenResult = await user.getIdTokenResult(true);
                console.log("✅ Role:", tokenResult.claims.role);
            }
        };
        checkClaims();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.clear();
            toast.success("👋 Logged out successfully!", { autoClose: 2000 });
            setTimeout(() => navigate('/admin-login'), 1000);
        } catch (error) {
            toast.error("❌ Logout failed!");
            console.error("Logout error:", error.message);
        }
    };

    const Card = ({ icon, title, desc, path, color }) => (
        <div className="col-12 col-md-6 col-lg-4 mb-4">
            <div className="card shadow-sm h-100 border-0 text-center p-3 rounded-4">
                <div className="d-flex justify-content-center mb-3">
                    <div className={`rounded-circle bg-${color} bg-opacity-10 p-3`}>
                        <i className={`fas ${icon} text-${color} fs-2`}></i>
                    </div>
                </div>
                <h5 className="fw-bold">{title}</h5>
                <p className="small text-muted">{desc}</p>
                <button className={`btn btn-outline-${color} w-100 rounded-pill fw-semibold`} onClick={() => navigate(path)}>
                    Go to {title}
                </button>
            </div>
        </div>
    );

    return (
        <div className="container-fluid px-3 py-4">
            <h2 className="text-center text-primary fw-bold mb-4" data-aos="fade-down">
                🛠️ Admin Dashboard
            </h2>

            <Tab.Container activeKey={key} onSelect={(k) => setKey(k)}>
                <div className="sticky-top bg-white shadow-sm z-3" style={{ top: 0 }}>
                    <div className="overflow-auto">
                        <Nav variant="tabs" className="flex-nowrap nav-tabs-custom">
                            <Nav.Item><Nav.Link eventKey="students" className="fw-bold">🧑 Students</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link eventKey="academics" className="fw-bold">📘 Academics</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link eventKey="attendance" className="fw-bold">📊 Attendance</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link eventKey="website" className="fw-bold">📢 Website</Nav.Link></Nav.Item>
                        </Nav>
                    </div>
                </div>
                <Tab.Content>
                    <Tab.Pane eventKey="students">
                        <div className="row">
                            <Card icon="fa-user-plus" title="Create Student Login" desc="Generate login credentials for NEET students." path="/admin-dashboard/create-student" color="primary" />
                            <Card icon="fa-users" title="Manage Students" desc="View, edit, or delete student records." path="/admin-dashboard/students" color="success" />
                            <Card 
  icon="fa-money-bill-wave" 
  title="Student Fee Details" 
  desc="Track and manage student fee payments." 
  path="/admin-dashboard/student-fee-details" 
  color="warning" 
/>  
                        </div>
                    </Tab.Pane>

                    <Tab.Pane eventKey="academics">
                        <div className="row">
                            <Card
  icon="fa-chalkboard-teacher"
  title="Manage Online Classes"
  desc="Schedule live sessions, upload links, and track student attendance."
  path="/admin-dashboard/manage-online-classes"
  color="primary"
/>
    
                            <Card icon="fa-pen-nib" title="Create Exams & Manage Exams" desc="Schedule and manage NEET exams." path="/admin-dashboard/select-exam" color="primary" />
                            <Card icon="fa-chart-line" title="Upload Results" desc="Upload NEET results and performance." path="/admin-dashboard/upload-results" color="danger" />
                            <Card icon="fa-book-open" title="Manage Assignments" desc="Add and update assignments." path="/admin-dashboard/manage-assignments" color="success" />
                            <Card icon="fa-bullhorn" title="Manage Circulars / Notices" desc="Upload announcements, PDFs, or images." path="/admin-dashboard/manage-circulars" color="danger" />
                    </div>
                    </Tab.Pane>

                    <Tab.Pane eventKey="attendance">
                        <div className="row">
                            <Card icon="fa-calendar-check" title="Mark Attendance" desc="Daily or monthly student attendance records." path="/admin-dashboard/manage-attendance" color="info" />
                            <Card icon="fa-chart-bar" title="Monthly Attendance Summary" desc="Analyze monthly attendance." path="/admin-dashboard/monthly-summary" color="warning" />
                        </div>
                    </Tab.Pane>

                    <Tab.Pane eventKey="website">
                        <div className="row">
                            <Card icon="fa-book" title="Manage Courses" desc="Add, edit or delete academic courses." path="/admin-dashboard/manage-courses" color="success" />
                            <Card icon="fa-image" title="Manage Gallery" desc="Add or remove event photos." path="/admin-dashboard/manage-gallery" color="primary" />
                            <Card icon="fa-chalkboard-teacher" title="Manage Faculty" desc="Add or update faculty profiles." path="/admin-dashboard/manage-faculty" color="warning" />
                            <Card icon="fa-file-signature" title="Manage Applications & Contact Page" desc="View applications and contact messages." path="/admin-dashboard/manage-center" color="info" />
                        </div>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>

            <div className="text-center mt-5">
                <button className="btn btn-outline-secondary rounded-pill px-4" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i>Logout
                </button>
            </div>
        </div>
    );
}

export default AdminDashboard;
