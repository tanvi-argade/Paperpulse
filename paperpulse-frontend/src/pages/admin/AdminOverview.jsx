import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, FileClock, XCircle, Globe, CreditCard, Receipt } from "lucide-react";

import { getPaperReviews, getPapers } from "../../services/adminService";
import { getPaymentInfo } from "../../services/paymentService";
import "./AdminOverview.css";

const normalizeStatus = (value) => String(value || "").trim().toLowerCase();

const isSubmitted = (s) => s === "submitted";
const isUnderReview = (s) => s === "under_review";
const isAccepted = (s) => s === "accepted";
const isRejected = (s) => s === "rejected";

export default function AdminOverview() {
  const [papers, setPapers] = useState([]);
  const [payments, setPayments] = useState({}); // { paperId: status }
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

        // Fetch payments for each paper (per instruction: minimal per paper)
        // Only fetch for relevant papers (accepted/published) to minimize calls if needed, 
        // but here we fetch for all to ensure Paid count is accurate.
        const payMap = {};
        await Promise.all(papersList.map(async (p) => {
          try {
            const info = await getPaymentInfo(p.id);
            if (mounted) payMap[p.id] = info.status;
          } catch (e) {
            if (mounted) payMap[p.id] = 'none';
          }
        }));
        if (mounted) setPayments(payMap);

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

    // 🔴 NEW METRICS
    const published = list.filter(p => p.is_published).length;
    const paid = list.filter(p => payments[p.id] === 'success').length;
    const unpaidAccepted = list.filter(p => isAccepted(normalizeStatus(p.status)) && payments[p.id] !== 'success').length;

    return { submitted, underReview, accepted, rejected, published, paid, unpaidAccepted };
  }, [papers, payments]);

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
    {
      label: "Published",
      value: stats.published,
      Icon: Globe,
      tone: "success",
    },
    {
      label: "Paid Papers",
      value: stats.paid,
      Icon: CreditCard,
      tone: "info",
    },
    {
      label: "Accepted (Unpaid)",
      value: stats.unpaidAccepted,
      Icon: Receipt,
      tone: "warning",
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

