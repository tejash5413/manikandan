import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { toast } from 'react-toastify';
import { adminDb as db } from '../../services/firebase';
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc
} from 'firebase/firestore';

function ManageCourses() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        icon: '',
        hostelfee: '',
        dayscholarfee: '',
        duration: '',
        badge: ''
    });
    const [editId, setEditId] = useState(null);

    const iconOptions = [
        'fas fa-bullseye',
        'fas fa-book',
        'fas fa-bolt',
        'fas fa-flask',
        'fas fa-dna',
        'fas fa-brain',
        'fas fa-user-graduate',
        'fas fa-microscope',
        'fas fa-heartbeat',
        'fas fa-atom',
        'fas fa-laptop-medical',
        'fas fa-vials',
        'fas fa-virus',
        'fas fa-lungs',
        'fas fa-file-medical',
        'fas fa-stethoscope',
        'fas fa-syringe',
        'fas fa-user-md',
        'fas fa-graduation-cap',
        'fas fa-school',
        'fas fa-chalkboard-teacher',
        'fas fa-pen-nib',
        'fas fa-award',
        'fas fa-calendar-alt',
        'fas fa-clock',
        'fas fa-trophy'
    ];


    useEffect(() => {
        AOS.init({ duration: 1000 });
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'courses'));
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCourses(data);
        } catch (err) {
            toast.error('Failed to fetch courses');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isEmpty = Object.values(formData).some(field => !field);
        if (isEmpty) return toast.error("Please fill all fields!");

        try {
            if (editId) {
                await updateDoc(doc(db, 'courses', editId), formData);
                toast.success("Course updated!");
            } else {
                await addDoc(collection(db, 'courses'), formData);
                toast.success("Course added!");
            }
            setFormData({ title: '', description: '', icon: '', hostelfee: '', dayscholarfee: '', duration: '', badge: '' });
            setEditId(null);
            fetchCourses();
        } catch {
            toast.error("Submission failed");
        }
    };

    const handleEdit = (course) => {
        setFormData(course);
        setEditId(course.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure to delete this course?")) return;
        try {
            await deleteDoc(doc(db, 'courses', id));
            toast.info("Course deleted!");
            fetchCourses();
        } catch {
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
                </button>
            </div>
            <h2 className="text-center text-primary mb-5" data-aos="fade-down">Manage Courses</h2>

            <form className="row g-3 mb-5" onSubmit={handleSubmit} data-aos="fade-up">
                <div className="col-md-4">
                    <input
                        className="form-control"
                        placeholder="Course Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="col-md-4">
                    <label className="form-label fw-semibold">
                        <i className="fas fa-icons me-2 text-primary"></i>Choose Icon
                    </label>
                    <select
                        className="form-select"
                        name="icon"
                        value={formData.icon}
                        onChange={handleChange}
                        required
                    >
                        <option value="">-- Select Icon --</option>
                        {iconOptions.map((icon, i) => (
                            <option key={i} value={icon}>{icon}</option>
                        ))}
                    </select>
                    {formData.icon && (
                        <div className="mt-2 text-primary">
                            <i className={`${formData.icon} fs-2 me-2`}></i> Preview
                        </div>
                    )}
                </div>
                <div className="col-md-4">
                    <input
                        className="form-control"
                        placeholder="Hostel Fee"
                        name="hostelfee"
                        value={formData.hostelfee}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="col-md-4">
                    <input
                        className="form-control"
                        placeholder="Day Scholar Fee"
                        name="dayscholarfee"
                        value={formData.dayscholarfee}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="col-md-4">
                    <input
                        className="form-control"
                        placeholder="Badge"
                        name="badge"
                        value={formData.badge}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="col-md-4">
                    <input
                        className="form-control"
                        placeholder="Duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="col-md-12">
                    <input
                        className="form-control"
                        placeholder="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="text-center">
                    <button type="submit" className="btn btn-primary mt-3 px-5">
                        {editId ? "Update Course" : "Add Course"}
                    </button>
                </div>
            </form>

            <div className="table-responsive" data-aos="fade-up" data-aos-delay="100">
                <table className="table table-bordered align-middle text-center">
                    <thead className="table-primary">
                        <tr>
                            <th>#</th>
                            <th>Icon</th>
                            <th>Title</th>
                            <th>Badge</th>
                            <th>Hostel Fee</th>
                            <th>Day Scholar Fee</th>
                            <th>Duration</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.length === 0 ? (
                            <tr><td colSpan="9">No Courses Available</td></tr>
                        ) : (
                            courses.map((course, index) => (
                                <tr key={course.id}>
                                    <td>{index + 1}</td>
                                    <td><i className={`${course.icon} fs-4`}></i></td>
                                    <td>{course.title}</td>
                                    <td>{course.badge}</td>
                                    <td>{course.hostelfee}</td>
                                    <td>{course.dayscholarfee}</td>
                                    <td>{course.duration}</td>
                                    <td>{course.description}</td>
                                    <td>
                                        <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(course)}>Edit</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(course.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ManageCourses;
