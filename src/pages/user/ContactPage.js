import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Lottie from 'lottie-react';
import contactAnimation from './contact.json'; // Ensure you place the Lottie JSON here
import '../../index.css';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_WEB_APP_ID/exec'; // Replace with real URL

function Contact() {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            toast.success('📬 Message submitted successfully!');
            window.scrollTo({ top: 0, behavior: 'smooth' });

            setFormData({ name: '', email: '', message: '' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            toast.error('❌ Submission failed');
        }
    };

    return (
        <div className="contact-section position-relative" >
            <div className="container py-5">
                <h2 className="text-center  fw-bold mb-5" data-aos="fade-down">
                    <i className="fas fa-handshake-angle me-2"></i>Connect with Manikandan Academy
                </h2>

                <div className="row g-4 align-items-stretch">
                    <div className="col-md-5" data-aos="fade-right">
                        <div className="card border-0  h-100  rounded-4">
                            <div className="card-body p-4">
                                <h5 className="text-success fw-bold mb-4">
                                    <i className="fas fa-handshake  me-2"></i> Reach Us
                                </h5>

                                <div className="mb-3 d-flex align-items-start">
                                    <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                                        <i className="fas fa-map-marker-alt text-danger fs-4"></i>
                                    </div>
                                    <div>
                                        <h6 className="mb-0">Address</h6>
                                        <small>PMN complex, 1st Floor, Above HDFC Bank, Opp-Railway Station, Denkanikotta Road, Hosur - 635109</small>
                                    </div>
                                </div>

                                <div className="mb-3 d-flex align-items-start">
                                    <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                                        <i className="fas fa-phone-alt text-success fs-4"></i>
                                    </div>
                                    <div>
                                        <h6 className="mb-0">Phone</h6>
                                        <small >+91 7397746644/7397746633</small>
                                    </div>
                                </div>

                                <div className="mb-3 d-flex align-items-start">
                                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                                        <i className="fas fa-envelope text-primary fs-4"></i>
                                    </div>
                                    <div>
                                        <h6 className="mb-0">Email</h6>
                                        <small >manikandanneetacademy@gmail.com
                                        </small>
                                    </div>
                                </div>

                                <div className="mb-1 d-flex align-items-start">
                                    <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                                        <i className="fas fa-clock text-warning fs-4"></i>
                                    </div>
                                    <div>
                                        <h6 className="mb-0">Working Hours</h6>
                                        <small >Mon - Sat: 9:00 AM - 8:00 PM</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="col-md-7" data-aos="fade-left">
                        <div className="card border-0   h-100 rounded-4">
                            <div className="card-body p-4">
                                <div className="row">
                                    <div className="col-lg-5 text-center" data-aos="fade-in">
                                        <div className="p-3">
                                            <Lottie animationData={contactAnimation} loop={true} style={{ maxWidth: '100%', height: '300px' }} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <form onSubmit={handleSubmit}>
                                            <div className="form-floating mb-3">
                                                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" required />
                                                <label>Your Name</label>
                                            </div>
                                            <div className="form-floating mb-3">
                                                <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} placeholder="Your Email" required />
                                                <label>Your Email</label>
                                            </div>
                                            <div className="form-floating mb-4">
                                                <textarea className="form-control" name="message" value={formData.message} onChange={handleChange} placeholder="Your Message" style={{ height: '150px' }} required></textarea>
                                                <label>Your Message</label>
                                            </div>
                                            <button type="submit" className="btn btn-primary w-100 py-2">
                                                <i className="fas fa-paper-plane me-2"></i>Send Message
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-5 rounded-4 overflow-hidden shadow" data-aos="zoom-in">
                    <iframe
                        title="Manikandan NEET Academy Location"
                        className="w-100"
                        height="300"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3896.3566554056565!2d77.8215895!3d12.7187985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae70bb3125a859%3A0x3eeeb125f1bf4241!2sManikandan%20Academy!5e0!3m2!1sen!2sin!4v1714401544648!5m2!1sen!2sin"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
    );
}

export default Contact;
