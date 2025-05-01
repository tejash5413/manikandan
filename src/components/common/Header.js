import React, { useState } from 'react';
import { Offcanvas, Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './nav.css';

function Header({ isDarkMode, toggleDarkMode }) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>


            <Navbar variant="light" fixed="top" className="shadow-sm navbar-dark bg-dark">

                <Container>
                    <Navbar.Brand as={Link} to="/" className="fw-bold text-white">
                        <img src="/logo.png" alt="Logo" style={{ width: '50px', marginRight: '8px', marginBottom: '8px' }} />
                        Manikandan Academy
                    </Navbar.Brand>
                    <Button variant="outline-secondary" className="d-lg-none text-white" onClick={handleShow}>
                        ☰
                    </Button>

                    <Nav className="ms-auto d-none d-lg-flex fw-semibold text-white">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/about">About</Nav.Link>
                        <Nav.Link as={Link} to="/courses">Courses</Nav.Link>
                        <Nav.Link as={Link} to="/faculty">Faculty</Nav.Link>
                        <Nav.Link as={Link} to="/gallery">Gallery</Nav.Link>
                        <Nav.Link as={Link} to="/results">Results</Nav.Link>
                        <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
                        <Nav.Link as={Link} to="/apply" className="text-success">Apply</Nav.Link>
                        <Nav.Link as={Link} to="/student-login" className="text-danger">Student Login</Nav.Link>
                        <Nav.Link as={Link} to="/admin-login" className="text-danger">Admin Login</Nav.Link>
                    </Nav>
                    <button
                        onClick={toggleDarkMode}
                        className="btn btn-sm btn-outline-light ms-3"
                        title="Toggle Dark Mode"
                    >
                        <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                    </button>
                </Container>

            </Navbar>

            {/* Side Drawer */}
            <Offcanvas show={show} onHide={handleClose} placement="start" className="d-lg-none custom-drawer bg-dark">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title className="fw-bold text-white">Manikandan Academy</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Nav className="flex-column fw-semibold nav-mobile-links bg-dark text-white">
                        <Nav.Link as={Link} to="/" onClick={handleClose} className="text-white"> <i className="fas fa-home me-2"></i> Home</Nav.Link>
                        <Nav.Link as={Link} to="/about" onClick={handleClose} className="text-white"><i className="fas fa-info-circle me-2"></i> About</Nav.Link>
                        <Nav.Link as={Link} to="/courses" onClick={handleClose} className="text-white"><i className="fas fa-book-open me-2"></i> Courses</Nav.Link>
                        <Nav.Link as={Link} to="/faculty" onClick={handleClose} className="text-white"><i className="fas fa-chalkboard-teacher me-2"></i> Faculty</Nav.Link>
                        <Nav.Link as={Link} to="/gallery" onClick={handleClose} className="text-white"><i className="fas fa-images me-2"></i> Gallery</Nav.Link>
                        <Nav.Link as={Link} to="/results" onClick={handleClose} className="text-white"><i className="fas fa-chart-line me-2"></i> Results</Nav.Link>
                        <Nav.Link as={Link} to="/contact" onClick={handleClose} className="text-white"><i className="fas fa-envelope me-2"></i> Contact</Nav.Link>
                        <Nav.Link as={Link} to="/apply" onClick={handleClose} className="text-white"><i className="fas fa-file-alt me-2"></i> Apply</Nav.Link>
                        <Nav.Link as={Link} to="/student-login" onClick={handleClose} className="text-white"><i className="fas fa-user-graduate me-2"></i> Student Login</Nav.Link>
                        <Nav.Link as={Link} to="/admin-login" onClick={handleClose} className="text-white"><i className="fas fa-user-shield me-2"></i> Admin Login</Nav.Link>
                    </Nav>
                </Offcanvas.Body>
            </Offcanvas>

        </>
    );
}

export default Header;
