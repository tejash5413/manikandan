import React, { useState, useEffect, useRef } from "react";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy
} from "firebase/firestore";
import {
    ref,
    uploadBytes,
    getDownloadURL
} from "firebase/storage";
import { adminDb as db, adminStorage as storage } from "../../services/firebase";
import { toast } from "react-toastify";
import JoditEditor from "jodit-react";

const ManageCirculars = () => {
    const [circulars, setCirculars] = useState([]);
    const [form, setForm] = useState({
        title: "",
        description: "",
        expiryDate: "",
        tag: "",
    });
    const editorRef = useRef(null);

    const fetchCirculars = async () => {
        const q = query(collection(db, "circulars"), orderBy("uploadedAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCirculars(data);
    };

    useEffect(() => {
        fetchCirculars();
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!form.title.trim() || !form.description.trim()) {
            toast.warn("⚠️ Title and Description are required");
            return;
        }

        try {
            await addDoc(collection(db, "circulars"), {
                title: form.title.trim(),
                description: form.description,
                uploadedAt: new Date().toISOString(),
                expiryDate: form.expiryDate || null,
                tag: form.tag || "",
            });

            toast.success("✅ Circular uploaded!");
            setForm({ title: "", description: "", expiryDate: "", tag: "" });
            fetchCirculars();
        } catch (err) {
            console.error(err);
            toast.error("❌ Upload failed");
        }
    };

    const handleDelete = async (circular) => {
        if (!window.confirm(`Delete circular "${circular.title}"?`)) return;

        try {
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
                        <label className="form-label">Description (Rich text + Uploads)</label>
                        <JoditEditor
                            ref={editorRef}
                            value={form.description}
                            onChange={(newContent) => setForm({ ...form, description: newContent })}
                            config={{
                                height: 300,
                                uploader: {
                                    insertImageAsBase64URI: false,
                                    process: async (files, editor) => {
                                        const file = files[0];
                                        const filename = `circulars/${Date.now()}_${file.name}`;
                                        const fileRef = ref(storage, filename);
                                        await uploadBytes(fileRef, file);
                                        const url = await getDownloadURL(fileRef);

                                        if (file.type === "application/pdf") {
                                            editor.selection.insertHTML(
                                                `<p><a href="${url}" target="_blank" style="color:blue;text-decoration:underline;">📄 View PDF: ${file.name}</a></p>`
                                            );
                                        } else if (
                                            file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                                            file.type === "application/vnd.ms-excel"
                                        ) {
                                            editor.selection.insertHTML(
                                                `<p><a href="${url}" target="_blank" style="color:green;text-decoration:underline;">📊 Excel File: ${file.name}</a></p>`
                                            );
                                        } else if (file.type.startsWith("image/")) {
                                            editor.selection.insertImage(url);
                                        } else {
                                            editor.selection.insertHTML(
                                                `<p><a href="${url}" target="_blank">${file.name}</a></p>`
                                            );
                                        }
                                    }
                                },
                                buttons: [
                                    'bold', 'italic', 'underline', '|',
                                    'ul', 'ol', '|',
                                    'image', 'file', '|',
                                    'link', '|',
                                    'align', '|',
                                    'undo', 'redo'
                                ]
                            }}
                        />
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
                                <div className="card-body d-flex flex-column justify-content-between">
                                    <div>
                                        <h6 className="fw-bold">{item.title}</h6>
                                        <div
                                            className="small text-muted mb-2"
                                            dangerouslySetInnerHTML={{ __html: item.description }}
                                        />
                                        {item.tag && (
                                            <span className="badge bg-info text-dark me-2">{item.tag}</span>
                                        )}
                                        {item.expiryDate && (
                                            <p className="text-danger small mt-2">
                                                ⏳ Expires: {new Date(item.expiryDate).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-end">
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(item)}
                                        >
                                            <i className="fas fa-trash me-1"></i>Delete
                                        </button>
                                    </div>
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
