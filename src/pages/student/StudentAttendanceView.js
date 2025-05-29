import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { studentDb as db } from "../../services/firebase";
import { toast } from "react-toastify";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { FaArrowLeft } from "react-icons/fa";

ChartJS.register(ArcElement, Tooltip, Legend);

const StudentAttendanceView = () => {
    const [entryMode, setEntryMode] = useState("day");
    const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));
    const [month, setMonth] = useState(() => new Date().toISOString().substring(0, 7));
    const [data, setData] = useState(null);
    const rollno = localStorage.getItem("studentRollno");

    const fetchDaywise = async () => {
        try {
            const snap = await getDoc(doc(db, "attendance_records", date));
            if (snap.exists()) {
                const found = snap.data().students.find((s) => s.rollno === rollno);
                setData(found || null);
            } else {
                setData(null);
            }
        } catch (err) {
            console.error(err);
            toast.error("❌ Error loading daywise data.");
        }
    };

    const fetchMonthwise = async () => {
        try {
            const snap = await getDoc(doc(db, "monthly_attendance", month));
            if (snap.exists()) {
                const found = snap.data().students.find((s) => s.rollno === rollno);
                setData(found || null);
            } else {
                setData(null);
            }
        } catch (err) {
            console.error(err);
            toast.error("❌ Error loading monthly data.");
        }
    };

    useEffect(() => {
        if (entryMode === "day") fetchDaywise();
        else fetchMonthwise();
    }, [entryMode, date, month]);

    const getChartData = () => {
        if (!data) return null;

        const present = Number(data.presentDays || 0);
        const total = Number(data.totalDays || 0);
        const absent = total - present;

        return {
            labels: ["Present", "Absent"],
            datasets: [
                {
                    label: "Days",
                    data: [present, absent],
                    backgroundColor: ["#198754", "#dc3545"],
                    borderWidth: 1,
                },
            ],
        };
    };

    return (
        <div className="container py-4">
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <h4 className="text-primary fw-bold mb-0">📋 My Attendance</h4>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => window.history.back()}>
                    <FaArrowLeft className="me-1" /> Back
                </button>
            </div>

            {/* Mode Toggle */}
            <div className="mb-3">
                <div className="btn-group w-100">
                    <button
                        className={`btn ${entryMode === "day" ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setEntryMode("day")}
                    >
                        📆 Day-wise
                    </button>
                    <button
                        className={`btn ${entryMode === "month" ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setEntryMode("month")}
                    >
                        📅 Month-wise
                    </button>
                </div>
            </div>

            {/* Date / Month Picker */}
            <div className="mb-3">
                <label className="form-label fw-semibold">
                    {entryMode === "day" ? "Select Date" : "Select Month"}
                </label>
                <input
                    type={entryMode === "day" ? "date" : "month"}
                    className="form-control"
                    value={entryMode === "day" ? date : month}
                    onChange={(e) =>
                        entryMode === "day" ? setDate(e.target.value) : setMonth(e.target.value)
                    }
                />
            </div>

            {/* Attendance Card */}
            {data ? (
                <div className="card shadow-sm border-0 p-4 rounded-4">
                    <h5 className="fw-bold text-success">{data.name} ({data.rollno})</h5>
                    <p className="mb-2"><strong>Class:</strong> {data.class} &nbsp;&nbsp; <strong>Batch:</strong> {data.batch}</p>

                    {entryMode === "day" ? (
                        <p className="fs-5">
                            <strong>Status:</strong>{" "}
                            <span className={`badge bg-${data.status === "Present"
                                ? "success"
                                : data.status === "Absent"
                                    ? "danger"
                                    : data.status === "Leave"
                                        ? "warning text-dark"
                                        : "info text-dark"
                                }`}>
                                {data.status}
                            </span>
                        </p>
                    ) : (
                        <>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <p><strong>Present Days:</strong> {data.presentDays}</p>
                                    <p><strong>Total Days:</strong> {data.totalDays}</p>
                                    <p><strong>Attendance %:</strong> <span className={((data.presentDays / data.totalDays) * 100) < 75 ? "text-danger fw-bold" : "text-success fw-bold"}>
                                        {((data.presentDays / data.totalDays) * 100).toFixed(1)}%
                                    </span></p>
                                </div>
                                <div className="col-md-6 mb-3">
                                    {getChartData() && (
                                        <Doughnut data={getChartData()} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <p className="text-muted mt-4">No attendance found for selected {entryMode === "day" ? "date" : "month"}.</p>
            )}
        </div>
    );
};

export default StudentAttendanceView;
