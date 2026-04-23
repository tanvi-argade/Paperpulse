const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const adminController = require("../controllers/admin.controller");
const assignmentController = require("../controllers/assignment.controller");
const decisionController = require("../controllers/decision.controller");

// existing write APIs
router.post(
  "/assign-reviewer",
  auth,
  role("admin"),
  assignmentController.assignReviewer
);

router.patch(
  "/papers/:paperId/decision",
  auth,
  role("admin"),
  decisionController.makeDecision
);

router.patch(
  "/papers/:paperId/publish",
  auth,
  role("admin"),
  decisionController.publishPaper
);

// NEW READ APIs
router.get(
  "/users",
  auth,
  role("admin"),
  adminController.getUsers
);

router.get(
  "/papers",
  auth,
  role("admin"),
  adminController.getPapers
);

router.get(
  "/assignments",
  auth,
  role("admin"),
  adminController.getAssignments
);

router.get(
  "/papers/:paperId/reviews",
  auth,
  role("admin"),
  adminController.getPaperReviews
);

router.patch(
  "/users/:id/role",
  auth,
  role("admin"),
  adminController.updateUserRole
);

module.exports = router;