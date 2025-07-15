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

    useEffect(() => {
        const fetchCirculars = async () => {
            try {
                const snapshot = await getDocs(collection(db, "circulars"));
                const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                list.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
                setCirculars(list);

                const tagSet = new Set();
                list.forEach(item => item.tag && tagSet.add(item.tag));
                setTags([...tagSet]);
            } catch (err) {
                console.error(err);
                toast.error("❌ Failed to load circulars");
            }
        };
        fetchCirculars();
    }, []);

    const isExpired = (expiryDate) => {
        if (!expiryDate) return false;
        return new Date(expiryDate) < new Date();
    };

    const isNew = (uploadedAt) => {
        const uploadedDate = new Date(uploadedAt);
        const diffMs = new Date() - uploadedDate;
        return diffMs <= 3 * 24 * 60 * 60 * 1000; // within 3 days
    };

    const extractDownloadLinks = (html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const links = [...doc.querySelectorAll("a[href]")];
        return links.filter(link =>
            link.href.includes("https://") &&
            (link.href.endsWith(".pdf") ||
                link.href.endsWith(".xlsx") ||
                link.href.endsWith(".xls") ||
                link.href.endsWith(".docx"))
        );
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
                <div className="col-md-3">
                    <label className="form-label">Search</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by title or tag..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="col-md-2">
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
                <div className="col-md-2">
                    <label className="form-label">From</label>
                    <input
                        type="date"
                        className="form-control"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />
                </div>
                <div className="col-md-2">
                    <label className="form-label">To</label>
                    <input
                        type="date"
                        className="form-control"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                    />
                </div>
                <div className="col-md-3 d-flex align-items-center pt-3">
                    <input
                        type="checkbox"
                        className="form-check-input me-2"
                        id="hideExpired"
                        checked={hideExpired}
                        onChange={(e) => setHideExpired(e.target.checked)}
                    />
                    <label htmlFor="hideExpired" className="form-check-label">Hide Expired</label>
                </div>
            </div>

            {/* 🧾 Circular Cards */}
            <div className="row" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {filtered.length === 0 ? (
                    <p>No circulars found.</p>
                ) : (
                    filtered.map(item => {
                        const expired = isExpired(item.expiryDate);
                        const downloadLinks = extractDownloadLinks(item.description || "");
                        return (
                            <div className="col-md-6 col-lg-4 mb-3" key={item.id}>
                                <div className={`card shadow-sm h-100 border-0 ${expired ? "bg-light text-muted" : ""}`}>
                                    <div className="card-body d-flex flex-column justify-content-between">
                                        <div>
                                            <h6 className="fw-bold">
                                                {item.title}
                                                {isNew(item.uploadedAt) && (
                                                    <span className="badge bg-success ms-2">New</span>
                                                )}
                                            </h6>
                                            <div
                                                className="small text-muted mb-2"
                                                dangerouslySetInnerHTML={{ __html: item.description }}
                                            />
                                            {item.tag && (
                                                <span className="badge bg-info text-dark me-2">{item.tag}</span>
                                            )}
                                            {item.expiryDate && (
                                                <p className="text-danger small mt-2 mb-1">
                                                    ⏳ Expires: {new Date(item.expiryDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        <div className="mt-2 d-flex justify-content-between flex-wrap">
                                            <button
                                                className="btn btn-sm btn-outline-primary mb-1"
                                                onClick={() => openPreview(item)}
                                            >
                                                <i className="fas fa-eye me-1"></i>Preview
                                            </button>
                                            {downloadLinks.map((link, idx) => {
                                                const fileTypeIcon = link.href.endsWith(".pdf")
                                                    ? "fa-file-pdf"
                                                    : link.href.endsWith(".xls") || link.href.endsWith(".xlsx")
                                                        ? "fa-file-excel"
                                                        : "fa-file-alt";
                                                return (
                                                    <a
                                                        key={idx}
                                                        href={link.href}
                                                        className="btn btn-sm btn-outline-secondary mb-1"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download
                                                    >
                                                        <i className={`fas ${fileTypeIcon} me-1`}></i>
                                                        {link.textContent || "Download"}
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* 🔍 Preview Modal */}
            <Modal show={modalShow} onHide={() => setModalShow(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{previewData?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                    <div
                        dangerouslySetInnerHTML={{ __html: previewData?.description }}
                        className="text-muted"
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModalShow(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default StudentCircularsView;
