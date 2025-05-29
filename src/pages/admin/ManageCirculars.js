    import React, { useState, useEffect } from "react";
    import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
    import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
    import { adminDb as db, adminStorage as storage } from "../../services/firebase";
    import { toast } from "react-toastify";

    const ManageCirculars = () => {
        const [circulars, setCirculars] = useState([]);
        const [form, setForm] = useState({
            title: "",
            description: "",
            file: null,
            expiryDate: "",
            tag: "",
        });

        const fetchCirculars = async () => {
            const snapshot = await getDocs(collection(db, "circulars"));
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCirculars(data);
        };

        useEffect(() => {
            fetchCirculars();
        }, []);

        const handleUpload = async (e) => {
            e.preventDefault();

            if (!form.title || !form.file) {
                toast.warn("Title and File are required");
                return;
            }

            try {
                const filename = `circulars/${Date.now()}_${form.file.name}`;
                const fileRef = ref(storage, filename);
                await uploadBytes(fileRef, form.file);
                const fileURL = await getDownloadURL(fileRef); // ✅ Proper URL

                await addDoc(collection(db, "circulars"), {
                    title: form.title,
                    description: form.description,
                    fileURL,
                    filePath: filename,
                    fileType: form.file.type,
                    uploadedAt: new Date().toISOString(),
                    expiryDate: form.expiryDate || null,
                    tag: form.tag || "",
                });

                toast.success("✅ Circular uploaded!");
                setForm({ title: "", description: "", file: null, expiryDate: "", tag: "" });
                fetchCirculars();
            } catch (err) {
                console.error(err);
                toast.error("❌ Upload failed");
            }
        };

        const handleDelete = async (circular) => {
            if (!window.confirm(`Delete circular "${circular.title}"?`)) return;

            try {
                const fileRef = ref(storage, circular.filePath);
                await deleteObject(fileRef).catch(() => { });
                await deleteDoc(doc(db, "circulars", circular.id));
                toast.info("🗑️ Deleted");
                fetchCirculars();
            } catch (err) {
                console.error(err);
                toast.error("❌ Delete failed");
            }
        };

        return (
            <div className="container mt-4">
                <h4 className="text-primary mb-3">📢 Manage Circulars / Notices</h4>

                <div className="mb-3">
                    <button className="btn btn-outline-secondary" onClick={() => window.history.back()}>
                        <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
                    </button>
                </div>

                <form onSubmit={handleUpload} className="card p-3 mb-4 shadow-sm">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <input
                                type="text"
                                placeholder="Title *"
                                className="form-control"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                className="form-control"
                                onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Category / Tag (e.g. Exam, Event, General)"
                                value={form.tag}
                                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                            />
                        </div>
                        <div className="col-md-6">
                            <input
                                type="date"
                                className="form-control"
                                value={form.expiryDate}
                                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                            />
                        </div>
                        <div className="col-12">
                            <textarea
                                className="form-control"
                                placeholder="Optional description"
                                rows="3"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            ></textarea>
                        </div>
                        <div className="col-12 text-end">
                            <button className="btn btn-success" type="submit">
                                <i className="fas fa-upload me-2"></i>Upload Circular
                            </button>
                        </div>
                    </div>
                </form>

                <div className="row">
                    {circulars.length === 0 ? (
                        <p className="text-muted">No circulars uploaded yet.</p>
                    ) : (
                        circulars.map((item) => (
                            <div className="col-md-6 col-lg-4 mb-3" key={item.id}>
                                <div className="card shadow-sm h-100">
                                    <div className="card-body">
                                        <h6 className="fw-bold">{item.title}</h6>
                                        <p className="small text-muted mb-1">{item.description}</p>
                                        {item.tag && <p className="badge bg-info text-dark mb-2">{item.tag}</p>}
                                        {item.expiryDate && (
                                            <p className="text-danger small">⏳ Expires: {new Date(item.expiryDate).toLocaleDateString()}</p>
                                        )}
                                        <a
                                            href={item.fileURL}
                                            className="btn btn-sm btn-outline-primary"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            View {item.fileType?.includes("pdf") ? "PDF" : "Image"}
                                        </a>
                                        <button
                                            className="btn btn-sm btn-outline-danger float-end"
                                            onClick={() => handleDelete(item)}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    export default ManageCirculars;
