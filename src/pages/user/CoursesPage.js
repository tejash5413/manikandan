import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './CoursesPage.css';
import { Atom } from 'react-loading-indicators';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx5RL4Ke5ktuMbzEJ88Hy6U-8VOX514Su9dTxZjOmEME47G3Yc5ZFR30hzCCAHb8wDJsA/exec";

function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        AOS.init({ duration: 1000 });
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch(`${GOOGLE_SCRIPT_URL}?type=courses`);
            const data = await res.json();
            const formatted = data.map(course => ({
                title: course.title,
                description: course.description,
                icon: course.icon,
                fees: {
                    hostel: course.hostelfee || "N/A",
                    dayscholar: course.dayscholarfee || "N/A"
                },
                duration: course.duration,
                badge: course.badge || ""
            }));
            setCourses(formatted);
        } catch (err) {
            console.error("Failed to fetch courses", err);
        }
        setLoading(false);

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
                        <div key={index} className="col-md-6 col-lg-4 " data-aos="zoom-in" data-aos-delay={index * 100}>
                            <div className=" border-0 position-relative overflow-hidden">
                                <div className="course-badge">{course.badge}</div>
                                <img src="/images/wave1.svg" alt="wave" className="course-card-wave" />
                                <div className="card-body text-center p-4">
                                    <i className={`${course.icon} fa-5x text-success mb-3`}></i>
                                    <h3 className="card-title">{course.title}</h3>
                                    <p className="card-text d-fle large">{course.description}</p>
                                    <hr />
                                    <div className="fees-duration d-flex justify-content-between mt-2 fs-5">
                                        <span className="text-primary"><i className="bi bi-clock"></i> {course.duration}</span>
                                    </div>
                                    <div className="text-start w-100 mb-2 fs-5">
                                        <div><strong>Hostel:</strong> <span className="text-success ">{course.fees.hostel}</span></div>
                                        <div><strong>Day Scholar:</strong> <span className="text-info">{course.fees.dayscholar}</span></div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="text-center mt-5">
                        <Link to="/apply" className="btn btn-primary btn-lg shadow-lg">
                            Apply Now
                        </Link>
                    </div>
                </div>

            )}

        </div>
    );
}

export default CoursesPage;
