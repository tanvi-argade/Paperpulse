const pool = require("../config/db");

// Create audit log
const logAction = async (paper_id, action, performed_by, meta = {}) => {
  await pool.query(
    `INSERT INTO audit_logs (paper_id, action, performed_by, meta)
     VALUES ($1, $2, $3, $4)`,
    [paper_id, action, performed_by, meta]
  );
};

// Get logs for paper
const getPaperLogs = async (paper_id) => {
  const result = await pool.query(
    `SELECT * FROM audit_logs
     WHERE paper_id = $1
     ORDER BY created_at DESC`,
    [paper_id]
  );
  return result.rows;
};

module.exports = {
  logAction,
  getPaperLogs
};