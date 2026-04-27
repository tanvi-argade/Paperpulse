const pool = require("../config/db");
const path = require("path");
const fs = require("fs");

/**
 * SECURE DOWNLOAD API
 * Validates ownership/authorship before serving the certificate file.
 */
const downloadCertificate = async (req, res) => {
  try {
    const { paperId } = req.params;
    const userId = req.user.id;

    if (!paperId) {
      return res.status(400).json({ message: "paperId required" });
    }

    // 1. Fetch Paper details
    const paperRes = await pool.query(
      "SELECT id, author_id, certificate_url, is_published FROM papers WHERE id = $1",
      [paperId]
    );
    const paper = paperRes.rows[0];

    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }

    // 2. Access Control: Check if user is the main author or a co-author
    const authorRes = await pool.query(
      "SELECT id FROM paper_authors WHERE paper_id = $1 AND user_id = $2",
      [paperId, userId]
    );

    const isAuthor = paper.author_id === userId || authorRes.rows.length > 0;

    if (!isAuthor) {
      return res.status(403).json({ message: "Access denied. You are not an author of this paper." });
    }

    // 3. Verify Certificate exists
    if (!paper.certificate_url) {
      return res.status(404).json({ message: "Certificate not found. It might still be generating." });
    }

    const filePath = path.join(__dirname, "../../", paper.certificate_url);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Certificate file missing on server." });
    }

    // 4. Return file as download
    res.download(filePath, `Certificate-Paper-${paperId}.pdf`);
  } catch (error) {
    console.error("[DOWNLOAD CERTIFICATE ERROR]", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  downloadCertificate
};
