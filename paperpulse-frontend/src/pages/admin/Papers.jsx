import { useEffect, useMemo, useState } from "react";
import { getPapers } from "../../services/adminService";

import "./Papers.css";

export default function Papers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const data = await getPapers();
        if (!mounted) return;
        setPapers(Array.isArray(data) ? data : []);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const normalize = (v) => String(v ?? "").trim().toLowerCase();

  const getFullPdfUrl = (url) => {
    if (!url) return null;

    const clean = String(url).trim();

    if (!clean) return null;

    // ensure leading slash
    const normalized = clean.startsWith("/") ? clean : `/${clean}`;

    return `http://localhost:5000${normalized}`;
  };

  const statusOptions = [
    { key: "all", label: "All" },
    { key: "submitted", label: "Submitted" },
    { key: "under_review", label: "Under Review" },
    { key: "accepted", label: "Accepted" },
    { key: "rejected", label: "Rejected" },
  ];

  const statusBadgeClass = (status) => {
    const s = normalize(status);
    if (s === "accepted") return "pp-paperStatus pp-paperStatus--accepted";
    if (s === "rejected") return "pp-paperStatus pp-paperStatus--rejected";
    if (s === "under_review") return "pp-paperStatus pp-paperStatus--underReview";
    if (s === "submitted") return "pp-paperStatus pp-paperStatus--submitted";
    return "pp-paperStatus";
  };

  const keywordPreview = (keywords) => {
    if (!keywords) return "—";
    const list = Array.isArray(keywords)
      ? keywords.filter(Boolean).map(String)
      : String(keywords)
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean);

    if (list.length === 0) return "—";
    const shown = list.slice(0, 3);
    const more = list.length - shown.length;
    return more > 0 ? `${shown.join(", ")}…` : shown.join(", ");
  };

  const filteredPapers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = Array.isArray(papers) ? papers : [];

    return list.filter((p) => {
      const title = String(p?.title || "").toLowerCase();
      const authorName = String(p?.author_name || "").toLowerCase();

      const matchesSearch = !q ? true : title.includes(q) || authorName.includes(q);
      const matchesStatus =
        statusFilter === "all" ? true : normalize(p?.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [papers, search, statusFilter]);

  return (
    <section className="pp-adminPapers" aria-label="All papers">
      <div className="pp-adminPapers__header">
        <div>
          <h1 className="pp-adminPapers__title">All Papers</h1>
          <p className="pp-adminPapers__subtitle">Monitor and manage submitted research papers</p>
        </div>

        <div className="pp-adminPapers__filters">
          <input
            className="pp-adminPapers__search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search papers by title or author"
            aria-label="Search papers"
          />

          <select
            className="pp-adminPapers__select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            {statusOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={`pp-adminPapersTable ${loading ? "" : "is-ready"}`}>
        {loading ? (
          <div className="pp-adminPapersTable__state">Loading papers...</div>
        ) : filteredPapers.length === 0 ? (
          <div className="pp-adminPapersTable__state">No papers found</div>
        ) : (
          <div className="pp-adminPapersTable__wrap" role="table" aria-label="Papers table">
            <div className="pp-adminPapersTable__row pp-adminPapersTable__row--head" role="row">
              <div className="pp-adminPapersTable__cell pp-adminPapersTable__cell--head" role="columnheader">
                Title
              </div>
              <div className="pp-adminPapersTable__cell pp-adminPapersTable__cell--head" role="columnheader">
                Author
              </div>
              <div className="pp-adminPapersTable__cell pp-adminPapersTable__cell--head" role="columnheader">
                Status
              </div>
              <div className="pp-adminPapersTable__cell pp-adminPapersTable__cell--head" role="columnheader">
                Keywords
              </div>
              <div className="pp-adminPapersTable__cell pp-adminPapersTable__cell--head pp-adminPapersTable__cell--right" role="columnheader">
                Actions
              </div>
            </div>

            {filteredPapers.map((p) => {
              const viewHref = getFullPdfUrl(p?.pdf_url);

              console.log("PDF DEBUG:", {
                original: p?.pdf_url,
                final: viewHref,
              });

              return (
                <div key={p.id} className="pp-adminPapersTable__row" role="row">
                  <div className="pp-adminPapersTable__cell" role="cell">
                    <div className="pp-adminPapersTable__title" title={p.title}>
                      {p.title}
                    </div>
                  </div>

                  <div className="pp-adminPapersTable__cell" role="cell">
                    <div className="pp-adminPapersTable__authorName">{p.author_name || "—"}</div>
                    <div className="pp-adminPapersTable__authorEmail">{p.author_email || ""}</div>
                  </div>

                  <div className="pp-adminPapersTable__cell" role="cell">
                    <span className={statusBadgeClass(p.status)}>{p.status}</span>
                  </div>

                  <div className="pp-adminPapersTable__cell" role="cell" title={String(p?.keywords || "")}>
                    <div className="pp-adminPapersTable__keywords">{keywordPreview(p.keywords)}</div>
                  </div>

                  <div className="pp-adminPapersTable__cell pp-adminPapersTable__cell--right" role="cell">
                    {viewHref ? (
                      <a
                        className="pp-adminPapersAction"
                        href={viewHref}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View PDF
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="pp-adminPapersAction is-disabled"
                        disabled
                      >
                        No File
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}