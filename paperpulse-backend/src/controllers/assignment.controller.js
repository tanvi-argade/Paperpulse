const assignmentModel = require("../models/assignment.model");
const auditModel = require("../models/audit.model");
const AUDIT = require("../utils/auditActions");
const PAPER_STATUS = require("../utils/paperStatus");

const assignReviewer = async (req, res) => {
  try {
    const { paper_id, reviewer_id } = req.body;

    if (!paper_id || !reviewer_id) {
      return res.status(400).json({
        message: "paper_id and reviewer_id are required"
      });
    }

    const user = await assignmentModel.getUser(reviewer_id);

    if (!user || user.role !== "reviewer") {
      return res.status(400).json({
        message: "User is not a reviewer"
      });
    }

    const paper = await assignmentModel.getPaper(paper_id);

    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }

    if (paper.author_id === reviewer_id) {
      return res.status(400).json({
        message: "Author cannot review own paper"
      });
    }

    if ([PAPER_STATUS.ACCEPTED, PAPER_STATUS.REJECTED].includes(paper.status)) {
      return res.status(400).json({
        message: "Cannot assign reviewer. Paper already finalized"
      });
    }

    const exists = await assignmentModel.isAlreadyAssigned(
      paper_id,
      reviewer_id
    );

    if (exists) {
      return res.status(400).json({
        message: "Reviewer already assigned"
      });
    }

    const assignment = await assignmentModel.assignReviewerTx(
      paper,
      reviewer_id,
      req.user.id
    );


    res.status(201).json({
      message: "Reviewer assigned successfully",
      assignment
    });

  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        message: "Duplicate assignment prevented"
      });
    }

    res.status(500).json({ message: error.message });
  }
};

module.exports = { assignReviewer };