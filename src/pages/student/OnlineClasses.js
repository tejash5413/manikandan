import React, { useEffect, useState } from 'react';
import {
    collection, getDocs, doc, setDoc, getDoc, query, where
} from 'firebase/firestore';
import { studentDb as db, studentAuth as auth } from '../../services/firebase';
import {
    FaChalkboardTeacher, FaClock, FaCalendarAlt, FaVideo,
    FaBookOpen, FaCheckCircle, FaChartBar, FaArrowLeft
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function OnlineClasses() {
    const [classes, setClasses] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [filters, setFilters] = useState({ subject: '', date: '' });
    const [joinedIds, setJoinedIds] = useState(new Set());
    const [studentId, setStudentId] = useState(null);
    const [studentClass, setStudentClass] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setStudentId(user.uid);
                const snap = await getDoc(doc(db, 'students', user.uid));
                if (snap.exists()) {
                    const data = snap.data();
                    setStudentClass(data.class || '');
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchClasses = async () => {
        const snapshot = await getDocs(collection(db, 'online_classes'));
        const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const byClass = all.filter(cls => !cls.class || cls.class === studentClass);
        const sorted = byClass.sort((a, b) => new Date(`${a.date} ${a.startTime}`) - new Date(`${b.date} ${b.startTime}`));

        setClasses(sorted);
        setFiltered(sorted);
        setSubjects([...new Set(sorted.map(cls => cls.subject))]);

        if (studentId) {
            const q = query(collection(db, 'class_attendance'), where('studentId', '==', studentId));
            const attendanceSnap = await getDocs(q);
            const joined = new Set(attendanceSnap.docs.map(doc => doc.data().classId));
            setJoinedIds(joined);
        }
    };

    useEffect(() => {
        if (studentId && studentClass) fetchClasses();
    }, [studentId, studentClass]);

    const isPastClass = (cls) => new Date() > new Date(`${cls.date} ${cls.endTime || cls.startTime}`);

    const handleJoin = async (cls) => {
        window.open(cls.joinLink, '_blank');

        const user = auth.currentUser;
        const studentId = user?.uid;
        const attendanceId = `${studentId}_${cls.id}`;
        const attendanceRef = doc(db, 'class_attendance', attendanceId);
        const alreadyMarked = await getDoc(attendanceRef);

        let studentSnap = await getDoc(doc(db, 'students_list', studentId));
        let studentData = studentSnap.exists() ? studentSnap.data() : {};

        if (!studentData.name || !studentData.rollno) {
            const q = query(collection(db, 'students_list'), where('uid', '==', studentId));
            const fallbackSnap = await getDocs(q);
            if (!fallbackSnap.empty) {
                studentData = fallbackSnap.docs[0].data();
            }
        }

        if (!alreadyMarked.exists()) {
            await setDoc(attendanceRef, {
                studentId,
                studentName: studentData.name || '',
                rollno: studentData.rollno || '',
                classId: cls.id,
                title: cls.title,
                subject: cls.subject,
                joinedAt: new Date().toISOString(),
            });
        }

        setJoinedIds(prev => new Set(prev.add(cls.id)));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const updated = { ...filters, [name]: value };
        setFilters(updated);
        filterClasses(updated);
    };

    const filterClasses = ({ subject, date }) => {
        let result = [...classes];
        if (subject) result = result.filter(cls => cls.subject === subject);
        if (date) result = result.filter(cls => cls.date === date);
        setFiltered(result);
    };

    const totalClasses = filtered.length;
    const attended = filtered.filter(cls => joinedIds.has(cls.id)).length;
    const attendancePercent = totalClasses ? Math.round((attended / totalClasses) * 100) : 0;

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3><FaVideo className="me-2" />Online Classes</h3>
                <div className="d-flex align-items-center gap-3">
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/student-dashboard')}>
                        <FaArrowLeft className="me-2" />Back
                    </button>
                    <select
                        name="subject"
                        value={filters.subject}
                        onChange={handleFilterChange}
                        className="form-select"
                    >
                        <option value="">📚 All Subjects</option>
                        {subjects.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                    <input
                        type="date"
                        name="date"
                        value={filters.date}
                        onChange={handleFilterChange}
                        className="form-control"
                    />
                </div>
            </div>

            <div className="mb-4">
                <div className="card shadow-sm border-0">
                    <div className="card-body">
                        <h5 className="mb-2"><FaChartBar className="me-2 text-primary" />Your Attendance Summary</h5>
                        <div className="progress" style={{ height: '20px' }}>
                            <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                style={{ width: `${attendancePercent}%` }}
                            >
                                {attendancePercent}% Attended
                            </div>
                        </div>
                        <div className="text-muted mt-2">
                            {attended} of {totalClasses} classes joined
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                {filtered.length === 0 ? (
                    <p>No classes match the selected filters.</p>
                ) : (
                    filtered.map(cls => (
                        <div key={cls.id} className="col-md-6 mb-4">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-body">
                                    <h5 className="card-title">{cls.title}</h5>
                                    <p><FaBookOpen className="me-2 text-info" /> <strong>Subject:</strong> {cls.subject}</p>
                                    <p><FaChalkboardTeacher className="me-2 text-primary" /> <strong>Faculty:</strong> {cls.faculty}</p>
                                    <p><FaCalendarAlt className="me-2 text-success" /> <strong>Date:</strong> {cls.date}</p>
                                    <p><FaClock className="me-2 text-warning" /> <strong>Time:</strong> {cls.startTime} – {cls.endTime}</p>
                                    <p><strong>Class:</strong> {cls.class || 'All'}</p>

                                    {cls.type === 'Live' && !isPastClass(cls) ? (
                                        <button onClick={() => handleJoin(cls)} className="btn btn-success w-100">
                                            🔴 Join Live Class
                                        </button>
                                    ) : cls.type === 'Live' && isPastClass(cls) ? (
                                        <div className="text-muted text-center">✅ Class Completed</div>
                                    ) : cls.type === 'Recording' ? (
                                        <a href={cls.joinLink} target="_blank" rel="noopener noreferrer" className="btn btn-info w-100">
                                            🎥 Watch Recording
                                        </a>
                                    ) : null}

                                    {joinedIds.has(cls.id) && (
                                        <div className="mt-2 text-success text-center">
                                            <FaCheckCircle className="me-1" /> Joined
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default OnlineClasses;
