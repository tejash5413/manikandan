import React, { useEffect, useState } from 'react';
import {
    collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where
} from 'firebase/firestore';
import { adminDb as db } from '../../services/firebase';
import { toast } from 'react-toastify';
import {
    FaChalkboardTeacher, FaClock, FaCalendarAlt, FaTrash, FaEdit, FaPlus,
    FaVideo, FaUsers, FaUserCheck, FaArrowLeft, FaDownload, FaSearch
} from 'react-icons/fa';
import { CSVLink } from 'react-csv';
import { useNavigate } from 'react-router-dom';

const initialForm = {
    title: '',
    subject: '',
    faculty: '',
    date: '',
    startTime: '',
    endTime: '',
    joinLink: '',
    type: 'Live',
    class: '',
};

const classOptions = [
    ...Array.from({ length: 12 }, (_, i) => ({ value: `Class ${i + 1}`, label: `Class ${i + 1}` })),
    { value: "LT", label: "LT" },
    { value: "NEET Repeaters", label: "NEET Repeaters" },
    { value: "Crash Course", label: "Crash Course" },
    { value: "Integrated", label: "Integrated" },
    { value: "Class 12th NEET", label: "Class 12th NEET" },
    { value: "Class 12th JEE", label: "Class 12th JEE" },
    { value: "Class 11th NEET", label: "Class 11th NEET" },
    { value: "Class 11th JEE", label: "Class 11th JEE" },
];

