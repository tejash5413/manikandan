import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { adminDb as db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";

const AttendanceDashboard = () => {
    const navigate = useNavigate();
    const [totalStudents, setTotalStudents] = useState(0);
    const [presentCount, setPresentCount] = useState(0);
    const [absentCount, setAbsentCount] = useState(0);
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().substring(0, 10));

    useEffect(() => {
        fetchStudentCount();
        fetchTodayAttendance();
    }, [selectedDate]);

    const fetchStudentCount = async () => {
        const snapshot = await getDocs(collection(db, "students_list"));
        setTotalStudents(snapshot.docs.length);
    };

    const fetchTodayAttendance = async () => {
        try {
            const docRef = doc(db, "attendance_records", selectedDate);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const students = docSnap.data().students || [];
                setPresentCount(students.filter(s => s.status === "Present").length);
                setAbsentCount(students.filter(s => s.status === "Absent" || s.status === "Leave" || s.status === "Late").length);
            } else {
                setPresentCount(0);
                setAbsentCount(0);
            }
        } catch (err) {
            console.error("Error fetching attendance:", err);
        }
    };

    const pieData = {
        labels: ["Present", "Absent/Others"],
        datasets: [
            {
                data: [presentCount, absentCount],
                backgroundColor: ["#28a745", "#dc3545"],
            },
        ],
    };

    return (
        <div className="container mt-4">
            <h3 className="text-primary mb-3">📊 Admin Attendance Dashboard</h3>

            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow rounded-3 p-3 text-center bg-light">
                        <h5 className="text-muted">Total Students</h5>
                        <h2 className="fw-bold text-dark">{totalStudents}</h2>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow rounded-3 p-3 text-center bg-success text-white">
                        <h5>Present Today</h5>
                        <h2 className="fw-bold">{presentCount}</h2>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow rounded-3 p-3 text-center bg-danger text-white">
                        <h5>Absent/Leave/Late</h5>
                        <h2 className="fw-bold">{absentCount}</h2>
                    </div>
                </div>
                <div className="col-md-3">
                    <label className="form-label fw-semibold">📅 Select Date</label>
                    <input
                        type="date"
                        className="form-control"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>
            </div>

            <div className="card border-0 shadow-sm p-4 mb-4">
                <h5 className="mb-3 fw-semibold">Today’s Attendance Pie Chart</h5>
                <Pie data={pieData} />
            </div>

            <div className="d-flex gap-3 mt-4">
                <button
                    className="btn btn-primary rounded-pill"
                    onClick={() => navigate("/admin/manage-attendance")}
                >
                    📋 Mark Attendance
                </button>
                <button
                    className="btn btn-outline-secondary rounded-pill"
                    onClick={() => navigate("/admin/monthly-summary")}
                >
                    📅 View Monthly Summary
                </button>
            </div>
        </div>
    );
};

export default AttendanceDashboard;
