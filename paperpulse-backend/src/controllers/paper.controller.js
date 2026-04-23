const pool = require("../config/db"); // ❗ YOU ALSO MISSED THIS
const paperModel = require("../models/paper.model");
const auditModel = require("../models/audit.model");
const PAPER_STATUS = require("../utils/paperStatus");
const AUDIT = require("../utils/auditActions");

// author paper stats
const getPaperStats = async (req, res) => {
  try {
    const authorId = req.user.id;

    const result = await pool.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = $2)::int AS submitted,
         COUNT(*) FILTER (WHERE status = $3)::int AS under_review,
         COUNT(*) FILTER (WHERE status = $4)::int AS accepted,
         COUNT(*) FILTER (WHERE status = $5)::int AS rejected
       FROM papers
       WHERE author_id = $1`,
      [
        authorId,
        PAPER_STATUS.SUBMITTED,
        PAPER_STATUS.UNDER_REVIEW,
        PAPER_STATUS.ACCEPTED,
        PAPER_STATUS.REJECTED
      ]
    );

    const row = result.rows?.[0] || {};

    res.json({
      total: row.total ?? 0,
      submitted: row.submitted ?? 0,
      under_review: row.under_review ?? 0,
      accepted: row.accepted ?? 0,
      rejected: row.rejected ?? 0,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: error.message
      }
    });
  }
};

// submit paper
const submitPaper = async (req, res) => {
  try {
    const { title, abstract, keywords } = req.body;

    if (!req.file) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "PDF file is required"
        }
      });
    }

    const pdf_url = `/uploads/${req.file.filename}`;

    const paper = await paperModel.createPaper(
      req.user.id,
      title,
      abstract,
      keywords,
      pdf_url
    );

    // 🔥 AUDIT: submission event
    await auditModel.logAction(
      paper.id,
      AUDIT.PAPER_SUBMITTED,
      req.user.id,
      { title }
    );

    res.status(201).json({
      message: "Paper submitted successfully",
      paper
    });

  } catch (error) {
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: error.message
      }
    });
  }
};

// author papers
const getMyPapers = async (req, res) => {
  try {
    const papers = await paperModel.getPapersByAuthor(req.user.id);
    res.json(papers);
  } catch (error) {
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: error.message
      }
    });
  }
};

// 🔥 PUBLIC published papers (FINAL STATE ONLY)
const getPublishedPapers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
     p.id,
     p.title,
     p.abstract,
     p.keywords,
     p.pdf_url,
     p.created_at,
     u.name AS author_name
   FROM papers p
   JOIN users u ON p.author_id = u.id
   WHERE p.is_published = true
   AND p.status = 'accepted'
   ORDER BY p.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      error: {
        code: "FETCH_FAILED",
        message: "Failed to fetch published papers"
      }
    });
  }
};

// 🔥 GET reviews for author's own paper
const getMyPaperReviews = async (req, res) => {
  try {
    const { paperId } = req.params;

    // 1. Check paper belongs to this author
    const paperCheck = await pool.query(
      "SELECT id FROM papers WHERE id = $1 AND author_id = $2",
      [paperId, req.user.id]
    );

    if (paperCheck.rows.length === 0) {
      res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Not authorized to view this paper"
        }
      });
    }

    // 2. Get reviews
    const reviews = await pool.query(
      `SELECT 
         r.id,
         r.comments,
         r.recommendation,
         r.created_at,
         u.name AS reviewer_name
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.paper_id = $1
       ORDER BY r.created_at DESC`,
      [paperId]
    );

    res.json(reviews.rows);

  } catch (err) {
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: error.message
      }
    });
  }
};

module.exports = {
  getPaperStats,
  submitPaper,
  getMyPapers,
  getPublishedPapers,
  getMyPaperReviews
};