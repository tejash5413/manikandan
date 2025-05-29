import React, { useEffect, useState } from "react";
import {
    updateEmail,
    sendEmailVerification,
    updatePassword,
    reload
} from "firebase/auth";
import {
    doc,
    getDoc,
    updateDoc,
    collection,
    getDocs
} from "firebase/firestore";
import {
    ref,
    uploadBytes,
    getDownloadURL
} from "firebase/storage";
import {
    studentAuth as auth,
    studentDb as db,
    studentStorage as storage
} from "../../services/firebase";
import {
    FaEdit, FaEnvelope, FaCamera, FaEye, FaEyeSlash,
    FaUserCircle, FaBell, FaArrowLeft
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setDoc } from "firebase/firestore";

const StudentProfile = () => {
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [email, setEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [emailVerified, setEmailVerified] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [profileUrl, setProfileUrl] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [stats, setStats] = useState({ assignments: 0, exams: 0, attendance: 0 });
    const [preferences, setPreferences] = useState({
        assignmentAlert: true,
        examReminder: true,
        noticeAlert: true
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const user = auth.currentUser;
            if (!user) return;

            try {
                await reload(user); // Refresh user session to get latest emailVerified
                const studentSnap = await getDoc(doc(db, "students", user.uid));
                const prefSnap = await getDoc(doc(db, "students", user.uid, "preferences", "notifications"));

                if (studentSnap.exists()) {
                    const data = studentSnap.data();
                    setStudent(data);
                    setEmail(user.email);
                    setEmailVerified(user.emailVerified);
                    setProfileUrl(data.photoURL || null);
                    const { uid } = user;
                    const { rollno } = data;
                    if (uid && rollno) {
                        fetchStats(uid, rollno);
                    }
                }

                if (prefSnap.exists()) {
                    setPreferences(prefSnap.data());
                }
            } catch (err) {
                toast.error("❌ Failed to load profile");
                console.error(err);
            }
        };

        fetchProfile();
    }, []);

    const fetchStats = async (uidOrRollno, rollno) => {
        try {
            // Assignments use UID
            const assignments = await getDocs(collection(db, "assignment_status"));
            const completed = assignments.docs.filter(
                (doc) => doc.id.startsWith(uidOrRollno + "_") && doc.data().status === "Completed"
            ).length;

            // Exams use rollno
            const rollno = localStorage.getItem("studentRollno")?.trim().toLowerCase();
            const exams = await getDocs(collection(db, "results"));
            const taken = exams.docs.filter(doc =>
                (doc.data().studentId || "").trim().toLowerCase() === rollno
            ).length;

            setStats(prev => ({ ...prev, exams: taken }));


            // Attendance uses rollno
            const attendanceSnap = await getDocs(collection(db, "monthly_attendance"));
            let total = 0, present = 0;

            attendanceSnap.docs.forEach(doc => {
                const found = doc.data().students.find(s => s.rollno === rollno);
                if (found) {
                    present += parseInt(found.presentDays || 0);
                    total += parseInt(found.totalDays || 0);
                }
            });

            const percentage = total ? ((present / total) * 100).toFixed(1) : 0;
            setStats({ assignments: completed, exams: taken, attendance: percentage });
        } catch (err) {
            toast.error("❌ Failed to fetch stats");
            console.error(err);
        }
    };

    const handleEmailUpdate = async () => {
        try {
            const user = auth.currentUser;

            if (!user) {
                toast.error("❌ Not logged in");
                return;
            }

            await reload(user);
            if (!user.emailVerified) {
                toast.warning("⚠️ Please verify your current email first.");
                return;
            }

            if (!newEmail || !newEmail.includes("@")) {
                toast.warning("⚠️ Please enter a valid new email address.");
                return;
            }

            await updateEmail(user, newEmail);
            toast.success("✅ Email updated successfully!");
            setEmail(newEmail);
            setNewEmail("");
        } catch (error) {
            console.error("Email update error:", error);
            toast.error(`❌ ${error.message}`);
        }
    };

    const handleResendVerification = async () => {
        try {
            const user = auth.currentUser;
            if (user && !user.emailVerified) {
                await sendEmailVerification(user);
                toast.info("📧 Verification email sent. Please check your inbox.");
            }
        } catch (err) {
            toast.error("❌ Failed to resend verification email");
            console.error(err);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setUploading(true);
            const fileRef = ref(storage, `profile_photos/${auth.currentUser.uid}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            await updateDoc(doc(db, "students", auth.currentUser.uid), { photoURL: url });
            setProfileUrl(url);
            toast.success("✅ Profile photo updated");
        } catch (err) {
            toast.error("❌ Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (password.length < 6) {
            toast.error("❌ Password must be at least 6 characters.");
            return;
        }

        try {
            await updatePassword(auth.currentUser, password);
            toast.success("🔒 Password updated successfully!");
            setPassword("");
        } catch (err) {
            if (err.code === "auth/requires-recent-login") {
                toast.error("⚠️ Please log in again to update your password.");
            } else {
                toast.error("❌ Failed to update password");
            }
            console.error("Password update error:", err);
        }
    };

    const handlePreferenceToggle = async (key) => {
        try {
            const newPrefs = { ...preferences, [key]: !preferences[key] };
            setPreferences(newPrefs);
            await setDoc(
                doc(db, "students", auth.currentUser.uid, "preferences", "notifications"),
                newPrefs,
                { merge: true } // ✅ creates the doc if it doesn't exist
            );
            toast.success("✅ updated preferences");

        } catch (err) {
            toast.error("❌ Failed to update preferences");
        }
    };

    return (
        <div className="container py-5">
            <button className="btn btn-outline-secondary mb-3" onClick={() => navigate("/student-dashboard")}>
                <FaArrowLeft className="me-2" />Back to Dashboard
            </button>

            <div className="card shadow-lg p-4 border-0 rounded-4">
                <div className="text-center mb-4">
                    {profileUrl ? (
                        <img src={profileUrl} alt="Profile" className="rounded-circle border" style={{ width: 100, height: 100 }} />
                    ) : (
                        <FaUserCircle size={100} className="text-muted" />
                    )}
                    <div className="mt-2">
                        <label className="btn btn-sm btn-outline-primary">
                            <FaCamera className="me-1" /> Upload Photo
                            <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} disabled={uploading} />
                        </label>
                    </div>
                </div>

                <h4 className="text-primary text-center mb-3">👤 My Profile</h4>
                <p><strong>Name:</strong> {student?.name}</p>
                <p><strong>Roll No:</strong> {student?.rollno}</p>
                <p><strong>Class:</strong> {student?.class}</p>
                <p><strong>Batch:</strong> {student?.batch}</p>

                <div className="mb-3">
                    <label><FaEnvelope className="me-2" />Current Email</label>
                    <div className="input-group">
                        <input className="form-control" value={email} disabled />
                        <span className="input-group-text">
                            {emailVerified ? (
                                <span className="badge bg-success">Verified</span>
                            ) : (
                                <span className="badge bg-danger">Not Verified</span>
                            )}
                        </span>
                    </div>
                    {!emailVerified && (
                        <button
                            className="btn btn-sm btn-outline-warning mt-2"
                            onClick={handleResendVerification}
                        >
                            Resend Verification Email
                        </button>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label">New Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Enter new email address"
                        required
                    />
                </div>
                <button className="btn btn-sm btn-outline-success mt-2" onClick={handleEmailUpdate}>
                    Update Email
                </button>

                <div className="mb-3 mt-4">
                    <label>Password</label>
                    <div className="input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                        />
                        <span className="input-group-text" onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <button className="btn btn-sm btn-outline-dark mt-2" onClick={handlePasswordUpdate}>
                        Update Password
                    </button>
                </div>

                <hr />
                <h5 className="text-secondary">📊 My Stats</h5>
                <p><strong>✅ Assignments Completed:</strong> {stats.assignments}</p>
                <p><strong>🧪 Exams Taken:</strong> {stats.exams}</p>
                <p><strong>📅 Attendance:</strong> {stats.attendance}%</p>

                <hr />
                <h5 className="text-secondary">🔔 Notification Preferences</h5>
                {Object.keys(preferences).map(key => (
                    <div className="form-check" key={key}>
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={preferences[key]}
                            onChange={() => handlePreferenceToggle(key)}
                            id={key}
                        />
                        <label className="form-check-label" htmlFor={key}>
                            {key === "assignmentAlert" && "Assignment Alerts"}
                            {key === "examReminder" && "Exam Reminders"}
                            {key === "noticeAlert" && "Circular Updates"}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentProfile;
