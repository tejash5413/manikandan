import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useNavigate } from 'react-router-dom';
import { adminDb as db, adminStorage as storage } from '../../services/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function ManageGallery() {
    const navigate = useNavigate();
    const [gallery, setGallery] = useState([]);
    const [formData, setFormData] = useState({ title: '', imageurl: '', description: '' });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        AOS.init({ duration: 1000 });
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            const snapshot = await getDocs(collection(db, "gallery"));
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGallery(list);
        } catch (err) {
            toast.error("Error loading gallery images");
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];

        if (!file) {
            toast.error("Please select a file.");
            return;
        }

        try {
            // Ensure filename is safe and unique
            const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
            const storageRef = ref(storage, `gallery/${fileName}`);

            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);

            setFormData(prev => ({ ...prev, imageurl: url }));
            toast.success("Image uploaded successfully!");
        } catch (err) {
            console.error("Upload error:", err);

            if (err.code === "storage/unauthorized") {
                toast.error("Unauthorized. Check Firebase Storage rules.");
            } else {
                toast.error("Image upload failed. Check console for details.");
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { title, imageurl, description } = formData;
        if (!title || !imageurl || !description) return toast.error("Fill all fields");

        try {
            if (editId) {
                await updateDoc(doc(db, "gallery", editId), formData);
                toast.success("Image updated");
            } else {
                await addDoc(collection(db, "gallery"), formData);
                toast.success("Image added");
            }
            setFormData({ title: '', imageurl: '', description: '' });
            setEditId(null);
            fetchGallery();
        } catch (err) {
            toast.error("Submission failed");
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditId(item.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure to delete this image?")) return;
        try {
            await deleteDoc(doc(db, "gallery", id));
            toast.info("Image deleted");
            fetchGallery();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="container py-5">
            <div className="text-center mb-4">
                <button className="btn btn-outline-danger" onClick={() => navigate('/admin-dashboard')}>
                    ← Back to Dashboard
                </button>
            </div>

            <h2 className="text-center text-primary mb-5" data-aos="fade-down">Manage Gallery</h2>

            {/* Form Section */}
            <form className="row g-3 mb-5" onSubmit={handleSubmit} data-aos="fade-up">
                <div className="col-md-4">
                    <input type="text" className="form-control" placeholder="Image Title" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                    <input type="file" className="form-control" accept="image/*" onChange={handleImageUpload} required={!editId} />
                    {formData.imageurl && <img src={formData.imageurl} alt="Preview" style={{ height: '80px', marginTop: '10px' }} />}
                </div>
                <div className="col-md-4">
                    <input type="text" className="form-control" placeholder="Short Description" name="description" value={formData.description} onChange={handleChange} required />
                </div>
                <div className="text-center">
                    <button type="submit" className="btn btn-primary mt-3 px-5">{editId ? "Update Image" : "Add Image"}</button>
                </div>
            </form>

            {/* Gallery Display */}
            <div className="row g-4" data-aos="fade-up" data-aos-delay="200">
                {gallery.length === 0 ? (
                    <p className="text-center">No images available.</p>
                ) : (
                    gallery.map((item, index) => (
                        <div key={item.id} className="col-md-4 col-lg-3" data-aos="zoom-in" data-aos-delay={index * 100}>
                            <div className="card shadow-sm h-100">
                                <img src={item.imageurl} className="card-img-top" alt={item.title} style={{ height: "200px", objectFit: "cover" }} />
                                <div className="card-body text-center">
                                    <h5 className="card-title text-primary">{item.title}</h5>
                                    <p className="card-text small">{item.description}</p>
                                    <div className="d-flex justify-content-center gap-2">
                                        <button className="btn btn-sm btn-warning" onClick={() => handleEdit(item)}>Edit</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>Delete</button>
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
