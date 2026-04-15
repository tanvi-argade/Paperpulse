const notificationModel = require("../models/notification.model");

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await notificationModel.getNotificationsByUser(req.user.id);
    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

const markMyNotificationsAsRead = async (req, res) => {
  try {
    await notificationModel.markAllNotificationsAsRead(req.user.id);
    return res.json({ message: "Notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to mark notifications as read" });
  }
};

module.exports = {
  getMyNotifications,
  markMyNotificationsAsRead
};
