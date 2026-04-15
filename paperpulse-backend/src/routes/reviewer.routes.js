const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const reviewController = require("../controllers/review.controller");

// reviewer dashboard
router.get("/papers", auth, role("reviewer"), reviewController.getMyPapers);

// submit review
router.post("/review", auth, role("reviewer"), reviewController.submitReview);

module.exports = router;