import { formatTimeAgo } from "../../utils/time";

const Notifications = ({ notifications = [], onViewAllClick, onItemClick }) => {
  const latestNotifications = notifications.slice(0, 5);

  if (notifications.length === 0) {
    return <div>No notifications</div>;
  }

  return (
    <div>
      {latestNotifications.map((item) => (
        <div
          key={item.id}
          onClick={() => typeof onItemClick === "function" && onItemClick(item)}
          style={{
            padding: "10px 12px",
            borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
            background: item.is_read ? "transparent" : "rgba(37, 99, 235, 0.08)",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          className="pp-notification-item"
        >
          <div style={{ fontWeight: item.is_read ? 500 : 700, color: item.is_read ? "#475569" : "#0f172a" }}>{item.message}</div>
          <div style={{ fontSize: "12px", color: "rgba(51, 65, 85, 0.7)", marginTop: "4px" }}>
            {formatTimeAgo(item.created_at)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
