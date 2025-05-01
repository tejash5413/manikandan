import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Spinner, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaExternalLinkAlt, FaBookOpen } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx5RL4Ke5ktuMbzEJ88Hy6U-8VOX514Su9dTxZjOmEME47G3Yc5ZFR30hzCCAHb8wDJsA/exec";

function Assignments() {
    const navigate = useNavigate();

    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        AOS.init({ duration: 1000 });
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const res = await fetch(`${GOOGLE_SCRIPT_URL}?type=assignments`);
            const data = await res.json();
            setAssignments(data);
        } catch (err) {
            console.error("Failed to load assignments:", err);
            setAssignments([
                {
                    "subject/exam": "Biology",
                    title: "Cell Structure Quiz",
                    duedate: "2025-05-05",
                    description: "Complete all MCQs from Chapter 5",
                    link: "https://example.com/biology-quiz",
                    postedon: "2025-04-30",
                    status: "Pending"
                },
                {
                    "subject/exam": "Physics",
                    title: "Numerical Worksheet",
                    duedate: "2025-05-06",
                    description: "Solve numerical questions from Chapter 3",
                    link: "",
                    postedon: "2025-04-30",
                    status: "Pending"
                },
                {
                    "subject/exam": "Chemistry",
                    title: "Organic Mechanisms",
                    duedate: "2025-05-07",
                    description: "Write notes for key reactions",
                    link: "https://example.com/organic-mech",
                    postedon: "2025-04-30",
                    status: "Completed"
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        return (
            <Badge pill bg={status.toLowerCase() === 'completed' ? 'success' : 'danger'}>
                {status}
            </Badge>
        );
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
    return (
        <div className="container py-5">
            <button
                className="btn btn-outline-danger"
                onClick={() => navigate('/student-dashboard')}
            >
                ← Back to Dashboard
            </button>
            <h2 className="text-center text-primary mb-5" data-aos="fade-up">📘 Student Assignments</h2>

            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : assignments.length === 0 ? (
                <p className="text-center ">No assignments available.</p>
            ) : (
                <div className="table-responsive" >
                    <table className="table table-hover align-middle text-center shadow-sm">
                        <thead className="table-primary">
                            <tr>
                                <th className="fw-semibold fs-5 ">#</th>
                                <th className="fw-semibold fs-5 ">📖 Subject / Exam</th>
                                <th className="fw-semibold fs-5 ">📝 Title</th>
                                <th className="fw-semibold fs-5 ">📅 Due Date</th>
                                <th className="fw-semibold fs-5 ">🧾 Description</th>
                                <th className="fw-semibold fs-5 ">🔗 Link</th>
                                <th className="fw-semibold fs-5 ">🕒 Posted On</th>
                                <th className="fw-semibold fs-5 ">📌 Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map((item, index) => (
                                <tr key={index} className={item.status.toLowerCase() === 'completed' ? 'table-success' : 'table-danger'}>
                                    <td className="fw-semibold fs-5">{index + 1}</td>
                                    <td className="fw-semibold text-start fs-5">
                                        <FaBookOpen className="me-2 text-secondary" />
                                        <span className="fw-medium">{item['subjectexam']}</span>
                                    </td>
                                    <td className="fw-semibold fs-5 ">{item.title}</td>
                                    <td className="fw-semibold fs-5 ">{formatDate(item.duedate)}</td>
                                    <td className=" fw-semibold text-start fs-5">{item.description}</td>
                                    <td className=" fw-semibold fs-5">
                                        {item.link ? (
                                            <OverlayTrigger placement="top" overlay={<Tooltip>Open Link</Tooltip>}>
                                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                                    <FaExternalLinkAlt className="text-primary fs-5" />
                                                </a>
                                            </OverlayTrigger>
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                    <td className="fw-semibold fs-5">{formatDate(item.postedon)}</td>
                                    <td className="fw-semibold fs-5">{getStatusBadge(item.status)}</td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            )}
        </div>
    );
}

export default Assignments;
