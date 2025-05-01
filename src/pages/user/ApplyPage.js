import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';
import animationData from '../../assets/apply.json';
import successAnimation from '../../assets/success.json';
import './ApplyPage.css';

function ApplyPage() {
    const [successAnimationVisible, setSuccessAnimationVisible] = useState(false);
    const [courses, setCourses] = useState([]);
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx5RL4Ke5ktuMbzEJ88Hy6U-8VOX514Su9dTxZjOmEME47G3Yc5ZFR30hzCCAHb8wDJsA/exec";

    useEffect(() => {
        AOS.init({ duration: 1000 });
        fetch(`${GOOGLE_SCRIPT_URL}?type=courses`)
            .then(res => res.json())
            .then(data => setCourses(data))
            .catch(err => console.error("Failed to fetch courses", err));
    }, []);

    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', address: '', course: '', accommodation: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const emptyField = Object.values(formData).some(field => !field);
        if (emptyField) return toast.error("Please fill all fields properly!");

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "apply", ...formData })
            });

            toast.success(`Thank you ${formData.name}, your application for ${formData.course} was submitted.`);
            setSuccessAnimationVisible(true);
            setFormData({ name: '', phone: '', email: '', address: '', course: '', accommodation: '' });

            setTimeout(() => setSuccessAnimationVisible(false), 2500);
        } catch (err) {
            toast.error("⚠️ Network error. Check internet or script access.");
        }
    };

    return (
        <div className="container py-5">




            <form className="row g-4 p-4 rounded-4 " onSubmit={handleSubmit} data-aos="fade-up">
                <div className="row align-items-center mb-5">
                    <div className="col-md-6" data-aos="fade-right">
                        <h2 className=" fw-bold mb-3">
                            Apply for Admission
                        </h2>
                        <p >Get started on your NEET journey with expert guidance and quality coaching.</p>
                    </div>
                    <div className=" col-md-6" data-aos="fade-left">
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
                { label: 'Email ID', name: 'email', type: 'email', icon: 'fas fa-envelope' }].map((field, i) => (
                    <div className="col-md-6" key={field.name}>
                        <label className="form-label">
                            <i className={`${field.icon} me-2 text-secondary`}></i> {field.label}
                        </label>
                        <input
                            type={field.type}
                            className="form-control"
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            placeholder={`Enter your ${field.label.toLowerCase()}`}
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
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your complete address"
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
                        {courses.map((course, i) => (
                            <option key={i} value={course.title}>{course.title}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label d-block">
                        <i className="fas fa-bed me-2 text-info"></i> Accommodation
                    </label>
                    {['Day Scholar', 'Hosteller'].map(option => (
                        <div className="form-check form-check-inline" key={option}>
                            <input
                                className="form-check-input"
                                type="radio"
                                name="accommodation"
                                id={option}
                                value={option}
                                checked={formData.accommodation === option}
                                onChange={handleChange}
                                required
                            />
                            <label className="form-check-label" htmlFor={option}>{option}</label>
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
