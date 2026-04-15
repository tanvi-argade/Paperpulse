const pool = require("../config/db");

// CREATE PAPER
const createPaper = async (author_id, title, abstract, keywords, pdf_url) => {
  const result = await pool.query(
    `INSERT INTO papers (author_id, title, abstract, keywords, pdf_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [author_id, title, abstract, keywords, pdf_url]
  );

  return result.rows[0];
};

// GET AUTHOR PAPERS (NEW - REQUIRED)
const getPapersByAuthor = async (author_id) => {
  const result = await pool.query(
    `SELECT * FROM papers
     WHERE author_id = $1
     ORDER BY created_at DESC`,
    [author_id]
  );

  return result.rows;
};

module.exports = {
  createPaper,
  getPapersByAuthor
};