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
    `SELECT 
       p.*,
       COALESCE(
         (
           SELECT json_agg(
             json_build_object(
               'name_snapshot', pa.name_snapshot,
               'role', pa.role,
               'author_order', pa.author_order
             ) ORDER BY pa.author_order ASC
           )
           FROM paper_authors pa
           WHERE pa.paper_id = p.id
         ), 
         '[]'::json
       ) AS authors
     FROM papers p
     WHERE p.author_id = $1
     ORDER BY p.created_at DESC`,
    [author_id]
  );

  return result.rows;
};

module.exports = {
  createPaper,
  getPapersByAuthor
};