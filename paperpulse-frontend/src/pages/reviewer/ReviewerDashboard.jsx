import { useEffect, useMemo, useState } from "react";
import { getAssignedPapers } from "../../services/reviewerService";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import "./ReviewerDashboard.css";

export default function ReviewerDashboard() {
  const [papers, setPapers] = useState([]);
  const [filter, setFilter] = useState("all"); // all | pending | reviewed
  const [search, setSearch] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const isReviewPage = location.pathname.includes("/review/");

  useEffect(() => {
    if (!isReviewPage) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isReviewPage]);

  const fetchPapers = async () => {
    const data = await getAssignedPapers();
    setPapers(data);
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const normalize = (value) => String(value ?? "").trim().toLowerCase();

  const toPills = (keywords) => {
    if (!keywords) return [];
    if (Array.isArray(keywords)) return keywords.filter(Boolean).map(String);
    return String(keywords)
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
  };

  const isReviewed = (paper) => {
    if (!paper) return false;

    const direct =
      paper.reviewed ??
      paper.is_reviewed ??
      paper.has_review ??
      paper.review_submitted ??
      paper.reviewSubmitted;
    if (typeof direct === "boolean") return direct;
    if (typeof direct === "number") return direct > 0;

    const reviewStatus = normalize(
      paper.review_status ?? paper.reviewStatus ?? paper.reviewer_status ?? paper.reviewerStatus,
    );
    if (["reviewed", "completed", "done", "submitted"].includes(reviewStatus)) return true;

    if (paper.review || paper.my_review) return true;
    if (Array.isArray(paper.reviews) && paper.reviews.length > 0) return true;

    return false;
  };

  const counts = useMemo(() => {
    const assigned = papers.length;
    const completed = papers.filter((p) => isReviewed(p)).length;
    const pending = Math.max(assigned - completed, 0);
    return { assigned, pending, completed };
  }, [papers]);

  const filterOptions = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "reviewed", label: "Reviewed" },
  ];

  const filteredPapers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return papers.filter((p) => {
      const reviewed = isReviewed(p);
      const statusOk =
        filter === "all" ? true : filter === "reviewed" ? reviewed : !reviewed;

      const title = String(p?.title || "").toLowerCase();
      const searchOk = q.length === 0 ? true : title.includes(q);

      return statusOk && searchOk;
    });
  }, [papers, filter, search]);

  return (
    <div className="pp-reviewerDash">
      <div className={isReviewPage ? "pp-blur" : ""}>
        <header className="pp-reviewerDash__header">
          <div>
            <div className="pp-reviewerDash__kicker">Welcome, Reviewer</div>
            <h1 className="pp-reviewerDash__title">Review assigned research papers</h1>
          </div>
        </header>

        <section className="pp-reviewerDash__kpis" aria-label="Reviewer stats">
          <div className="pp-reviewerKpiGrid">
            <div className="pp-reviewerKpiCard">
              <div className="pp-reviewerKpiCard__label">Assigned Papers</div>
              <div className="pp-reviewerKpiCard__value">{counts.assigned}</div>
            </div>
            <div className="pp-reviewerKpiCard">
              <div className="pp-reviewerKpiCard__label">Pending Reviews</div>
              <div className="pp-reviewerKpiCard__value">{counts.pending}</div>
            </div>
            <div className="pp-reviewerKpiCard">
              <div className="pp-reviewerKpiCard__label">Completed Reviews</div>
              <div className="pp-reviewerKpiCard__value">{counts.completed}</div>
            </div>
          </div>
        </section>

        <section className="pp-reviewerDash__list" aria-label="Assigned papers">
          <div className="pp-reviewerDash__controls" aria-label="Paper filters and search">
            <div className="pp-reviewerFilterTabs" role="tablist" aria-label="Filter by review status">
              {filterOptions.map((opt) => {
                const active = opt.key === filter;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className={`pp-reviewerFilterTab ${active ? "is-active" : ""}`}
                    onClick={() => setFilter(opt.key)}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div className="pp-reviewerSearchWrap">
              <input
                className="pp-reviewerSearchInput"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title..."
                aria-label="Search papers by title"
              />
            </div>
          </div>

          {papers.length === 0 ? (
            <div className="pp-reviewerEmpty">
              <div className="pp-reviewerEmpty__title">No papers assigned yet</div>
              <div className="pp-reviewerEmpty__subtitle">When papers are assigned to you, they’ll appear here for review.</div>
            </div>
          ) : filteredPapers.length === 0 ? (
            <div className="pp-reviewerEmpty">
              <div className="pp-reviewerEmpty__title">No matches</div>
              <div className="pp-reviewerEmpty__subtitle">Try a different filter or search term.</div>
            </div>
          ) : (
            <div className="pp-reviewerPaperGrid">
              {filteredPapers.map((p) => {
                const pills = toPills(p?.keywords);
                const reviewed = isReviewed(p);

                const pdfUrlRaw = p?.pdf_url ?? p?.pdfUrl ?? p?.pdf;
                const pdfUrl = pdfUrlRaw ? String(pdfUrlRaw) : "";
                const viewHref = pdfUrl
                  ? pdfUrl.startsWith("http")
                    ? pdfUrl
                    : pdfUrl.startsWith("/")
                      ? `http://localhost:5000${pdfUrl}`
                      : `http://localhost:5000/${pdfUrl}`
                  : "";

                return (
                  <article key={p.id} className="pp-reviewerPaperCard">
                    <div className="pp-reviewerPaperCard__top">
                      <div className="pp-reviewerPaperCard__title">{p.title}</div>
                      <span className={`pp-reviewerChip ${reviewed ? "is-reviewed" : "is-pending"}`}>
                        {reviewed ? "Reviewed" : "Pending"}
                      </span>
                    </div>

                    <div className="pp-reviewerPaperCard__metaRow">
                      <span className="pp-reviewerMetaLabel">Status:</span>{" "}
                      <span className="pp-reviewerMetaValue">{p.status || "—"}</span>
                    </div>

                    <div className="pp-reviewerPills" aria-label="Keywords">
                      {pills.length > 0 ? (
                        pills.slice(0, 6).map((k) => (
                          <span key={k} className="pp-reviewerPill">
                            {k}
                          </span>
                        ))
                      ) : (
                        <span className="pp-reviewerPill pp-reviewerPill--muted">No keywords</span>
                      )}
                      {pills.length > 6 ? (
                        <span className="pp-reviewerPill pp-reviewerPill--muted">+{pills.length - 6}</span>
                      ) : null}
                    </div>

                    <div className="pp-reviewerPaperCard__actions">
                      {viewHref ? (
                        <a className="pp-reviewerAction" href={viewHref} target="_blank" rel="noreferrer">
                          View PDF
                        </a>
                      ) : (
                        <button type="button" className="pp-reviewerAction pp-reviewerAction--disabled" disabled>
                          View PDF
                        </button>
                      )}

                      {reviewed ? (
                        <button type="button" className="pp-reviewerAction pp-reviewerAction--disabled" disabled>
                          Reviewed
                        </button>
                      ) : (
                        <Link className="pp-reviewerAction pp-reviewerAction--primary" to={`review/${p.id}`}>
                          Start Review
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {isReviewPage && (
        <div
          className="pp-reviewModalOverlay"
          role="dialog"
          aria-modal="true"
          onClick={() => navigate("/reviewer")}
        >
          <div className="pp-reviewModalContent" onClick={(e) => e.stopPropagation()}>
            <Outlet context={{ refreshPapers: fetchPapers }} />
          </div>
        </div>
      )}
    </div>
  );
}