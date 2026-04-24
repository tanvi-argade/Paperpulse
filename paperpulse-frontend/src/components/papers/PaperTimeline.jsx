import { useMemo } from "react";
import { formatTimeAgo } from "../../utils/time";

const getActionLabel = (item) => {
  const action = String(item.action || "").toLowerCase();
  
  if (action === "review_submitted") return "Review Submitted";
  if (action === "reviewer_assigned") return "Reviewer Assigned";
  if (action === "paper_submitted") return "Paper Submitted";
  if (action === "final_decision") return "Decision Made";
  if (action === "paper_published") return "Paper Published";
  if (action === "paper_unpublished") return "Paper Unpublished";
  if (action === "status_changed") return "Status Updated";
  
  if (action === "decision_made") {
    const value = String(item?.meta?.decision || "").toLowerCase();
    if (value === "accepted") return "Accepted";
    if (value === "rejected") return "Rejected";
    return "Decision Made";
  }

  // Fallback: capitalize if unknown
  return action.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
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
            paddingLeft: "15px",
            paddingBottom: "15px",
            position: "relative"
          }}
        >
          {/* Dot */}
          <div style={{
            position: "absolute",
            left: "-5px",
            top: "4px",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#2563eb",
            border: "2px solid #fff"
          }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontWeight: 700, color: "#1e293b" }}>{getActionLabel(item)}</div>
            <div style={{ fontSize: "11px", color: "rgba(51, 65, 85, 0.6)" }}>
              {formatTimeAgo(item.created_at)}
            </div>
          </div>
          
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
            By <span style={{ fontWeight: 600 }}>{item.performer_name || "System"}</span>
          </div>

          {item?.meta?.comments && (
            <div style={{ 
              fontSize: "13px", 
              marginTop: "6px", 
              padding: "8px", 
              background: "#f8fafc", 
              borderRadius: "6px",
              border: "1px solid #f1f5f9"
            }}>
              "{item.meta.comments}"
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PaperTimeline;
