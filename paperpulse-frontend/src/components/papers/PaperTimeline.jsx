import { useMemo } from "react";
import { formatTimeAgo } from "../../utils/time";

const getActionLabel = (item) => {
  if (item.action === "review_submitted") return "Review Submitted";
  if (item.action === "assign_reviewer") return "Reviewer Assigned";
  if (item.action === "decision_made") {
    const value = String(item?.meta?.decision || "").toLowerCase();
    if (value === "accepted") return "Accepted";
    if (value === "rejected") return "Rejected";
    return "Decision Made";
  }
  return item.action;
};

const PaperTimeline = ({ timeline = [] }) => {
  const orderedTimeline = useMemo(() => {
    return [...timeline].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }, [timeline]);

  if (orderedTimeline.length === 0) return <p>No timeline yet</p>;

  return (
    <div>
      {orderedTimeline.map((item) => (
        <div
          key={item.id}
          style={{
            borderLeft: "2px solid rgba(15, 23, 42, 0.12)",
            marginLeft: "6px",
            paddingLeft: "10px",
            paddingBottom: "10px",
          }}
        >
          <div style={{ fontWeight: 700 }}>{getActionLabel(item)}</div>
          <div style={{ fontSize: "12px", color: "rgba(51, 65, 85, 0.85)" }}>
            {formatTimeAgo(item.created_at)}
          </div>
          {item?.meta?.comments && (
            <div style={{ fontSize: "13px", marginTop: "4px" }}>
              {item.meta.comments}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PaperTimeline;
