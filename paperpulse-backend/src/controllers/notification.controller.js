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
    const { cutoff } = req.body;

    // 1. Validate presence
    if (!cutoff) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "cutoff timestamp required"
        }
      });
    }

    // 2. Validate format
    const cutoffDate = new Date(cutoff);
    if (isNaN(cutoffDate.getTime())) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid cutoff timestamp"
        }
      });
    }

    // 🔴 3. Prevent future timestamps (CRITICAL)
    const now = new Date();
    if (cutoffDate > now) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "cutoff cannot be in future"
        }
      });
    }

    const normalizedCutoff = cutoffDate.toISOString();

    // 4. Update notifications
    await notificationModel.markNotificationsAsReadUntil(
      req.user.id,
      normalizedCutoff
    );

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
