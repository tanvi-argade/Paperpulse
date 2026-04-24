const pool = require("../config/db"); // ❗ YOU ALSO MISSED THIS
const paperModel = require("../models/paper.model");
const auditModel = require("../models/audit.model");
const PAPER_STATUS = require("../utils/paperStatus");
const AUDIT = require("../utils/auditActions");
const fs = require('fs');
const path = require('path');

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
  const client = await pool.connect();
  try {
    const { title, abstract, keywords, coauthors } = req.body;
    
    // Parse coauthors if sent as string from FormData
    const parsedCoauthors = coauthors ? JSON.parse(coauthors) : [];

    if (!req.file) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "PDF file is required" }
      });
    }
    const pdf_url = `/uploads/${req.file.filename}`;
    const ownerId = req.user.id;

    // 0. Fetch explicit OWNER details from users table
    const userRes = await client.query(`SELECT name, email FROM users WHERE id = $1`, [ownerId]);
    if (userRes.rows.length === 0) {
      throw new Error("Owner user record not found.");
    }
    const ownerName = userRes.rows[0].name.trim();
    const ownerEmail = userRes.rows[0].email.trim().toLowerCase();

    // Strict validation and email normalization for coauthors
    const normalizedCoauthors = [];
    const coauthorEmails = [];
    for (const author of parsedCoauthors) {
      if (!author.name || !author.name.trim()) {
        return res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: "Invalid co-author entry. Name is required." }
        });
      }
      
      let normalizedEmail = null;
      if (author.email && author.email.trim()) {
        normalizedEmail = author.email.trim().toLowerCase();
        if (normalizedEmail === ownerEmail) {
          return res.status(400).json({
            error: { code: "VALIDATION_ERROR", message: "Owner cannot be added as a co-author." }
          });
        }
        coauthorEmails.push(normalizedEmail);
      }
      
      normalizedCoauthors.push({
        name: author.name.trim(),
        email: normalizedEmail
      });
    }

    if (coauthorEmails.length > 0 && new Set(coauthorEmails).size !== coauthorEmails.length) {
       return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Duplicate co-author emails are not allowed." }
      });
    }

    console.log("[DEBUG] Starting submission for ownerId:", ownerId);
    console.log("[DEBUG] Parsed coauthors:", normalizedCoauthors.length);
    console.log("[DEBUG] Paper payload:", { title, abstract: abstract.substring(0, 20) + "...", keywords, pdf_url });

    await client.query('BEGIN'); // Start Transaction

    // 1. Insert Paper
    const paperRes = await client.query(
      `INSERT INTO papers (author_id, title, abstract, keywords, pdf_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [ownerId, title, abstract, keywords, pdf_url]
    );
    const paper = paperRes.rows[0];
    console.log("[DEBUG] Paper inserted successfully:", paper.id);

    // 2. Insert OWNER into paper_authors
    await client.query(
      `INSERT INTO paper_authors (paper_id, user_id, name_snapshot, email_snapshot, role, is_registered_user, author_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [paper.id, ownerId, ownerName, ownerEmail, 'OWNER', true, 1]
    );

    let registeredCount = 1;
    let externalCount = 0;

    // 3. Insert CO_AUTHORS (Eliminate N+1 Query on Emails)
    let userMap = new Map();
    if (coauthorEmails.length > 0) {
      const matchRes = await client.query(`SELECT id, email FROM users WHERE email = ANY($1)`, [coauthorEmails]);
      matchRes.rows.forEach(u => userMap.set(u.email.trim().toLowerCase(), u.id));
    }

    let authorIndex = 2;
    for (const author of normalizedCoauthors) {
      const matchedUserId = author.email ? (userMap.get(author.email) || null) : null;
      const isRegistered = matchedUserId !== null;
      
      if (isRegistered) registeredCount++; else externalCount++;

      await client.query(
        `INSERT INTO paper_authors (paper_id, user_id, name_snapshot, email_snapshot, role, is_registered_user, author_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [paper.id, matchedUserId, author.name, author.email, 'CO_AUTHOR', isRegistered, authorIndex]
      );
      authorIndex++;
    }
    console.log("[DEBUG] Inserted authors. Registered:", registeredCount, "External:", externalCount);

    // 4. Audit Logging (Merged to avoid breaking ENUM limit)
    // The audit_logs_action ENUM in DB does not contain 'author_list_finalized',
    // so we merge author metadata into the primary PAPER_SUBMITTED action.
    await auditModel.logAction(paper.id, AUDIT.PAPER_SUBMITTED, ownerId, { 
       title,
       total_authors: 1 + normalizedCoauthors.length,
       registered_authors: registeredCount,
       external_authors: externalCount
    }, client);
    console.log("[DEBUG] Audit log inserted cleanly under PAPER_SUBMITTED");

    await client.query('COMMIT'); // Commit Transaction

    res.status(201).json({
      message: "Paper submitted successfully",
      paper
    });

  } catch (error) {
    console.error("DEBUG INTERNAL ERROR:", error);
    await client.query('ROLLBACK');
    
    // Filesystem cleanup on rollback
    if (req.file) {
      const filePath = path.join(__dirname, '..', '..', 'uploads', req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete uploaded file on rollback:", err);
      });
    }

    res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: error.message }
    });
  } finally {
    client.release();
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