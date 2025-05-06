import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';
import animationData from '../../assets/apply.json';
import successAnimation from '../../assets/success.json';
import './ApplyPage.css';
import { db } from '../../services/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

function ApplyPage() {
    const [successAnimationVisible, setSuccessAnimationVisible] = useState(false);
    const [courses, setCourses] = useState([]);

    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', address: '', course: '', accommodation: '',
    });

    useEffect(() => {
        AOS.init({ duration: 1000 });
        const fetchCourses = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'courses'));
                const courseList = snapshot.docs.map(doc => doc.data());
                setCourses(courseList);
            } catch (err) {
                console.error("Error fetching courses:", err);
            }
        };
        fetchCourses();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const empty = Object.values(formData).some(val => !val.trim());
        if (empty) return toast.error("⚠️ Please fill all fields!");

        try {
            await addDoc(collection(db, "applications"), {
                ...formData,
                submittedAt: new Date().toISOString()
            });

            toast.success(`Thank you ${formData.name}, your application was submitted!`);
            setSuccessAnimationVisible(true);
            setFormData({ name: '', phone: '', email: '', address: '', course: '', accommodation: '' });

            setTimeout(() => setSuccessAnimationVisible(false), 2500);
        } catch (err) {
            console.error("Firestore error:", err);
            toast.error("Failed to submit. Try again.");
        }
    };

    return (
        <div className="container py-5">
            <form className="row g-4 p-4 rounded-4" onSubmit={handleSubmit} data-aos="fade-up">
                <div className="row align-items-center mb-5">
                    <div className="col-md-6" data-aos="fade-right">
                        <h2 className="fw-bold mb-3">Apply for Admission</h2>
                        <p>Get started on your NEET journey with expert guidance and quality coaching.</p>
                    </div>
                    <div className="col-md-6" data-aos="fade-left">
                        <Lottie animationData={animationData} style={{ height: '250px' }} />
                    </div>
                </div>

                {successAnimationVisible && (
                    <div className="text-center my-4">
                        <Lottie animationData={successAnimation} style={{ height: 150 }} />
                    </div>
                )}

                {[{ label: 'Full Name', name: 'name', type: 'text', icon: 'fas fa-user' },
                { label: 'Mobile Number', name: 'phone', type: 'tel', icon: 'fas fa-phone' },
                { label: 'Email ID', name: 'email', type: 'email', icon: 'fas fa-envelope' }]
                    .map((field, i) => (
                        <div className="col-md-6" key={i}>
                            <label className="form-label">
                                <i className={`${field.icon} me-2 text-secondary`}></i> {field.label}
                            </label>
                            <input
                                type={field.type}
                                name={field.name}
                                className="form-control"
                                placeholder={`Enter your ${field.label.toLowerCase()}`}
                                value={formData[field.name]}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    ))}

                <div className="col-md-12">
                    <label className="form-label">
                        <i className="fas fa-map-marker-alt me-2 text-danger"></i> Address
                    </label>
                    <textarea
                        className="form-control"
                        name="address"
                        placeholder="Enter your complete address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="3"
                        required
                    ></textarea>
                </div>

                <div className="col-md-6">
                    <label className="form-label">
                        <i className="fas fa-book me-2 text-primary"></i> Select Course
                    </label>
                    <select
                        className="form-select"
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        required
                    >
                        <option value="">-- Select Course --</option>
                        {courses.map((course, idx) => (
                            <option key={idx} value={course.title}>{course.title}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label d-block">
                        <i className="fas fa-bed me-2 text-info"></i> Accommodation
                    </label>
                    {['Day Scholar', 'Hosteller'].map((opt, idx) => (
                        <div className="form-check form-check-inline" key={idx}>
                            <input
                                className="form-check-input"
                                type="radio"
                                name="accommodation"
                                id={opt}
                                value={opt}
                                checked={formData.accommodation === opt}
                                onChange={handleChange}
                                required
                            />
                            <label className="form-check-label" htmlFor={opt}>{opt}</label>
                        </div>
                    ))}
                </div>

                <div className="col-12 text-center">
                    <button type="submit" className="btn btn-primary btn-lg px-5 shadow">
                        <i className="fas fa-paper-plane me-2"></i> Submit Application
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ApplyPage;
