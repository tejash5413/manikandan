
import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx5RL4Ke5ktuMbzEJ88Hy6U-8VOX514Su9dTxZjOmEME47G3Yc5ZFR30hzCCAHb8wDJsA/exec";

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
    const [editIndex, setEditIndex] = useState(null);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        AOS.init({ duration: 1000 });
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch(`${GOOGLE_SCRIPT_URL}?type=courses`);
            const data = await res.json();
            setCourses(data);
        } catch (error) {
            toast.error("Failed to load courses");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.icon || !formData.hostelfee || !formData.dayscholarfee || !formData.duration || !formData.badge) {
            toast.error("Please fill all fields!");
            return;
        }

        const action = editIndex !== null ? "editCourse" : "addCourse";
        const payload = {
            action,
            ...formData,
            id: editingId // only used for edit
        };

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            toast.success(editIndex !== null ? "Course updated!" : "Course added!");
            setFormData({
                title: '',
                description: '',
                icon: '',
                hostelfee: '',
                dayscholarfee: '',
                duration: '',
                badge: ''
            }); setEditIndex(null);
            setEditingId(null);
            fetchCourses();
        } catch (err) {
            toast.error("Submission failed");
        }
    };

    const handleEdit = (index) => {
        setFormData(courses[index]);
        setEditIndex(index);
        setEditingId(courses[index].id);
    };

    const handleDelete = async (index) => {
        if (!window.confirm("Are you sure to delete this course?")) return;

        const id = courses[index].id;

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'deleteCourse', id })
            });
            toast.info("Course deleted!");
            fetchCourses();
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
            <h2 className="text-center text-primary mb-5" data-aos="fade-down">Manage Courses</h2>

            {/* Course Form */}
            <form className="row g-3 mb-5" onSubmit={handleSubmit} data-aos="fade-up">

                {/* Title */}
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Course Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Icon */}
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Icon Class (e.g., fas fa-bullseye)"
                        name="icon"
                        value={formData.icon}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Fees - Hostel */}
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Hostel Fee (e.g., ₹80,000)"
                        name="hostelfee"
                        value={formData.hostelfee}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Fees - Day Scholar */}
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Day Scholar Fee (e.g., ₹40,000)"
                        name="dayscholarfee"
                        value={formData.dayscholarfee}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Badge */}
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Badge (e.g., Most Popular)"
                        name="badge"
                        value={formData.badge}
                        onChange={handleChange}
                    />
                </div>
                {/* Duration */}
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Duration (e.g., 1 Year, 2 Years)"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Description */}
                <div className="col-md-8">
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

                {/* Submit Button */}
                <div className="text-center">
                    <button type="submit" className="btn btn-primary mt-3 px-5">
                        {editIndex !== null ? "Update Course" : "Add Course"}
                    </button>
                </div>

            </form>

            {/* Courses List Table */}
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
                            <tr>
                                <td colSpan="7">No Courses Available</td>
                            </tr>
                        ) : (
                            courses.map((course, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td><i className={`${course.icon} fs-4`}></i></td>
                                    <td>{course.title}</td>
                                    <td>{course.badge}</td>
                                    <td>{course.hostelfee}</td>
                                    <td>{course.dayscholarfee}</td>
                                    <td>{course.duration}</td>
                                    <td>{course.description}</td>
                                    <td>
                                        <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(index)}>Edit</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(index)}>Delete</button>
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


