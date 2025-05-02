import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx5RL4Ke5ktuMbzEJ88Hy6U-8VOX514Su9dTxZjOmEME47G3Yc5ZFR30hzCCAHb8wDJsA/exec";

function UploadResults() {
    const navigate = useNavigate();
    const [editMode, setEditMode] = useState(false);
    const [resultList, setResultList] = useState([]);
    const [excelData, setExcelData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterDate, setFilterDate] = useState('');
    const [filterTestType, setFilterTestType] = useState('');
    const itemsPerPage = 5;
    const [filterRoll, setFilterRoll] = useState('');

    const [formData, setFormData] = useState({
        rollno: '',
        name: '',
        testname: '',
        date: '',
        testtype: 'Daily',
        physics: '',
        chemistry: '',
        botany: '',
        zoology: '',
        rank: '',
        class: '',
        batch: ''
    });

    const fetchResults = async () => {
        try {
            const res = await fetch(`${GOOGLE_SCRIPT_URL}?type=results`);
            const data = await res.json();
            setResultList(data);
        } catch (err) {
            toast.error("Failed to load results");
        }
    };

    useEffect(() => {
        AOS.init({ duration: 1000 });
        fetchResults();
    }, []);

    const formatDate = (inputDate) => {
        if (!inputDate) return '';
        const dateObj = new Date(inputDate);
        if (isNaN(dateObj)) return inputDate;
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${day}-${month}-${year}`;
    };
    const filteredResults = resultList.filter(row => {
        const matchesRoll = !filterRoll || row.rollno?.toString().includes(filterRoll);
        const matchesDate = !filterDate || row.date === filterDate || formatDate(row.date) === formatDate(filterDate);
        const matchesTestType = !filterTestType || row.testtype === filterTestType;
        return matchesRoll && matchesDate && matchesTestType;
    });
    const paginatedResults = filteredResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredResults.length / itemsPerPage);


    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };
    const goToPreviousPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const requiredFields = ['rollno', 'name', 'testname', 'date', 'testtype', 'physics', 'chemistry', 'botany', 'zoology', 'rank', 'class', 'batch'];
        for (let field of requiredFields) {
            if (!formData[field]) {
                toast.error(`Please fill in ${field}`);
                return;
            }
        }

        const action = editMode ? "editResult" : "uploadResult";

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',

                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, action })
            });

            toast.success(editMode ? "Result updated successfully!" : "Result uploaded successfully!");
            setFormData({
                rollno: '', name: '', testname: '', date: '', testtype: 'Daily',
                physics: '', chemistry: '', botany: '', zoology: '', rank: '', class: '',
                batch: ''
            });
            setEditMode(false);
            fetchResults();
        } catch (err) {
            toast.error("Upload failed");
        }
    };

    const handleExcelUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

            const headers = data[0];
            const rows = data.slice(1);

            if (!headers.includes("rollno") || !headers.includes("testname") || !headers.includes("class") || !headers.includes("batch")) {
                toast.error("Excel must contain correct headers: rollno, name, testname, date, testtype, physics, chemistry, botany, zoology, rank,, class, batch");
                return;
            }

            const formatted = rows.map(row => {
                const entry = {};
                headers.forEach((h, i) => {
                    let key = h.toLowerCase();
                    let value = row[i];
                    if (key === 'date' && typeof value === 'number') {
                        value = convertExcelDate(value);
                    }
                    entry[key] = value;
                });
                return entry;
            });

            setExcelData(formatted);
            toast.success("Excel file loaded. Preview below!");
        };
        reader.readAsBinaryString(file);
    };

    const handleUploadAllExcel = async () => {
        if (excelData.length === 0) {
            toast.error("No Excel data to upload!");
            return;
        }

        try {
            for (let i = 0; i < excelData.length; i++) {
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',

                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...excelData[i], action: "uploadResult" })
                });
            }

            toast.success("All Excel results uploaded!");
            setExcelData([]);
            fetchResults();
        } catch (err) {
            toast.error("Bulk upload failed");
        }
    };

    const convertExcelDate = (serial) => {
        const utcDays = Math.floor(serial - 25569);
        const utcValue = utcDays * 86400;
        const dateInfo = new Date(utcValue * 1000);
        const day = String(dateInfo.getDate()).padStart(2, '0');
        const month = String(dateInfo.getMonth() + 1).padStart(2, '0');
        const year = dateInfo.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleEdit = (entry) => {
        setFormData(entry);
        setEditMode(true);
    };

    const handleDelete = async (entry) => {
        if (!window.confirm("Delete this result?")) return;
        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',

                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...entry, action: "deleteResult" })
            });
            toast.success("Deleted!");
            fetchResults();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const handleBulkDelete = async () => {
        if (!filterDate && !filterTestType) {
            toast.error("Please select a filter to delete.");
            return;
        }

        if (!window.confirm("Are you sure you want to delete all filtered results?")) return;

        try {
            const filteredToDelete = resultList.filter(row => {
                const matchesDate = !filterDate || row.date === filterDate || formatDate(row.date) === formatDate(filterDate);
                const matchesTestType = !filterTestType || row.testtype === filterTestType;
                return matchesDate && matchesTestType;
            });

            await Promise.all(filteredToDelete.map(row =>
                fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...row, action: "deleteResult" })
                })
            ));

            toast.success("Filtered results deleted.");
            fetchResults();
        } catch (err) {
            toast.error("Bulk delete failed.");
        }
    };

    return (
        <div className="container py-5">
            <div className="text-center mb-4">
                <button className="btn btn-outline-danger" onClick={() => navigate('/admin-dashboard')}>
                    ← Back to Dashboard
                </button>
            </div>

            <h2 className="text-center text-primary mb-4" data-aos="fade-down">Upload Student Results</h2>
            <div className="row g-2 mb-3">
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Filter by Roll No"
                        value={filterRoll}
                        onChange={(e) => setFilterRoll(e.target.value)}
                    />
                </div>
                <div className="col-md-6">
                    <input
                        type="date"
                        className="form-control"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        placeholder="Filter by Date"
                    />
                </div>
                <div className="col-md-6">
                    <select
                        className="form-select"
                        value={filterTestType}
                        onChange={(e) => setFilterTestType(e.target.value)}
                    >
                        <option value="">All Test Types</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekend">Weekend</option>
                        <option value="Grand">Grand</option>
                    </select>
                </div>
            </div>
            <div className="text-end mb-2">
                <button className="btn btn-outline-danger" onClick={handleBulkDelete}>
                    🗑 Delete Filtered Results
                </button>
            </div>
            {/* Excel Upload */}
            <div className="card shadow p-4 mb-5" data-aos="fade-up">
                <h5>Upload Excel (.xlsx)</h5>
                <input type="file" accept=".xlsx, .xls" className="form-control my-3" onChange={handleExcelUpload} />
                {excelData.length > 0 && (
                    <>
                        <h6 className="text-success">Excel Preview:</h6>
                        <div className="table-responsive">
                            <table className="table table-bordered text-center small">
                                <thead className="table-secondary">
                                    <tr>
                                        <th>Roll No</th>
                                        <th>Name</th>
                                        <th>Class</th>
                                        <th>Batch</th>
                                        <th>Test Name</th>
                                        <th>Date</th>
                                        <th>Test Type</th>
                                        <th>Physics</th>
                                        <th>Chemistry</th>
                                        <th>Botany</th>
                                        <th>Zoology</th>
                                        <th>Rank</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {excelData.map((row, idx) => (
                                        <tr key={idx}>
                                            <td>{row.rollno}</td>
                                            <td>{row.name}</td>
                                            <td>{row.class}</td>
                                            <td>{row.batch}</td>
                                            <td>{row.testname}</td>
                                            <td>{formatDate(row.date)}</td>
                                            <td>{row.testtype}</td>
                                            <td>{row.physics}</td>
                                            <td>{row.chemistry}</td>
                                            <td>{row.botany}</td>
                                            <td>{row.zoology}</td>
                                            <td>{row.rank}</td>
                                            <td>
                                                <button className="btn btn-sm btn-danger" onClick={() => {
                                                    const newData = [...excelData];
                                                    newData.splice(idx, 1);
                                                    setExcelData(newData);
                                                }}>
                                                    ❌
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="text-center mt-3">
                            <button className="btn btn-success" onClick={handleUploadAllExcel}>
                                Upload All Results
                            </button>
                        </div>
                    </>
                )}
            </div>



            {/* Manual Entry */}
            <div className="card shadow p-4" data-aos="fade-up" data-aos-delay="200">
                <h5>Manual Entry</h5>
                <form className="row g-3" onSubmit={handleSubmit}>
                    {['rollno', 'name', 'testname', 'physics', 'chemistry', 'botany', 'zoology', 'rank'].map((field, i) => (
                        <div className="col-md-4" key={i}>
                            <input
                                type={field === 'rank' || field === 'physics' || field === 'chemistry' || field === 'botany' || field === 'zoology' ? 'number' : 'text'}
                                className="form-control"
                                name={field}
                                value={formData[field]}
                                onChange={handleChange}
                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                            />
                        </div>
                    ))}
                    <div className="col-md-4">
                        <input type="date" className="form-control" name="date" value={formData.date} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <select className="form-select" name="testtype" value={formData.testtype} onChange={handleChange}>
                            <option value="Daily">Daily</option>
                            <option value="Weekend">Weekend</option>
                            <option value="Grand">Grand</option>
                        </select>
                    </div>
                    <div className="text-center mt-3">
                        <button type="submit" className="btn btn-primary px-5">Upload Result</button>
                    </div>
                </form>
            </div>
            {/* Uploaded Results View */}
            <div className="card shadow p-4 mb-5" data-aos="fade-up">
                <h5>Uploaded Results</h5>
                <div className="table-responsive">
                    <table className="table table-bordered text-center small">
                        <thead className="table-secondary">
                            <tr>
                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Class</th>
                                <th>Batch</th>
                                <th>Test Name</th>
                                <th>Date</th>
                                <th>Test Type</th>
                                <th>Physics</th>
                                <th>Chemistry</th>
                                <th>Botany</th>
                                <th>Zoology</th>
                                <th>Rank</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedResults.map((row, idx) => (
                                <tr key={idx}>
                                    <td>{row.rollno}</td>
                                    <td>{row.name}</td>
                                    <td>{row.class}</td>
                                    <td>{row.batch}</td>
                                    <td>{row.testname}</td>
                                    <td>{formatDate(row.date)}</td>
                                    <td>{row.testtype}</td>
                                    <td>{row.physics}</td>
                                    <td>{row.chemistry}</td>
                                    <td>{row.botany}</td>
                                    <td>{row.zoology}</td>
                                    <td>{row.rank}</td>
                                    <td>
                                        <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(row)}>Edit</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(row)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <button className="btn btn-sm btn-outline-primary" onClick={goToPreviousPage} disabled={currentPage === 1}>
                            ← Previous
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button className="btn btn-sm btn-outline-primary" onClick={goToNextPage} disabled={currentPage === totalPages}>
                            Next →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UploadResults;
