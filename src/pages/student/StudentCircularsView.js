import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { studentDb as db } from "../../services/firebase";
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const StudentCircularsView = () => {
    const [circulars, setCirculars] = useState([]);
    const [search, setSearch] = useState("");
    const [hideExpired, setHideExpired] = useState(true);
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [modalShow, setModalShow] = useState(false);
    const [previewData, setPreviewData] = useState(null);

    const fetchCirculars = async () => {
        try {
            const snapshot = await getDocs(collection(db, "circulars"));
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            list.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
            setCirculars(list);

            // extract unique tags
            const tagSet = new Set();
            list.forEach(item => item.tag && tagSet.add(item.tag));
            setTags([...tagSet]);
        } catch (err) {
            toast.error("❌ Failed to load circulars");
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCirculars();
    }, []);

    const isExpired = (expiryDate) => {
        if (!expiryDate) return false;
        return new Date(expiryDate) < new Date();
    };

    const filtered = circulars.filter(c => {
        const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.tag?.toLowerCase().includes(search.toLowerCase());
        const matchTag = selectedTag ? c.tag === selectedTag : true;
        const matchDateFrom = dateFrom ? new Date(c.uploadedAt) >= new Date(dateFrom) : true;
        const matchDateTo = dateTo ? new Date(c.uploadedAt) <= new Date(dateTo) : true;
        const notExpired = !hideExpired || !isExpired(c.expiryDate);
        return matchSearch && matchTag && matchDateFrom && matchDateTo && notExpired;
    });

    const openPreview = (item) => {
        setPreviewData(item);
        setModalShow(true);
    };

    return (
        <div className="container py-4">
            <h4 className="text-primary mb-3">📢 Notices & Circulars</h4>

            <div className="mb-3">
                <button className="btn btn-outline-secondary" onClick={() => window.history.back()}>
                    <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
                </button>
            </div>

            {/* 🔍 Filters */}
            <div className="row g-3 align-items-end mb-4">
                {/* 🔍 Search Field */}
                <div className="col-md-3 col-sm-6">
                    <label className="form-label">Search</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by title or tag..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* 🏷️ Tag Dropdown */}
                <div className="col-md-2 col-sm-6">
                    <label className="form-label">Filter by Tag</label>
                    <select
                        className="form-select"
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                    >
                        <option value="">All Tags</option>
                        {tags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                        ))}
                    </select>
                </div>

                {/* 📅 From Date */}
                <div className="col-md-2 col-sm-6">
                    <label className="form-label">From Date</label>
                    <input
                        type="date"
                        className="form-control"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />
                </div>

                {/* 📅 To Date */}
                <div className="col-md-2 col-sm-6">
                    <label className="form-label">To Date</label>
                    <input
                        type="date"
                        className="form-control"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                    />
                </div>

                {/* ✅ Hide Expired */}
                <div className="col-md-2 col-sm-12 d-flex align-items-center pt-3">
                    <input
                        type="checkbox"
                        className="form-check-input me-2"
                        id="hideExpired"
                        checked={hideExpired}
                        onChange={(e) => setHideExpired(e.target.checked)}
                    />
                    <label htmlFor="hideExpired" className="form-check-label">
                        Hide Expired
                    </label>
                </div>
            </div>


            {/* 📜 Circular Cards */}
            <div className="row" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {filtered.length === 0 ? (
                    <p className="">No circulars found.</p>
                ) : (
                    filtered.map(item => (
                        <div className="col-md-6 col-lg-4 mb-3" key={item.id}>
                            <div className="card shadow-sm h-100 border-0">
                                <div className="card-body d-flex flex-column justify-content-between">
                                    <div>
                                        <h6 className="fw-bold">{item.title}</h6>
                                        {item.description && <p className="text-muted small">{item.description}</p>}
                                        {item.tag && <span className="badge bg-info text-dark me-2">{item.tag}</span>}
                                        {item.expiryDate && (
                                            <p className="text-danger small mt-2 mb-1">
                                                ⏳ Expires: {new Date(item.expiryDate).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-2 d-flex justify-content-between">
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => openPreview(item)}
                                        >
                                            Preview
                                        </button>
                                        <a
                                            href={item.fileURL}
                                            className="btn btn-sm btn-outline-secondary"
                                            download
                                        >
                                            <i className="fas fa-download me-1"></i>Download
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 🖼 Modal Preview */}
            {previewData && (
                <Modal show={modalShow} onHide={() => setModalShow(false)} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{previewData.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ minHeight: "500px" }}>
                        {previewData.fileType?.includes("pdf") ? (
                            <iframe
                                src={previewData.fileURL}
                                title="PDF Preview"
                                style={{ width: "100%", height: "450px", border: "none" }}
                            ></iframe>
                        ) : (
                            <img
                                src={previewData.fileURL}
                                alt="Circular"
                                className="img-fluid"
                            />
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setModalShow(false)}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default StudentCircularsView;
