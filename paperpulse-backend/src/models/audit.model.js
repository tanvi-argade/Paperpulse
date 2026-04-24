const pool = require("../config/db");

// Create audit log
const logAction = async (paper_id, action, performed_by, meta = {}, client = pool) => {
  await client.query(
    `INSERT INTO audit_logs (paper_id, action, performed_by, meta)
     VALUES ($1, $2, $3, $4)`,
    [paper_id, action, performed_by, meta]
  );
};

// Get logs with performer names (supports per-paper or system-wide)
const getLogs = async ({ paper_id = null, limit = 50, offset = 0 } = {}) => {
  let query = `
    SELECT 
      a.*, 
      u.name AS performer_name,
      p.title AS paper_title
    FROM audit_logs a
    LEFT JOIN users u ON a.performed_by = u.id
    LEFT JOIN papers p ON a.paper_id = p.id
  `;
  
  const params = [];
  if (paper_id) {
    query += ` WHERE a.paper_id = $1`;
    params.push(paper_id);
  }

  query += ` ORDER BY a.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

module.exports = {
  logAction,
  getLogs
};