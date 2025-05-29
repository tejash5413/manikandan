import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import CountUp from 'react-countup';
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';

const ResultsPage = () => {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const [filterYear, setFilterYear] = useState('All');
    const toppers = [
        { appno: 2550555, name: 'Ravi Kumar', photo: '/images/topper1.jpg', score: 695, course: 'NEET Foundation', year: 2025, college: 'MMC' },
        { appno: 2550555, name: 'Sneha Reddy', photo: '/images/topper2.jpg', score: 685, course: 'Crash Course', year: 2024, college: 'MMC' },
        { appno: 2550555, name: 'Rahul M', photo: '/images/topper3.jpg', score: 678, course: 'Repeater Batch', year: 2025, college: 'MMC' },
        { appno: 2550555, name: 'Meena S', photo: '/images/topper4.jpg', score: 655, course: 'NEET Foundation', year: 2023, college: 'MMC' },
        { appno: 2550555, name: 'Ravi Kumar', photo: '/images/topper1.jpg', score: 695, course: 'NEET Foundation', year: 2025, college: 'MMC' },
        { appno: 2550555, name: 'Sneha Reddy', photo: '/images/topper2.jpg', score: 685, course: 'Crash Course', year: 2024, college: 'MMC' },
        { appno: 2550555, name: 'Rahul M', photo: '/images/topper3.jpg', score: 678, course: 'Repeater Batch', year: 2025, college: 'MMC' },
        { appno: 2550555, name: 'Meena S', photo: '/images/topper4.jpg', score: 655, course: 'NEET Foundation', year: 2023, college: 'MMC' },
    ];

    const filteredToppers = filterYear === 'All' ? toppers : toppers.filter(t => t.year === parseInt(filterYear));

    return (
        <div className="container py-5">
            <h2 className="text-center text-primary mb-5" data-aos="fade-down">
                <i className="fas fa-trophy me-3 text-warning"></i> Student Achievements
            </h2>
            {/* Filter by Year */}
            <div className="text-center mb-4">
                <label className="me-2">Filter by Year:</label>
                <div className="d-flex justify-content-center align-items-center gap-2 mb-4">
                    <label htmlFor="yearSelect" className="form-label fw-semibold me-2">
                        <i className="bi bi-calendar2-range text-primary me-1"></i> Filter by Year:
                    </label>
                    <select
                        id="yearSelect"
                        className="form-select w-auto shadow-sm rounded-pill border-primary text-center"
                        style={{ minWidth: "120px" }}
                        onChange={(e) => setFilterYear(e.target.value)}
                    >
                        <option value="All">All</option>
                        {[...Array(2025 - 2017 + 1)].map((_, i) => {
                            const year = 2017 + i;
                            return (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            );
                        })}
                    </select>
                </div>

            </div>

            {/* Animated Counters */}
            <div className="row text-center mb-5">
                <div className="col-md-4">
                    <h3><CountUp end={10} duration={2} /></h3>
                    <p className="text-success">Students 650+ Score</p>
                </div>
                <div className="col-md-4">
                    <h3><CountUp end={6} duration={2} /></h3>
                    <p className="text-warning">600 - 649 Score</p>
                </div>
                <div className="col-md-4">
                    <h3><CountUp end={4} duration={2} /></h3>
                    <p className="text-danger">550 - 599 Score</p>
                </div>
            </div>

            {/* Topper Cards */}
            <div className="row g-4">
                {filteredToppers.map((student, idx) => (
                    <div className="col-md-4" key={idx} data-aos="zoom-in" data-aos-delay={idx * 100}>
                        <div className="card shadow border-0 text-center p-3">
                            <img src={student.photo} alt={student.name} className="rounded-circle mx-auto" style={{ width: "120px", height: "120px", objectFit: "cover" }} />
                            <h5 className="mt-3">{student.name}</h5>
                            <p>Application NO :  <strong>{student.appno}</strong></p>
                            <p>Score: <strong>{student.score}</strong></p>
                            <span className="badge bg-success">{student.course} - {student.year}</span>

                            <span className=" mt-2 badge bg-warning text-black">College :  <strong>{student.college}</strong></span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Testimonials Carousel */}
            <h3 className="text-center mt-5 mb-3" data-aos="fade-down">🗞️ Student Testimonials</h3>
            <Carousel className=" bg-dark text-white w-100 mx-auto" data-aos="zoom-in">
                <Carousel.Item >
                    <blockquote className="blockquote text-center">
                        <p className="mb-4">"Manikandan Academy changed my life. The foundation batch gave me everything I needed to crack NEET. Manikandan Academy changed my life. The foundation batch gave me everything I needed to crack NEET."</p>
                        <footer className="blockquote-footer">Ravi Kumar, 2025</footer>
                    </blockquote>
                </Carousel.Item>
                <Carousel.Item>
                    <blockquote className="blockquote text-center">
                        <p className="mb-4">"The crash course was super intense but it really paid off. Thanks to all my mentors!"</p>
                        <footer className="blockquote-footer">Sneha Reddy, 2024</footer>
                    </blockquote>
                </Carousel.Item>
                <Carousel.Item>
                    <blockquote className="blockquote text-center">
                        <p className="mb-4">"I repeated the exam with the right support and now I'm in a top government college. Highly recommend."</p>
                        <footer className="blockquote-footer">Rahul M, 2025</footer>
                    </blockquote>
                </Carousel.Item>
            </Carousel>
        </div>
    );
};

export default ResultsPage;
