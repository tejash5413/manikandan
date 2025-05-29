import React, { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
} from "firebase/firestore";
import { adminDb as db } from "../../services/firebase";
import { toast } from "react-toastify";

const ManageAttendancePage = () => {
    const [students, setStudents] = useState([]);
    const [entryMode, setEntryMode] = useState("day");
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().substring(0, 10));
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    });
    const [attendance, setAttendance] = useState({});
    const [filters, setFilters] = useState({ class: "", batch: "" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            try {
                const snapshot = await getDocs(collection(db, "students_list"));
                const list = snapshot.docs.map(doc => doc.data());
                setStudents(list);

                const defaultAttendance = {};
                for (let s of list) {
                    defaultAttendance[s.rollno] = {
                        ...s,
                        status: "Present",
                        presentDays: "",
                        totalDays: "30",
                    };
                }
                setAttendance(defaultAttendance);
            } catch (err) {
                toast.error("❌ Failed to fetch student list");
                console.error(err);
            }
            setLoading(false);
        };
        fetchStudents();
    }, []);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const docRef = doc(db, entryMode === "day" ? "attendance_records" : "monthly_attendance", entryMode === "day" ? selectedDate : selectedMonth);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data().students || [];
                    const updated = {};
                    for (let s of data) {
                        updated[s.rollno] = {
                            ...attendance[s.rollno],
                            ...s
                        };
                    }
                    setAttendance(prev => ({ ...prev, ...updated }));
                }
            } catch (err) {
                toast.error("❌ Failed to load existing attendance");
                console.error(err);
            }
        };
        if (students.length > 0) fetchAttendance();
    }, [entryMode, selectedDate, selectedMonth, students]);

    const filteredStudents = students.filter((s) => {
        const matchClass = filters.class ? s.class?.toLowerCase().includes(filters.class.toLowerCase()) : true;
        const matchBatch = filters.batch ? s.batch?.toLowerCase().includes(filters.batch.toLowerCase()) : true;
        return matchClass && matchBatch;
    });

    const handleChange = (rollno, field, value) => {
        setAttendance(prev => ({
            ...prev,
            [rollno]: {
                ...prev[rollno],
                [field]: value,
            },
        }));
    };

    const markAll = (status) => {
        const updated = {};
        filteredStudents.forEach((s) => {
            updated[s.rollno] = {
                ...attendance[s.rollno],
                status,
            };
        });
        setAttendance((prev) => ({ ...prev, ...updated }));
    };

    const handleSubmit = async () => {
        try {
            if (entryMode === "day") {
                const data = filteredStudents.map((s) => ({
                    rollno: s.rollno,
                    name: s.name,
                    class: s.class,
                    batch: s.batch,
                    status: attendance[s.rollno]?.status || "Absent",
                }));

                await setDoc(doc(db, "attendance_records", selectedDate), {
                    date: selectedDate,
                    students: data,
                    timestamp: new Date().toISOString(),
                });

                toast.success("✅ Daily attendance saved!");
            } else {
                const data = filteredStudents.map((s) => ({
                    rollno: s.rollno,
                    name: s.name,
                    class: s.class,
                    batch: s.batch,
                    presentDays: parseInt(attendance[s.rollno]?.presentDays || "0"),
                    totalDays: parseInt(attendance[s.rollno]?.totalDays || "30"),
                }));

                await setDoc(doc(db, "monthly_attendance", selectedMonth), {
                    month: selectedMonth,
                    students: data,
                    timestamp: new Date().toISOString(),
                });

                toast.success("✅ Monthly attendance saved!");
            }
        } catch (err) {
            toast.error("❌ Save failed");
            console.error(err);
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-lg border-0 rounded-4 p-4 bg-white">
                <h3 className="text-primary mb-3">
                    📋 Manage Attendance – {entryMode === "day" ? "Day-wise" : "Month-wise"}
                </h3>
                <div className="mb-3">
                    <button className="btn btn-outline-secondary" onClick={() => window.history.back()}>
                        <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
                    </button>
                </div>
                <div className="d-flex gap-2 mb-3">
                    <button className={`btn ${entryMode === "day" ? "btn-primary" : "btn-outline-primary"} rounded-pill`} onClick={() => setEntryMode("day")}>📆 Day-wise</button>
                    <button className={`btn ${entryMode === "month" ? "btn-primary" : "btn-outline-primary"} rounded-pill`} onClick={() => setEntryMode("month")}>📅 Month-wise</button>
                </div>

                <div className="bg-light p-3 rounded-3 mb-3 border">
                    <div className="row g-3 mb-3">
                        {entryMode === "day" && (
                            <div className="col-md-3">
                                <label className="form-label">Date</label>
                                <input type="date" className="form-control" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                            </div>
                        )}
                        {entryMode === "month" && (
                            <div className="col-md-3">
                                <label className="form-label">Month</label>
                                <input type="month" className="form-control" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
                            </div>
                        )}
                        <div className="col-md-3">
                            <label className="form-label">Class</label>
                            <input type="text" className="form-control" placeholder="e.g. 12A, NEET" value={filters.class} onChange={(e) => setFilters({ ...filters, class: e.target.value })} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Batch</label>
                            <input type="text" className="form-control" placeholder="e.g. Crash" value={filters.batch} onChange={(e) => setFilters({ ...filters, batch: e.target.value })} />
                        </div>
                        {entryMode === "day" && (
                            <div className="col-md-3 d-flex align-items-end">
                                <button className="btn btn-outline-success me-2" onClick={() => markAll("Present")}>Mark All Present</button>
                                <button className="btn btn-outline-danger" onClick={() => markAll("Absent")}>Mark All Absent</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-bordered table-hover table-striped align-middle text-center">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Class</th>
                                {entryMode === "day" ? <th>Status</th> : <><th>Present Days</th><th>Total Days</th></>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((s, idx) => (
                                <tr key={s.rollno}>
                                    <td>{idx + 1}</td>
                                    <td>{s.rollno}</td>
                                    <td>{s.name}</td>
                                    <td>{s.class}</td>
                                    {entryMode === "day" ? (
                                        <td>
                                            <div className="d-flex flex-wrap justify-content-center gap-2">
                                                {["Present", "Absent", "Leave", "Late"].map(status => (
                                                    <button
                                                        key={status}
                                                        className={`btn btn-sm d-flex align-items-center ${attendance[s.rollno]?.status === status ? `btn-${status === "Present" ? "success" : status === "Absent" ? "danger" : status === "Leave" ? "warning text-dark" : "info text-dark"}` : `btn-outline-${status === "Present" ? "success" : status === "Absent" ? "danger" : status === "Leave" ? "warning" : "info"}`}`}
                                                        onClick={() => handleChange(s.rollno, "status", status)}
                                                        title={status}
                                                    >
                                                        <i className={`fas ${status === "Present" ? "fa-circle-check" : status === "Absent" ? "fa-circle-xmark" : status === "Leave" ? "fa-circle-exclamation" : "fa-clock"}`}></i>
                                                        <span className="d-none d-md-inline ms-1">{status}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    ) : (
                                        <>
                                            <td><input type="number" className="form-control" value={attendance[s.rollno]?.presentDays || ""} onChange={(e) => handleChange(s.rollno, "presentDays", e.target.value)} min="0" /></td>
                                            <td><input type="number" className="form-control" value={attendance[s.rollno]?.totalDays || ""} onChange={(e) => handleChange(s.rollno, "totalDays", e.target.value)} min="0" /></td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button className="btn btn-success mt-3" onClick={handleSubmit}>
                    <i className="fas fa-save me-2"></i>Save Attendance
                </button>
            </div>
        </div>
    );
};

export default ManageAttendancePage;
