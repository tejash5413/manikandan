import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './CoursesPage.css';
import { Atom } from 'react-loading-indicators';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase'; // adjust path if needed

function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        AOS.init({ duration: 1000 });
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const snapshot = await getDocs(collection(db, "courses"));
            const formatted = snapshot.docs.map(doc => {
                const course = doc.data();
                return {
                    title: course.title,
                    description: course.description,
                    icon: course.icon,
                    fees: {
                        hostel: course.hostelfee || "N/A",
                        dayscholar: course.dayscholarfee || "N/A"
                    },
                    duration: course.duration,
                    badge: course.badge || ""
                };
            });
            setCourses(formatted);
        } catch (err) {
            console.error("Failed to fetch courses", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <h2 className="text-center text-primary mb-5" data-aos="fade-down">Our Courses</h2>

            {loading ? (
                <div className="text-center">
                    <Atom animation="border" text="Loading" variant="primary" />
                </div>
            ) : (
                <div className="row g-4">
                    {courses.map((course, index) => (
                        <div key={index} className="col-md-6 col-lg-4" data-aos="zoom-in" data-aos-delay={index * 100}>
                            <div className="card border-0 shadow-sm rounded-4 position-relative overflow-hidden  h-100">
                                {course.badge && <div className="course-badge bg-warning text-dark">{course.badge}</div>}
                                <img src="/images/wave1.svg" alt="wave" className="course-card-wave" />
                                <div className="card-body text-center p-4">
                                    <i className={`${course.icon} fa-5x text-success mb-3`}></i>
                                    <h3 className="card-title fw-bold">{course.title}</h3>
                                    <p className="card-text text-secondary fs-6">{course.description}</p>
                                    <hr />
                                    <div className="fees-duration d-flex justify-content-between mt-3 fs-5">
                                        <span className="text-primary"><i className="bi bi-clock"></i> {course.duration}</span>
                                    </div>
                                    <div className="text-start w-100 mt-3 fs-6">
                                        <div><strong>Hostel:</strong> <span className="text-success">{course.fees.hostel}</span></div>
                                        <div><strong>Day Scholar:</strong> <span className="text-info">{course.fees.dayscholar}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="text-center mt-5">
                        <Link to="/apply" className="btn btn-primary btn-lg shadow-lg px-4">
                            Apply Now
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CoursesPage;
