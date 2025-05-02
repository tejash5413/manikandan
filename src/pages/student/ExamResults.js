import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);


function ExamResults() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rollno, setRollno] = useState('');
    const [filterType, setFilterType] = useState('All');
    const itemsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(1);


    useEffect(() => {
        AOS.init({ duration: 1000 });
        const storedRollno = localStorage.getItem("studentRollno");
        if (storedRollno) {
            setRollno(storedRollno);
            fetchResults(storedRollno);
        } else {
            toast.error("Roll number not found. Please log in again.");
            navigate("/student-login");
        }
    }, []);
    const navigate = useNavigate();

    const fetchResults = async () => {
        const storedRollno = localStorage.getItem("studentRollno");
        if (!storedRollno) {
            toast.error("Roll number not found. Please log in again.");
            navigate("/student-login");
            return;
        }

        try {
            const response = await fetch(
                `https://script.google.com/macros/s/AKfycbx5RL4Ke5ktuMbzEJ88Hy6U-8VOX514Su9dTxZjOmEME47G3Yc5ZFR30hzCCAHb8wDJsA/exec?type=results`
            );

            const allResults = await response.json();

            // Filter only results for logged-in rollno
            const filteredResults = allResults
                .filter(entry => String(entry.rollno).trim() === storedRollno.trim())
                .map(entry => {
                    const physics = parseInt(entry.physics) || 0;
                    const chemistry = parseInt(entry.chemistry) || 0;
                    const botany = parseInt(entry.botany) || 0;
                    const zoology = parseInt(entry.zoology) || 0;
                    const total = physics + chemistry + botany + zoology;
                    const maxMarks = entry.testtype === "Daily" ? 160 : 720;
                    const percent = ((total / maxMarks) * 100).toFixed(2);

                    return {
                        ...entry,
                        total,
                        percent
                    };
                });

            setResults(filteredResults);
        } catch (error) {
            toast.error("Failed to fetch results.");
        } finally {
            setLoading(false);
        }
    };


    const studentResults = results.filter(r => String(r.rollno).trim() === String(rollno).trim());


    const getMaxMarks = (testtype) => {
        if (testtype === "Daily") return 200;
        if (testtype === "Weekend" || testtype === "Grand") return 720;
        return 0;
    };

    const calculateAverages = (filteredData) => {
        if (filteredData.length === 0) return { avgTotal: 0, avgPercent: 0, bestRank: "-" };

        let totalObtained = 0;
        let totalPossible = 0;
        let bestRank = Infinity;

        filteredData.forEach(test => {
            const total = parseInt(test.physics || 0)
                + parseInt(test.chemistry || 0)
                + parseInt(test.botany || 0)
                + parseInt(test.zoology || 0);

            totalObtained += total;
            totalPossible += getMaxMarks(test.testtype);
            if (parseInt(test.rank) < bestRank) bestRank = parseInt(test.rank);
        });

        const avgTotal = (totalObtained / filteredData.length).toFixed(2);
        const avgPercent = ((totalObtained / totalPossible) * 100).toFixed(2);

        return {
            avgTotal,
            avgPercent,
            bestRank: bestRank === Infinity ? "-" : bestRank
        };
    };

    const filtered = studentResults.filter(t => filterType === 'All' || t.testtype === filterType);
    const { avgTotal, avgPercent, bestRank } = calculateAverages(filtered);

    const handleFilterChange = (type) => {
        setFilterType(type);
        setCurrentPage(1);
    };

    const dailyTests = filtered.filter(t => t.testtype === "Daily");
    const weekendTests = filtered.filter(t => t.testtype === "Weekend");
    const grandTests = filtered.filter(t => t.testtype === "Grand");

    const chartData = {
        labels: filtered.map(t => formatDate(t.date)),
        datasets: [
            {
                label: 'Daily Tests',
                data: dailyTests.map(t => ({ x: formatDate(t.date), y: t.total })),
                borderColor: 'rgba(40, 167, 69, 1)',
                backgroundColor: 'rgba(40, 167, 69, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 6
            },
            {
                label: 'Weekend Tests',
                data: weekendTests.map(t => ({ x: formatDate(t.date), y: t.total })),
                borderColor: 'rgba(0, 123, 255, 1)',
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 6
            },
            {
                label: 'Grand Tests',
                data: grandTests.map(t => ({ x: formatDate(t.date), y: t.total })),
                borderColor: 'rgba(220, 53, 69, 1)',
                backgroundColor: 'rgba(220, 53, 69, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 6
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: true, position: 'top' },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0,0,0,0.7)',
                titleFont: { size: 16 },
                bodyFont: { size: 14 },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Marks', font: { size: 14, weight: 'bold' } },
                grid: { color: 'rgba(200,200,200,0.2)' }
            },
            x: {
                type: 'category', // ⬅️ important!
                title: {
                    display: true,
                    text: 'Test Date',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                ticks: {
                    autoSkip: false,
                    maxRotation: 45,
                    minRotation: 0
                },
                grid: {
                    color: 'rgba(200,200,200,0.2)'
                }
            }
        }
    };

    const handleLogout = () => {
        toast.info("Logged Out Successfully!");
        setTimeout(() => navigate('/student-login'), 1000);
    };
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
    const calculateSubjectAverages = (data) => {
        if (data.length === 0) return { physicsAvg: 0, chemistryAvg: 0, botanyAvg: 0, zoologyAvg: 0 };

        const total = data.reduce((acc, t) => {
            acc.physics += parseInt(t.physics || 0);
            acc.chemistry += parseInt(t.chemistry || 0);
            acc.botany += parseInt(t.botany || 0);
            acc.zoology += parseInt(t.zoology || 0);
            return acc;
        }, { physics: 0, chemistry: 0, botany: 0, zoology: 0 });

        const count = data.length;

        return {
            physicsAvg: (total.physics / count).toFixed(2),
            chemistryAvg: (total.chemistry / count).toFixed(2),
            botanyAvg: (total.botany / count).toFixed(2),
            zoologyAvg: (total.zoology / count).toFixed(2)
        };
    };

    const { physicsAvg, chemistryAvg, botanyAvg, zoologyAvg } = calculateSubjectAverages(filtered);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedResults = filtered.slice(startIndex, startIndex + itemsPerPage);
    return (
        <div className="container py-5">
            <button className="btn btn-outline-secondary" onClick={handleLogout}>Logout</button>
            <div className="text-center mb-4">
                <button className="btn btn-outline-danger" onClick={() => navigate('/student-dashboard')}>
                    ← Back to Dashboard
                </button>
            </div>
            <h2 className="text-center text-primary mb-4" data-aos="fade-down">My Exam Results</h2>

            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                </div>) : (
                <>
                    <h2 className="text-center"> Total Average</h2>
                    <div className="row g-3 mb-4" data-aos="fade-up">
                        <div className="col-md-4">
                            <div className="card text-white bg-info shadow text-center p-3 rounded-4">
                                <div className="mb-2"><i className="fas fa-calculator fa-2x"></i></div>
                                <h6>Average Total Marks</h6>
                                <h3 className="fw-bold">{avgTotal}</h3>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card text-white bg-primary shadow text-center p-3 rounded-4">
                                <div className="mb-2"><i className="fas fa-percent fa-2x"></i></div>
                                <h6>Average Percentage</h6>
                                <h3 className="fw-bold">{avgPercent}%</h3>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card text-white bg-warning shadow text-center p-3 rounded-4">
                                <div className="mb-2"><i className="fas fa-medal fa-2x"></i></div>
                                <h6>Best Rank Achieved</h6>
                                <h3 className="fw-bold">{bestRank}</h3>
                            </div>
                        </div>
                    </div>
                    <h2 className="text-center"> Subject Wise Average</h2>
                    <div className="row g-3 mb-4" data-aos="fade-up">
                        <div className="col-md-3">
                            <div className="card text-white bg-primary shadow text-center p-3 rounded-4">
                                <div className="mb-2"><i className="fas fa-atom fa-2x"></i></div>
                                <h6>Avg Physics</h6>
                                <h3 className="fw-bold">{physicsAvg}</h3>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card text-white bg-warning shadow text-center p-3 rounded-4">
                                <div className="mb-2"><i className="fas fa-flask fa-2x"></i></div>
                                <h6>Avg Chemistry</h6>
                                <h3 className="fw-bold">{chemistryAvg}</h3>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card text-white bg-success  shadow text-center p-3 rounded-4">
                                <div className="mb-2"><i className="fas fa-leaf fa-2x"></i></div>
                                <h6>Avg Botany</h6>
                                <h3 className="fw-bold">{botanyAvg}</h3>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card text-white bg-danger shadow text-center p-3 rounded-4">
                                <div className="mb-2"><i className="fas fa-dna fa-2x"></i></div>
                                <h6>Avg Zoology</h6>
                                <h3 className="fw-bold">{zoologyAvg}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mb-4" data-aos="fade-up">
                        {['All', 'Daily', 'Weekend', 'Grand'].map(type => (
                            <button key={type}
                                className={`btn btn-outline-${type === 'All' ? 'primary' : type === 'Daily' ? 'success' : type === 'Weekend' ? 'warning' : 'danger'} m-1 ${filterType === type ? 'active' : ''}`}
                                onClick={() => handleFilterChange(type)}
                            >
                                {type} Tests
                            </button>
                        ))}
                    </div>

                    <div className="table-responsive" data-aos="fade-up">
                        <div className="card shadow mb-4 p-3" data-aos="fade-up">
                            <h5 className="text-center text-primary mb-3">Performance Progress Chart</h5>
                            <Line data={chartData} options={chartOptions} />
                        </div>
                        <table className="table table-bordered text-center">
                            <thead className="table-primary">
                                <tr>
                                    <th>Date</th>
                                    <th>Test Name</th>
                                    <th>Physics</th>
                                    <th>Chemistry</th>
                                    <th>Botany</th>
                                    <th>Zoology</th>
                                    <th>Total</th>
                                    <th>Rank</th>
                                    <th>Test Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedResults.length === 0 ? (
                                    <tr><td colSpan="9">No Results Found for Selected Filter</td></tr>
                                ) : (
                                    paginatedResults.map((test, index) => (
                                        <tr key={index}>
                                            <td>{formatDate(test.date)}</td>
                                            <td>{test.testname}</td>
                                            <td>{test.physics}</td>
                                            <td>{test.chemistry}</td>
                                            <td>{test.botany}</td>
                                            <td>{test.zoology}</td>
                                            <td>{test.total}</td>
                                            <td>{test.rank}</td>
                                            <td>{test.testtype}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                ← Previous
                            </button>

                            <span>Page {currentPage} of {Math.ceil(filtered.length / itemsPerPage)}</span>

                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setCurrentPage(prev => (prev < Math.ceil(filtered.length / itemsPerPage) ? prev + 1 : prev))}
                                disabled={currentPage === Math.ceil(filtered.length / itemsPerPage)}
                            >
                                Next →
                            </button>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}

export default ExamResults;
