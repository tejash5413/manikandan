import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useNavigate } from 'react-router-dom';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx5RL4Ke5ktuMbzEJ88Hy6U-8VOX514Su9dTxZjOmEME47G3Yc5ZFR30hzCCAHb8wDJsA/exec";

function ManageFaculty() {
    const navigate = useNavigate();

    const [faculty, setFaculty] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        photourl: '',
        bio: ''
    });
    const [editIndex, setEditIndex] = useState(null);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        AOS.init({ duration: 1000 });
        fetchFaculty();
    }, []);

    const fetchFaculty = async () => {
        try {
            const res = await fetch(`${GOOGLE_SCRIPT_URL}?type=faculty`);
            const data = await res.json();
            setFaculty(data);
        } catch (error) {
            toast.error("Failed to load faculty list!");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.subject || !formData.photourl || !formData.bio) {
            toast.error("Please fill all fields!");
            return;
        }

        const action = editIndex !== null ? 'editFaculty' : 'addFaculty';
        const payload = {
            action,
            ...formData,
            id: editingId
        };

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',

                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            toast.success(editIndex !== null ? "Faculty Updated!" : "Faculty Added!");
            setFormData({ name: '', subject: '', photourl: '', bio: '' });
            setEditIndex(null);
            setEditingId(null);
            fetchFaculty();
        } catch (err) {
            toast.error("Submission failed");
        }
    };

    const handleEdit = (index) => {
        setFormData(faculty[index]);
        setEditIndex(index);
        setEditingId(faculty[index].id);
    };

    const handleDelete = async (index) => {
        if (!window.confirm("Are you sure to delete this faculty?")) return;

        const id = faculty[index].id;

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',

                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'deleteFaculty', id })
            });
            toast.info("Faculty Deleted!");
            fetchFaculty();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="container py-5">
            <div className="text-center mb-4">
                <button
                    className="btn btn-outline-danger"
                    onClick={() => navigate('/admin-dashboard')}
                >
                    ← Back to Dashboard
                </button></div>
            <h2 className="text-center text-primary mb-5" data-aos="fade-down">Manage Faculty</h2>

            {/* Form Section */}
            <form className="row g-3 mb-5" onSubmit={handleSubmit} data-aos="fade-up">
                <div className="col-md-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Faculty Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="col-md-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="col-md-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Photo URL"
                        name="photourl"
                        value={formData.photourl}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="col-md-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Short Bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="text-center">
                    <button type="submit" className="btn btn-primary mt-3 px-5">
                        {editIndex !== null ? "Update Faculty" : "Add Faculty"}
                    </button>
                </div>
            </form>

            {/* Faculty Cards */}
            <div className="row g-4" data-aos="fade-up" data-aos-delay="200">
                {faculty.length === 0 ? (
                    <p className="text-center">No faculty added yet.</p>
                ) : (
                    faculty.map((item, index) => (
                        <div key={index} className="col-md-4 col-lg-3" data-aos="zoom-in" data-aos-delay={index * 100}>
                            <div className="card shadow-sm h-100 border-0 rounded-4 overflow-hidden">
                                <img
                                    src={item.photourl}
                                    alt={item.name}
                                    className="card-img-top"
                                    style={{ height: "220px", objectFit: "cover" }}
                                />
                                <div className="card-body text-center">
                                    <h5 className="card-title text-primary">{item.name}</h5>
                                    <p className="card-text small">{item.subject}</p>
                                    <p className="card-text  small">{item.bio}</p>
                                    <div className="d-flex justify-content-center gap-2">
                                        <button className="btn btn-sm btn-warning" onClick={() => handleEdit(index)}>Edit</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(index)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ManageFaculty;
