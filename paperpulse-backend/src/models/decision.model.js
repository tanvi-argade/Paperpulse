const pool = require("../config/db");

// Get paper (FIXED: includes author_id)
const getPaper = async (paper_id) => {
  const result = await pool.query(
    "SELECT id, status, author_id FROM papers WHERE id = $1",
    [paper_id]
  );
  return result.rows[0];
};

const getReviewsByPaper = async (paper_id) => {
  const result = await pool.query(
    `SELECT id FROM reviews WHERE paper_id = $1`,
    [paper_id]
  );
  return result.rows;
};

// Update final decision
const updateDecision = async (paper_id, decision) => {
  await pool.query(
    `UPDATE papers 
     SET status = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [decision, paper_id]
  );
};

module.exports = {
  getPaper,
  updateDecision,
  getReviewsByPaper
};