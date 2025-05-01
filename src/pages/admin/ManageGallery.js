import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useNavigate } from 'react-router-dom';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx5RL4Ke5ktuMbzEJ88Hy6U-8VOX514Su9dTxZjOmEME47G3Yc5ZFR30hzCCAHb8wDJsA/exec";

function ManageGallery() {
    const navigate = useNavigate();

    const [gallery, setGallery] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        imageurl: '',
        description: ''
    });
    const [editIndex, setEditIndex] = useState(null);
    const [editingId, setEditingId] = useState(null);

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
            toast.error("Failed to load gallery images!");
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

        if (!formData.title || !formData.imageurl || !formData.description) {
            toast.error("Please fill all fields!");
            return;
        }

        const action = editIndex !== null ? 'editImage' : 'addImage';
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

            toast.success(editIndex !== null ? "Image Updated!" : "Image Added!");
            setFormData({ title: '', imageurl: '', description: '' });
            setEditIndex(null);
            setEditingId(null);
            fetchGallery();
        } catch (err) {
            toast.error("Submission failed");
        }
    };

    const handleEdit = (index) => {
        setFormData(gallery[index]);
        setEditIndex(index);
        setEditingId(gallery[index].id);
    };

    const handleDelete = async (index) => {
        if (!window.confirm("Are you sure to delete this image?")) return;

        const id = gallery[index].id;

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'deleteImage', id })
            });
            toast.info("Image Deleted!");
            fetchGallery();
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
            <h2 className="text-center text-primary mb-5" data-aos="fade-down">Manage Gallery</h2>

            {/* Form Section */}
            <form className="row g-3 mb-5" onSubmit={handleSubmit} data-aos="fade-up">
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Image Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Image URL"
                        name="imageurl"
                        value={formData.imageurl}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Short Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="text-center">
                    <button type="submit" className="btn btn-primary mt-3 px-5">
                        {editIndex !== null ? "Update Image" : "Add Image"}
                    </button>
                </div>
            </form>

            {/* Gallery Table Section */}
            <div className="row g-4" data-aos="fade-up" data-aos-delay="200">
                {gallery.length === 0 ? (
                    <p className="text-center">No images available.</p>
                ) : (
                    gallery.map((item, index) => (
                        <div key={index} className="col-md-4 col-lg-3" data-aos="zoom-in" data-aos-delay={index * 100}>
                            <div className="card shadow-sm h-100">
                                <img src={item.imageurl} className="card-img-top" alt={item.title} style={{ height: "200px", objectFit: "cover" }} />
                                <div className="card-body text-center">
                                    <h5 className="card-title text-primary">{item.title}</h5>
                                    <p className="card-text small ">{item.description}</p>
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

export default ManageGallery;
