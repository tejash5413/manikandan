import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Private Route Guards
import StudentPrivateRoute from '../services/StudentPrivateRoute';
import AdminPrivateRoute from '../services/AdminPrivateRoute';

// User Pages
import HomePage from '../pages/user/HomePage';
import AboutPage from '../pages/user/AboutPage';
import CoursesPage from '../pages/user/CoursesPage';
import ContactPage from '../pages/user/ContactPage';
import ApplyPage from '../pages/user/ApplyPage';
import FacultyPage from '../pages/user/FacultyPage';
import ResultsPage from '../pages/user/ResultsPage';
import GalleryPage from '../pages/user/GalleryPage';

// Student Pages
import StudentLogin from '../pages/student/StudentLogin';
import StudentDashboard from '../pages/student/StudentDashboard';
import ExamResults from '../pages/student/ExamResults';
import Assignments from '../pages/student/Assignments';

// Admin Pages
import AdminLogin from '../pages/admin/AdminLogin';
import Dashboard from '../pages/admin/Dashboard';
import ManageCourses from '../pages/admin/ManageCourses';
import ManageApplications from '../pages/admin/ManageApplications';
import ManageGallery from '../pages/admin/ManageGallery';
import ManageFaculty from '../pages/admin/ManageFaculty';
import UploadResults from '../pages/admin/UploadResults';
import ViewTopperBoard from '../pages/admin/ViewTopperBoard';
import SiteSettings from '../pages/admin/SiteSettings';
import ManageAssignments from '../pages/admin/ManageAssignments';

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/apply" element={<ApplyPage />} />
            <Route path="/faculty" element={<FacultyPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/results" element={<ResultsPage />} />

            {/* Student Auth Routes */}
            <Route path="/student-login" element={<StudentLogin />} />

            {/* Student Protected Routes */}
            <Route path="/student-dashboard" element={
                <StudentPrivateRoute>
                    <StudentDashboard />
                </StudentPrivateRoute>
            } />
            <Route path="/student-dashboard/exam-results" element={
                <StudentPrivateRoute>
                    <ExamResults />
                </StudentPrivateRoute>
            } />
            <Route path="/student-dashboard/assignments" element={
                <StudentPrivateRoute>
                    <Assignments />
                </StudentPrivateRoute>
            } />

            {/* Admin Auth Route */}
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* Admin Protected Routes */}
            <Route path="/admin-dashboard" element={
                <AdminPrivateRoute>
                    <Dashboard />
                </AdminPrivateRoute>
            } />
            <Route path="/admin-dashboard/manage-courses" element={
                <AdminPrivateRoute>
                    <ManageCourses />
                </AdminPrivateRoute>
            } />
            <Route path="/admin-dashboard/manage-applications" element={
                <AdminPrivateRoute>
                    <ManageApplications />
                </AdminPrivateRoute>
            } />
            <Route path="/admin-dashboard/manage-gallery" element={
                <AdminPrivateRoute>
                    <ManageGallery />
                </AdminPrivateRoute>
            } />
            <Route path="/admin-dashboard/manage-faculty" element={
                <AdminPrivateRoute>
                    <ManageFaculty />
                </AdminPrivateRoute>
            } />
            <Route path="/admin-dashboard/manage-assignments" element={
                <AdminPrivateRoute>
                    <ManageAssignments />
                </AdminPrivateRoute>
            } />
            <Route path="/admin-dashboard/upload-results" element={
                <AdminPrivateRoute>
                    <UploadResults />
                </AdminPrivateRoute>
            } />
            <Route path="/admin-dashboard/view-topper-board" element={
                <AdminPrivateRoute>
                    <ViewTopperBoard />
                </AdminPrivateRoute>
            } />
            <Route path="/admin-dashboard/site-settings" element={
                <AdminPrivateRoute>
                    <SiteSettings />
                </AdminPrivateRoute>
            } />
        </Routes>
    );
}

export default AppRoutes;
