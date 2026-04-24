const pool = require("../config/db");

const createNotification = async (user_id, type, message) => {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, type, message)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [user_id, type, message]
  );
  return result.rows[0];
};

const getNotificationsByUser = async (user_id) => {
  const result = await pool.query(
    `SELECT id, type, message, created_at, is_read
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC;`,
    [user_id]
  );
  return result.rows;
};

const markNotificationsAsReadUntil = async (user_id, cutoff) => {
  await pool.query(
    `UPDATE notifications
     SET is_read = true
     WHERE user_id = $1 
       AND is_read = false
       AND created_at <= $2`,
    [user_id, cutoff]
  );
};

const markAllNotificationsAsRead = async (user_id) => {
  await pool.query(
    `UPDATE notifications
     SET is_read = true
     WHERE user_id = $1 AND is_read = false`,
    [user_id]
  );
};

module.exports = {
  createNotification,
  getNotificationsByUser,
  markNotificationsAsReadUntil,
  markAllNotificationsAsRead
};