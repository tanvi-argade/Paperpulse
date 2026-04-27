const express = require("express");
const router = express.Router();
const certificateController = require("../controllers/certificate.controller");
const authMiddleware = require("../middleware/auth.middleware");

// GET /api/certificates/:paperId
router.get("/:paperId", authMiddleware, certificateController.downloadCertificate);

module.exports = router;
