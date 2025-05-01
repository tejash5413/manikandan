import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { toast } from 'react-toastify';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';

function ManageApplications() {
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
    const [accommodationFilter, setAccommodationFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); // desc = Newest first
    const navigate = useNavigate();

    useEffect(() => {
        AOS.init({ duration: 1000 });

        fetch('https://script.google.com/macros/s/AKfycbx4tBUYOITEflVuBsMS2XiCa5f8sFAm-n_oSRjxSlpx2Nt-FwiPQXqpICWRd_-afaj7pQ/exec?type=applications')
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }

                const text = await res.text(); // get raw text
                try {
                    const json = JSON.parse(text); // try parsing
                    console.log("Fetched applications:", json);
                    setApplications(json);
                    setFilteredApplications(json);
                } catch (parseError) {
                    console.error("JSON parse error:", parseError);
                    console.error("Raw response:", text);
                    toast.error("Response is not valid JSON");
                }

                setLoading(false);
            })
            .catch((error) => {
                console.error("Fetch Error:", error);
                toast.error("Failed to load applications");
                setLoading(false);
            });
    }, []);


    useEffect(() => {
        let temp = [...applications];

        if (searchQuery.trim() !== '') {
            temp = temp.filter(app =>
                (app.name && app.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (app.email && app.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (app.phone && app.phone.includes(searchQuery))
            );
        }

        if (courseFilter !== '') {
            temp = temp.filter(app => app.course === courseFilter);
        }

        if (accommodationFilter !== '') {
            temp = temp.filter(app => app.accommodation === accommodationFilter);
        }

        temp.sort((a, b) => {
            const [dayA, monthA, yearA] = a.date.split('/');
            const [dayB, monthB, yearB] = b.date.split('/');

            const dateA = new Date(`${yearA}-${monthA}-${dayA}`);
            const dateB = new Date(`${yearB}-${monthB}-${dayB}`);

            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        setFilteredApplications(temp);

    }, [searchQuery, courseFilter, accommodationFilter, sortOrder, applications]);

    function formatDate(inputDate) {
        if (!inputDate) return '';

        const dateObj = new Date(inputDate);

        if (isNaN(dateObj)) {
            return inputDate; // If already text like 29-04-2025
        }

        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();

        return `${day}-${month}-${year}`;
    }
    const handleExportCSV = () => {
        if (filteredApplications.length === 0) {
            toast.warn("No data to export!");
            return;
        }

        const headers = ["Name", "Phone", "Email", "Address", "Course", "Accommodation", "Date"];
        const rows = filteredApplications.map(app => [
            app.name,
            app.phone,
            app.email,
            app.address,
            app.course,
            app.accommodation,
            formatDate(app.date)
        ]);

        const csvContent = [headers, ...rows]
            .map(e => e.map(field => `"${field}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "student_applications.csv");
    };

    return (
        <div className="container py-5">
            <div className="text-center mb-4">
                <button
                    className="btn btn-outline-danger"
                    onClick={() => navigate('/admin-dashboard')}
                >
                    ← Back to Dashboard
                </button></div>
            <h2 className="text-center text-primary mb-4" data-aos="fade-down">Student Applications</h2>

            {/* Filters */}
            <div className="row g-3 mb-4" data-aos="fade-up">
                <div className="col-md-4">
                    <input
                        type="text"
                        placeholder="Search by Name, Email or Phone"
                        className="form-control"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="col-md-3">
                    <select className="form-select" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
                        <option value="">All Courses</option>
                        <option value="NEET Foundation Batch">NEET Foundation Batch</option>
                        <option value="NEET Crash Course">NEET Crash Course</option>
                        <option value="Repeater Batch">Repeater Batch</option>
                        <option value="Medical Entrance Batch">Medical Entrance Batch</option>
                        <option value="Hostel Integrated Program">Hostel Integrated Program</option>
                    </select>
                </div>

                <div className="col-md-3">
                    <select className="form-select" value={accommodationFilter} onChange={(e) => setAccommodationFilter(e.target.value)}>
                        <option value="">All Accommodation</option>
                        <option value="Day Scholar">Day Scholar</option>
                        <option value="Hosteller">Hosteller</option>
                    </select>
                </div>

                <div className="col-md-2 text-end">
                    <button
                        className="btn btn-outline-primary w-100"
                        onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
                    >
                        {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
                    </button>
                </div>
            </div>
            <div className="text-end mb-3">
                <button className="btn btn-outline-success" onClick={handleExportCSV}>
                    📥 Export to CSV
                </button>
            </div>
            {/* Table */}
            {loading ? (
                <div className="d-flex justify-content-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-striped align-middle">
                        <thead className="table-dark text-center">
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Address</th>
                                <th>Course</th>
                                <th>Accommodation</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center text-muted">No Applications Found</td>
                                </tr>
                            ) : (
                                filteredApplications.map((app, index) => (
                                    <tr key={index} className="text-center">
                                        <td>{index + 1}</td>
                                        <td>{app.name}</td>
                                        <td>{app.phone}</td>
                                        <td>{app.email}</td>
                                        <td>{app.address}</td>
                                        <td>{app.course}</td>
                                        <td>{app.accommodation}</td>
                                        <td>{formatDate(app.date)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ManageApplications;
