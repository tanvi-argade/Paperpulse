const decisionModel = require("../models/decision.model");
const notificationModel = require("../models/notification.model");
const auditModel = require("../models/audit.model");
const reviewModel = require("../models/review.model");
const { canTransition } = require("../utils/workflow");

const makeDecision = async (req, res) => {
  try {
    const { paper_id, decision } = req.body;

    // 1. Basic validation
    if (!paper_id || !decision) {
      return res.status(400).json({
        message: "paper_id and decision required"
      });
    }

    const validDecisions = ["accepted", "rejected"];
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({
        message: "Invalid decision"
      });
    }

    // 2. Fetch paper
    const paper = await decisionModel.getPaper(paper_id);

    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }

    // 🔥 3. CHECK REVIEWS EXIST (ADD HERE)
    const reviews = await reviewModel.getReviewsByPaper(paper_id);

    if (!reviews || reviews.length === 0) {
      return res.status(400).json({
        message: "Cannot make decision without reviews"
      });
    }

    // 4. Workflow transition check
    if (!canTransition(paper.status, decision)) {
      return res.status(400).json({
        message: `Invalid transition: ${paper.status} → ${decision}`
      });
    }

    // 5. Update decision
    await decisionModel.updateDecision(paper_id, decision);

    // 6. Notify author
    await notificationModel.createNotification(
      paper.author_id,
      "decision_made",
      `Your paper is ${decision}`
    );

    // 7. Audit log
    await auditModel.logAction(
      paper_id,
      "final_decision",
      req.user.id,
      { decision }
    );

    res.json({
      message: `Paper ${decision} successfully`
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { makeDecision };