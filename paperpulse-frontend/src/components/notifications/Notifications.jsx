import { formatTimeAgo } from "../../utils/time";

const Notifications = ({ notifications = [], onViewAllClick }) => {
  const latestNotifications = notifications.slice(0, 5);
  const hasMoreThanFive = notifications.length > 5;

  if (notifications.length === 0) {
    return <div>No notifications</div>;
  }

  return (
    <div>
      {latestNotifications.map((item) => (
        <div
          key={item.id}
          style={{
            padding: "8px 0",
            borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
            background: item.is_read ? "transparent" : "rgba(37, 99, 235, 0.06)",
            pointerEvents: "auto",
          }}
        >
          <div style={{ fontWeight: item.is_read ? 500 : 700 }}>{item.message}</div>
          <div style={{ fontSize: "12px", color: "rgba(51, 65, 85, 0.85)" }}>
            {formatTimeAgo(item.created_at)}
          </div>
        </div>
      ))}
      {hasMoreThanFive && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            console.log("[Notifications] View All button clicked");
            if (typeof onViewAllClick === "function") {
              onViewAllClick();
            }
          }}
          style={{
            marginTop: "8px",
            width: "100%",
            textAlign: "center",
            fontSize: "13px",
            fontWeight: 700,
            color: "#1d4ed8",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            pointerEvents: "auto",
            padding: "6px 0",
          }}
        >
          View All
        </button>
      )}
    </div>
  );
};

export default Notifications;
