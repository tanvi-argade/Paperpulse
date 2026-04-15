const pool = require("../config/db");

// Get assigned papers
const getAssignedPapers = async (reviewer_id) => {
  const result = await pool.query(
    `SELECT
       p.*,
       CASE
         WHEN r.id IS NOT NULL THEN true
         ELSE false
       END AS is_reviewed
     FROM papers p
     JOIN reviewer_assignments ra ON p.id = ra.paper_id
     LEFT JOIN reviews r
       ON r.paper_id = p.id AND r.reviewer_id = $1
     WHERE ra.reviewer_id = $1`,
    [reviewer_id]
  );
  return result.rows;
};

// Check duplicate review
const hasReviewed = async (paper_id, reviewer_id) => {
  const result = await pool.query(
    `SELECT 1 FROM reviews
     WHERE paper_id = $1 AND reviewer_id = $2`,
    [paper_id, reviewer_id]
  );
  return result.rows.length > 0;
};

// 🔒 Check reviewer is assigned
const isAssignedReviewer = async (paper_id, reviewer_id) => {
  const result = await pool.query(
    `SELECT 1 FROM reviewer_assignments
     WHERE paper_id = $1 AND reviewer_id = $2`,
    [paper_id, reviewer_id]
  );
  return result.rows.length > 0;
};

// Get paper (for notifications)
const getPaperById = async (paper_id) => {
  const result = await pool.query(
    "SELECT id, author_id FROM papers WHERE id = $1",
    [paper_id]
  );
  return result.rows[0];
};

// Submit review
const submitReview = async (paper_id, reviewer_id, comments, recommendation) => {
  const result = await pool.query(
    `INSERT INTO reviews (paper_id, reviewer_id, comments, recommendation)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [paper_id, reviewer_id, comments, recommendation]
  );
  return result.rows[0];
};

// 📊 Aggregation
const getReviewStats = async (paper_id) => {
  const result = await pool.query(
    `SELECT recommendation, COUNT(*) as count
     FROM reviews
     WHERE paper_id = $1
     GROUP BY recommendation`,
    [paper_id]
  );
  return result.rows;
};

// Update status
const updatePaperStatus = async (paper_id, status) => {
  await pool.query(
    `UPDATE papers 
     SET status = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [status, paper_id]
  );
};

const getReviewsByPaper = async (paper_id) => {
  const result = await pool.query(
    `SELECT id, reviewer_id, comments, recommendation
     FROM reviews
     WHERE paper_id = $1`,
    [paper_id]
  );
  return result.rows;
};

module.exports = {
  getAssignedPapers,
  hasReviewed,
  isAssignedReviewer,
  getPaperById,      // 🔥 REQUIRED
  submitReview,
  getReviewStats,
  updatePaperStatus,
  getReviewsByPaper
};