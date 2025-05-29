import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import TestimonialsSlider from '../../components/home/TestimonialsSlider'; // adjust path as needed

function AboutPage() {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    return (
        <div className="container py-5">
            <h2 className="text-center  mb-4" data-aos="fade-down">About Manikandan NEET Academy</h2>

            <div className="row mb-5" data-aos="fade-up">
                <div className="col-md-6">
                    <img src="/images/academy-building.jpg" className="img-fluid rounded shadow" alt="Academy" />
                </div>
                <div className="col-md-6 d-flex flex-column justify-content-center">
                    <p className="lead">
                        Manikandan NEET Academy is a premier coaching institute founded with a vision to empower students across India to achieve success in NEET and other medical entrance exams. With a blend of academic excellence, personalized mentorship, and strategic test prep methods, we have built a legacy of producing top medical aspirants.
                    </p>
                    <p>
                        Established in 2017, our academy has helped 1000+ students secure top government medical college seats. We believe in a structured and disciplined approach combined with compassion and guidance.
                    </p>
                </div>
            </div>

            <div className="row align-items-center" data-aos="fade-up" data-aos-delay="100">
                <div className="col-md-6">
                    <h4 className="text-success">Our Vision</h4>
                    <p>
                        To be the most trusted and result-oriented NEET coaching academy in the country, fostering future doctors who serve society with knowledge and empathy.
                    </p>

                    <h4 className="text-success mt-4">Chairman's Message</h4>
                    <p>
                        "We believe that every child has the potential to achieve greatness. With dedicated mentors, innovative resources, and a nurturing environment, we ensure our students rise with confidence and clarity."
                        <br /><strong>- Mr. Siva Koteswara Rao, Founder & Chairman</strong>
                    </p>
                </div>
                <div className="col-md-6">
                    <img src="/images/chairman.jpg" className="img-fluid rounded shadow" alt="Chairman" />
                </div>
            </div>

            <div className="text-center my-5" data-aos="zoom-in">
                <h4 className="mb-3">Welcome Video</h4>
                <div className="ratio ratio-16x9">
                    <iframe
                        src="https://www.youtube.com/embed/vZa-i9AQwA8"
                        title="Welcome to Manikandan NEET Academy"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>

            <TestimonialsSlider />


            <div className="text-center" data-aos="fade-up" data-aos-delay="200">
                <p className="lead fw-bold">
                    Join the journey of success, mentorship, and transformation with Manikandan NEET Academy.
                </p>
                <a
                    href="https://www.youtube.com/@manikandanacademyforneet5353"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-danger mt-2"
                >
                    Visit our YouTube Channel
                </a>
            </div>
        </div>
    );
}

export default AboutPage;
