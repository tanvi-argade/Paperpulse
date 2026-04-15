const pool = require("../config/db");

// Check if already assigned
const isAlreadyAssigned = async (paper_id, reviewer_id) => {
  const result = await pool.query(
    `SELECT 1 FROM reviewer_assignments 
     WHERE paper_id = $1 AND reviewer_id = $2`,
    [paper_id, reviewer_id]
  );
  return result.rows.length > 0;
};

// Get paper (with author_id + status)
const getPaper = async (paper_id) => {
  const result = await pool.query(
    "SELECT id, status, author_id FROM papers WHERE id = $1",
    [paper_id]
  );
  return result.rows[0];
};

// Get user role
const getUser = async (user_id) => {
  const result = await pool.query(
    "SELECT id, role FROM users WHERE id = $1",
    [user_id]
  );
  return result.rows[0];
};

// Assign reviewer WITH TRANSACTION
const assignReviewerTx = async (paper, reviewer_id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Insert assignment
    const assignmentRes = await client.query(
      `INSERT INTO reviewer_assignments (paper_id, reviewer_id)
       VALUES ($1, $2)
       RETURNING *`,
      [paper.id, reviewer_id]
    );

    // Update status only if first assignment
    if (paper.status === "submitted") {
      await client.query(
        `UPDATE papers 
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        ["under_review", paper.id]
      );
    }

    await client.query("COMMIT");

    return assignmentRes.rows[0];

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  isAlreadyAssigned,
  assignReviewerTx,
  getPaper,
  getUser
};