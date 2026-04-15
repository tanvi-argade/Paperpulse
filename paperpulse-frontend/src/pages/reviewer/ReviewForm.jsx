import { useState } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { submitReview } from "../../services/reviewerService";

import "./ReviewForm.css";

export default function ReviewForm() {
  const { paperId } = useParams();
  const { refreshPapers } = useOutletContext(); // 🔥 get refresh function
  const navigate = useNavigate();

  const [comments, setComments] = useState("");
  const [recommendation, setRecommendation] = useState("accept");

  const handleSubmit = async () => {
    if (!comments) return;

    await submitReview({
      paper_id: paperId,
      comments,
      recommendation,
    });

    alert("Review submitted");

    // 🔥 REFRESH DASHBOARD DATA
    await refreshPapers();

    // 🔥 OPTIONAL: go back to dashboard cleanly
    navigate("/reviewer");
  };

  return (
    <section className="pp-reviewForm" aria-label="Submit review">
      <div className="pp-reviewForm__card">
        <div className="pp-reviewForm__topRow">
          <button
            type="button"
            className="pp-reviewForm__backLink"
            onClick={() => navigate("/reviewer")}
          >
            Back to Dashboard
          </button>
        </div>

        <header className="pp-reviewForm__header">
          <h1 className="pp-reviewForm__title">Review Paper</h1>
          <p className="pp-reviewForm__subtitle">Provide your evaluation and recommendation</p>
          <div className="pp-reviewForm__meta">
            Reviewing Paper ID: <span className="pp-reviewForm__metaValue">{paperId}</span>
          </div>
        </header>

        <div className="pp-reviewForm__divider" aria-hidden="true" />

        <div className="pp-reviewForm__form">
          <label className="pp-reviewForm__field">
            <div className="pp-reviewForm__label">Review Comments</div>
            <textarea
              className="pp-reviewForm__textarea"
              placeholder="Write detailed review comments..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </label>

          <label className="pp-reviewForm__field">
            <div className="pp-reviewForm__label">Recommendation</div>
            <select
              className="pp-reviewForm__select"
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
            >
              <option value="accept">Accept</option>
              <option value="reject">Reject</option>
            </select>

            <div className="pp-reviewForm__recHint" aria-hidden="true">
              <span
                className={`pp-reviewForm__recPill ${
                  recommendation === "accept" ? "is-active is-accept" : "is-accept"
                }`}
              >
                Accept ✅
              </span>
              <span
                className={`pp-reviewForm__recPill ${
                  recommendation === "reject" ? "is-active is-reject" : "is-reject"
                }`}
              >
                Reject ❌
              </span>
            </div>
          </label>

          <button
            type="button"
            className="pp-reviewForm__submit"
            onClick={handleSubmit}
            disabled={!comments}
            title={!comments ? "Please enter review comments" : ""}
          >
            Submit Review
          </button>
        </div>
      </div>
    </section>
  );
}