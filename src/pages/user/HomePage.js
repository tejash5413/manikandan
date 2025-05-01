import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Typewriter } from 'react-simple-typewriter';
import '../../App.css';

function HomePage({ isDarkMode, toggleDarkMode }) {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    return (
        <div>

            {/* Hero Section */}
            <section
                className="text-white"

            >
                <section
                    className="text-white position-relative d-flex align-items-center"
                    style={{
                        backgroundImage: `url('/images/education1.png')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        minHeight: '100vh',
                        padding: '80px 30px',
                    }}
                >
                    {/* Gradient Overlay */}
                    <div
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{
                            background: "linear-gradient(to right, rgba(30, 60, 114, 0.95), rgba(42, 82, 152, 0.75))",
                            zIndex: 1,
                        }}
                    ></div>

                    {/* Content */}
                    <div className="container position-relative h-100 d-flex align-items-center" style={{ zIndex: 2 }}>
                        <div className="row w-100">
                            <div className="col-lg-8 col-md-10" data-aos="fade-right">
                                <img
                                    src="/logo.png"
                                    alt="Manikandan Academy Logo"
                                    style={{ width: '250px', marginBottom: '30px' }}
                                    className="img-fluid"
                                />
                                <h1 className="display-3 fw-bold text-white mb-3">
                                    <Typewriter
                                        words={['Manikandan Academy']}
                                        loop={0} // or Infinity for endless loop
                                        cursor
                                        cursorStyle="|"
                                        typeSpeed={78}
                                        deleteSpeed={60}
                                        delaySpeed={2000}
                                    />
                                </h1>
                                <p className="fs-4 text-light mb-4" style={{ maxWidth: '700px' }}>
                                    Your trusted path to NEET success. Expert faculty, proven results, and smart learning for ambitious medical aspirants.
                                </p>
                                <Link
                                    to="/apply"
                                    className="btn btn-success btn-lg shadow px-5 py-3 fs-5"
                                >
                                    <i className="col-sm-4 "></i>Apply Now
                                </Link>
                            </div>
                        </div>
                    </div>

                </section>

            </section>


            {/* About Section */}
            <section className="py-5 ">
                <div className="container" data-aos="fade-up">
                    <h2 className="text-center text-primary mb-4">About Manikandan NEET Academy</h2>
                    <p className="lead text-center ">
                        A premier institute dedicated to helping students excel in NEET. With top faculty, tailored resources, and a motivating environment, we guide every student toward success.
                    </p>
                </div>
            </section>

            {/* Chairman Section */}
            <section className={`py-5 ${isDarkMode ? 'bg-gradient-dark text-white' : 'bg-gradient-light text-dark'}`}>
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-4 text-center mb-4 mb-md-0" data-aos="zoom-in">
                            <img src="/images/chairman.png" alt="Chairman" className="img-fluid rounded-circle shadow" style={{ width: "200px" }} />
                        </div>
                        <div className="col-md-8" data-aos="fade-left">
                            <h3 >Mr. Siva Koteswara Rao - Founder & Chairman</h3>
                            <p >
                                With 20+ years of academic leadership, Mr. Siva Koteswara Rao aims to nurture top-ranking NEET aspirants through quality teaching and commitment.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-5 ">
                <div className="container text-center">
                    <h2 className="text-primary mb-4" data-aos="fade-up">Why Choose Us?</h2>
                    <div className="row g-4">
                        <div className="col-md-3" data-aos="zoom-in">
                            <div className="shadow-sm p-4 rounded-4  h-100">
                                <i className="fas fa-chalkboard-teacher fa-2x text-success mb-2"></i>
                                <h6>Expert Faculty</h6>
                                <p className=" small">Specialized, experienced NEET educators.</p>
                            </div>
                        </div>
                        <div className="col-md-3" data-aos="zoom-in" data-aos-delay="100">
                            <div className="shadow-sm p-4 rounded-4  h-100">
                                <i className="fas fa-trophy fa-2x text-warning mb-2"></i>
                                <h6>Top Results</h6>
                                <p className=" small">Yearly top ranks in NEET exams.</p>
                            </div>
                        </div>
                        <div className="col-md-3" data-aos="zoom-in" data-aos-delay="200">
                            <div className="shadow-sm p-4 rounded-4  h-100">
                                <i className="fas fa-book-open fa-2x  mb-2"></i>
                                <h6>Modern Study Material</h6>
                                <p className=" small">Smart, updated NEET-focused notes.</p>
                            </div>
                        </div>
                        <div className="col-md-3" data-aos="zoom-in" data-aos-delay="300">
                            <div className="shadow-sm p-4 rounded-4  h-100">
                                <i className="fas fa-university fa-2x text-danger mb-2"></i>
                                <h6>Smart Campus</h6>
                                <p className=" small">Digital classrooms & hostel facilities.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Courses Preview */}
            <section className="py-5" style={{ background: "linear-gradient(to right, #e0c3fc, #8ec5fc)" }}>
                <div className="container" data-aos="fade-up">
                    <h2 className="text-center text-dark mb-5">Our Courses</h2>
                    <div className="row text-center g-4">
                        <div className="col-md-4" data-aos="flip-left">
                            <div className="card shadow border-0 h-100">
                                <div className="card-body">
                                    <i className="fas fa-layer-group fa-2x text-success mb-3"></i>
                                    <h5>NEET Foundation</h5>
                                    <p className="small ">Solid fundamentals for 11th & 12th aspirants.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4" data-aos="flip-left" data-aos-delay="100">
                            <div className="card shadow border-0 h-100">
                                <div className="card-body">
                                    <i className="fas fa-bolt fa-2x text-warning mb-3"></i>
                                    <h5>Crash Course</h5>
                                    <p className="small ">Intensive revision with rapid test series.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4" data-aos="flip-left" data-aos-delay="200">
                            <div className="card shadow border-0 h-100">
                                <div className="card-body">
                                    <i className="fas fa-sync fa-2x text-danger mb-3"></i>
                                    <h5>Repeater Batch</h5>
                                    <p className="small ">For repeaters aiming to boost NEET scores.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <Link to="/courses" className="btn btn-light btn-lg text-primary fw-semibold shadow-sm">
                            <i className="fas fa-arrow-circle-right me-2"></i>View All Courses
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}

export default HomePage;
