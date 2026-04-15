import { useEffect, useMemo, useState } from "react";
import {
  getPapers,
  makeDecision,
  getPaperReviews,
} from "../../services/adminService";

import "./AdminDecision.css";

export default function AdminDecision() {
  const [papers, setPapers] = useState([]);
  const [reviewsMap, setReviewsMap] = useState({});
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("success"); // success | error
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const allPapers = await getPapers();

      // 🔥 ONLY under_review papers
      const filtered = (Array.isArray(allPapers) ? allPapers : []).filter(
        (p) => p.status === "under_review"
      );

      setPapers(filtered);

      // 🔥 fetch reviews for each paper
      const reviewData = {};

      for (let p of filtered) {
        const reviews = await getPaperReviews(p.id);
        reviewData[p.id] = Array.isArray(reviews) ? reviews : [];
      }

      setReviewsMap(reviewData);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDecision = async (paperId, decision) => {
    const reviews = reviewsMap[paperId];

    if (!reviews || reviews.length === 0) {
      setMessageTone("error");
      setMessage("Cannot decide without reviews");
      return;
    }

    try {
      setLoading(true);
      setMessageTone("success");
      setMessage("Processing...");

      await makeDecision({
        paper_id: paperId,
        decision,
      });

      setMessageTone("success");
      setMessage("Decision updated");

      // 🔥 reload data after decision
      await loadData();
    } catch (err) {
      setMessageTone("error");
      setMessage(err?.response?.data?.message || "Failed to update decision");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!message) return;
    if (message === "Processing...") return;
    const t = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const normalize = (v) => String(v ?? "").trim().toLowerCase();
  const recBadgeClass = (rec) => {
    const r = normalize(rec);
    if (r === "accept" || r === "accepted") return "pp-adminDecisionBadge pp-adminDecisionBadge--accept";
    if (r === "reject" || r === "rejected") return "pp-adminDecisionBadge pp-adminDecisionBadge--reject";
    return "pp-adminDecisionBadge";
  };

  const filteredPapers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return papers;
    return (papers || []).filter((p) => String(p?.title || "").toLowerCase().includes(q));
  }, [papers, search]);

  return (
    <section className="pp-adminDecision" aria-label="Decision panel">
      <header className="pp-adminDecision__header">
        <div>
          <h1 className="pp-adminDecision__title">Decision Panel</h1>
          <p className="pp-adminDecision__subtitle">
            Finalize paper decisions based on reviewer feedback
          </p>
        </div>

        <div className="pp-adminDecision__searchWrap">
          <input
            className="pp-adminDecision__search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search paper by title"
            aria-label="Search paper by title"
            disabled={loadingData}
          />
        </div>
      </header>

      {message ? (
        <div
          className={`pp-adminDecision__notice ${messageTone === "success" ? "is-success" : "is-error"}`}
          role="status"
          aria-live="polite"
        >
          {message}
        </div>
      ) : null}

      {loadingData ? (
        <div className="pp-adminDecision__state">Loading decisions...</div>
      ) : filteredPapers.length === 0 ? (
        <div className="pp-adminDecision__state">No papers ready for decision</div>
      ) : (
        <div className="pp-adminDecision__grid">
          {filteredPapers.map((p) => {
            const reviews = Array.isArray(reviewsMap[p.id]) ? reviewsMap[p.id] : [];
            const acceptCount = reviews.filter((r) => normalize(r?.recommendation) === "accept").length;
            const rejectCount = reviews.filter((r) => normalize(r?.recommendation) === "reject").length;
            const hasReviews = reviews.length > 0;

            return (
              <article key={p.id} className="pp-adminDecisionCard">
                <div className="pp-adminDecisionCard__top">
                  <div className="pp-adminDecisionCard__paperTitle" title={p.title}>
                    {p.title}
                  </div>
                  <span className="pp-adminDecisionStatus">Under Review</span>
                </div>

                <div className="pp-adminDecisionCard__section">
                  <div className="pp-adminDecisionCard__sectionTitle">Review Summary</div>
                  <div className="pp-adminDecisionSummary">
                    <span className="pp-adminDecisionSummary__pill pp-adminDecisionSummary__pill--accept">
                      Accept: {acceptCount}
                    </span>
                    <span className="pp-adminDecisionSummary__pill pp-adminDecisionSummary__pill--reject">
                      Reject: {rejectCount}
                    </span>
                  </div>
                </div>

                <div className="pp-adminDecisionCard__section">
                  <div className="pp-adminDecisionCard__sectionTitle">Reviews</div>
                  <div className="pp-adminDecisionTable" aria-label="Reviews table">
                    <table className="pp-decisionTable">
                      <thead>
                        <tr>
                          <th>Reviewer</th>
                          <th>Recommendation</th>
                          <th>Comments</th>
                        </tr>
                      </thead>

                      <tbody>
                        {reviews.length > 0 ? (
                          reviews.map((r) => (
                            <tr key={r.id}>
                              <td>
                                <div className="pp-adminDecisionTable__reviewer">
                                  {r.reviewer_name || "Reviewer"}
                                </div>
                              </td>
                              <td>
                                <span className={recBadgeClass(r.recommendation)}>
                                  {normalize(r.recommendation) || "—"}
                                </span>
                              </td>
                              <td title={String(r.comments || "")}>
                                {r.comments || "—"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="pp-adminDecisionTable__empty">
                              No reviews yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pp-adminDecisionCard__section">
                  <div className="pp-adminDecisionCard__sectionTitle">Decision Actions</div>
                  <div className="pp-adminDecisionActions">
                    <button
                      type="button"
                      className="pp-adminDecisionAction pp-adminDecisionAction--accept"
                      onClick={() => handleDecision(p.id, "accepted")}
                      disabled={loading || !hasReviews}
                      title={!hasReviews ? "Reviews required to make a decision" : ""}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="pp-adminDecisionAction pp-adminDecisionAction--reject"
                      onClick={() => handleDecision(p.id, "rejected")}
                      disabled={loading || !hasReviews}
                      title={!hasReviews ? "Reviews required to make a decision" : ""}
                    >
                      Reject
                    </button>
                  </div>

                  {!hasReviews ? (
                    <div className="pp-adminDecisionCard__hint">
                      Add at least one review before finalizing a decision.
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}