function ManageOnlineClasses() {
    const [form, setForm] = useState(initialForm);
    const [classes, setClasses] = useState([]);
    const [editId, setEditId] = useState(null);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [viewingAttendance, setViewingAttendance] = useState(null);
    const [studentList, setStudentList] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const fetchClasses = async () => {
        const snapshot = await getDocs(collection(db, 'online_classes'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClasses(data);

        const attendanceSnap = await getDocs(collection(db, 'class_attendance'));
        const countMap = {};
        attendanceSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.classId) {
                countMap[data.classId] = (countMap[data.classId] || 0) + 1;
            }
        });
        setAttendanceMap(countMap);
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.subject || !form.date || !form.startTime || !form.endTime || !form.joinLink || !form.class) {
            return toast.warning('Please fill all required fields');
        }

        try {
            if (editId) {
                await updateDoc(doc(db, 'online_classes', editId), form);
                toast.success('Class updated successfully');
            } else {
                await addDoc(collection(db, 'online_classes'), form);
                toast.success('Class added successfully');
            }
            setForm(initialForm);
            setEditId(null);
            fetchClasses();
        } catch (error) {
            toast.error('Error saving class');
        }
    };

    const handleEdit = (cls) => {
        setForm(cls);
        setEditId(cls.id);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this class?")) {
            await deleteDoc(doc(db, 'online_classes', id));
            toast.success("Class deleted");
            fetchClasses();
        }
    };

    const handleViewAttendance = async (classId) => {
        const q = query(collection(db, 'class_attendance'), where("classId", "==", classId));
        const snapshot = await getDocs(q);
        const students = snapshot.docs.map(doc => doc.data());
        setStudentList(students);
        setViewingAttendance(classId);
    };

    const filteredClasses = classes.filter(cls =>
        cls.title.toLowerCase().includes(search.toLowerCase()) ||
        cls.subject.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4><FaVideo className="me-2" />Manage Online Classes</h4>
                <button className="btn btn-outline-dark" onClick={() => navigate('/admin-dashboard')}>
                    <FaArrowLeft className="me-2" />Back to Dashboard
                </button>
            </div>

            <form onSubmit={handleSubmit} className="card shadow p-4 mb-4 border-0">
                <div className="row g-3">
                    <div className="col-md-4">
                        <input type="text" name="title" value={form.title} onChange={handleChange} className="form-control" placeholder="Class Title" required />
                    </div>
                    <div className="col-md-4">
                        <input type="text" name="subject" value={form.subject} onChange={handleChange} className="form-control" placeholder="Subject" required />
                    </div>
                    <div className="col-md-4">
                        <input type="text" name="faculty" value={form.faculty} onChange={handleChange} className="form-control" placeholder="Faculty Name" />
                    </div>
                    <div className="col-md-3">
                        <input type="date" name="date" value={form.date} onChange={handleChange} className="form-control" required />
                    </div>
                    <div className="col-md-3">
                        <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="form-control" placeholder="Start Time" required />
                    </div>
                    <div className="col-md-3">
                        <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="form-control" placeholder="End Time" required />
                    </div>
                    <div className="col-md-3">
                        <select name="type" value={form.type} onChange={handleChange} className="form-select">
                            <option value="Live">Live</option>
                            <option value="Recording">Recording</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <input type="url" name="joinLink" value={form.joinLink} onChange={handleChange} className="form-control" placeholder="Join Link" required />
                    </div>
                    <div className="col-md-4">
                        <select name="class" value={form.class} onChange={handleChange} className="form-select" required>
                            <option value="">Select Class</option>
                            {classOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-12 text-end">
                        <button className="btn btn-primary">
                            <FaPlus className="me-2" />
                            {editId ? 'Update' : 'Add'} Class
                        </button>
                    </div>
                </div>
            </form>

            <div className="card shadow border-0">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0"><FaChalkboardTeacher className="me-2" />Class List</h5>
                    <div className="d-flex gap-2 align-items-center">
                        <FaSearch />
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ width: '200px' }}
                            placeholder="Search title/subject..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Title</th>
                                <th>Subject</th>
                                <th>Class</th>
                                <th>Date</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Type</th>
                                <th><FaUsers className="me-1" />Attendance</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClasses.length === 0 ? (
                                <tr><td colSpan="9" className="text-center py-4">No classes found.</td></tr>
                            ) : (
                                filteredClasses.map((cls) => (
                                    <tr key={cls.id}>
                                        <td>{cls.title}</td>
                                        <td>{cls.subject}</td>
                                        <td>{cls.class}</td>
                                        <td><FaCalendarAlt className="me-1" />{cls.date}</td>
                                        <td><FaClock className="me-1" />{cls.startTime}</td>
                                        <td><FaClock className="me-1" />{cls.endTime}</td>
                                        <td>
                                            <span className={`badge bg-${cls.type === 'Live' ? 'success' : 'secondary'}`}>
                                                {cls.type}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-secondary" onClick={() => handleViewAttendance(cls.id)}>
                                                <FaUserCheck className="me-1" />
                                                {attendanceMap[cls.id] || 0} Students
                                            </button>
                                        </td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(cls)}><FaEdit /></button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(cls.id)}><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {viewingAttendance && (
                <div className="card shadow mt-4 border-0">
                    <div className="card-header bg-info text-white d-flex justify-content-between">
                        <h6 className="mb-0"><FaUsers className="me-2" />Attendance for Class ID: {viewingAttendance}</h6>
                        <CSVLink
                            data={studentList.map(s => ({
                                RollNo: s.rollno || s.studentId,
                                Name: s.studentName || 'Unnamed',
                                Subject: s.subject,
                                JoinedAt: new Date(s.joinedAt).toLocaleString(),
                            }))}
                            filename={`attendance_${viewingAttendance}.csv`}
                            className="btn btn-sm btn-light"
                        >
                            <FaDownload className="me-1" /> Export CSV
                        </CSVLink>
                    </div>
                    <div className="card-body">
                        {studentList.length === 0 ? (
                            <p>No students have joined this class yet.</p>
                        ) : (
                            <ul className="list-group">
                                {studentList.map((s, i) => (
                                    <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                                        <span>
                                            <strong>{s.rollno || s.studentId}</strong> – {s.studentName || 'Unnamed'} ({s.subject})
                                        </span>
                                        <span className="badge bg-success">
                                            ✔️ {new Date(s.joinedAt).toLocaleString()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageOnlineClasses;