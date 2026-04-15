import { useEffect, useMemo, useState } from "react";
import { getUsers, getPapers, assignReviewer } from "../../services/adminService";

import "./AssignReviewer.css";

export default function AssignReviewer() {
  const [users, setUsers] = useState([]);
  const [papers, setPapers] = useState([]);

  const [paperId, setPaperId] = useState("");
  const [reviewerId, setReviewerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("success"); // success | error

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoadingData(true);
        const [u, p] = await Promise.all([getUsers(), getPapers()]);
        if (!mounted) return;
        setUsers(Array.isArray(u) ? u : []);
        setPapers(Array.isArray(p) ? p : []);
      } finally {
        if (mounted) setLoadingData(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const normalize = (v) => String(v ?? "").trim().toLowerCase();
  const isAssignableStatus = (status) => {
    const s = normalize(status);
    return s === "submitted" || s === "under_review";
  };

  const reviewers = useMemo(
    () => users.filter((u) => normalize(u?.role) === "reviewer"),
    [users]
  );

  const assignablePapers = useMemo(
    () => papers.filter((p) => isAssignableStatus(p?.status)),
    [papers]
  );

  const filteredPapers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return assignablePapers;
    return assignablePapers.filter((p) =>
      String(p?.title || "").toLowerCase().includes(q)
    );
  }, [assignablePapers, search]);

  const selectedPaper = useMemo(() => {
    const idNum = Number(paperId);
    return assignablePapers.find((p) => Number(p?.id) === idNum) || null;
  }, [assignablePapers, paperId]);

  const selectedReviewer = useMemo(() => {
    const idNum = Number(reviewerId);
    return reviewers.find((r) => Number(r?.id) === idNum) || null;
  }, [reviewers, reviewerId]);

  const statusBadgeClass = (status) => {
    const s = normalize(status);
    if (s === "under_review") return "pp-assignStatus pp-assignStatus--underReview";
    return "pp-assignStatus pp-assignStatus--submitted";
  };

  const handleAssign = async () => {
    if (!paperId || !reviewerId) return;

    try {
      setLoading(true);
      await assignReviewer({
        paper_id: paperId,
        reviewer_id: reviewerId
      });
      setMessageTone("success");
      setMessage("Reviewer assigned successfully");

      // reset selections to reduce duplicate assignments
      setPaperId("");
      setReviewerId("");
    } catch (err) {
      setMessageTone("error");
      setMessage(err?.response?.data?.message || "Failed to assign reviewer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="pp-assignReviewer" aria-label="Assign reviewer">
      <div className="pp-assignReviewer__card">
        <header className="pp-assignReviewer__header">
          <h1 className="pp-assignReviewer__title">Assign Reviewer</h1>
          <p className="pp-assignReviewer__subtitle">Assign papers to reviewers for evaluation</p>
        </header>

        {message ? (
          <div
            className={`pp-assignReviewer__notice ${messageTone === "success" ? "is-success" : "is-error"}`}
            role="status"
            aria-live="polite"
          >
            {message}
          </div>
        ) : null}

        <div className="pp-assignReviewer__form">
          <section className="pp-assignReviewer__section" aria-label="Select paper">
            <div className="pp-assignReviewer__sectionTitle">Select Paper</div>

            <input
              className="pp-assignReviewer__search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search paper by title"
              aria-label="Search papers by title"
              disabled={loadingData}
            />

            {loadingData ? (
              <div className="pp-assignReviewer__hint">Loading...</div>
            ) : filteredPapers.length === 0 ? (
              <div className="pp-assignReviewer__hint">No papers available for assignment</div>
            ) : (
              <select
                className="pp-assignReviewer__select"
                value={paperId}
                onChange={(e) => setPaperId(e.target.value)}
              >
                <option value="">Select Paper</option>
                {filteredPapers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({normalize(p.status)})
                  </option>
                ))}
              </select>
            )}
          </section>

          <section className="pp-assignReviewer__section" aria-label="Select reviewer">
            <div className="pp-assignReviewer__sectionTitle">Select Reviewer</div>

            {loadingData ? (
              <div className="pp-assignReviewer__hint">Loading...</div>
            ) : reviewers.length === 0 ? (
              <div className="pp-assignReviewer__hint">No reviewers available</div>
            ) : (
              <select
                className="pp-assignReviewer__select"
                value={reviewerId}
                onChange={(e) => setReviewerId(e.target.value)}
              >
                <option value="">Select Reviewer</option>
                {reviewers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.email})
                  </option>
                ))}
              </select>
            )}
          </section>

          <section className="pp-assignReviewer__section" aria-label="Preview and assign">
            <div className="pp-assignReviewer__sectionTitle">Preview + Assign</div>

            {selectedPaper && selectedReviewer ? (
              <div className="pp-assignReviewer__preview">
                <div className="pp-assignReviewer__previewRow">
                  <div className="pp-assignReviewer__previewLabel">Paper</div>
                  <div className="pp-assignReviewer__previewValue">
                    <span className="pp-assignReviewer__previewTitle">{selectedPaper.title}</span>
                    <span className={statusBadgeClass(selectedPaper.status)}>{normalize(selectedPaper.status)}</span>
                  </div>
                </div>

                <div className="pp-assignReviewer__previewRow">
                  <div className="pp-assignReviewer__previewLabel">Reviewer</div>
                  <div className="pp-assignReviewer__previewValue">
                    {selectedReviewer.name}
                  </div>
                </div>
              </div>
            ) : (
              <div className="pp-assignReviewer__hint">Select a paper and reviewer to preview the assignment.</div>
            )}

            <button
              type="button"
              className="pp-assignReviewer__button"
              onClick={handleAssign}
              disabled={loading || !paperId || !reviewerId}
            >
              {loading ? "Assigning..." : "Assign Reviewer"}
            </button>
          </section>
        </div>
      </div>
    </section>
  );
}