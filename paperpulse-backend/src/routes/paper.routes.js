const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const upload = require("../utils/upload");
const paperController = require("../controllers/paper.controller");
const auditController = require("../controllers/audit.controller");

// submit paper
router.post(
  "/submit",
  auth,
  role("author"),
  upload.single("pdf"),
  paperController.submitPaper
);

// author papers
router.get(
  "/my",
  auth,
  role("author"),
  paperController.getMyPapers
);

// author stats
router.get(
  "/stats",
  auth,
  role("author"),
  paperController.getPaperStats
);

router.get("/accepted", (req, res) => {
  return res.status(410).json({
    message: "Endpoint deprecated. Use /published"
  });
});

// 🔥 PUBLIC published papers
router.get(
  "/published",
  paperController.getPublishedPapers
);

router.get(
  "/:paperId/reviews",
  auth,
  role("author"),
  paperController.getMyPaperReviews
);

router.get(
  "/:paperId/audit",
  auth,
  role("author"),
  auditController.getLogs
);

module.exports = router;