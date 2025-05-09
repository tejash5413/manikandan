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
import ProgressCard from '../pages/student/ProgressCard';
import ExaminationsPage from '../pages/student/ExaminationsPage';
import StartTestPage from '../pages/student/StartTestPage';
import OnlineExamResults from '../pages/student/OnlineExamResults';

// Admin Pages
import AdminLogin from '../pages/admin/AdminLogin';
import Dashboard from '../pages/admin/Dashboard';
import ManageCourses from '../pages/admin/ManageCourses';
import ManageApplications from '../pages/admin/ManageApplications';
import ManageGallery from '../pages/admin/ManageGallery';
import ManageFaculty from '../pages/admin/ManageFaculty';
import UploadResults from '../pages/admin/UploadResults';
import ManageAssignments from '../pages/admin/ManageAssignments';
import CreateExamForm from '../pages/admin/CreateExamForm';
import CreateStudent from '../pages/admin/CreateStudent';
import ExamSelectionPage from '../pages/admin/ExamSelectionPage';
import StudentsList from '../pages/admin/StudentsList'; // ✅ should be default import
import ManageApplicationsAndContactPage from '../pages/admin/ManageApplicationsAndContactPage';
import ContactSubmissionsPage from '../pages/admin/ContactSubmissionsPage';

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
            <Route path="/student-dashboard/progress-card" element={
                <StudentPrivateRoute>
                    <ProgressCard />
                </StudentPrivateRoute>
            } />
            <Route path="/student-dashboard/examinations" element={
                <StudentPrivateRoute>
                    <ExaminationsPage />
                </StudentPrivateRoute>
            } />
            <Route path="/student-dashboard/start-test/:examId" element={
                <StudentPrivateRoute>
                    <StartTestPage />
                </StudentPrivateRoute>
            } />
            <Route path="/student-dashboard/online-exam-results" element={
                <StudentPrivateRoute>
                    <OnlineExamResults />
                </StudentPrivateRoute>
            } />
            <Route path="/student-dashboard/online-exam-results/:title" element={
                <StudentPrivateRoute>
                    <OnlineExamResults />
                </StudentPrivateRoute>
            } />

            <Route path="/student-dashboard/online-exam-results" element={
                <StudentPrivateRoute>
                    <OnlineExamResults />
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


            <Route path="/admin-dashboard/create-exams" element={
                <AdminPrivateRoute>
                    <CreateExamForm />
                </AdminPrivateRoute>
            } />
            <Route path="/admin-dashboard/select-exam" element={
                <AdminPrivateRoute>
                    <ExamSelectionPage />
                </AdminPrivateRoute>
            } />
            <Route path="/admin-dashboard/create-student" element={
                <AdminPrivateRoute>
                    <CreateStudent />
                </AdminPrivateRoute>
            } />
            <Route path="/admin-dashboard/students" element={
                <AdminPrivateRoute>
                    <StudentsList />
                </AdminPrivateRoute>
            } />
            <Route path="/admin-dashboard/manage-center" element={
                <AdminPrivateRoute>
                    <ManageApplicationsAndContactPage />
                </AdminPrivateRoute>
            } />
            <Route path="/admin-dashboard/contact-submissions" element={
                <AdminPrivateRoute>
                    <ContactSubmissionsPage />
                </AdminPrivateRoute>
            } />
        </Routes>
    );
}

export default AppRoutes;
