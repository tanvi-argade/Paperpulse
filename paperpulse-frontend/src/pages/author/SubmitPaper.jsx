import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ ADD THIS
import api from "../../api/axios";
import { getUser } from "../../utils/auth";

import "./SubmitPaper.css";

const SubmitPaper = () => {
    const navigate = useNavigate(); // ✅ ADD THIS

    const [title, setTitle] = useState("");
    const [abstract, setAbstract] = useState("");
    const [keywords, setKeywords] = useState("");
    const [file, setFile] = useState(null);

    const [coauthorName, setCoauthorName] = useState("");
    const [coauthorEmail, setCoauthorEmail] = useState("");
    const [coauthors, setCoauthors] = useState([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageTone, setMessageTone] = useState("success");
    const [isDragOver, setIsDragOver] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!message || messageTone !== "success") return;
        const t = setTimeout(() => setMessage(""), 3000);
        return () => clearTimeout(t);
    }, [message, messageTone]);

    const setPickedFile = (picked) => {
        if (!picked) return;
        const isPdf =
            picked.type === "application/pdf" || String(picked.name || "").toLowerCase().endsWith(".pdf");
        if (!isPdf) {
            setMessageTone("error");
            setMessage("Only PDF files are allowed");
            return;
        }
        setFile(picked);
    };

    const openFilePicker = () => fileInputRef.current?.click();

    const addCoauthor = () => {
        if (!coauthorName) return; // Only name is required visually
        if (coauthorEmail) {
            const emailNormalized = coauthorEmail.trim().toLowerCase();
            const currentUser = getUser();
            
            if (currentUser && currentUser.email && emailNormalized === currentUser.email.trim().toLowerCase()) {
                setMessageTone("error");
                setMessage("You are already the main author");
                return;
            }
            if (coauthors.find(c => c.email && c.email.trim().toLowerCase() === emailNormalized)) {
                setMessageTone("error");
                setMessage("Co-author with this email already added");
                return;
            }
        }
        setCoauthors([...coauthors, { name: coauthorName, email: coauthorEmail || undefined }]);
        setCoauthorName("");
        setCoauthorEmail("");
    };

    const removeCoauthor = (indexToRemove) => {
        setCoauthors(coauthors.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setMessageTone("error");
            setMessage("PDF file is required");
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("title", title);
            formData.append("abstract", abstract);
            formData.append("keywords", keywords);
            formData.append("pdf", file);
            formData.append("coauthors", JSON.stringify(coauthors));

            await api.post("/api/papers/submit", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setMessageTone("success");
            setMessage("Paper submitted successfully");

            // reset form
            setTitle("");
            setAbstract("");
            setKeywords("");
            setFile(null);
            setCoauthors([]);
            if (fileInputRef.current) fileInputRef.current.value = "";

            // ✅ OPTIONAL: redirect after success
            setTimeout(() => navigate("/author"), 1000);

        } catch (err) {
            setMessageTone("error");
            setMessage(err.response?.data?.error?.message || err.response?.data?.message || "Submission failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pp-submitPaper">
            <div className="pp-submitPaper__bg" aria-hidden="true" />

            <div className="pp-submitPaper__card">
                <header className="pp-submitPaper__header">
                    
                    {/* ✅ ADD THIS BUTTON */}
                    <button
                        type="button"
                        className="pp-submitPaper__back"
                        onClick={() => navigate("/author")}
                    >
                        ← Back
                    </button>

                    <div className="pp-submitPaper__kicker">Author</div>
                    <h1 className="pp-submitPaper__title">Submit Research Paper</h1>
                    <p className="pp-submitPaper__subtitle">
                        Upload your manuscript and track its review progress from your dashboard.
                    </p>
                </header>

                {message ? (
                    <div
                        className={`pp-submitPaper__alert ${messageTone === "success" ? "is-success" : "is-error"}`}
                        role="status"
                        aria-live="polite"
                    >
                        {message}
                    </div>
                ) : null}

                <form className="pp-submitPaper__form" onSubmit={handleSubmit}>
                    <section className="pp-submitPaper__section" aria-label="Paper details">
                        <div className="pp-submitPaper__sectionTitle">Paper Details</div>

                        <label className="pp-submitPaper__field">
                            <div className="pp-submitPaper__label">Title</div>
                            <input
                                className="pp-submitPaper__input"
                                type="text"
                                placeholder="Enter research paper title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </label>

                        <label className="pp-submitPaper__field">
                            <div className="pp-submitPaper__label">Abstract</div>
                            <textarea
                                className="pp-submitPaper__textarea"
                                placeholder="Write a clear summary of your work..."
                                value={abstract}
                                onChange={(e) => setAbstract(e.target.value)}
                                required
                            />
                        </label>
                    </section>

                    <section className="pp-submitPaper__section" aria-label="Metadata">
                        <div className="pp-submitPaper__sectionTitle">Metadata</div>

                        <label className="pp-submitPaper__field">
                            <div className="pp-submitPaper__label">Keywords</div>
                            <input
                                className="pp-submitPaper__input"
                                type="text"
                                placeholder="AI, Machine Learning, NLP"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                required
                            />
                        </label>
                    </section>

                    <section className="pp-submitPaper__section" aria-label="Co-authors">
                        <div className="pp-submitPaper__sectionTitle">Co-authors</div>
                        
                        <div className="pp-submitPaper__coauthorInput" style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                            <label className="pp-submitPaper__field" style={{ flex: "1 1 200px" }}>
                                <div className="pp-submitPaper__label">Name *</div>
                                <input
                                    className="pp-submitPaper__input"
                                    type="text"
                                    placeholder="Jane Doe"
                                    value={coauthorName}
                                    onChange={(e) => setCoauthorName(e.target.value)}
                                />
                            </label>
                            <label className="pp-submitPaper__field" style={{ flex: "1 1 200px" }}>
                                <div className="pp-submitPaper__label">Email (Optional)</div>
                                <input
                                    className="pp-submitPaper__input"
                                    type="email"
                                    placeholder="jane@example.com"
                                    value={coauthorEmail}
                                    onChange={(e) => setCoauthorEmail(e.target.value)}
                                />
                            </label>
                            <button 
                                type="button" 
                                className="pp-submitPaper__addBtn"
                                onClick={addCoauthor}
                                style={{ marginBottom: "0.25rem", padding: "0.5rem 1rem", backgroundColor: "var(--pp-primary, #2563eb)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold"}}
                            >
                                Add
                            </button>
                        </div>

                        {coauthors.length > 0 && (
                            <ul className="pp-submitPaper__coauthorList" style={{ marginTop: "1rem", listStyle: "none", padding: 0 }}>
                                {coauthors.map((c, idx) => (
                                    <li key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", padding: "0.5rem 1rem", background: "rgba(0,0,0,0.05)", borderRadius: "4px", border: "1px solid rgba(0,0,0,0.1)" }}>
                                        <div>
                                            <strong>{c.name}</strong> {c.email ? `<${c.email}>` : ""}
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => removeCoauthor(idx)}
                                            style={{ color: "var(--pp-danger, #dc2626)", background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="pp-submitPaper__section" aria-label="Upload">
                        <div className="pp-submitPaper__sectionTitle">Upload Section</div>

                        <input
                            ref={fileInputRef}
                            className="pp-submitPaper__fileInput"
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => setPickedFile(e.target.files?.[0] || null)}
                            tabIndex={-1}
                        />

                        <button
                            type="button"
                            className={`pp-submitPaper__dropzone ${isDragOver ? "is-dragOver" : ""}`}
                            onClick={openFilePicker}
                            onDragEnter={() => setIsDragOver(true)}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragOver(true);
                            }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragOver(false);
                                const picked = e.dataTransfer?.files?.[0];
                                setPickedFile(picked || null);
                            }}
                            aria-label="Upload PDF"
                        >
                            <div className="pp-submitPaper__dropTitle">Click or drag PDF to upload</div>
                            <div className="pp-submitPaper__dropHint">
                                {file ? (
                                    <>
                                        Selected: <span className="pp-submitPaper__fileName">{file.name}</span>
                                    </>
                                ) : (
                                    "PDF only • Max size depends on server configuration"
                                )}
                            </div>
                        </button>
                    </section>

                    <button className="pp-submitPaper__submit" type="submit" disabled={loading}>
                        {loading ? "Submitting..." : "Submit Paper"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubmitPaper;