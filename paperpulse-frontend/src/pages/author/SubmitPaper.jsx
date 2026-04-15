import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ ADD THIS
import api from "../../api/axios";

import "./SubmitPaper.css";

const SubmitPaper = () => {
    const navigate = useNavigate(); // ✅ ADD THIS

    const [title, setTitle] = useState("");
    const [abstract, setAbstract] = useState("");
    const [keywords, setKeywords] = useState("");
    const [file, setFile] = useState(null);

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
            if (fileInputRef.current) fileInputRef.current.value = "";

            // ✅ OPTIONAL: redirect after success
            setTimeout(() => navigate("/author"), 1000);

        } catch (err) {
            setMessageTone("error");
            setMessage(err.response?.data?.message || "Submission failed");
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