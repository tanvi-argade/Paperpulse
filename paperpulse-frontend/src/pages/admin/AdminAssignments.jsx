import { useEffect, useMemo, useState } from "react";
import { getAssignments } from "../../services/adminService";

import "./AdminAssignments.css";

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const data = await getAssignments();
        if (!mounted) return;
        setAssignments(Array.isArray(data) ? data : []);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const formatAssignedAt = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const filteredAssignments = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = Array.isArray(assignments) ? assignments : [];
    if (!q) return list;

    return list.filter((a) => {
      const paper = String(a?.paper_title || "").toLowerCase();
      const reviewer = String(a?.reviewer_name || "").toLowerCase();
      return paper.includes(q) || reviewer.includes(q);
    });
  }, [assignments, search]);

  return (
    <section className="pp-adminAssignments" aria-label="Reviewer assignments">
      <div className="pp-adminAssignments__header">
        <div>
          <h1 className="pp-adminAssignments__title">Reviewer Assignments</h1>
          <p className="pp-adminAssignments__subtitle">Track which reviewer is assigned to which paper</p>
        </div>

        <div className="pp-adminAssignments__filters">
          <input
            className="pp-adminAssignments__search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by paper or reviewer"
            aria-label="Search assignments"
          />
        </div>
      </div>

      <div className={`pp-adminAssignmentsTable ${loading ? "" : "is-ready"}`}>
        {loading ? (
          <div className="pp-adminAssignmentsTable__state">Loading assignments...</div>
        ) : filteredAssignments.length === 0 ? (
          <div className="pp-adminAssignmentsTable__state">No assignments found</div>
        ) : (
          <div className="pp-adminAssignmentsTable__wrap" role="table" aria-label="Assignments table">
            <div className="pp-adminAssignmentsTable__row pp-adminAssignmentsTable__row--head" role="row">
              <div className="pp-adminAssignmentsTable__cell pp-adminAssignmentsTable__cell--head" role="columnheader">
                Paper Title
              </div>
              <div className="pp-adminAssignmentsTable__cell pp-adminAssignmentsTable__cell--head" role="columnheader">
                Author
              </div>
              <div className="pp-adminAssignmentsTable__cell pp-adminAssignmentsTable__cell--head" role="columnheader">
                Reviewer
              </div>
              <div className="pp-adminAssignmentsTable__cell pp-adminAssignmentsTable__cell--head" role="columnheader">
                Assigned Date
              </div>
            </div>

            {filteredAssignments.map((a) => (
              <div key={a.id} className="pp-adminAssignmentsTable__row" role="row">
                <div className="pp-adminAssignmentsTable__cell" role="cell">
                  <div className="pp-adminAssignmentsTable__paperTitle" title={a.paper_title}>
                    {a.paper_title}
                  </div>
                  <div className="pp-adminAssignmentsTable__badge">Assigned</div>
                </div>

                <div className="pp-adminAssignmentsTable__cell" role="cell">
                  <div className="pp-adminAssignmentsTable__name">{a.author_name || "—"}</div>
                  {a.author_email ? (
                    <div className="pp-adminAssignmentsTable__email">{a.author_email}</div>
                  ) : null}
                </div>

                <div className="pp-adminAssignmentsTable__cell" role="cell">
                  <div className="pp-adminAssignmentsTable__name">{a.reviewer_name || "—"}</div>
                  {a.reviewer_email ? (
                    <div className="pp-adminAssignmentsTable__email">{a.reviewer_email}</div>
                  ) : null}
                </div>

                <div className="pp-adminAssignmentsTable__cell" role="cell">
                  <div className="pp-adminAssignmentsTable__date">{formatAssignedAt(a.assigned_at)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}