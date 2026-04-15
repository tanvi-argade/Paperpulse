const reviewModel = require("../models/review.model");
const notificationModel = require("../models/notification.model");
const auditModel = require("../models/audit.model");

// GET assigned papers
const getMyPapers = async (req, res) => {
  try {
    const papers = await reviewModel.getAssignedPapers(req.user.id);
    res.json(papers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SUBMIT review (SECURE + NOTIFICATIONS)
const submitReview = async (req, res) => {
  try {
    const { paper_id, comments, recommendation } = req.body;

    // 1. Validation
    if (!paper_id || !comments || !recommendation) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const validRecommendations = ["accept", "reject"];
    if (!validRecommendations.includes(recommendation)) {
      return res.status(400).json({
        message: "Invalid recommendation"
      });
    }

    // 2. Check reviewer assignment
    const isAssigned = await reviewModel.isAssignedReviewer(
      paper_id,
      req.user.id
    );

    if (!isAssigned) {
      return res.status(403).json({
        message: "You are not assigned to this paper"
      });
    }

    // 3. Prevent duplicate review
    const alreadyReviewed = await reviewModel.hasReviewed(
      paper_id,
      req.user.id
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        message: "Already reviewed"
      });
    }

    // 4. Get paper (for author_id)
    const paper = await reviewModel.getPaperById(paper_id);

    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }

    // 5. Save review
    const review = await reviewModel.submitReview(
      paper_id,
      req.user.id,
      comments,
      recommendation
    );

    // 6. Move to under_review
    await reviewModel.updatePaperStatus(paper_id, "under_review");

    // 7. 🔔 Notify author
    await notificationModel.createNotification(
      paper.author_id,
      "review_submitted",
      "Your paper has been reviewed"
    );
    
    // 🔥 AUDIT LOG (CORRECT PLACE)
    await auditModel.logAction(
      paper_id,
      "review_submitted",
      req.user.id,
      { recommendation, comments }
    );

    res.status(201).json({
      message: "Review submitted",
      review
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyPapers,
  submitReview
};