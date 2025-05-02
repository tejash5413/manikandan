import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Atom } from 'react-loading-indicators';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx5RL4Ke5ktuMbzEJ88Hy6U-8VOX514Su9dTxZjOmEME47G3Yc5ZFR30hzCCAHb8wDJsA/exec";

function FacultyPage() {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dummy fallback
    const dummyFaculty = [
        {
            name: "Dr. Aravind Raj",
            subject: "Biology",
            photourl: "https://randomuser.me/api/portraits/men/45.jpg",
            bio: "15+ years experience in NEET Biology coaching."
        },
        {
            name: "Prof. Kavitha Iyer",
            subject: "Physics",
            photourl: "https://randomuser.me/api/portraits/women/44.jpg",
            bio: "Known for concept clarity and real-time NEET problem solving."
        },
        {
            name: "Dr. Manoj K",
            subject: "Chemistry",
            photourl: "https://randomuser.me/api/portraits/men/46.jpg",
            bio: "Expert in Organic & Inorganic NEET modules."
        },
        {
            name: "Mrs. Shruthi Ramesh",
            subject: "English / Reasoning",
            photourl: "https://randomuser.me/api/portraits/women/43.jpg",
            bio: "Makes comprehension and communication a strength for students."
        }
    ];

    useEffect(() => {
        AOS.init({ duration: 1000 });
        const fetchFaculty = async () => {
            try {
                const res = await fetch(`${GOOGLE_SCRIPT_URL}?type=faculty`);
                const data = await res.json();
                if (data.length === 0) {
                    setFaculty(dummyFaculty);
                } else {
                    setFaculty(data);
                }
            } catch (err) {
                console.warn("Using dummy faculty list due to fetch failure.");
                setFaculty(dummyFaculty);
            } finally {
                setLoading(false);
            }
        };
        fetchFaculty();
    }, []);



    return (
        <div className="container py-5">
            <h2 className="text-center text-primary mb-3" data-aos="fade-down">Meet Our Expert Faculty</h2>
            <p className="text-center  mb-5" data-aos="fade-up">
                At <strong>Manikandan NEET Academy</strong>, we take pride in our highly qualified and experienced faculty members.
                With 10+ years of average teaching experience and unmatched dedication, our team ensures each student receives personal mentorship and top-tier guidance to crack NEET.
            </p>

            {loading ? (
                <div className="text-center">
                    <Atom color="#32cd32" size="medium" text="" textColor="" />                </div>
            ) : (
                <div className="row g-4">
                    {faculty.map((item, index) => (
                        <div key={index} className="col-md-4 col-lg-3" data-aos="zoom-in" data-aos-delay={index * 100}>
                            <div className="card shadow-sm h-100 border-0 rounded-4">
                                <img
                                    src={item.photourl || "https://via.placeholder.com/300x200?text=Faculty"}
                                    alt={item.name}
                                    className="card-img-top"
                                    style={{ height: "220px", objectFit: "cover" }}
                                />
                                <div className="card-body text-center">
                                    <h5 className="card-title text-primary">{item.name}</h5>
                                    <p className="card-text  small mb-1">{item.subject}</p>
                                    <p className="card-text small">{item.bio}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FacultyPage;
