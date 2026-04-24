const notificationModel = require("../models/notification.model");

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await notificationModel.getNotificationsByUser(req.user.id);
    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({
      error: {
        code: "FETCH_FAILED",
        message: "Failed to fetch notifications"
      }
    });
  }
};

const markMyNotificationsAsRead = async (req, res) => {
  try {

    // 4. Update notifications
    await notificationModel.markAllNotificationsAsRead(req.user.id);

    // 🔴 5. Return fresh state (prevents frontend drift)
    const updatedNotifications =
      await notificationModel.getNotificationsByUser(req.user.id);

    return res.json({
      message: "Notifications marked as read",
      notifications: updatedNotifications
    });

  } catch (error) {
    return res.status(500).json({
      error: {
        code: "FETCH_FAILED",
        message: "Failed to mark notifications as read"
      }
    });
  }
};

module.exports = {
  getMyNotifications,
  markMyNotificationsAsRead
};
