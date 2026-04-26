const pool = require("../config/db");
const decisionModel = require("../models/decision.model");
const notificationModel = require("../models/notification.model");
const auditModel = require("../models/audit.model");
const reviewModel = require("../models/review.model");
const paymentModel = require("../models/payment.model");
const { canTransition } = require("../utils/workflow");
const AUDIT = require("../utils/auditActions");
const PAPER_STATUS = require("../utils/paperStatus");
const emailService = require("../utils/email.service");

// =====================
// MAKE DECISION
// =====================
const makeDecision = async (req, res) => {
  try {
    const { paperId } = req.params;
    const { decision } = req.body;

    if (!paperId || !decision) {
      return res.status(400).json({
        message: "paperId and decision required"
      });
    }

    const validDecisions = [PAPER_STATUS.ACCEPTED, PAPER_STATUS.REJECTED];
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({
        message: "Invalid decision"
      });
    }

    const paper = await decisionModel.getPaper(paperId);

    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }

    if (
      paper.status === PAPER_STATUS.ACCEPTED ||
      paper.status === PAPER_STATUS.REJECTED
    ) {
      return res.status(400).json({
        message: "Decision already finalized"
      });
    }

    const reviews = await reviewModel.getReviewsByPaper(paperId);

    if (!reviews || reviews.length === 0) {
      return res.status(400).json({
        message: "Cannot make decision without reviews"
      });
    }

    if (!canTransition(paper.status, decision)) {
      return res.status(400).json({
        message: `Invalid transition: ${paper.status} → ${decision}`
      });
    }

    await decisionModel.updateDecision(paperId, decision);

    await notificationModel.createNotification(
      paper.author_id,
      "decision_made",
      `Your paper is ${decision}`
    );

    await auditModel.logAction(
      paperId,
      AUDIT.FINAL_DECISION,
      req.user.id,
      { decision }
    );

    // 🔥 EMAIL NOTIFICATION (SILENT FAIL)
    try {
      const userRes = await pool.query("SELECT email FROM users WHERE id = $1", [paper.author_id]);
      const authorEmail = userRes.rows[0]?.email;
      
      if (authorEmail) {
        const decisionText = decision === PAPER_STATUS.ACCEPTED
          ? "Your paper has been ACCEPTED. You can now proceed with payment to publish."
          : "Your paper has been REJECTED.";

        await emailService.sendEmail(
          authorEmail,
          "Paper Decision Update",
          decisionText
        );
      }
    } catch (err) {
      console.error("[EMAIL ERROR] Decision email failed:", err.message);
    }

    res.json({
      message: `Paper ${decision} successfully`
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================
// PUBLISH PAPER
// =====================
const publishPaper = async (req, res) => {
  try {
    const { paperId } = req.params;

    if (!paperId) {
      return res.status(400).json({
        message: "paperId required"
      });
    }

    const paper = await decisionModel.getPaper(paperId);

    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }

    if (paper.status !== PAPER_STATUS.ACCEPTED) {
      return res.status(400).json({
        message: "Only 'accepted' papers can be published"
      });
    }

    // 🔥 PAYMENT GATE
    const payment = await paymentModel.getPaymentByPaper(paperId);
    if (!payment || payment.status !== 'success') {
      return res.status(400).json({
        message: "Payment required before publishing"
      });
    }

    await pool.query(
      "UPDATE papers SET is_published = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [true, paperId]
    );

    await notificationModel.createNotification(
      paper.author_id,
      AUDIT.PAPER_PUBLISHED,
      "Your paper has been published"
    );

    await auditModel.logAction(
      paperId,
      AUDIT.PAPER_PUBLISHED,
      req.user.id,
      { is_published: true }
    );

    // 🔥 EMAIL NOTIFICATION (SILENT FAIL)
    try {
      const userRes = await pool.query("SELECT email FROM users WHERE id = $1", [paper.author_id]);
      const authorEmail = userRes.rows[0]?.email;
      
      if (authorEmail) {
        await emailService.sendEmail(
          authorEmail,
          "Paper Published",
          "Your paper is now published and publicly visible."
        );
      }
    } catch (err) {
      console.error("[EMAIL ERROR] Publication email failed:", err.message);
    }

    res.json({
      message: "Paper published successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================
// UNPUBLISH PAPER
// =====================
const unpublishPaper = async (req, res) => {
  try {
    const { paperId } = req.params;

    if (!paperId) {
      return res.status(400).json({
        message: "paperId required"
      });
    }

    const paper = await decisionModel.getPaper(paperId);

    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }

    await pool.query(
      "UPDATE papers SET is_published = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [false, paperId]
    );

    await auditModel.logAction(
      paperId,
      AUDIT.PAPER_UNPUBLISHED,
      req.user.id,
      { is_published: false }
    );

    res.json({
      message: "Paper unpublished successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  makeDecision,
  publishPaper,
  unpublishPaper
};