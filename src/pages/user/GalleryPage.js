import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Spinner } from 'react-bootstrap';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx5RL4Ke5ktuMbzEJ88Hy6U-8VOX514Su9dTxZjOmEME47G3Yc5ZFR30hzCCAHb8wDJsA/exec";

function Gallery() {
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        AOS.init({ duration: 1000 });
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            const res = await fetch(`${GOOGLE_SCRIPT_URL}?type=gallery`);
            const data = await res.json();
            setGallery(data);
        } catch (error) {
            console.error("Failed to load gallery, showing dummy data.");
            setGallery([
                { title: "NEET Foundation", imageurl: "https://via.placeholder.com/400x300?text=Foundation", description: "Top students" },
                { title: "Crash Course", imageurl: "https://via.placeholder.com/400x300?text=Crash", description: "Fast NEET training" },
                { title: "Hostel Life", imageurl: "https://via.placeholder.com/400x300?text=Hostel", description: "Stay & Study" },
                { title: "Science Lab", imageurl: "https://via.placeholder.com/400x300?text=Labs", description: "Practical Training" }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <h2 className="text-center text-primary mb-5" data-aos="fade-down">
                <i className="fas fa-images me-2"></i> Academy Gallery
            </h2>

            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <PhotoProvider>
                    <div className="row g-4" data-aos="fade-up">
                        {gallery.length === 0 ? (
                            <p className="text-center">No images available.</p>
                        ) : (
                            gallery.map((item, index) => (
                                <div key={index} className="col-md-6 col-lg-4" data-aos="zoom-in" data-aos-delay={index * 100}>
                                    <div className="card shadow-sm h-100 border-0 rounded-4 overflow-hidden">
                                        <PhotoView src={item.imageurl}>
                                            <img
                                                src={item.imageurl}
                                                alt={item.title}
                                                className="card-img-top"
                                                style={{ height: "250px", objectFit: "cover", cursor: "pointer" }}
                                            />
                                        </PhotoView>
                                        <div className="card-body">
                                            <h5 className="card-title text-primary">{item.title}</h5>
                                            <p className="card-text small">{item.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </PhotoProvider>
            )}
        </div>
    );
}

export default Gallery;
