const pool = require("../config/db");

// ================= USERS =================
exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY id ASC"
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      error: {
        code: "FETCH_FAILED",
        message: "Failed to fetch users"
      }
    });
    }
};

// 🔥 UPDATE ROLE (SAFE VERSION)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // 1. Validate role
    const allowedRoles = ["author", "reviewer"];
    if (!allowedRoles.includes(role)) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid role"
        }
      });
    }

    // 2. Check user exists
    const userCheck = await pool.query(
      "SELECT id, role FROM users WHERE id = $1",
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "User not found"
        }
      });
    }

    const currentUser = userCheck.rows[0];

    // 3. 🔥 PROTECT ADMIN
    if (currentUser.role === "admin") {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Cannot modify admin role"
        }
      });
    }

    // 4. Prevent unnecessary update
    if (currentUser.role === role) {
      return res.status(400).json({
        message: "User already has this role",
      });
    }

    // 5. Update role
    const result = await pool.query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, role",
      [role, id]
    );

    res.json({
      message: "Role updated successfully",
      user: result.rows[0],
    });

  } catch (err) {
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: error.message
      }
    });
  }
};

// ================= PAPERS =================
exports.getPapers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.title,
        p.abstract,
        p.keywords,
        p.pdf_url,
        p.status,
        p.created_at,
        p.updated_at,
        u.name AS author_name,
        u.email AS author_email
      FROM papers p
      JOIN users u ON p.author_id = u.id
      ORDER BY p.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      error: {
        code: "FETCH_FAILED",
        message: "Failed to fetch Papers"
      }
    });
  }
};

// ================= ASSIGNMENTS =================
exports.getAssignments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ra.id,
        ra.paper_id,
        ra.reviewer_id,
        ra.assigned_at,
        p.title AS paper_title,
        u1.name AS reviewer_name,
        u2.name AS author_name
      FROM reviewer_assignments ra
      JOIN papers p ON ra.paper_id = p.id
      JOIN users u1 ON ra.reviewer_id = u1.id
      JOIN users u2 ON p.author_id = u2.id
      ORDER BY ra.assigned_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      error: {
        code: "FETCH_FAILED",
        message: "Failed to fetch Assignments"
      }
    });
  }
};

// ================= REVIEWS =================
exports.getPaperReviews = async (req, res) => {
  try {
    const { paperId } = req.params;

    const result = await pool.query(
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

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      error: {
        code: "FETCH_FAILED",
        message: "Failed to fetch reviews"
      }
    });
  }
};