import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Footer() {
    return (
        <footer className="bg-dark text-light py-4">
            <div className="container">
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <div className="col-md-4 mb-4">
                            <h5 className="text-uppercase">Manikandan NEET Academy</h5>
                            <p>Empowering future doctors with structured training, mentorship, and commitment to excellence.</p>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="col-md-4 mb-4">
                        <h5>Contact Us</h5>
                        <p><i className="bi bi-geo-alt-fill me-2"></i> PMN complex, 1st Floor, Above HDFC Bank, Opp-Railway Station, Denkanikotta Road, Hosur - 635109</p>
                        <p><i className="bi bi-telephone-fill me-2"></i> +91 7397746644/7397746633</p>
                        <p><i className="bi bi-envelope-fill me-2"></i> manikandanneetacademy@gmail.com
                        </p>
                    </div>

                    {/* Links & Social */}
                    <div className="col-md-4 mb-4">
                        <h5>Follow Us</h5>
                        <div className="d-flex gap-3">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white">
                                <i className="bi bi-facebook fs-4"></i>
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white">
                                <i className="bi bi-instagram fs-4"></i>
                            </a>
                            <a href="https://youtube.com/@yourchannel" target="_blank" rel="noopener noreferrer" className="text-white">
                                <i className="bi bi-youtube fs-4"></i>
                            </a>
                            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="text-white">
                                <i className="bi bi-whatsapp fs-4"></i>
                            </a>
                        </div>
                    </div>
                </div>

                <hr className="border-light" />
                <p className="text-center mb-0">&copy; {new Date().getFullYear()} Manikandan NEET Academy. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
