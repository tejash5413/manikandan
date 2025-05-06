import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Spinner } from 'react-bootstrap';
import { FaUserGraduate, FaIdBadge, FaSchool, FaCalendarCheck, FaFlask, FaAtom, FaLeaf, FaDna, FaClipboardList, FaBookReader, FaMedal, FaDownload } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { toast } from 'react-toastify';

function ProgressCard() {
    const navigate = useNavigate();

    const [results, setResults] = useState([]);
    const [rollno, setRollno] = useState('');
    const [name, setName] = useState('');
    const [studentClass, setStudentClass] = useState('');
    const [batch, setBatch] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [loading, setLoading] = useState(true);
    const [testCounts, setTestCounts] = useState({ daily: 0, weekend: 0, grand: 0 });
    const [, setRankTrend] = useState(null);

    useEffect(() => {
        AOS.init({ duration: 1000 });
        const storedRollno = localStorage.getItem("studentRollno");
        if (storedRollno) {
            setRollno(storedRollno);
            fetchResults(storedRollno);
        }
    }, []);

    const fetchResults = async (rollno) => {
        try {
            // 🔹 First: Get student details from Firestore
            const q = query(collection(db, "students"), where("rollno", "==", rollno));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const student = snapshot.docs[0].data();
                setName(student.name || '');
                setStudentClass(student.class || '');
                setBatch(student.batch || '');
            } else {
                console.warn("Student not found in Firestore");
            }

            // 🔹 Then: Fetch performance results from Google Sheets
            const response = await fetch("https://script.google.com/macros/s/AKfycbx5RL4Ke5ktuMbzEJ88Hy6U-8VOX514Su9dTxZjOmEME47G3Yc5ZFR30hzCCAHb8wDJsA/exec?type=results");
            const data = await response.json();

            const filtered = data.filter(entry =>
                String(entry.rollno || entry.RollNo || '').trim() === rollno.trim()
            );

            const daily = filtered.filter(t => (t.testtype || t.TestType)?.trim() === 'Daily').length;
            const weekend = filtered.filter(t => (t.testtype || t.TestType)?.trim() === 'Weekend').length;
            const grand = filtered.filter(t => (t.testtype || t.TestType)?.trim() === 'Grand').length;

            setTestCounts({ daily, weekend, grand });
            setResults(filtered);

            // Rank trend logic
            const sortedByDate = [...filtered].sort((a, b) =>
                new Date(a.date || a.Date) - new Date(b.date || b.Date)
            );

            if (sortedByDate.length >= 2) {
                const latest = parseInt(sortedByDate[sortedByDate.length - 1].rank || sortedByDate[sortedByDate.length - 1].Rank);
                const previous = parseInt(sortedByDate[sortedByDate.length - 2].rank || sortedByDate[sortedByDate.length - 2].Rank);
                if (!isNaN(latest) && !isNaN(previous)) {
                    if (latest < previous) setRankTrend('up');
                    else if (latest > previous) setRankTrend('down');
                    else setRankTrend('same');
                }
            }
        } catch (error) {
            console.error("Error fetching results:", error);
            toast.error("❌ Failed to load results or student data.");
        } finally {
            setLoading(false);
        }
    };

    const filteredResults = results.filter(t => filterType === 'All' || (t.testtype || t.TestType) === filterType);

    const calculate = () => {
        if (filteredResults.length === 0) return {};

        let totalMarks = 0, maxMarks = 0, rankSum = 0, rankCount = 0;
        let subjectTotals = { Physics: 0, Chemistry: 0, Botany: 0, Zoology: 0 };

        filteredResults.forEach(test => {
            const physics = parseInt(test.physics || test.Physics || 0);
            const chemistry = parseInt(test.chemistry || test.Chemistry || 0);
            const botany = parseInt(test.botany || test.Botany || 0);
            const zoology = parseInt(test.zoology || test.Zoology || 0);
            const testType = (test.testtype || test.TestType || '').trim();
            const testTotal = physics + chemistry + botany + zoology;

            totalMarks += testTotal;
            maxMarks += testType === "Daily" ? 160 : 720;
            subjectTotals.Physics += physics;
            subjectTotals.Chemistry += chemistry;
            subjectTotals.Botany += botany;
            subjectTotals.Zoology += zoology;

            const rank = parseInt(test.rank || test.Rank);
            if (!isNaN(rank)) {
                rankSum += rank;
                rankCount++;
            }
        });

        const count = filteredResults.length;

        return {
            avgTotal: (totalMarks / count).toFixed(2),
            avgPercent: ((totalMarks / maxMarks) * 100).toFixed(2),
            bestRank: rankCount > 0 ? Math.round(rankSum / rankCount) : '-',
            physicsAvg: (subjectTotals.Physics / count).toFixed(2),
            chemistryAvg: (subjectTotals.Chemistry / count).toFixed(2),
            botanyAvg: (subjectTotals.Botany / count).toFixed(2),
            zoologyAvg: (subjectTotals.Zoology / count).toFixed(2)
        };
    };

    const { avgTotal, avgPercent, bestRank, physicsAvg, chemistryAvg, botanyAvg, zoologyAvg } = calculate();
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
    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        doc.setFillColor(220, 53, 69);
        doc.rect(0, 0, 210, 35, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255);
        doc.setFontSize(16);
        doc.text('MANIKANDAN ACADEMY', 105, 15, { align: 'center' });

        doc.setFontSize(11);
        doc.text('..An Institution for NEET & JEE     ..Step by step learning', 105, 22, { align: 'center' });


        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('PMN COMPLEX, 1ST FLOOR, ABOVE HDFC BANK, OPPT TO RAILWAY STATION', 105, 30, { align: 'center' });
        doc.text('HOSUR - 635109 | PHONE: 7397746644 / 7397746633', 105, 35, { align: 'center' });

        let y = 45;

        doc.setTextColor(0);
        doc.setFontSize(12);
        doc.text(`${filterType} TEST ANALYSIS REPORT`, 105, y, { align: 'center' });

        y += 10;
        doc.setFontSize(10);
        doc.text(`Name: ${name}`, 20, y);
        doc.text(`Roll No: ${rollno}`, 110, y);
        y += 7;
        doc.text(`Class: ${studentClass}`, 20, y);
        doc.text(`Batch: ${batch}`, 110, y);
        y += 10;

        autoTable(doc, {
            startY: y,
            head: [['Total', 'Value']],
            body: [
                ['Average Marks', avgTotal],
                ['Average %', `${avgPercent}%`],
                ['Average Rank', bestRank],
            ],
            styles: { halign: 'center' },
            headStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255] },
            columnStyles: { 0: { halign: 'left' }, 1: { halign: 'center' } }
        });

        y = doc.lastAutoTable.finalY + 10;

        autoTable(doc, {
            startY: y,
            head: [['Subject', 'Average']],
            body: [
                ['Physics', physicsAvg],
                ['Chemistry', chemistryAvg],
                ['Botany', botanyAvg],
                ['Zoology', zoologyAvg],
            ],
            styles: { halign: 'center' },
            headStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255] },
            columnStyles: { 0: { halign: 'left' }, 1: { halign: 'center' } }
        });


        y = doc.lastAutoTable.finalY + 10;

        autoTable(doc, {
            startY: y,
            head: [['Sl No', 'Test Name', 'Date', 'Phy', 'Chem', 'Bot', 'Zoo', 'Total', 'Rank']],
            body: filteredResults.map((t, i) => {
                const p = parseInt(t.physics || t.Physics || 0);
                const c = parseInt(t.chemistry || t.Chemistry || 0);
                const b = parseInt(t.botany || t.Botany || 0);
                const z = parseInt(t.zoology || t.Zoology || 0);
                const total = (p + c + b + z) || 0;
                return [
                    i + 1,
                    t.testname || t.TestName || '-',
                    formatDate(t.date) || formatDate(t.Date) || '-',
                    p || '-',
                    c || '-',
                    b || '-',
                    z || '-',
                    total,
                    t.rank || t.Rank || '-'
                ];
            }),
            styles: { fontSize: 9, halign: 'center' },
            headStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255] }
        });

        doc.save(`${name}_${rollno}_${filterType}.pdf`);
    };

    return (
        <div className="container py-5 mt-5">
            <h2 className="text-center  mb-4">
                <FaUserGraduate className="me-2 mb-1" /> Student Progress Card
            </h2>

            <div className="text-center mb-3">
                {['All', 'Daily', 'Weekend', 'Grand'].map(type => (
                    <button
                        key={type}
                        className={`btn btn-outline-${filterType === type ? 'primary' : 'secondary'} mx-1`}
                        onClick={() => setFilterType(type)}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div className="text-end mb-3">
                <button className="btn btn-outline-danger " onClick={() => navigate('/student-dashboard')}>
                    ← Back to Dashboard
                </button>
                <button className="btn btn-outline-success" onClick={handleDownloadPDF}>
                    <FaDownload className="me-2" /> Download PDF
                </button>
            </div>

            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <div className="card shadow p-4 mb-4">
                    <div className="d-flex flex-md-row flex-column gap-4 align-items-center">
                        <img src="/logo.png" className="rounded-circle" style={{ width: 80, height: 80 }} alt="Logo" />
                        <div>
                            <h4 className="text-success fw-bold">Progress Card ({filterType} Tests)</h4>
                            <p><FaUserGraduate /> <strong>Name:</strong> {name}</p>
                            <p><FaIdBadge /> <strong>Roll No:</strong> {rollno}</p>
                            <p><FaSchool /> <strong>Class:</strong> {studentClass} &nbsp; <strong>Batch:</strong> {batch}</p>
                            <p><FaCalendarCheck /> <strong>Tests Taken:</strong> Daily: {testCounts.daily}, Weekend: {testCounts.weekend}, Grand: {testCounts.grand}</p>
                        </div>
                    </div>

                    <hr />

                    <div className="row row-cols-1 row-cols-md-3 g-4 text-center mt-3">
                        <div className="col">
                            <div className="card border-0 shadow-sm h-100 ">
                                <div className="card-body">
                                    <FaClipboardList className="fs-3 text-danger mb-2" />
                                    <h6 className="fw-bold ">Average Marks</h6>
                                    <h5 className="fw-semibold ">{avgTotal}</h5>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card border-0 shadow-sm h-100 ">
                                <div className="card-body">
                                    <FaBookReader className="fs-3 text-info mb-2" />
                                    <h6 className="fw-bold ">Average %</h6>
                                    <h5 className="fw-semibold ">{avgPercent}%</h5>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card border-0 shadow-sm h-100 ">
                                <div className="card-body">
                                    <FaMedal className="fs-3 text-warning mb-2" />
                                    <h6 className="fw-bold ">Average Rank</h6>
                                    <h5 className="fw-semibold ">{bestRank}</h5>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row row-cols-2 row-cols-md-4 g-4 text-center mt-3">
                        <div className="col">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <FaAtom className="fs-3 text-primary mb-2" />
                                    <h6 className="fw-bold ">Physics</h6>
                                    <h5 className="fw-semibold ">{physicsAvg}</h5>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <FaFlask className="fs-3 text-success mb-2" />
                                    <h6 className="fw-bold ">Chemistry</h6>
                                    <h5 className="fw-semibold ">{chemistryAvg}</h5>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <FaLeaf className="fs-3 text-success mb-2" />
                                    <h6 className="fw-bold ">Botany</h6>
                                    <h5 className="fw-semibold ">{botanyAvg}</h5>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <FaDna className="fs-3 text-secondary mb-2" />
                                    <h6 className="fw-bold ">Zoology</h6>
                                    <h5 className="fw-semibold ">{zoologyAvg}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProgressCard;
