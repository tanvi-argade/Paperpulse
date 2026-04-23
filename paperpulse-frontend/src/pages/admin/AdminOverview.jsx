import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, FileClock, XCircle } from "lucide-react";

import { getPaperReviews, getPapers } from "../../services/adminService";
import "./AdminOverview.css";

const normalizeStatus = (value) => String(value || "").trim().toLowerCase();

const isSubmitted = (s) => s === "submitted";
const isUnderReview = (s) => s === "under_review";
const isAccepted = (s) => s === "accepted";
const isRejected = (s) => s === "rejected";

export default function AdminOverview() {
  const [papers, setPapers] = useState([]);
  const [requiresDecisionCount, setRequiresDecisionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);

        const all = await getPapers();
        if (!mounted) return;

        const papersList = Array.isArray(all) ? all : [];
        setPapers(papersList);

        // ❌ REMOVED N+1 REVIEW CALLS
        // Instead derive "requires decision" from paper status only
        const requiresDecision = papersList.filter(
          (p) => normalizeStatus(p.status) === "under_review"
        ).length;

        setRequiresDecisionCount(requiresDecision);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const list = papers || [];
    const submitted = list.filter((p) => isSubmitted(normalizeStatus(p.status))).length;
    const underReview = list.filter((p) => isUnderReview(normalizeStatus(p.status))).length;
    const accepted = list.filter((p) => isAccepted(normalizeStatus(p.status))).length;
    const rejected = list.filter((p) => isRejected(normalizeStatus(p.status))).length;

    return { submitted, underReview, accepted, rejected };
  }, [papers]);

  const cards = [
    {
      label: "Pending Papers",
      value: stats.submitted,
      Icon: FileClock,
      tone: "info",
    },
    {
      label: "Under Review",
      value: stats.underReview,
      Icon: Clock,
      tone: "warning",
    },
    {
      label: "Accepted Papers",
      value: stats.accepted,
      Icon: CheckCircle2,
      tone: "success",
    },
    {
      label: "Rejected Papers",
      value: stats.rejected,
      Icon: XCircle,
      tone: "danger",
    },
    {
      label: "Requires Decision",
      value: requiresDecisionCount,
      Icon: AlertTriangle,
      tone: "accent",
    },
  ];

  return (
    <section className="pp-adminOverview" aria-label="Admin overview">
      <div className="pp-adminOverview__grid">
        {cards.map(({ label, value, Icon, tone }) => (
          <div key={label} className={`pp-kpiCard pp-kpiCard--${tone}`}>
            <div className="pp-kpiCard__top">
              <div className="pp-kpiCard__label">{label}</div>
              <div className="pp-kpiCard__iconWrap" aria-hidden="true">
                <Icon size={18} />
              </div>
            </div>

            <div className="pp-kpiCard__value" aria-label={`${label} count`}>
              {loading ? "—" : value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

