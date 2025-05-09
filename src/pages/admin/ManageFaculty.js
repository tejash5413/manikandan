import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useNavigate } from 'react-router-dom';
import { adminDb as db, adminStorage as storage } from '../../services/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function ManageFaculty() {
    const navigate = useNavigate();
    const [faculty, setFaculty] = useState([]);
    const [formData, setFormData] = useState({ name: '', subject: '', photourl: '', bio: '' });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        AOS.init({ duration: 1000 });
        fetchFaculty();
    }, []);

    const fetchFaculty = async () => {
        try {
            const snapshot = await getDocs(collection(db, "faculty"));
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFaculty(list);
        } catch (err) {
            toast.error("Error loading faculty");
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];

        if (!file) {
            toast.error("No file selected");
            return;
        }

        try {
            // Clean and timestamp the file name
            const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
            const storageRef = ref(storage, `faculty/${fileName}`);

            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);

            setFormData(prev => ({ ...prev, photourl: url }));
            toast.success("Image uploaded successfully!");
        } catch (err) {
            console.error("Faculty image upload error:", err);

            if (err.code === "storage/unauthorized") {
                toast.error("Unauthorized. Check Firebase Storage rules.");
            } else {
                toast.error("Image upload failed. Please try again.");
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, subject, photourl, bio } = formData;
        if (!name || !subject || !photourl || !bio) return toast.error("Fill all fields");

        try {
            if (editId) {
                await updateDoc(doc(db, "faculty", editId), formData);
                toast.success("Faculty updated");
            } else {
                await addDoc(collection(db, "faculty"), formData);
                toast.success("Faculty added");
            }
            setFormData({ name: '', subject: '', photourl: '', bio: '' });
            setEditId(null);
            fetchFaculty();
        } catch (err) {
            toast.error("Submit failed");
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditId(item.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure to delete this faculty?")) return;
        try {
            await deleteDoc(doc(db, "faculty", id));
            toast.info("Faculty deleted");
            fetchFaculty();
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

            <h2 className="text-center text-primary mb-5" data-aos="fade-down">Manage Faculty</h2>

            <form className="row g-3 mb-5" onSubmit={handleSubmit} data-aos="fade-up">
                <div className="col-md-3">
                    <input type="text" className="form-control" placeholder="Faculty Name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="col-md-3">
                    <input type="text" className="form-control" placeholder="Subject" name="subject" value={formData.subject} onChange={handleChange} required />
                </div>
                <div className="col-md-3">
                    <input type="file" className="form-control" accept="image/*" onChange={handleImageUpload} required={!editId} />
                    {formData.photourl && <img src={formData.photourl} alt="Preview" style={{ height: '80px', marginTop: '10px' }} />}
                </div>
                <div className="col-md-3">
                    <input type="text" className="form-control" placeholder="Short Bio" name="bio" value={formData.bio} onChange={handleChange} required />
                </div>
                <div className="text-center">
                    <button type="submit" className="btn btn-primary mt-3 px-5">{editId ? "Update Faculty" : "Add Faculty"}</button>
                </div>
            </form>

            <div className="row g-4" data-aos="fade-up" data-aos-delay="200">
                {faculty.length === 0 ? (
                    <p className="text-center">No faculty added yet.</p>
                ) : (
                    faculty.map((item, index) => (
                        <div key={item.id} className="col-md-4 col-lg-3" data-aos="zoom-in" data-aos-delay={index * 100}>
                            <div className="card shadow-sm h-100 border-0 rounded-4 overflow-hidden">
                                <img src={item.photourl} alt={item.name} className="card-img-top" style={{ height: "220px", objectFit: "cover" }} />
                                <div className="card-body text-center">
                                    <h5 className="card-title text-primary">{item.name}</h5>
                                    <p className="card-text small">{item.subject}</p>
                                    <p className="card-text small">{item.bio}</p>
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

export default ManageFaculty;
