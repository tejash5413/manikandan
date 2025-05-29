import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { adminDb as db } from "../../services/firebase";

const MonthlySummaryPage = () => {
    const [selectedMonths, setSelectedMonths] = useState([
        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
    ]);
    const [classFilter, setClassFilter] = useState("");
    const [summaryData, setSummaryData] = useState({});

    const handleMonthChange = (index, value) => {
        const updated = [...selectedMonths];
        updated[index] = value;
        setSelectedMonths(updated);
    };

    const addMonthField = () => {
        if (selectedMonths.length < 3) {
            setSelectedMonths([...selectedMonths, ""]);
        }
    };

    useEffect(() => {
        const fetchSummary = async () => {
            const allData = {};

            for (let month of selectedMonths) {
                if (!month) continue;

                try {
                    const snap = await getDoc(doc(db, "monthly_attendance", month));
                    if (snap.exists()) {
                        const students = snap.data().students || [];
                        for (let s of students) {
                            if (classFilter && !s.class?.toLowerCase().includes(classFilter.toLowerCase())) continue;

                            if (!allData[s.rollno]) {
                                allData[s.rollno] = {
                                    rollno: s.rollno,
                                    name: s.name,
                                    class: s.class,
                                    months: {},
                                };
                            }
                            const percent = s.totalDays ? ((s.presentDays / s.totalDays) * 100).toFixed(1) : "0";
                            allData[s.rollno].months[month] = percent;
                        }
                    }
                } catch (e) {
                    console.error("Error loading", month, e);
                }
            }

            setSummaryData(allData);
        };

        fetchSummary();
    }, [selectedMonths, classFilter]);

    const monthLabels = selectedMonths.filter(Boolean);

    return (
        <div className="container mt-4">
            <h4 className="text-primary mb-3">📅 Monthly Attendance Comparison</h4>
            {/* 🔙 Back Button */}
            <div className="mb-3">
                <button className="btn btn-outline-secondary" onClick={() => window.history.back()}>
                    <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
                </button>
            </div>
            <div className="row g-3 mb-3">
                {selectedMonths.map((m, i) => (
                    <div className="col-md-3" key={i}>
                        <label className="form-label">Month {i + 1}</label>
                        <input
                            type="month"
                            className="form-control"
                            value={m}
                            onChange={(e) => handleMonthChange(i, e.target.value)}
                        />
                    </div>
                ))}

                {selectedMonths.length < 3 && (
                    <div className="col-md-2 d-flex align-items-end">
                        <button className="btn btn-outline-primary" onClick={addMonthField}>
                            ➕ Add Month
                        </button>
                    </div>
                )}

                <div className="col-md-4">
                    <label className="form-label">Filter by Class</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 12A"
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-responsive shadow-sm rounded border">
                <table className="table table-bordered table-hover text-center">
                    <thead className="table-light">
                        <tr>
                            <th>#</th>
                            <th>Roll No</th>
                            <th>Name</th>
                            <th>Class</th>
                            {monthLabels.map((m) => (
                                <th key={m}>{m}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.values(summaryData).length === 0 ? (
                            <tr>
                                <td colSpan={4 + monthLabels.length} className="text-muted">
                                    No data found.
                                </td>
                            </tr>
                        ) : (
                            Object.values(summaryData).map((s, idx) => (
                                <tr key={s.rollno}>
                                    <td>{idx + 1}</td>
                                    <td>{s.rollno}</td>
                                    <td>{s.name}</td>
                                    <td>{s.class}</td>
                                    {monthLabels.map((m) => {
                                        const val = s.months[m] || "0.0";
                                        return (
                                            <td key={m} className={val < 75 ? "text-danger fw-bold" : "text-success"}>
                                                {val}%
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MonthlySummaryPage;
