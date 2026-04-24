import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import {
  BadgeCheck,
  Bell,
  Clock,
  FileText,
  Plus,
  XCircle,
} from "lucide-react";
import Notifications from "../../components/notifications/Notifications";
import PaperTimeline from "../../components/papers/PaperTimeline";
import { formatTimeAgo } from "../../utils/time";

import "./Dashboard.css";

const AuthorDashboard = () => {
  const [papers, setPapers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // 🔥 NEW STATE (reviews)
  const [reviews, setReviews] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    under_review: 0,
    accepted: 0,
    rejected: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchPapers = async () => {
    try {
      const res = await api.get("/api/papers/my");
      setPapers(res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await api.get("/api/papers/stats");
      const data = res?.data || {};
      setStats({
        total: Number(data.total) || 0,
        submitted: Number(data.submitted) || 0,
        under_review: Number(data.under_review) || 0,
        accepted: Number(data.accepted) || 0,
        rejected: Number(data.rejected) || 0,
      });
    } catch (err) {
      setStats({
        total: 0,
        submitted: 0,
        under_review: 0,
        accepted: 0,
        rejected: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // 🔥 NEW FUNCTION
  const fetchReviews = async (paperId) => {
    try {
      const [reviewsRes, auditRes] = await Promise.all([
        api.get(`/api/papers/${paperId}/reviews`),
        api.get(`/api/papers/${paperId}/audit`),
      ]);
      setReviews(reviewsRes.data);
      setTimeline(Array.isArray(auditRes.data) ? auditRes.data : []);
      setSelectedPaper(paperId);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get("/api/notifications");
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err.message);
      setNotifications([]);
    }
  }, []);

  const markNotificationsAsRead = async () => {
    try {
      if (notifications.length === 0 || notifications.every(n => n.is_read)) return;
      const cutoff = notifications[0]?.created_at || new Date().toISOString();
      const res = await api.patch("/api/notifications/read", { cutoff });
      if (res.data.notifications) {
          setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error("Failed to mark notifications as read:", err.message);
    }
  };

  // initial load
  useEffect(() => {
    fetchPapers();
    fetchStats();
    fetchNotifications();
  }, [fetchNotifications]);

  // handle paperId from query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pId = params.get("paperId");
    if (pId) {
      setSelectedPaper(Number(pId));
      fetchReviews(pId);
    }
  }, [location.search]);

  // 🔥 ADD HERE (focus sync)
  useEffect(() => {
    const onFocus = () => fetchNotifications();

    window.addEventListener("focus", onFocus);

    return () => window.removeEventListener("focus", onFocus);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const normalizeStatus = (value) => String(value || "").trim().toLowerCase();
  const statusMeta = (status) => {
    const s = normalizeStatus(status);
    if (s === "accepted") {
      return { label: "Accepted", tone: "success", hint: "Published" };
    }
    if (s === "rejected") {
      return { label: "Rejected", tone: "danger", hint: "Requires resubmission" };
    }
    if (s === "under_review") {
      return { label: "Under review", tone: "warning", hint: "Under evaluation" };
    }
    if (s === "submitted") {
      return { label: "Submitted", tone: "info", hint: "Waiting for review" };
    }
    return { label: status || "Unknown", tone: "neutral", hint: "" };
  };

  const toPills = (keywords) => {
    if (!keywords) return [];
    if (Array.isArray(keywords)) return keywords.filter(Boolean).map(String);
    return String(keywords)
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
  };

  const parseUpdatedAt = (paper) => {
    const raw = paper?.updated_at ?? paper?.updatedAt ?? paper?.last_updated ?? paper?.created_at;
    if (!raw) return null;
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const kpiTotal = stats.total;
  const kpiAccepted = stats.accepted;
  const kpiRejected = stats.rejected;
  const kpiInReview = (stats.submitted || 0) + (stats.under_review || 0);
  const unreadCount = notifications.filter((item) => !item.is_read).length;

  const filterOptions = [
    { key: "all", label: "All" },
    { key: "accepted", label: "Accepted" },
    { key: "rejected", label: "Rejected" },
    { key: "under_review", label: "Under Review" },
    { key: "submitted", label: "Submitted" },
  ];

  const filteredPapers = papers.filter((paper) => {
    const statusOk =
      filter === "all" ? true : normalizeStatus(paper?.status) === filter;

    const q = search.trim().toLowerCase();
    const title = String(paper?.title || "").toLowerCase();
    const searchOk = q.length === 0 ? true : title.includes(q);

    return statusOk && searchOk;
  });

  const handleNotificationToggle = async () => {
    const next = !showDropdown;
    setShowDropdown(next);

    if (next) {
      await markNotificationsAsRead();
    }
  };

  return (
    <div className="pp-authorDash">
      <header className="pp-authorDash__header">
        <div>
          <div className="pp-authorDash__kicker">Welcome, Author</div>
          <h1 className="pp-authorDash__title">Track and manage your research submissions</h1>
        </div>

        <div ref={dropdownRef} style={{ position: "relative", display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="pp-authorDash__cta pp-authorDash__cta--secondary"
            onClick={handleNotificationToggle}
            aria-label="Open notifications"
            style={{ padding: "10px 12px" }}
          >
            <Bell size={18} aria-hidden="true" />
            <span>Notifications</span>
            <span
              style={{
                minWidth: "20px",
                height: "20px",
                borderRadius: "999px",
                background: "#2563eb",
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 800,
                padding: "0 6px",
              }}
            >
              {unreadCount}
            </span>
          </button>

          <button
            type="button"
            className="pp-authorDash__cta"
            onClick={() => navigate("/author/submit")}
          >
            <Plus size={18} aria-hidden="true" />
            <span>Submit New Paper</span>
          </button>

          {showDropdown && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: "320px",
                maxHeight: "340px",
                overflowY: "auto",
                background: "#fff",
                border: "1px solid rgba(15, 23, 42, 0.12)",
                borderRadius: "12px",
                boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
                padding: "10px 12px",
                zIndex: 20,
              }}
            >
              <Notifications
                notifications={notifications}
                onItemClick={(item) => {
                  if (item.paper_id) {
                    navigate(`/author?paperId=${item.paper_id}`);
                  } else {
                    navigate("/author");
                  }
                  setShowDropdown(false);
                }}
              />
            </div>
          )}
        </div>
      </header>

      <section className="pp-authorDash__kpis" aria-label="Author stats">
        <div className="pp-kpiGrid">
          <div className="pp-kpiCard pp-kpiCard--info">
            <div className="pp-kpiCard__top">
              <div className="pp-kpiCard__label">Total Papers</div>
              <div className="pp-kpiCard__iconWrap" aria-hidden="true">
                <FileText size={18} />
              </div>
            </div>
            <div className="pp-kpiCard__value">{statsLoading ? "—" : kpiTotal}</div>
          </div>

          <div className="pp-kpiCard pp-kpiCard--warning">
            <div className="pp-kpiCard__top">
              <div className="pp-kpiCard__label">In Review</div>
              <div className="pp-kpiCard__iconWrap" aria-hidden="true">
                <Clock size={18} />
              </div>
            </div>
            <div className="pp-kpiCard__value">{statsLoading ? "—" : kpiInReview}</div>
          </div>

          <div className="pp-kpiCard pp-kpiCard--success">
            <div className="pp-kpiCard__top">
              <div className="pp-kpiCard__label">Accepted Papers</div>
              <div className="pp-kpiCard__iconWrap" aria-hidden="true">
                <BadgeCheck size={18} />
              </div>
            </div>
            <div className="pp-kpiCard__value">{statsLoading ? "—" : kpiAccepted}</div>
          </div>

          <div className="pp-kpiCard pp-kpiCard--danger">
            <div className="pp-kpiCard__top">
              <div className="pp-kpiCard__label">Rejected Papers</div>
              <div className="pp-kpiCard__iconWrap" aria-hidden="true">
                <XCircle size={18} />
              </div>
            </div>
            <div className="pp-kpiCard__value">{statsLoading ? "—" : kpiRejected}</div>
          </div>
        </div>
      </section>

      <section className="pp-authorDash__list" aria-label="My papers">
        <div className="pp-authorDash__sectionHead">
          <h2 className="pp-authorDash__sectionTitle">My Papers</h2>
        </div>

        {papers.length === 0 ? (
          <div className="pp-empty">
            <div className="pp-empty__title">No papers submitted yet</div>
            <div className="pp-empty__subtitle">Submit your first paper to start tracking reviews.</div>
            <button
              type="button"
              className="pp-authorDash__cta pp-authorDash__cta--secondary"
              onClick={() => navigate("/author/submit")}
            >
              <Plus size={18} aria-hidden="true" />
              <span>Submit New Paper</span>
            </button>
          </div>
        ) : (
          <>
            <div className="pp-paperControls" aria-label="Paper filters">
              <div className="pp-filterTabs" role="tablist" aria-label="Filter by status">
                {filterOptions.map((opt) => {
                  const active = opt.key === filter;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className={`pp-filterTab ${active ? "is-active" : ""}`}
                      onClick={() => setFilter(opt.key)}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <div className="pp-searchWrap">
                <input
                  className="pp-searchInput"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title..."
                  aria-label="Search papers by title"
                />
              </div>
            </div>

            <div className="pp-paperGrid">
              {filteredPapers.map((paper) => {
                const meta = statusMeta(paper.status);
                const pills = toPills(paper.keywords);
                const updated = parseUpdatedAt(paper);
                const updatedText = updated ? formatTimeAgo(updated) : null;

                const pdfUrlRaw = paper?.pdf_url ?? paper?.pdfUrl ?? paper?.pdf;
                const pdfUrl = pdfUrlRaw ? String(pdfUrlRaw).replace(/^\/+/, "") : "";
                const viewHref = pdfUrl ? `http://localhost:5000/${pdfUrl}` : "";

                return (
                  <article key={paper.id} className="pp-paperCard">
                    <div className="pp-paperCard__top">
                      <div className="pp-paperCard__title">{paper.title}</div>
                      <span className={`pp-badge pp-badge--${meta.tone}`}>{meta.label}</span>
                    </div>

                    {paper.authors && paper.authors.length > 0 && (
                      <div className="pp-paperCard__authors" style={{ fontSize: "13px", color: "rgba(51, 65, 85, 0.85)", marginBottom: "8px", marginTop: "-6px", fontWeight: "600" }}>
                        Authors: {paper.authors.map(a => a.name_snapshot).join(", ")}
                      </div>
                    )}

                    <div className="pp-keywords">
                      {pills.map((k, i) => (
                        <span key={i} className="pp-pill">{k}</span>
                      ))}
                    </div>

                    {meta.hint && (
                      <div className="pp-paperCard__hint">
                        <span className="pp-paperCard__hintLabel">Next:</span> {meta.hint}
                      </div>
                    )}

                    <div className="pp-paperCard__meta">
                      {updatedText ? <span>Updated {updatedText}</span> : <span>—</span>}
                    </div>

                    <div className="pp-paperCard__actions">
                      {viewHref && (
                        <a className="pp-paperAction" href={viewHref} target="_blank" rel="noreferrer">
                          View Paper
                        </a>
                      )}

                      {/* 🔥 NEW BUTTON */}
                      {paper.status !== "submitted" && (
                        <button
                          className="pp-paperAction"
                          onClick={() => fetchReviews(paper.id)}
                        >
                          View Reviews
                        </button>
                      )}
                    </div>

                    {/* 🔥 NEW REVIEW UI */}
                    {selectedPaper === paper.id && (
                      <div className="pp-reviewBox">
                        {reviews.length === 0 ? (
                          <p>No reviews yet</p>
                        ) : (
                          reviews.map((r) => (
                            <div key={r.id} className="pp-reviewCard">
                              <p><b>Reviewer:</b> {r.reviewer_name}</p>
                              <p><b>Recommendation:</b> {r.recommendation}</p>
                              <p><b>Comments:</b> {r.comments}</p>
                              <p><b>Date:</b> {formatTimeAgo(r.created_at)}</p>
                            </div>
                          ))
                        )}
                        <div style={{ marginTop: "10px" }}>
                          <PaperTimeline timeline={timeline} />
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default AuthorDashboard;