import { formatTimeAgo } from "../../utils/time";

const Notifications = ({ notifications = [] }) => {
  const latestNotifications = notifications.slice(0, 5);

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
          }}
        >
          <div style={{ fontWeight: item.is_read ? 500 : 700 }}>{item.message}</div>
          <div style={{ fontSize: "12px", color: "rgba(51, 65, 85, 0.85)" }}>
            {formatTimeAgo(item.created_at)}
          </div>
        </div>
      ))}
      <div
        style={{
          marginTop: "8px",
          textAlign: "center",
          fontSize: "13px",
          fontWeight: 700,
          color: "#1d4ed8",
        }}
      >
        View All
      </div>
    </div>
  );
};

export default Notifications;
